import 'dotenv/config';
import * as Sentry from '@sentry/node';
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import { setIo, broadcastToUser } from './realtime';
import { setupBoardroomSocket } from './src/realtime/boardroom';
import { logInfo, logWarn, logError } from './utils/logger';
import path from 'path';
import { verifyToken } from './utils/jwt';
import { authMiddleware } from './middleware/auth';
import cookieParser from 'cookie-parser';

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
    // Let Sentry handle and eventually exit if we decide to, but for now we'll just log
    // process.exit(1); 
});

process.on('unhandledRejection', (reason, promise) => {
    logError(`Unhandled Rejection at: ${promise}, reason:`, reason);
});

const app = express();
app.set('trust proxy', 1);

// Initialize Sentry
Sentry.init({
    dsn: process.env.SENTRY_DSN || "https://c658e25682ffbbce0cd373c74bf48f1d@o4510500686331904.ingest.us.sentry.io/4510500686659584",
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
        Sentry.httpIntegration(),
        Sentry.expressIntegration(),
    ],
});

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

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Sentry request handler is no longer needed in v8+ for simple integration


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
