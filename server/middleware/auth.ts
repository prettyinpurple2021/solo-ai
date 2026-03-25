import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { logError } from '../utils/logger';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    // Only accept tokens from the Authorization: Bearer header.
    // Cookie-based auth is intentionally not supported to prevent CSRF attacks.
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
        ? authHeader.substring(7)
        : undefined;

    if (!token) {
        res.status(401).json({ error: 'Unauthorized - No token provided' });
        return;
    }

    try {
        const decoded = verifyToken(token);
        if (!decoded) {
            res.status(401).json({ error: 'Unauthorized - Invalid token' });
            return;
        }

        // Attach user info to request
        req.userId = decoded.userId;
        req.userEmail = decoded.email;

        next();
    } catch (error) {
        logError('Token verification error in authMiddleware:', error);
        res.status(401).json({ error: 'Unauthorized - Token verification failed' });
    }
}

// Optional auth - doesn't fail if no token, just doesn't set userId
export function optionalAuth(req: Request, arg_Response: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
        ? authHeader.substring(7)
        : undefined;

    if (token) {
        try {
            const decoded = verifyToken(token);
            if (decoded) {
                req.userId = decoded.userId;
                req.userEmail = decoded.email;
            }
        } catch (error) {
            logError('Token verification error in optionalAuth:', error);
            // Non-fatal for optional auth — continue without setting userId
        }
    }

    next();
}
