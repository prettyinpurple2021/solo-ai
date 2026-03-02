import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    console.log('Loading .env.local');
    dotenv.config({ path: envPath });
} else {
    dotenv.config();
}

function generateUUID() {
    return crypto.randomUUID();
}

async function createTestUser() {
    console.log('🚀 Creating Production-Ready Test User...');

    const email = process.env.TEST_USER_EMAIL || `test_user_${Date.now()}@example.com`;
    const password = process.env.TEST_USER_PASSWORD || 'password123';
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
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `;

        if (existingUsers.length > 0) {
            console.log('User already exists (updating password instead)...');
            const saltRounds = 12;
            const passwordHash = await bcrypt.hash(password, saltRounds);
            
            await sql`
                UPDATE users 
                SET password = ${passwordHash}, updated_at = NOW() 
                WHERE email = ${email.toLowerCase()}
            `;
            console.log('✅ User password updated successfully');
        } else {
            // Hash password
            console.log('Securing password...');
            const saltRounds = 12;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            // Insert user
            console.log('Persisting user to database...');
            const userId = generateUUID();

            await sql`
              INSERT INTO users (id, email, password, full_name, username, role, subscription_tier, subscription_status, created_at, updated_at)
              VALUES (${userId}, ${email.toLowerCase()}, ${passwordHash}, ${fullName}, ${username.toLowerCase()}, 'user', 'launch', 'active', NOW(), NOW())
            `;

            console.log('✅ User created successfully');
        }

        console.log(`
CREDENTIALS FOR TESTING:`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`
You can now run:`);
        console.log(`$env:TEST_USER_EMAIL="${email}"; $env:TEST_USER_PASSWORD="${password}"; npx playwright test`);

    } catch (error) {
        console.error('❌ User Creation Failed!');
        console.error('Error:', error.message);
        process.exit(1);
    }
}

createTestUser();
