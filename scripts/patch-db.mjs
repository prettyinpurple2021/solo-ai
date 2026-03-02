import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config();
}

async function patchDatabase() {
    console.log('🛠️ Patching Database Schema...');

    try {
        const url = process.env.DATABASE_URL;
        if (!url) throw new Error('DATABASE_URL is not set');
        const sql = neon(url);

        console.log('Adding "tags" column to templates...');
        await sql`ALTER TABLE templates ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]'`;

        console.log('Creating "user_preferences" table...');
        await sql`
            CREATE TABLE IF NOT EXISTS user_preferences (
                id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
                user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                theme text DEFAULT 'dark',
                notifications_enabled boolean DEFAULT true,
                created_at timestamp DEFAULT now(),
                updated_at timestamp DEFAULT now(),
                UNIQUE(user_id)
            )
        `;

        console.log('✅ Database patched successfully');

    } catch (error) {
        console.error('❌ Database Patch Failed!');
        console.error('Error:', error.message);
        process.exit(1);
    }
}

patchDatabase();
