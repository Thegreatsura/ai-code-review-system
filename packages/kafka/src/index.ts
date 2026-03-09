import { Kafka } from "kafkajs";

export const kafka = new Kafka({
	clientId: "ai-code-review-system",
	brokers: ["localhost:9092"],
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: "review-workers" });
