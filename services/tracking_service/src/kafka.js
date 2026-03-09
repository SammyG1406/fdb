import { Kafka, logLevel } from "kafkajs";

const brokers = (process.env.KAFKA_BROKERS || "localhost:9092").split(",");

export const kafka = new Kafka({
  clientId: process.env.SERVICE_NAME || "tracking-service",
  brokers,
  logLevel: logLevel.INFO,
});

export const consumer = kafka.consumer({
  groupId: "tracking-service",
});
