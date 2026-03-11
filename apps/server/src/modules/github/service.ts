import prisma from '@repo/db';
import { Octokit } from 'octokit';

export interface GitHubStats {
    totalRepositories: number;
    totalCommits: number;
}

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

    const totalRepositories = repos.length;

    let totalCommits = 0;
    for (const repo of repos) {
        try {
            const { data: commits } = await octokit.request('GET /repos/{owner}/{repo}/commits', {
                owner: repo.owner!.login,
                repo: repo.name,
                per_page: 1,
            });
            if (commits.length > 0) {
                totalCommits += 1;
            }
        } catch {
            // Skip repos where we can't fetch commits
        }
    }

    return {
        totalRepositories,
        totalCommits,
    };
}
