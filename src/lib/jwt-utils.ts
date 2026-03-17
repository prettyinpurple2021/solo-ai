import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export function generateBackendToken(userId: string, email: string): string {
    return jwt.sign(
        { userId, email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}
