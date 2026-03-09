import { Partitioners, Kafka, logLevel } from "kafkajs";


export const kafka = new Kafka({
  clientId: process.env.SERVICE_NAME || "meal-service",
  brokers: ['localhost:9092'],
  connectionTimeout: 5000, 
  loglevel: logLevel.INFO,
});

export const producer = kafka.producer({
  allowAutoTopicCreation: false,
});