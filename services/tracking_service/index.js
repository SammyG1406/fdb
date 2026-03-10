require("dotenv").config();

const express = require("express");
const { consumer } = require("./src/kafka");

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

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.value) return;

      const event = JSON.parse(message.value.toString());
      await handleMealLogged(event);
      console.log("tracking_service received event:");
    },
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