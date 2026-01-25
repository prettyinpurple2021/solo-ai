import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export type AuthRequest = Omit<Request, 'userId'> & {
    userId?: string;
    userEmail?: string;
};

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    // Get token from Authorization header or cookie
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
        ? authHeader.substring(7)
        : req.cookies?.token;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    // Attach user info to request
    req.userId = decoded.userId;
    req.userEmail = decoded.email;

    next();
}

// Optional auth - doesn't fail if no token, just doesn't set userId
export function optionalAuth(req: AuthRequest,: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
        ? authHeader.substring(7)
        : req.cookies?.token;

    if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
            req.userId = decoded.userId;
            req.userEmail = decoded.email;
        }
    }

    next();
}
