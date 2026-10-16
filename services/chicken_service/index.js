import express from "express";
import router from "./metrics/index.js";
import pkg from 'pg';

const { Pool } = pkg;

const app = express();
app.use(express.json());
app.use(router);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Per-serving thresholds for the high_protein / low_fat filters
const HIGH_PROTEIN_MIN_G = 30;
const LOW_FAT_MAX_G = 10;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MACRO_FIELDS = ["calories_per_100g", "protein_per_100g", "carbs_per_100g", "fats_per_100g", "fiber_per_100g"];

const withTags = (recipe) => ({
    ...recipe,
    high_protein: recipe.protein_per_serving >= HIGH_PROTEIN_MIN_G,
    low_fat: recipe.fats_per_serving <= LOW_FAT_MAX_G,
});

async function getRecipe(id) {
    const recipe = await pool.query(`SELECT * FROM recipe_nutrition WHERE id = $1`, [id]);
    if (recipe.rows.length === 0) return null;

    const ingredients = await pool.query(
        `SELECT i.name, i.is_chicken, ri.grams::float8 AS grams
         FROM recipe_ingredients ri
         JOIN ingredients i ON i.id = ri.ingredient_id
         WHERE ri.recipe_id = $1
         ORDER BY i.is_chicken DESC, ri.grams DESC`,
        [id]
    );
    return { ...withTags(recipe.rows[0]), ingredients: ingredients.rows };
}

app.get("/", (req, res) => {
    res.json({ service: "chicken_service running" });
});

// Search recipes: ?q=curry&high_protein=true&low_fat=true
app.get("/chicken/recipes", async (req, res) => {
    try {
        const { q, high_protein, low_fat } = req.query;
        const conditions = [];
        const params = [];

        if (q) {
            params.push(`%${q}%`);
            conditions.push(`name ILIKE $${params.length}`);
        }
        if (high_protein === "true") {
            params.push(HIGH_PROTEIN_MIN_G);
            conditions.push(`protein_per_serving >= $${params.length}`);
        }
        if (low_fat === "true") {
            params.push(LOW_FAT_MAX_G);
            conditions.push(`fats_per_serving <= $${params.length}`);
        }

        const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
        const result = await pool.query(
            `SELECT * FROM recipe_nutrition ${where} ORDER BY name`,
            params
        );
        res.json(result.rows.map(withTags));
    } catch (error) {
        console.error("Error fetching chicken recipes:", error);
        res.status(500).json({ error: "Failed to fetch chicken recipes" });
    }
});

app.get("/chicken/recipes/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!UUID_RE.test(id)) {
            return res.status(404).json({ error: "Recipe not found" });
        }
        const recipe = await getRecipe(id);
        if (!recipe) {
            return res.status(404).json({ error: "Recipe not found" });
        }
        res.json(recipe);
    } catch (error) {
        console.error("Error fetching chicken recipe:", error);
        res.status(500).json({ error: "Failed to fetch chicken recipe" });
    }
});

// Body: { name, description, instructions, servings, ingredients: [{ name, grams, is_chicken?, calories_per_100g?, ... }] }
// Known ingredients are matched by name; new ones must include their per-100g macros.
app.post("/chicken/recipes", async (req, res) => {
    const { name, description = null, instructions = null, servings = 1, ingredients } = req.body;

    if (!name) {
        return res.status(400).json({ error: "name is required" });
    }
    if (!Number.isInteger(servings) || servings <= 0) {
        return res.status(400).json({ error: "servings must be a positive integer" });
    }
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ error: "ingredients must be a non-empty array" });
    }
    for (const ing of ingredients) {
        if (!ing?.name || !(Number(ing.grams) > 0)) {
            return res.status(400).json({ error: "each ingredient needs a name and positive grams" });
        }
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const ingredientIds = [];
        let hasChicken = false;
        for (const ing of ingredients) {
            let found = await client.query(
                `SELECT id, is_chicken FROM ingredients WHERE name = $1`,
                [ing.name]
            );
            if (found.rows.length === 0) {
                if (ing.calories_per_100g === undefined) {
                    await client.query("ROLLBACK");
                    return res.status(400).json({
                        error: `Unknown ingredient "${ing.name}"; include its per-100g macros to add it`,
                    });
                }
                found = await client.query(
                    `INSERT INTO ingredients (name, is_chicken, ${MACRO_FIELDS.join(", ")})
                     VALUES ($1, $2, $3, $4, $5, $6, $7)
                     RETURNING id, is_chicken`,
                    [ing.name, Boolean(ing.is_chicken), ...MACRO_FIELDS.map((f) => ing[f] ?? 0)]
                );
            }
            hasChicken ||= found.rows[0].is_chicken;
            ingredientIds.push({ id: found.rows[0].id, grams: Number(ing.grams) });
        }

        if (!hasChicken) {
            await client.query("ROLLBACK");
            return res.status(400).json({ error: "A chicken recipe needs at least one chicken ingredient" });
        }

        const recipe = await client.query(
            `INSERT INTO recipes (name, description, instructions, servings)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [name, description, instructions, servings]
        );
        const recipeId = recipe.rows[0].id;

        for (const { id, grams } of ingredientIds) {
            await client.query(
                `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, grams)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (recipe_id, ingredient_id) DO UPDATE
                 SET grams = recipe_ingredients.grams + EXCLUDED.grams`,
                [recipeId, id, grams]
            );
        }

        await client.query("COMMIT");
        res.status(201).json(await getRecipe(recipeId));
    } catch (error) {
        await client.query("ROLLBACK");
        if (error.code === "23505") {
            return res.status(409).json({ error: "A recipe with that name already exists" });
        }
        console.error("Error creating chicken recipe:", error);
        res.status(500).json({ error: "Failed to create chicken recipe" });
    } finally {
        client.release();
    }
});

app.delete("/chicken/recipes/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!UUID_RE.test(id)) {
            return res.status(404).json({ error: "Recipe not found" });
        }
        const result = await pool.query(`DELETE FROM recipes WHERE id = $1`, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Recipe not found" });
        }
        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting chicken recipe:", error);
        res.status(500).json({ error: "Failed to delete chicken recipe" });
    }
});

// Ingredients available to build recipes from
app.get("/chicken/ingredients", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, is_chicken, ${MACRO_FIELDS.map((f) => `${f}::float8 AS ${f}`).join(", ")}
             FROM ingredients ORDER BY name`
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching ingredients:", error);
        res.status(500).json({ error: "Failed to fetch ingredients" });
    }
});

app.listen(4004, () => {
    console.log("Chicken service running on port 4004");
});
