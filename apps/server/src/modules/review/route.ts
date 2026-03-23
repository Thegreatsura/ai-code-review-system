import { type Router as ExpressRouter, Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { getReviewEventsHandler, getReviewHistory } from './controller.js';

const router: ExpressRouter = Router();

router.get('/history', authMiddleware, getReviewHistory);
router.get('/events/:id', authMiddleware, getReviewEventsHandler);

export default router;
