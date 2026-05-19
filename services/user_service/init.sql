CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS user_profile (
    user_id TEXT PRIMARY KEY,
    weight NUMERIC(6,2),
    height NUMERIC(6,2),
    age INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female', 'non_binary', 'prefer_not_to_say')),
    goal TEXT CHECK (goal IN ('lose_weight', 'maintain', 'build_muscle', 'improve_fitness')),
    activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_goals (
    user_id TEXT PRIMARY KEY,
    bmr NUMERIC(10,2),
    tdee NUMERIC(10,2),
    calorie_goal NUMERIC(10,2),
    protein_goal NUMERIC(10,2),
    carbs_goal NUMERIC(10,2),
    fat_goal NUMERIC(10,2),
    fibre_goal NUMERIC(10,2),
    updated_at TIMESTAMP DEFAULT NOW()
);
