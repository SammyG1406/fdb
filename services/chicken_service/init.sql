CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Nutrition values are per 100g (approximate, based on USDA FoodData Central)
CREATE TABLE IF NOT EXISTS ingredients (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              TEXT NOT NULL UNIQUE,
    is_chicken        BOOLEAN NOT NULL DEFAULT FALSE,
    calories_per_100g NUMERIC(10,4) DEFAULT 0,
    protein_per_100g  NUMERIC(10,4) DEFAULT 0,
    carbs_per_100g    NUMERIC(10,4) DEFAULT 0,
    fats_per_100g     NUMERIC(10,4) DEFAULT 0,
    fiber_per_100g    NUMERIC(10,4) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS recipes (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         TEXT NOT NULL UNIQUE,
    description  TEXT,
    instructions TEXT,
    servings     INTEGER NOT NULL DEFAULT 1 CHECK (servings > 0),
    created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
    recipe_id     UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id),
    grams         NUMERIC(10,2) NOT NULL CHECK (grams > 0),
    PRIMARY KEY (recipe_id, ingredient_id)
);

-- Per-serving totals for each recipe
CREATE OR REPLACE VIEW recipe_nutrition AS
SELECT
    r.id,
    r.name,
    r.description,
    r.instructions,
    r.servings,
    ROUND(COALESCE(SUM(ri.grams) FILTER (WHERE i.is_chicken), 0) / r.servings, 1)::float8 AS chicken_grams_per_serving,
    ROUND(COALESCE(SUM(ri.grams * i.calories_per_100g / 100), 0) / r.servings, 1)::float8 AS calories_per_serving,
    ROUND(COALESCE(SUM(ri.grams * i.protein_per_100g  / 100), 0) / r.servings, 1)::float8 AS protein_per_serving,
    ROUND(COALESCE(SUM(ri.grams * i.carbs_per_100g    / 100), 0) / r.servings, 1)::float8 AS carbs_per_serving,
    ROUND(COALESCE(SUM(ri.grams * i.fats_per_100g     / 100), 0) / r.servings, 1)::float8 AS fats_per_serving,
    ROUND(COALESCE(SUM(ri.grams * i.fiber_per_100g    / 100), 0) / r.servings, 1)::float8 AS fiber_per_serving
FROM recipes r
LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
LEFT JOIN ingredients i ON i.id = ri.ingredient_id
GROUP BY r.id;

CREATE INDEX IF NOT EXISTS recipes_name_fts_idx
    ON recipes USING GIN (to_tsvector('english', name));

-- ---------- Seed data ----------
INSERT INTO ingredients (name, is_chicken, calories_per_100g, protein_per_100g, carbs_per_100g, fats_per_100g, fiber_per_100g) VALUES
    ('Chicken breast, skinless',  TRUE,  120, 22.5, 0,    2.6,  0),
    ('Chicken thigh, skinless',   TRUE,  121, 19.7, 0,    4.1,  0),
    ('Olive oil',                 FALSE, 884, 0,    0,    100,  0),
    ('White rice, cooked',        FALSE, 130, 2.7,  28.2, 0.3,  0.4),
    ('Broccoli',                  FALSE, 34,  2.8,  6.6,  0.4,  2.6),
    ('Greek yogurt, non-fat',     FALSE, 59,  10.3, 3.6,  0.4,  0),
    ('Romaine lettuce',           FALSE, 17,  1.2,  3.3,  0.3,  2.1),
    ('Parmesan',                  FALSE, 392, 35.8, 3.2,  25.8, 0),
    ('Sweet potato',              FALSE, 86,  1.6,  20.1, 0.1,  3.0),
    ('Onion',                     FALSE, 40,  1.1,  9.3,  0.1,  1.7),
    ('Tomato',                    FALSE, 18,  0.9,  3.9,  0.2,  1.2),
    ('Coconut milk, canned',      FALSE, 197, 2.0,  2.8,  21.3, 0),
    ('Wholemeal tortilla',        FALSE, 310, 9.0,  50.0, 8.0,  7.0),
    ('Bell pepper',               FALSE, 31,  1.0,  6.0,  0.3,  2.1),
    ('Soy sauce',                 FALSE, 53,  8.1,  4.9,  0.6,  0.8)
ON CONFLICT (name) DO NOTHING;

INSERT INTO recipes (name, description, instructions, servings) VALUES
    ('Grilled chicken, rice and broccoli',
     'Classic meal-prep bowl.',
     'Season and grill the chicken breast. Steam the broccoli. Serve over rice.',
     2),
    ('Light chicken Caesar salad',
     'Caesar salad with a Greek yogurt dressing.',
     'Grill the chicken and slice. Whisk yogurt, oil and grated parmesan into a dressing. Toss with chopped romaine.',
     2),
    ('Chicken thigh and sweet potato traybake',
     'One-tray roast dinner.',
     'Cube the sweet potato and slice the onion. Toss everything with oil and seasoning and roast at 200C for 35 minutes.',
     4),
    ('Chicken coconut curry',
     'Creamy curry served with rice.',
     'Brown the chicken thighs with onion. Add tomato and coconut milk and simmer for 25 minutes. Serve with rice.',
     4),
    ('Chicken fajita wraps',
     'Quick pan-fried fajitas.',
     'Slice the chicken, peppers and onion. Fry in oil with fajita seasoning and serve in warm tortillas.',
     2),
    ('Chicken and broccoli stir-fry',
     'Fast weeknight stir-fry.',
     'Stir-fry sliced chicken in oil, add broccoli and pepper, finish with soy sauce. Serve with rice.',
     3)
ON CONFLICT (name) DO NOTHING;

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, grams)
SELECT r.id, i.id, v.grams
FROM (VALUES
    ('Grilled chicken, rice and broccoli',      'Chicken breast, skinless', 400),
    ('Grilled chicken, rice and broccoli',      'White rice, cooked',       300),
    ('Grilled chicken, rice and broccoli',      'Broccoli',                 200),
    ('Grilled chicken, rice and broccoli',      'Olive oil',                5),

    ('Light chicken Caesar salad',              'Chicken breast, skinless', 300),
    ('Light chicken Caesar salad',              'Romaine lettuce',          200),
    ('Light chicken Caesar salad',              'Parmesan',                 30),
    ('Light chicken Caesar salad',              'Greek yogurt, non-fat',    60),
    ('Light chicken Caesar salad',              'Olive oil',                10),

    ('Chicken thigh and sweet potato traybake', 'Chicken thigh, skinless',  600),
    ('Chicken thigh and sweet potato traybake', 'Sweet potato',             600),
    ('Chicken thigh and sweet potato traybake', 'Onion',                    150),
    ('Chicken thigh and sweet potato traybake', 'Olive oil',                30),

    ('Chicken coconut curry',                   'Chicken thigh, skinless',  500),
    ('Chicken coconut curry',                   'Coconut milk, canned',     400),
    ('Chicken coconut curry',                   'Onion',                    150),
    ('Chicken coconut curry',                   'Tomato',                   400),
    ('Chicken coconut curry',                   'White rice, cooked',       600),

    ('Chicken fajita wraps',                    'Chicken breast, skinless', 300),
    ('Chicken fajita wraps',                    'Bell pepper',              200),
    ('Chicken fajita wraps',                    'Onion',                    100),
    ('Chicken fajita wraps',                    'Wholemeal tortilla',       120),
    ('Chicken fajita wraps',                    'Olive oil',                10),

    ('Chicken and broccoli stir-fry',           'Chicken breast, skinless', 450),
    ('Chicken and broccoli stir-fry',           'Broccoli',                 250),
    ('Chicken and broccoli stir-fry',           'Bell pepper',              150),
    ('Chicken and broccoli stir-fry',           'Soy sauce',                30),
    ('Chicken and broccoli stir-fry',           'White rice, cooked',       450),
    ('Chicken and broccoli stir-fry',           'Olive oil',                15)
) AS v(recipe, ingredient, grams)
JOIN recipes r     ON r.name = v.recipe
JOIN ingredients i ON i.name = v.ingredient
ON CONFLICT DO NOTHING;
