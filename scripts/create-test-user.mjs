import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    console.log('Loading .env.local');
    dotenv.config({ path: envPath });
}

function generateUUID() {
    return crypto.randomUUID();
}

async function createTestUser() {
    console.log('🚀 Creating Test User...');

    const email = `test_user_${Date.now()}@example.com`;
    const password = 'password123';
    const fullName = 'Test User';
    const username = `user_${Date.now()}`;

    console.log(`Creating user credentials for: ${email}`);

    try {
        const url = process.env.DATABASE_URL;
        if (!url) throw new Error('DATABASE_URL is not set');
        const sql = neon(url);

        // Check existing
        console.log('Checking for existing user collisions...');
        const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()} OR username = ${username.toLowerCase()}
    `;

        if (existingUsers.length > 0) {
            console.log('User collision detected (skipping creation)');
            return;
        }

        // Hash password
        console.log('Securing password...');
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert user
        console.log('Persisting user to database...');
        const _userId = generateUUID();
        const dateOfBirth = null;

        // Uses the same query structure as the main registration route
        const newUsers = await sql`
      INSERT INTO users (id, email, password_hash, full_name, username, date_of_birth, subscription_tier, subscription_status, cancel_at_period_end, created_at, updated_at)
      VALUES (${_userId}, ${email.toLowerCase()}, ${passwordHash}, ${fullName}, ${username.toLowerCase()}, ${dateOfBirth}, 'launch', 'active', false, NOW(), NOW())
      RETURNING id, email
    `;

        if (newUsers.length === 0) {
            throw new Error('Failed to create user (database returned no rows)');
        }

        console.log('✅ User created successfully:', newUsers[0]);

        // Generate JWT
        console.log('Generating authentication token...');
        if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set');

        const token = jwt.sign(
            {
                userId: newUsers[0].id,
                email: newUsers[0].email,
                username: username
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log('✅ Authentication token generated');
        console.log(`\nTo login, use:\nEmail: ${email}\nPassword: ${password}\n`);

    } catch (error) {
        console.error('❌ User Creation Failed!');
        console.error('Error:', error.message);
        if (error.stack) console.error('Stack:', error.stack);

        // Check if it's a specific postgres error
        if (error.code) {
            console.error('Postgres Error Code:', error.code);
            console.error('Postgres Error Detail:', error.detail);
        }
        process.exit(1);
    }
}

createTestUser();
