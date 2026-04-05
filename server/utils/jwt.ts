import jwt from 'jsonwebtoken';

/** Must match `/api/ws-token` signing secret: same as Vercel `JWT_SECRET`, or `AUTH_SECRET` if only that is set. */
const _jwtSecret = process.env.JWT_SECRET || process.env.AUTH_SECRET;
if (!_jwtSecret) {
    throw new Error('JWT_SECRET (or AUTH_SECRET) environment variable is required but not set.');
}
const JWT_SECRET: string = _jwtSecret;
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

export function generateToken(userId: string, email: string): string {
    return jwt.sign(
        { userId, email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

export type AccessTokenVerifyResult =
    | { ok: true; userId: string; email: string }
    | { ok: false; reason: 'expired' | 'invalid' };

export function verifyAccessToken(token: string): AccessTokenVerifyResult {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId?: string; email?: string };
        if (!decoded?.userId || decoded.email === undefined) {
            return { ok: false, reason: 'invalid' };
        }
        return { ok: true, userId: String(decoded.userId), email: decoded.email };
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return { ok: false, reason: 'expired' };
        }
        return { ok: false, reason: 'invalid' };
    }
}

export function verifyToken(token: string): { userId: string; email: string } | null {
    const r = verifyAccessToken(token);
    return r.ok ? { userId: r.userId, email: r.email } : null;
}
