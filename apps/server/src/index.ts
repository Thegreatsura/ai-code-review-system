import { logger } from '@repo/logger';
import cors from 'cors';
import express from 'express';
import 'dotenv/config';
import { producer } from '@repo/kafka';
import { authMiddleware } from './middleware/auth.js';
import { githubRoutes } from './modules/index.js';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(
    cors({
        origin: ['http://localhost:3000'],
        credentials: true,
    }),
);

app.use(express.json());

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'server' });
});

app.use('/api/github', authMiddleware, githubRoutes);

async function start() {
    await producer.connect();
    logger.info('Kafka producer connected');

    app.listen(PORT, () => {
        logger.info({ port: PORT }, 'Server started');
    });
}

start();
