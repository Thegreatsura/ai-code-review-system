import { logger } from "@repo/logger";
import fs from "fs-extra";
import { glob } from "glob";
import { simpleGit } from "simple-git";

const git = simpleGit();

async function indexRepository(repoPath: string): Promise<void> {
	logger.info({ repoPath }, "Indexing repository");

	const files = await glob("**/*", {
		cwd: repoPath,
		ignore: ["node_modules/**", ".git/**", "dist/**", "build/**"],
	});

	logger.info({ fileCount: files.length }, "Found files");

	for (const file of files) {
		const filePath = `${repoPath}/${file}`;
		const stats = await fs.stat(filePath);
		if (stats.isFile()) {
			logger.debug({ file }, "Indexed file");
		}
	}

	logger.info({ repoPath }, "Repository indexed successfully");
}

async function main(): Promise<void> {
	logger.info("Repo Indexer service started");

	const repoPath = process.argv[2] || process.cwd();
	await indexRepository(repoPath);
}

main().catch((error) => {
	logger.error({ error }, "Failed to index repository");
	process.exit(1);
});
