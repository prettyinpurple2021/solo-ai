import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users } from '../../src/lib/shared/db/schema';
import { eq } from 'drizzle-orm';
import { generateToken } from '../utils/jwt';
import { z } from 'zod';
import { logError } from '../utils/logger';

const router = express.Router();

const authSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

router.post('/signup', async (req, res) => {
    try {
        const { email, password } = authSchema.parse(req.body);

        // Check if user already exists
        const existingUsers = await db.select().from(users).where(eq(users.email, email));
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await db.insert(users).values({
            email,
            password: hashedPassword,
            role: 'user',
            createdAt: new Date(),
        }).returning();

        const user = newUser[0];
        const token = generateToken(user.id, user.email);

        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        logError('Signup error:', error);
        res.status(500).json({ error: 'Failed to create account' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = authSchema.parse(req.body);

        // Find user
        const foundUsers = await db.select().from(users).where(eq(users.email, email));
        const user = foundUsers[0];

        if (!user || !user.password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user.id, user.email);

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        logError('Login error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

export { router as authRouter };
