CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS foods (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name             TEXT NOT NULL,
    calories_per_100g NUMERIC(10,4) DEFAULT 0,
    protein_per_100g  NUMERIC(10,4) DEFAULT 0,
    carbs_per_100g    NUMERIC(10,4) DEFAULT 0,
    fats_per_100g     NUMERIC(10,4) DEFAULT 0,
    fiber_per_100g    NUMERIC(10,4) DEFAULT 0
);

-- Staging table matches the CSV column names exactly
CREATE TEMP TABLE foods_staging (
    food_name TEXT,
    calories  NUMERIC(10,4),
    protein_g NUMERIC(10,4),
    fat_g     NUMERIC(10,4),
    carbs_g   NUMERIC(10,4),
    fibre_g   NUMERIC(10,4)
);

COPY foods_staging (food_name, calories, protein_g, fat_g, carbs_g, fibre_g)
FROM '/data/combined_foods.csv'
WITH (FORMAT csv, HEADER true);

INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fats_per_100g, fiber_per_100g)
SELECT food_name, calories, protein_g, carbs_g, fat_g, fibre_g
FROM foods_staging;

CREATE INDEX IF NOT EXISTS foods_name_fts_idx
    ON foods USING GIN (to_tsvector('english', name));
