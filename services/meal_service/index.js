import "dotenv/config";
import express from "express";
import { randomUUID } from "crypto";

import { mealLoggedEventSchema } from "../../shared/schemas/mealLogged.Schema.js";
import { mealUpdatedEventSchema } from "../../shared/schemas/mealUpdated.Schema.js";
import { mealDeletedEventSchema } from "../../shared/schemas/mealDeleted.Schema.js";
import router from "./metrics/index.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ service: "meal_service" });
});

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "meal_service" });
});

app.use(router);

app.post("/meals/log", async (req, res) => {
  try {
    const { userId, mealType, mealDate, totalCalories, totalProtein, totalCarbs, totalFats } = req.body;
    const now = new Date().toISOString();

    const rawEvent = {
      eventId: randomUUID(),
      eventType: "MealLogged",
      version: 1,
      occurredAt: now,
      source: "meal_service",
      payload: {
        mealId: randomUUID(),
        userId,
        mealType,
        mealDate,
        totalCalories: totalCalories ?? 0,
        totalProtein: totalProtein ?? 0,
        totalCarbs: totalCarbs ?? 0,
        totalFats: totalFats ?? 0,
      },
    };

    const event = mealLoggedEventSchema.parse(rawEvent);
    res.json({ success: true, event });
  } catch (error) {
    console.error("Meal log failed:", error);
    res.status(500).json({ success: false, error: error.message || "Meal log failed" });
  }
});

app.listen(4002, "0.0.0.0", () => {
  console.log("meal_service running on port 4002");
});
