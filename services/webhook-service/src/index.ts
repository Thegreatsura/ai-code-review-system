import 'dotenv/config';
import prisma from '@repo/db';
import { logger } from '@repo/logger';
import { addJob, createQueue } from '@repo/queue';
import crypto from 'crypto';
import express from 'express';

const QUEUE_NAME = 'pr-review';
const app = express();
const PORT = process.env.PORT || 4000;
const WEBHOOK_SECRET = process.env.GITHUB_BOT_WEBHOOK_SECRET!;
const prReviewQueue = createQueue(QUEUE_NAME);

app.use(express.json());

// ✅ Verify webhook signature from GitHub
function verifySignature(req: express.Request): boolean {
    const signature = req.headers['x-hub-signature-256'] as string;
    if (!signature) return false;
    const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
    const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'webhook-service' });
});

app.post('/api/webhooks/github', async (req, res) => {
    if (!verifySignature(req)) {
        logger.warn('Invalid webhook signature');
        return res.sendStatus(401);
    }

    const event = req.headers['x-github-event'] as string;
    const delivery = req.headers['x-github-delivery'] as string;
    logger.info({ event, delivery }, 'GitHub webhook received');

    // ✅ Handle bot installation — populates your Installation table
    if (event === 'installation') {
        const action = req.body.action;
        const installation = req.body.installation;

        if (action === 'created') {
            // Find the user by their GitHub account login
            const account = await prisma.account.findFirst({
                where: {
                    providerId: 'github',
                    accountId: String(installation.account.id),
                },
            });

            if (account) {
                await prisma.installation.upsert({
                    where: { installationId: String(installation.id) },
                    create: {
                        installationId: String(installation.id),
                        accountLogin: installation.account.login,
                        accountType: installation.account.type,
                        userId: account.userId,
                    },
                    update: {
                        suspended: false,
                    },
                });
                logger.info({ installationId: installation.id }, 'Installation created');
            }
        }

        if (action === 'deleted' || action === 'suspend') {
            await prisma.installation.updateMany({
                where: { installationId: String(installation.id) },
                data: { suspended: true },
            });
            logger.info({ installationId: installation.id }, 'Installation suspended/deleted');
        }
    }

    if (event === 'pull_request') {
        const action = req.body.action;
        const pr = req.body.pull_request;
        const repo = req.body.repository;
        const installationId = req.body.installation?.id; // ✅ GitHub sends this on every event

        const owner = repo?.owner?.login;
        const repoName = repo?.name;
        const fullName = repo?.full_name;

        // ✅ Also handle 'synchronize' (new commits pushed to PR)
        if (owner && repoName && fullName && (action === 'opened' || action === 'synchronize')) {
            try {
                const repository = await prisma.repository.findFirst({
                    where: { fullName },
                    include: { installation: true },
                });

                if (repository) {
                    await addJob(
                        prReviewQueue,
                        'pr-review',
                        {
                            owner,
                            repo: repoName,
                            prNumber: pr?.number,
                            userId: repository.userId,
                            installationId: repository.installation.installationId, // ✅ bot auth
                        },
                        {
                            jobId: `pr-review-${owner}-${repoName}-${pr?.number}-${action}`,
                        },
                    );
                    logger.info({ owner, repo: repoName, prNumber: pr?.number, action }, 'PR review queued');
                } else {
                    logger.warn({ fullName }, 'Repository not found in database');
                }
            } catch (error) {
                logger.error({ error, fullName }, 'Error processing PR event');
            }
        }
    }

    if (event === 'ping') {
        logger.info('GitHub App ping received');
    }

    res.sendStatus(200);
});

async function main(): Promise<void> {
    app.listen(PORT, () => {
        logger.info({ port: PORT }, 'Webhook service started');
    });
}

main();

process.on('SIGTERM', async () => {
    await prReviewQueue.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await prReviewQueue.close();
    process.exit(0);
});
