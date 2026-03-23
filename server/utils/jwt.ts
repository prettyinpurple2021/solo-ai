import jwt from 'jsonwebtoken';

/** Must match `/api/ws-token` signing secret: same as Vercel `JWT_SECRET`, or `AUTH_SECRET` if only that is set. */
const JWT_SECRET =
    process.env.JWT_SECRET || process.env.AUTH_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

export function generateToken(userId: string, email: string): string {
    return jwt.sign(
        { userId, email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

export function verifyToken(token: string): { userId: string; email: string } | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
        return decoded;
    } catch (error) {
        return null;
    }
}
