import express from "express";
import router from "./metrics/index.js";
import handleUserUpdated from "./src/handlers/userAttributesUpdated.js";
import handleUserGoals from "./src/handlers/userGoalsUpdated.js";
import pkg from 'pg';

const { Pool } = pkg;

const app = express();
app.use(express.json());
app.use(router);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

app.get("/", (req, res) => {
    res.json({ service: "user_service running" });
});

app.put("/users/:user_id/profile", async (req, res) => {
    try {
        const { user_id } = req.params;
        const { weight, height, age, gender, goal, activity_level } = req.body;
        const profileData = { user_id, weight, height, age, gender, goal, activity_level };

        await handleUserUpdated(profileData);
        await handleUserGoals(profileData);

        res.json({ success: true });
    } catch (error) {
        console.error("Error in profile update route:", error);
        res.status(500).json({ error: "Failed to update user profile" });
    }
});

app.get("/users/:user_id/goals", async (req, res) => {
    try {
        const { user_id } = req.params;
        const result = await pool.query(
            `SELECT calorie_goal, protein_goal, carbs_goal, fat_goal, fibre_goal, bmr, tdee
             FROM user_goals WHERE user_id = $1`,
            [user_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No goals found for user" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching user goals:", error);
        res.status(500).json({ error: "Failed to fetch user goals" });
    }
});

app.listen(4001, () => {
    console.log("User service running on port 4001");
});
