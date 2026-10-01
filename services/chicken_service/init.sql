CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Nutrition values are per 100g raw (approximate, based on USDA FoodData Central)
CREATE TABLE IF NOT EXISTS chicken_cuts (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              TEXT NOT NULL UNIQUE,
    skin_on           BOOLEAN NOT NULL DEFAULT FALSE,
    calories_per_100g NUMERIC(10,4) DEFAULT 0,
    protein_per_100g  NUMERIC(10,4) DEFAULT 0,
    carbs_per_100g    NUMERIC(10,4) DEFAULT 0,
    fats_per_100g     NUMERIC(10,4) DEFAULT 0,
    fiber_per_100g    NUMERIC(10,4) DEFAULT 0,
    created_at        TIMESTAMP DEFAULT NOW()
);

INSERT INTO chicken_cuts (name, skin_on, calories_per_100g, protein_per_100g, carbs_per_100g, fats_per_100g, fiber_per_100g) VALUES
    ('Chicken breast, skinless', FALSE, 120, 22.5, 0, 2.6, 0),
    ('Chicken breast, skin on',  TRUE,  172, 20.9, 0, 9.3, 0),
    ('Chicken thigh, skinless',  FALSE, 121, 19.7, 0, 4.1, 0),
    ('Chicken thigh, skin on',   TRUE,  221, 16.5, 0, 16.6, 0),
    ('Chicken drumstick, skinless', FALSE, 119, 20.6, 0, 3.7, 0),
    ('Chicken wing, skin on',    TRUE,  191, 17.5, 0, 12.9, 0),
    ('Ground chicken',           FALSE, 143, 17.4, 0, 8.1, 0),
    ('Chicken liver',            FALSE, 119, 16.9, 0.7, 4.8, 0)
ON CONFLICT (name) DO NOTHING;

CREATE INDEX IF NOT EXISTS chicken_cuts_name_fts_idx
    ON chicken_cuts USING GIN (to_tsvector('english', name));
