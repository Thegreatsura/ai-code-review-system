import { type Router as ExpressRouter, Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { getReviewHistory } from './controller.js';

const router: ExpressRouter = Router();

router.get('/history', authMiddleware, getReviewHistory);

export default router;
