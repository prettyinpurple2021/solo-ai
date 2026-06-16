import { rateLimit } from 'express-rate-limit';

// Standard rate limiter for general API routes (generous)
export const standardApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
    skip: (req) => req.path === '/api/health', // health checks are never rate-limited
});

// Strict rate limiter for authentication routes (login, signup)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts, please try again after 15 minutes.' },
});

// Moderate rate limiter for AI execution routes to prevent abuse but allow normal usage
export const aiExecutionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'AI request limit reached. Please wait a moment before trying again.' },
});
