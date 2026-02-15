import { Request } from 'express';
import { verifyToken } from './jwt';

/**
 * Extracts the User ID from the request headers.
 * Supports standard Bearer token (JWT) and internal x-stack-user-id header.
 * 
 * @param req Express Request object
 * @returns User ID string or null if not found/valid
 */
export const getUserId = (req: Request): string | null => {
    // Check Authorization header for Bearer token
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        if (decoded) return decoded.userId;
    }

    // Check specific Stack Auth header
    const stackUserId = req.headers['x-stack-user-id'] as string;
    if (stackUserId) return stackUserId;

    return null;
};
