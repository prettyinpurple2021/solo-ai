import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

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

    const decoded = verifyToken(token);
    if (!decoded) {
        res.status(401).json({ error: 'Unauthorized - Invalid token' });
        return;
    }

    // Attach user info to request
    req.userId = decoded.userId;
    req.userEmail = decoded.email;

    next();
}

// Optional auth - doesn't fail if no token, just doesn't set userId
export function optionalAuth(req: Request, arg_Response: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
        ? authHeader.substring(7)
        : undefined;

    if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
            req.userId = decoded.userId;
            req.userEmail = decoded.email;
        }
    }

    next();
}
