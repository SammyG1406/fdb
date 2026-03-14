
require("dotenv").config();

const express = require("express");
const { consumer } = require("./src/kafka");
const { handleMealLogged } = require("./src/handlers/mealLogged")

const app = express();
app.use(express.json());

app.get("/", (_, res) => res.json({ service: "tracking_service" }));

app.get("/health", (_, res) => res.json({ ok: true, service: "tracking_service" }));


async function startConsumer() {
  await consumer.connect();
  console.log("Kafka consumer connected for tracking_service");

  await consumer.subscribe({
    topic: "meal.events",
    fromBeginning: false,
  });

  console.log("tracking_service subscribed to meal.events");

  import { handleMealLogged } from "./handlers/mealLogged.js";
import { handleMealUpdated } from "./handlers/mealUpdated.js";
import { handleMealDeleted } from "./handlers/mealDeleted.js";

await consumer.run({
  eachMessage: async ({ message }) => {

    const event = JSON.parse(message.value.toString());

    switch (event.type) {

      case "MealLogged":
        await handleMealLogged(event.payload);
        break;

      case "MealUpdated":
        await handleMealUpdated(event.payload);
        break;

      case "MealDeleted":
        await handleMealDeleted(event.payload);
        break;

      default:
        console.log("Unknown event type:", event.type);
    }
  }
});
}

async function start() {
  try {
    await startConsumer();

    app.listen(4003, () => {
      console.log("tracking_service on 4003");
    });
  } catch (error) {
    console.error("Failed to start tracking_service:", error);
    process.exit(1);
  }
}

start();