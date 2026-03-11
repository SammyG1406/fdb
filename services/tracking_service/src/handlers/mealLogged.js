
import { pool } from "../db"

async function handleMealLogged(event) {
  console.log("Handling MealLogged event");

  const query = `
    INSERT INTO meal_logs_received (
      event_id,
      meal_id,
      user_id,
      calories,
      protein,
      carbs,
      fat,
      logged_at
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
  `;

  const values = [
    event.eventId,
    event.mealId,
    event.userId,
    event.calories,
    event.protein,
    event.carbs,
    event.fat,
    event.loggedAt
  ];

  await pool.query(query, values);

  console.log({
    userId: event.userId,
    calories: event.calories,
    protein: event.protein,
    carbs: event.carbs,
    fat: event.fat,
  });

  console.log("Event Persisted to tracking_db");
}

module.exports = { handleMealLogged };