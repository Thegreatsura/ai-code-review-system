import 'dotenv/config';
import { google } from '@ai-sdk/google';
import prisma from '@repo/db';
import { ensureTopics, kafkaManager, sendMessageWithKey } from '@repo/kafka';
import { logger } from '@repo/logger';
import { generateText } from 'ai';

const TOPIC_REVIEW = 'pr.ai-review';
const TOPIC_ISSUES = 'pr.issues';
const TOPIC_COMMENT = 'pr.comment';

interface AIReviewMessage {
    title: string;
    description: string;
    context: string[];
    diff: string;
    repoId: string;
    owner: string;
    repo: string;
    prNumber: number;
    userId: string;
    commitSha: string;
}

async function getAccessToken(userId: string): Promise<string | null> {
    try {
        const account = await prisma.account.findFirst({
            where: { userId, providerId: 'github' },
            select: { accessToken: true },
        });
        return account?.accessToken ?? null;
    } catch (error) {
        logger.error({ error, userId }, 'Failed to fetch access token from database');
        return null;
    }
}

interface ReviewIssue {
    file: string;
    line: number;
    severity: 'critical' | 'warning' | 'suggestion';
    description: string;
    oldCode: string;
    newCode: string;
    suggestion: string;
}

interface ReviewResult {
    issues: ReviewIssue[];
    summary: string;
    strengths: string;
}

function findLineNumberInDiff(diff: string, file: string, code: string): number {
    const lines = diff.split('\n');
    let currentFile = '';
    let hunkStartLine = 0;
    const searchCode = code.substring(0, 30).trim();

    for (const line of lines) {
        if (line.startsWith('diff --git')) {
            const match = line.match(/b\/(.+)/);
            if (match && match[1]) currentFile = match[1];
        } else if (line.startsWith('@@')) {
            const match = line.match(/@@ -\d+(?:,\d+)? \+(\d+)/);
            if (match && match[1]) hunkStartLine = parseInt(match[1], 10);
        } else if (currentFile === file && line.includes(searchCode)) {
            return hunkStartLine;
        } else if (currentFile === file && (line.startsWith('+') || line.startsWith(' '))) {
            hunkStartLine++;
        }
    }

    return 1;
}

interface ReviewResult {
    issues: ReviewIssue[];
    summary: string;
    strengths: string;
}

function createIssueHash(issue: ReviewIssue): string {
    return `${issue.file}:${issue.line}:${issue.description.substring(0, 50)}`;
}

function deduplicateIssues(issues: ReviewIssue[]): ReviewIssue[] {
    const seen = new Set<string>();
    const deduplicated: ReviewIssue[] = [];

    for (const issue of issues) {
        const hash = createIssueHash(issue);
        if (!seen.has(hash)) {
            seen.add(hash);
            deduplicated.push(issue);
        } else {
            logger.warn({ issue }, 'Duplicate issue found, skipping');
        }
    }

    return deduplicated;
}

async function generateCodeReview(
    title: string,
    description: string,
    context: string[],
    diff: string,
): Promise<ReviewResult> {
    const prompt = `You are an expert code reviewer. Analyze the following pull request and provide a structured code review.

PR Title: ${title}
PR Description: ${description || 'No description provided'}

Context from Codebase:
${context.join('\n\n')}

Code Changes:
\`\`\`diff
${diff}
\`\`\`

Analyze the changes and return a JSON object with the following structure:
{
  "issues": [
    {
      "file": "filename.ts",
      "severity": "critical|warning|suggestion",
      "description": "What's wrong - be specific and concise",
      "oldCode": "exact code that was removed (leave empty if new code only)",
      "newCode": "exact code that was added (leave empty if removal only)",
      "suggestion": "how to fix it - be specific"
    }
  ],
  "summary": "Brief overview of the changes in 2-3 sentences",
  "strengths": "What's done well - mention specific positive aspects"
}

IMPORTANT:
1. For oldCode and newCode, provide the EXACT code from the diff (without +/- prefixes)
2. Only report actual issues - bugs, security vulnerabilities, logic errors, performance concerns
3. If no significant issues found, return empty array for issues
4. Each issue should be unique - don't report the same issue multiple times

Return ONLY valid JSON, no markdown formatting.`;

    const { text } = await generateText({
        model: google('gemini-2.5-flash'),
        prompt,
    });

    try {
        // Step 1: Strip markdown code fences if present
        let cleanedText = text.trim();
        if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText
                .replace(/^```(?:json)?\s*/i, '')
                .replace(/\s*```$/, '')
                .trim();
        }

        // Step 2: Extract outermost JSON object
        const startIdx = cleanedText.indexOf('{');
        const endIdx = cleanedText.lastIndexOf('}');
        if (startIdx === -1 || endIdx === -1) {
            throw new Error('No JSON object found in response');
        }
        cleanedText = cleanedText.slice(startIdx, endIdx + 1);

        // Step 3: Parse directly — don't mangle the JSON
        const result = JSON.parse(cleanedText) as ReviewResult;

        // Step 4: Validate shape
        if (!Array.isArray(result.issues)) result.issues = [];
        if (typeof result.summary !== 'string') result.summary = '';
        if (typeof result.strengths !== 'string') result.strengths = '';

        return result;
    } catch (parseError) {
        logger.error({ parseError, text: text.substring(0, 1000) }, 'Failed to parse AI response as JSON');
        // Fallback: return empty review instead of crashing the worker
        return {
            issues: [],
            summary: 'AI review could not be parsed.',
            strengths: '',
        };
    }
}

async function startConsumer(): Promise<void> {
    const consumer = kafkaManager.consumer({
        groupId: 'ai-review-worker',
        sessionTimeout: 300000,
        heartbeatInterval: 30000,
    });

    await consumer.connect();
    logger.info('[AI Review Worker] Consumer connected to Kafka');

    await consumer.subscribe({ topic: TOPIC_REVIEW, fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const value = message.value?.toString();
            if (!value) return;

            const reviewMessage = JSON.parse(value) as AIReviewMessage;
            logger.info({ reviewMessage, offset: message.offset }, 'Received AI review event');

            const { title, description, context, diff, repoId, owner, repo, prNumber, userId, commitSha } =
                reviewMessage;

            if (!userId) {
                logger.error('No userId provided in message');
                return;
            }

            try {
                logger.info({ repoId, prNumber }, 'Generating code review...');
                const review = await generateCodeReview(title, description, context, diff);

                const uniqueIssues = deduplicateIssues(review.issues);

                const issuesWithLines = uniqueIssues.map((issue) => {
                    const resolvedLine = findLineNumberInDiff(diff, issue.file, issue.newCode || issue.oldCode);
                    return {
                        ...issue,
                        line: resolvedLine,
                    };
                });

                logger.info(
                    { repoId, prNumber, totalIssues: review.issues.length, uniqueIssues: uniqueIssues.length },
                    'Deduplicated and resolved line numbers for issues',
                );

                const messageKey = `${owner}/${repo}/${prNumber}`;

                if (issuesWithLines.length > 0) {
                    await sendMessageWithKey(
                        TOPIC_ISSUES,
                        {
                            owner,
                            repo,
                            prNumber,
                            userId,
                            commitSha,
                            issues: issuesWithLines,
                        },
                        messageKey,
                    );
                    logger.info(
                        { repoId, prNumber, issuesCount: issuesWithLines.length },
                        'Sent issues to Kafka (will be posted first)',
                    );
                }

                const summaryMessage = `## Code Review Summary\n\n${review.summary}\n\n### Strengths\n${review.strengths}\n\n### Issues Found: ${uniqueIssues.length}`;
                await sendMessageWithKey(
                    TOPIC_COMMENT,
                    {
                        owner,
                        repo,
                        prNumber,
                        userId,
                        comment: summaryMessage,
                    },
                    messageKey,
                );
                logger.info({ repoId, prNumber }, 'Sent summary to Kafka (will be posted last)');
            } catch (error) {
                logger.error(
                    { error: String(error), repoId, prNumber, stack: error instanceof Error ? error.stack : undefined },
                    'Failed to generate/post review',
                );
            }
        },
    });

    logger.info({ topic: TOPIC_REVIEW }, 'Kafka consumer started');
}

async function main(): Promise<void> {
    logger.info('AI Review Worker service starting...');

    try {
        await ensureTopics([TOPIC_REVIEW, TOPIC_ISSUES, TOPIC_COMMENT]);
        logger.info('[AI Review Worker] Topics ensured');

        await startConsumer();
    } catch (error) {
        logger.error({ error }, 'Failed to start AI Review Worker');

        setTimeout(() => {
            logger.info('Retrying AI Review Worker startup...');
            main().catch((err) => {
                logger.error({ error: err }, 'Retry failed');
                process.exit(1);
            });
        }, 5000);

        return;
    }
}

main();

process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down gracefully...');
    await kafkaManager.disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    await kafkaManager.disconnect();
    process.exit(0);
});
