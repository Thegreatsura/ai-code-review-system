import prisma from '@repo/db';
import type { GitHubStats } from '@repo/types';
import { Octokit } from 'octokit';

export async function getGitHubStats(userId: string): Promise<GitHubStats> {
    const account = await prisma.account.findFirst({
        where: {
            userId,
            providerId: 'github',
        },
        select: {
            accessToken: true,
        },
    });

    if (!account?.accessToken) {
        throw new Error('GitHub account not connected');
    }

    const octokit = new Octokit({
        auth: account.accessToken,
    });

    const { data: repos } = await octokit.request('GET /user/repos', {
        per_page: 100,
        sort: 'updated',
    });

    const totalRepos = repos.length;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    const reposThisMonth = repos.filter((repo) => {
        const createdAtStr = repo.created_at;
        if (!createdAtStr) return false;
        const createdAt = new Date(createdAtStr);
        return createdAt >= startOfMonth;
    }).length;

    const monthlyRepoTrend: { [key: string]: number } = {};
    for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toISOString().slice(0, 7);
        monthlyRepoTrend[monthKey] = 0;
    }

    repos.forEach((repo) => {
        const createdAtStr = repo.created_at;
        if (!createdAtStr) return;
        const createdAt = new Date(createdAtStr);
        if (createdAt >= oneYearAgo) {
            const monthKey = createdAt.toISOString().slice(0, 7);
            if (monthKey in monthlyRepoTrend) {
                monthlyRepoTrend[monthKey] = (monthlyRepoTrend[monthKey] || 0) + 1;
            }
        }
    });

    const repoTrend = Object.entries(monthlyRepoTrend)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month));

    const monthlyCommitTrend: { [key: string]: number } = {};
    for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toISOString().slice(0, 7);
        monthlyCommitTrend[monthKey] = 0;
    }

    let actualCommitsThisWeek = 0;
    let totalCommits = 0;

    for (const repo of repos) {
        try {
            const { data: commits } = await octokit.request('GET /repos/{owner}/{repo}/commits', {
                owner: repo.owner!.login,
                repo: repo.name,
                per_page: 100,
            });

            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            commits.forEach((commit) => {
                const commitDateStr = commit.commit.author?.date;
                if (!commitDateStr) return;

                const commitDate = new Date(commitDateStr);
                if (commitDate >= weekAgo) {
                    actualCommitsThisWeek++;
                }
                if (commitDate >= oneYearAgo) {
                    const monthKey = commitDate.toISOString().slice(0, 7);
                    if (monthKey in monthlyCommitTrend) {
                        monthlyCommitTrend[monthKey] = (monthlyCommitTrend[monthKey] || 0) + 1;
                    }
                }
                totalCommits++;
            });
        } catch {
            // Skip repos where we can't fetch commits
        }
    }

    const commitTrend = Object.entries(monthlyCommitTrend)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month));

    return {
        repos: {
            total: totalRepos,
            thisMonth: reposThisMonth,
            trend: repoTrend,
        },
        commits: {
            total: totalCommits,
            thisWeek: actualCommitsThisWeek,
            trend: commitTrend,
        },
    };
}
