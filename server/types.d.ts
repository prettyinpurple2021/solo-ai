declare module '@sentry/node';

declare namespace Express {
    export interface Request {
        userId?: string;
        userEmail?: string;
    }
}
