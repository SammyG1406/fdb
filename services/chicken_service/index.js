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

const CUT_COLUMNS = `id, name, skin_on, calories_per_100g, protein_per_100g, carbs_per_100g, fats_per_100g, fiber_per_100g`;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

app.get("/", (req, res) => {
    res.json({ service: "chicken_service running" });
});

// List all chicken cuts, optionally filtered by ?q=<search term>
app.get("/chicken", async (req, res) => {
    try {
        const { q } = req.query;
        const result = q
            ? await pool.query(
                `SELECT ${CUT_COLUMNS} FROM chicken_cuts WHERE name ILIKE $1 ORDER BY name`,
                [`%${q}%`]
            )
            : await pool.query(`SELECT ${CUT_COLUMNS} FROM chicken_cuts ORDER BY name`);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching chicken cuts:", error);
        res.status(500).json({ error: "Failed to fetch chicken cuts" });
    }
});

app.get("/chicken/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!UUID_RE.test(id)) {
            return res.status(404).json({ error: "Chicken cut not found" });
        }
        const result = await pool.query(
            `SELECT ${CUT_COLUMNS} FROM chicken_cuts WHERE id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Chicken cut not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching chicken cut:", error);
        res.status(500).json({ error: "Failed to fetch chicken cut" });
    }
});

// Macros scaled to a portion size, e.g. /chicken/:id/nutrition?grams=150
app.get("/chicken/:id/nutrition", async (req, res) => {
    try {
        const { id } = req.params;
        if (!UUID_RE.test(id)) {
            return res.status(404).json({ error: "Chicken cut not found" });
        }
        const grams = Number(req.query.grams ?? 100);
        if (!Number.isFinite(grams) || grams <= 0) {
            return res.status(400).json({ error: "grams must be a positive number" });
        }

        const result = await pool.query(
            `SELECT ${CUT_COLUMNS} FROM chicken_cuts WHERE id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Chicken cut not found" });
        }

        const cut = result.rows[0];
        const scale = (per100g) => Math.round(Number(per100g) * grams) / 100;
        res.json({
            id: cut.id,
            name: cut.name,
            grams,
            calories: scale(cut.calories_per_100g),
            protein: scale(cut.protein_per_100g),
            carbs: scale(cut.carbs_per_100g),
            fats: scale(cut.fats_per_100g),
            fiber: scale(cut.fiber_per_100g),
        });
    } catch (error) {
        console.error("Error calculating chicken nutrition:", error);
        res.status(500).json({ error: "Failed to calculate nutrition" });
    }
});

app.post("/chicken", async (req, res) => {
    try {
        const {
            name,
            skin_on = false,
            calories_per_100g = 0,
            protein_per_100g = 0,
            carbs_per_100g = 0,
            fats_per_100g = 0,
            fiber_per_100g = 0,
        } = req.body;

        if (!name) {
            return res.status(400).json({ error: "name is required" });
        }

        const result = await pool.query(
            `INSERT INTO chicken_cuts (name, skin_on, calories_per_100g, protein_per_100g, carbs_per_100g, fats_per_100g, fiber_per_100g)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING ${CUT_COLUMNS}`,
            [name, skin_on, calories_per_100g, protein_per_100g, carbs_per_100g, fats_per_100g, fiber_per_100g]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({ error: "A chicken cut with that name already exists" });
        }
        console.error("Error creating chicken cut:", error);
        res.status(500).json({ error: "Failed to create chicken cut" });
    }
});

app.delete("/chicken/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!UUID_RE.test(id)) {
            return res.status(404).json({ error: "Chicken cut not found" });
        }
        const result = await pool.query(`DELETE FROM chicken_cuts WHERE id = $1`, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Chicken cut not found" });
        }
        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting chicken cut:", error);
        res.status(500).json({ error: "Failed to delete chicken cut" });
    }
});

app.listen(4004, () => {
    console.log("Chicken service running on port 4004");
});
