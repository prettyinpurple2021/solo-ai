import 'dotenv/config';
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import cors from 'cors';
import { db } from './db';
import { users, tasks, chatHistory, competitorReports, businessContext } from './db/schema';
import { eq, desc, and, or } from 'drizzle-orm';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import { Redis } from '@upstash/redis';
import bcrypt from 'bcryptjs';
import { generateToken, verifyToken } from './utils/jwt';
import { authMiddleware, AuthRequest } from './middleware/auth';
import { SearchIndexer } from './utils/searchIndexer';
import adminRouter from './routes/admin';
import contactsRouter from './routes/contacts';
import pitchDecksRouter from './routes/pitchDecks';
import stripeRouter from './routes/stripe';
import path from 'path';
import rateLimit from 'express-rate-limit';

const app = express();
// Trust proxy for correct IP identification behind reverse proxies (e.g., Render, Heroku, AWS)
app.set('trust proxy', 1);
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3001;

// Initialize Redis
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

app.use(cors());
app.use(express.json());

// Middleware to extract user from Auth headers
const getUserId = (req: express.Request): string | null => {
    // Check for JWT first
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        if (decoded) return decoded.userId;
    }

    // Stack Auth sends user ID in x-stack-user-id header
    const userId = req.headers['x-stack-user-id'] as string;
    return userId || null;
};

// Cache helper functions
const CACHE_TTL = 300; // 5 minutes

async function getCached<T>(key: string): Promise<T | null> {
    try {
        const cached = await redis.get(key);
        return cached as T | null;
    } catch (error) {
        console.error('Redis get error:', error);
        return null;
    }
}

async function setCache(key: string, value: any, ttl: number = CACHE_TTL): Promise<void> {
    try {
        await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
        console.error('Redis set error:', error);
    }
}

async function invalidateCache(pattern: string): Promise<void> {
    try {
        // Invalidate by deleting
        await redis.del(pattern);
    } catch (error) {
        console.error('Redis invalidate error:', error);
    }
}

// WebSocket connection handling
io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // Join user-specific room
    socket.on('join', (userId: string) => {
        socket.join(`user:${userId}`);
        console.log(`User ${userId} joined their room`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Broadcast update to user's room
function broadcastToUser(userId: string, event: string, data: any) {
    io.to(`user:${userId}`).emit(event, data);
}

// --- Routes ---

import resourcesRouter from './routes/resources';

// ... (imports)

import searchRouter from './routes/search';
import notificationsRouter from './routes/notifications';
import aiRouter from './routes/ai';

// ... (imports)

import dashboardRouter from './routes/dashboard';

// ... (imports)

app.use('/api/admin', adminRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/pitch-decks', pitchDecksRouter);
app.use('/api/stripe', stripeRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/ai', aiRouter);
app.use('/api/search', searchRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/dashboard', dashboardRouter);

// Auth Routes
app.post('/api/auth/signup', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await db.insert(users).values({
            email,
            password: hashedPassword,
        }).returning();

        const token = generateToken(String(newUser[0].id), email);

        res.json({ token, user: newUser[0] });
    } catch (error: any) {
        console.error('Signup error:', error);
        res.status(500).json({ error: `Signup failed: ${error.message}` });
    }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (user.length === 0 || !user[0].password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user[0].password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(String(user[0].id), email);

        res.json({ token, user: user[0] });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// AI Generation Proxy
app.post('/api/generate', async (req: Request, res: Response) => {
    try {
        const { prompt, systemInstruction, model, history, temperature, maxOutputTokens } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'Server configuration error: API Key missing' });
        }

        const ai = new GoogleGenAI({ apiKey });
        const targetModel = model || 'gemini-2.5-flash';

        if (history && Array.isArray(history)) {
            const formattedHistory = history.map((h: any) => ({
                role: h.role,
                parts: [{ text: h.text }]
            }));

            const chat = ai.chats.create({
                model: targetModel,
                config: {
                    systemInstruction,
                    temperature: temperature || 0.8,
                    maxOutputTokens
                },
                history: formattedHistory
            });

            const result = await chat.sendMessage({ message: prompt });
            res.json({ text: result.text || '' });
        } else {
            const chat = ai.chats.create({
                model: targetModel,
                config: {
                    systemInstruction,
                    temperature: temperature || 0.7,
                    maxOutputTokens
                },
                history: []
            });

            const result = await chat.sendMessage({ message: prompt });
            res.json({ text: result.text || '' });
        }
    } catch (error) {
        console.error("Generation error:", error);
        res.status(500).json({ error: 'Generation failed' });
    }
});

// Root route for developer convenience (Development only)
if (process.env.NODE_ENV !== 'production') {
    app.get('/', (req: Request, res: Response) => {
        res.send(`
            <h1>SoloSuccess AI Backend is Running 🚀</h1>
            <p>You are currently accessing the backend API server.</p>
            <p>Please visit the frontend application at: <a href="${process.env.CLIENT_URL || 'http://localhost:3001'}">${process.env.CLIENT_URL || 'http://localhost:3001'}</a></p>
        `);
    });
}

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        db: process.env.DATABASE_URL ? 'configured' : 'missing_env',
        redis: process.env.UPSTASH_REDIS_REST_URL ? 'configured' : 'missing',
        websocket: 'active'
    });
});

// User Progress
app.get('/api/user', async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Try cache first
        const cacheKey = `user:${userId}`;
        const cached = await getCached<any>(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        // Get from database
        let user;
        if (!isNaN(Number(userId))) {
            user = await db.select().from(users).where(eq(users.id, Number(userId))).limit(1);
        } else {
            user = await db.select().from(users).where(eq(users.stackUserId, userId)).limit(1);
        }

        if (user.length === 0) {
            // Only create new user if it's a Stack Auth ID (non-numeric usually)
            if (!isNaN(Number(userId))) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Create new user for Stack Auth
            const newUser = await db.insert(users).values({
                email: `${userId}@stack.auth`,
                stackUserId: userId
            }).returning();

            await setCache(cacheKey, newUser[0]);
            return res.json(newUser[0]);
        }

        await setCache(cacheKey, user[0]);
        res.json(user[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

app.post('/api/user/progress', async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { xp, level, totalActions } = req.body;

        let user;
        if (!isNaN(Number(userId))) {
            user = await db.select().from(users).where(eq(users.id, Number(userId))).limit(1);
        } else {
            user = await db.select().from(users).where(eq(users.stackUserId, userId)).limit(1);
        }

        if (user.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updated = await db.update(users)
            .set({ xp, level, totalActions, updatedAt: new Date() })
            .where(eq(users.id, user[0].id))
            .returning();

        // Invalidate cache
        await invalidateCache(`user:${userId}`);

        res.json(updated[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update progress' });
    }
});

// Tasks with multi-user support
app.get('/api/tasks', async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Try cache
        const cacheKey = `tasks:${userId}`;
        const cached = await getCached<any[]>(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const allTasks = await db.select().from(tasks)
            .where(eq(tasks.userId, userId))
            .orderBy(desc(tasks.createdAt));

        await setCache(cacheKey, allTasks);
        res.json(allTasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

app.post('/api/tasks', async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const taskData = { ...req.body, userId };
        const existing = await db.select().from(tasks).where(
            and(eq(tasks.id, taskData.id), eq(tasks.userId, userId))
        );

        let result;
        if (existing.length > 0) {
            result = await db.update(tasks).set(taskData).where(eq(tasks.id, taskData.id)).returning();
        } else {
            result = await db.insert(tasks).values(taskData).returning();
        }

        // Invalidate cache and broadcast
        await invalidateCache(`tasks:${userId}`);
        broadcastToUser(userId, 'task:updated', result[0]);

        // Index for search
        await SearchIndexer.indexTask(userId, result[0]);

        res.json(result[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save task' });
    }
});

app.post('/api/tasks/batch', async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const taskList = req.body;
        if (!Array.isArray(taskList)) {
            return res.status(400).json({ error: "Expected array" });
        }

        for (const t of taskList) {
            const taskData = { ...t, userId };
            const existing = await db.select().from(tasks).where(
                and(eq(tasks.id, t.id), eq(tasks.userId, userId))
            );

            if (existing.length > 0) {
                await db.update(tasks).set(taskData).where(eq(tasks.id, t.id));
            } else {
                await db.insert(tasks).values(taskData);
            }
            // Index each task
            await SearchIndexer.indexTask(userId, taskData);
        }

        await invalidateCache(`tasks:${userId}`);
        broadcastToUser(userId, 'tasks:batch_updated', taskList);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to batch save' });
    }
});

app.delete('/api/tasks/:id', async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { id } = req.params;
        await db.delete(tasks).where(
            and(eq(tasks.id, id), eq(tasks.userId, userId))
        );

        await invalidateCache(`tasks:${userId}`);
        broadcastToUser(userId, 'task:deleted', { id });

        // Remove from index
        await SearchIndexer.removeFromIndex(userId, 'task', id);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

app.delete('/api/tasks', async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        await db.delete(tasks).where(eq(tasks.userId, userId));
        await invalidateCache(`tasks:${userId}`);
        broadcastToUser(userId, 'tasks:cleared', {});

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear tasks' });
    }
});

// Chat History with multi-user
app.get('/api/chat/:agentId', async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const cacheKey = `chat:${userId}:${req.params.agentId}`;
        const cached = await getCached<any[]>(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const history = await db.select()
            .from(chatHistory)
            .where(
                and(
                    eq(chatHistory.agentId, req.params.agentId),
                    eq(chatHistory.userId, userId)
                )
            )
            .orderBy(chatHistory.id);

        await setCache(cacheKey, history);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch chat' });
    }
});

app.post('/api/chat', async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { agentId, messages } = req.body;

        await db.delete(chatHistory).where(
            and(eq(chatHistory.agentId, agentId), eq(chatHistory.userId, userId))
        );

        if (messages.length > 0) {
            const toInsert = messages.map((m: any) => ({
                agentId,
                userId,
                role: m.role,
                text: m.text,
                timestamp: String(m.timestamp)
            }));
            await db.insert(chatHistory).values(toInsert);
        }

        await invalidateCache(`chat:${userId}:${agentId}`);
        broadcastToUser(userId, 'chat:updated', { agentId });

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save chat' });
    }
});

// Business Context with multi-user
app.get('/api/context', async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const cacheKey = `context:${userId}`;
        const cached = await getCached<any>(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const ctx = await db.select().from(businessContext)
            .where(eq(businessContext.userId, userId))
            .limit(1);

        const result = ctx[0] || null;
        await setCache(cacheKey, result);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch context' });
    }
});

app.post('/api/context', async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const data = { ...req.body, userId };
        const existing = await db.select().from(businessContext)
            .where(eq(businessContext.userId, userId))
            .limit(1);

        let result;
        if (existing.length > 0) {
            result = await db.update(businessContext)
                .set({ ...data, updatedAt: new Date() })
                .where(eq(businessContext.id, existing[0].id))
                .returning();
        } else {
            result = await db.insert(businessContext).values(data).returning();
        }

        await invalidateCache(`context:${userId}`);
        broadcastToUser(userId, 'context:updated', result[0]);

        res.json(result[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save context' });
    }
});

// Reports with multi-user
app.get('/api/reports', async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const cacheKey = `reports:${userId}`;
        const cached = await getCached<any[]>(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const reports = await db.select().from(competitorReports)
            .where(eq(competitorReports.userId, userId))
            .orderBy(desc(competitorReports.generatedAt));

        const formatted = reports.map((r: any) => ({
            ...r.data as object,
            id: r.id,
            generatedAt: r.generatedAt
        }));

        await setCache(cacheKey, formatted);
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

app.post('/api/reports', async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const report = req.body;
        await db.insert(competitorReports).values({
            userId,
            competitorName: report.competitorName,
            threatLevel: report.threatLevel,
            data: report,
            generatedAt: new Date(report.generatedAt || Date.now())
        });

        await invalidateCache(`reports:${userId}`);
        broadcastToUser(userId, 'report:created', report);

        // Index for search
        await SearchIndexer.indexReport(userId, { ...report, id: report.competitorName }); // Using name as ID for now since it's not returning ID

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save report' });
    }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, '../../dist');
    app.use(express.static(distPath));

    // Rate limiter for index.html (client-side routing)
    const clientRouteLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // limit each IP to 1000 requests per windowMs
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    });

    // Handle client-side routing
    app.get('*', clientRouteLimiter, (req: Request, res: Response) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(distPath, 'index.html'));
        }
    });
}

// Initialize background services
if (process.env.ENABLE_SCRAPING_SCHEDULER === 'true') {
    import('../lib/database-scraping-scheduler').then(({ ScrapingScheduler }) => {
        ScrapingScheduler.getInstance().start().catch(err => console.error('Failed to start scraping scheduler:', err));
    });
}

if (process.env.ENABLE_NOTIFICATION_PROCESSOR === 'true') {
    import('../lib/notification-processor').then(({ initializeNotificationProcessor }) => {
        initializeNotificationProcessor().catch(err => console.error('Failed to start notification processor:', err));
    });
}

httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`WebSocket server active`);
    console.log(`Redis cache: ${process.env.UPSTASH_REDIS_REST_URL ? '✅ Connected' : '❌ Not configured'}`);
});
