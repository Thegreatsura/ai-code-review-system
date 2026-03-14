import type { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import { FailResponse, SuccessResponse } from '../../utils/response-helpers.js';
import { getUserReviewHistory } from './service.js';

export async function getReviewHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(StatusCodes.UNAUTHORIZED).json(
                new FailResponse.Builder().withMessage('Unauthorized').withContent({ error: 'Unauthorized' }).build(),
            );
            return;
        }

        const reviews = await getUserReviewHistory(userId);
        res.status(StatusCodes.OK).json(
            new SuccessResponse.Builder()
                .withMessage('Review history fetched successfully')
                .withContent(reviews)
                .build(),
        );
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
            new FailResponse.Builder()
                .withMessage('Failed to fetch review history')
                .withContent({ error: error instanceof Error ? error.message : 'Unknown error' })
                .build(),
        );
    }
}
