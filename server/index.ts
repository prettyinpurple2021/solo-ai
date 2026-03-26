import './env-load';
import * as Sentry from '@sentry/node';

// Initialize Sentry only when a DSN is explicitly configured
if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        integrations: [
            Sentry.httpIntegration(),
            Sentry.expressIntegration(),
        ],
    });
}

import express, { Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import { setIo, broadcastToUser } from './realtime';
import { setupBoardroomSocket } from './src/realtime/boardroom';
import { setupCommandCenterSocket, broadcastRevenueUpdate, broadcastAgentActivity } from './src/realtime/command-center';
import { logInfo, logWarn, logError } from './utils/logger';
import path from 'path';
import { verifyToken } from './utils/jwt';
import { authMiddleware } from './middleware/auth';

// Route Imports
import { authRouter } from './routes/auth';
import { userRouter } from './routes/user';
import { tasksRouter } from './routes/tasks';
import dashboardRouter from './routes/dashboard';
import aiRouter from './routes/ai';
import adminRouter from './routes/admin';
import contactsRouter from './routes/contacts';
import pitchDecksRouter from './routes/pitchDecks';
import slidesRouter from './routes/slides';
import stripeRouter from './routes/stripe';
import resourcesRouter from './routes/resources';
import searchRouter from './routes/search';
import { boardroomRouter } from './src/routes/boardroom';
import competitorsRouter from './routes/competitors';
import notificationsRouter from './routes/notifications';
import briefcaseRouter from './routes/briefcase';

process.on('uncaughtException', (err) => {
    logError('Uncaught Exception:', err);
    // Suppress pg/neon connection termination crashes
    if (err.message && (err.message.includes('Connection terminated unexpectedly') || err.message.includes('terminating connection due to administrator command'))) {
        logWarn('Ignoring fatal database connection termination (likely Neon scale-to-zero). The pool will reconnect.');
        return;
    }
});

process.on('unhandledRejection', (reason, promise) => {
    logError(`Unhandled Rejection at: ${promise}, reason:`, reason);
});

const app = express();
app.set('trust proxy', 1);

const httpServer = createServer(app);
const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
const allowedOrigins = Array.from(
    new Set(
        [
            process.env.CLIENT_URL || "https://solosuccessai.fun",
            "https://solosuccessai.fun",
            ...(isDevelopment ? ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"] : []),
        ].filter(Boolean)
    )
);

const io = new SocketServer(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Socket.IO Hardening: JWT Middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        logWarn(`Socket authentication failed: No token provided (${socket.id})`);
        return next(new Error("Authentication error"));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        logWarn(`Socket authentication failed: Invalid token (${socket.id})`);
        return next(new Error("Authentication error"));
    }

    // Attach verified identity to socket
    socket.data.userId = decoded.userId;
    next();
});

// Standard Socket handlers
io.on('connection', (socket) => {
    logInfo(`Client connected: ${socket.id} (User: ${socket.data.userId})`);

    // SECURE Join: Only join the room belonging to the verified userId
    socket.on('join', () => {
        const userId = socket.data.userId;
        socket.join(`user:${userId}`);
        logInfo(`User ${userId} joined their secure room`);
    });

    socket.on('disconnect', () => {
        logInfo(`Client disconnected: ${socket.id}`);
    });
});

setIo(io);
setupBoardroomSocket(io);
setupCommandCenterSocket(io);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());

// Global API rate limiter — 200 requests per 15 minutes per IP.
// Fine-grained limiters (e.g. stripe routes) apply stricter limits on top.
const globalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
    skip: (req) => req.path === '/api/health', // health checks are never rate-limited
});
app.use('/api', globalApiLimiter);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/ai', aiRouter);
app.use('/api/admin', adminRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/pitch-decks', pitchDecksRouter);
app.use('/api/slides', slidesRouter);
app.use('/api/stripe', stripeRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/search', searchRouter);
app.use('/api/boardroom', boardroomRouter);
app.use('/api/competitors', competitorsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/briefcase', briefcaseRouter);

// Serve static files from the frontend build folder
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Handle any requests that don't match the ones above by sending back the main index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        db: process.env.DATABASE_URL ? 'configured' : 'missing_env',
        websocket: 'active',
        timestamp: new Date().toISOString()
    });
});

// Sentry error handler must be after all routes
Sentry.setupExpressErrorHandler(app);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    logInfo(`Server running on port ${PORT}`);
});
