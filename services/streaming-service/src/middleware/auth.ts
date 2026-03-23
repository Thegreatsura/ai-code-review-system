import type { NextFunction, Request, Response } from 'express';
import { auth } from '../auth.js';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        name: string;
    };
}

export async function authenticateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.slice(7);
    if (!token) {
        res.status(401).json({ error: 'Missing token' });
        return;
    }

    const session = await auth.api.getSession({
        headers: new Headers({
            Authorization: `Bearer ${token}`,
        }),
    });

    if (!session?.user) {
        res.status(401).json({ error: 'Invalid or expired session' });
        return;
    }

    req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
    };

    next();
}
