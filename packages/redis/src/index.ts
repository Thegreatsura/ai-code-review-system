import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL;

export const redis = REDIS_URL
    ? new Redis(REDIS_URL, { tls: { rejectUnauthorized: false }, maxRetriesPerRequest: null })
    : new Redis({ host: 'localhost', port: 6379, maxRetriesPerRequest: null });
