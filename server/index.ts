import 'dotenv/config';

import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import cors from 'cors';
import { setIo } from './realtime';
import { setupBoardroomSocket } from './src/realtime/boardroom';
import { logInfo, logWarn, logError } from './utils/logger';
import path from 'path';
import { z } from 'zod';
import { boardroomRouter } from './src/routes/boardroom';

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
    }
});

setIo(io);
setupBoardroomSocket(io);

const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());

// Sanity check for critical env vars
const requiredEnv = [
    'DATABASE_URL',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'CLIENT_URL',
];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
    logWarn('Missing critical environment variables for Real-time Hub', { missingEnv });
}

// WebSocket connection handling with strict validation
io.on('connection', (socket: Socket) => {
    logInfo('Real-time client connected', { socketId: socket.id });

    socket.on('join', (userId: string) => {
        try {
            const validatedUserId = z.string().min(1).parse(userId);
            socket.join(`user:${validatedUserId}`);
            logInfo(`User ${validatedUserId} joined real-time channel`);
        } catch (error) {
            logError('Invalid join event', { error, userId });
            socket.emit('error', { message: 'Invalid user context' });
        }
    });

    socket.on('disconnect', () => {
        logInfo('Real-time client disconnected', { socketId: socket.id });
    });
});

// --- Orchestration Routes ---
app.use('/api/boardroom', boardroomRouter);

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        service: 'SoloSuccess Real-time Hub',
        websocket: 'active',
        timestamp: new Date().toISOString()
    });
});

// Serve static files in production (Frontend build)
if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, '../../dist');
    app.use(express.static(distPath));

    app.get('*', (req: Request, res: Response) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(distPath, 'index.html'));
        }
    });
}

// Global Error Handler
app.use((err: Error, req: Request, res: Response, _next: express.NextFunction) => {
    logError('Unhandled error in Real-time Hub', err, { path: req.path });
    res.status(500).json({ error: 'Internal server error' });
});

httpServer.listen(PORT, () => {
    logInfo(`🚀 Real-time Hub running on http://localhost:${PORT}`);
    logInfo(`📡 WebSocket orchestration active`);
});
