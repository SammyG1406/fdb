import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const ACTIVITY_MULTIPLIERS = {
    sedentary:         1.2,
    lightly_active:    1.375,
    moderately_active: 1.55,
    very_active:       1.725,
    extremely_active:  1.9,
};

const GOAL_ADJUSTMENTS = {
    lose_weight:     0.80,
    maintain:        1.00,
    build_muscle:    1.10,
    improve_fitness: 1.00,
};

// Harris-Benedict revised formula
function calculateBMR(weight, height, age, gender) {
    const maleBMR   = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    const femaleBMR = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    if (gender === 'male')   return maleBMR;
    if (gender === 'female') return femaleBMR;
    return (maleBMR + femaleBMR) / 2;
}

export default async function handleUserGoals(event) {
    const { user_id, weight, height, age, gender, activity_level, goal } = event;

    if (!weight || !height || !age || !gender || !activity_level) {
        console.log(`Skipping goal calculation for ${user_id}: missing required fields`);
        return;
    }

    const bmr              = calculateBMR(weight, height, age, gender);
    const activityMult     = ACTIVITY_MULTIPLIERS[activity_level] ?? 1.2;
    const tdee             = bmr * activityMult;
    const goalAdj          = GOAL_ADJUSTMENTS[goal] ?? 1.0;
    const calorieGoal      = Math.round(tdee * goalAdj);

    // 30% protein, 40% carbs, 30% fat; fibre fixed at 30g
    const proteinGoal = Math.round((calorieGoal * 0.30) / 4);
    const carbsGoal   = Math.round((calorieGoal * 0.40) / 4);
    const fatGoal     = Math.round((calorieGoal * 0.30) / 9);
    const fibreGoal   = 30;

    try {
        await pool.query(
            `INSERT INTO user_goals
               (user_id, bmr, tdee, calorie_goal, protein_goal, carbs_goal, fat_goal, fibre_goal, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
             ON CONFLICT (user_id) DO UPDATE SET
               bmr          = EXCLUDED.bmr,
               tdee         = EXCLUDED.tdee,
               calorie_goal = EXCLUDED.calorie_goal,
               protein_goal = EXCLUDED.protein_goal,
               carbs_goal   = EXCLUDED.carbs_goal,
               fat_goal     = EXCLUDED.fat_goal,
               fibre_goal   = EXCLUDED.fibre_goal,
               updated_at   = NOW()`,
            [user_id, bmr, tdee, calorieGoal, proteinGoal, carbsGoal, fatGoal, fibreGoal]
        );
        console.log(`Goals stored for ${user_id}: ${calorieGoal} kcal (BMR ${Math.round(bmr)}, TDEE ${Math.round(tdee)})`);
    } catch (error) {
        console.error('Error storing user goals:', error);
        throw error;
    }
}
