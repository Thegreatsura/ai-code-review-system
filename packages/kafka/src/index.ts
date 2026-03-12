import { Kafka, logLevel } from 'kafkajs';

export const kafka = new Kafka({
    clientId: 'ai-code-review-system',
    brokers: ['localhost:9092'],
    logLevel: logLevel.WARN,
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: 'review-workers' });

export async function sendMessage(topic: string, message: object): Promise<void> {
    try {
        await producer.connect();
    } catch (error) {
        console.error('Failed to connect producer:', error);
        throw new Error('Failed to connect to Kafka');
    }

    try {
        await producer.send({
            topic,
            messages: [{ value: JSON.stringify(message) }],
        });
    } catch (error) {
        console.error('Failed to send message:', error);
        throw new Error('Failed to send message to Kafka');
    }
}
