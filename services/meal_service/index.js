


import { producer } from "./kafka";

export async function startKafkaProducer() {
  await producer.connect();
}
export async function publishMealLogged(event: {
  eventId: string;
  mealId: string;
  userId: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  loggedAt: string;
}) {
  await producer.send({
    topic: "meal.events",
    messages: [
      {
        key: event.userId,
        value: JSON.stringify({
          eventType: "MealLogged",
          eventVersion: 1,
          ...event,
        }),
      },
    ],
  });
}

const express = require("express");
const app = express();
app.get("/", (_, res) => res.json({ service: "meal_service" }));
app.listen(4002, () => console.log("meal_service on 4002"));