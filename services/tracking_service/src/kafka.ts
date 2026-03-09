import { Kafka, logLevel } from "kafkajs";

const brokers = (process.env.KAFKA_BROKERS || "localhost:9092").split(",");

export const kafka = new Kafka({
  clientId: process.env.SERVICE_NAME || "unknown-service",
  brokers,
  logLevel: logLevel.INFO,
});

export const producer = kafka.producer({
  allowAutoTopicCreation: false,
});