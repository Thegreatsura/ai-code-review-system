import { kafka } from '@repo/kafka';
import { logger } from '@repo/logger';

const TOPIC = 'repo.index';

async function startConsumer(): Promise<void> {
    const consumer = kafka.consumer({ groupId: 'repo-indexer' });
    await consumer.connect();
    await consumer.subscribe({ topic: TOPIC, fromBeginning: false });
    await consumer.run({
        eachMessage: async ({ message }) => {
            const value = message.value?.toString();
            if (!value) return;

            const repoDetails = JSON.parse(value);
            logger.info({ repoDetails }, 'Received index-repo event');
        },
    });

    logger.info({ topic: TOPIC }, 'Kafka consumer started');
}

async function main(): Promise<void> {
    logger.info('Repo Indexer service started');
    await startConsumer();
}

main().catch((error) => {
    logger.error({ error }, 'Failed to index repository');
    process.exit(1);
});
