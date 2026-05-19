import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

export default async function handleUserUpdated(event) {
    const { user_id, weight, height, age, gender, goal, activity_level } = event;

    try {
        await pool.query(
            `INSERT INTO user_profile (user_id, weight, height, age, gender, goal, activity_level, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
             ON CONFLICT (user_id) DO UPDATE SET
               weight = COALESCE(EXCLUDED.weight, user_profile.weight),
               height = COALESCE(EXCLUDED.height, user_profile.height),
               age = COALESCE(EXCLUDED.age, user_profile.age),
               gender = COALESCE(EXCLUDED.gender, user_profile.gender),
               goal = COALESCE(EXCLUDED.goal, user_profile.goal),
               activity_level = COALESCE(EXCLUDED.activity_level, user_profile.activity_level),
               updated_at = NOW()`,
            [user_id, weight ?? null, height ?? null, age ?? null, gender ?? null, goal ?? null, activity_level ?? null]
        );
        console.log(`User profile upserted for ${user_id}`);
    } catch (error) {
        console.error('Error upserting user profile:', error);
        throw error;
    }
}
