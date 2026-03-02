import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    console.log('Loading .env.local');
    dotenv.config({ path: envPath });
} else {
    dotenv.config();
}

async function patchBriefcase() {
    console.log('🛠️ Patching Briefcase Database Schema...');

    try {
        const url = process.env.DATABASE_URL;
        if (!url) throw new Error('DATABASE_URL is not set');
        const sql = neon(url);

        console.log('Ensuring pgvector extension exists...');
        try {
            await sql`CREATE EXTENSION IF NOT EXISTS vector;`;
        } catch (e) {
            console.warn('⚠️ Could not create vector extension (might already exist or permission denied).');
        }

        console.log('Adding missing columns to "documents" table...');
        
        // Add columns one by one to avoid issues with already existing ones
        const columns = [
            { name: 'tags', type: "jsonb DEFAULT '[]'::jsonb" },
            { name: 'metadata', type: "jsonb DEFAULT '{}'::jsonb" },
            { name: 'ai_insights', type: "jsonb DEFAULT '{}'::jsonb" },
            { name: 'embedding', type: 'vector(1536)' },
            { name: 'is_favorite', type: 'boolean DEFAULT false' },
            { name: 'is_public', type: 'boolean DEFAULT false' },
            { name: 'download_count', type: 'integer DEFAULT 0' },
            { name: 'view_count', type: 'integer DEFAULT 0' },
            { name: 'last_accessed', type: 'timestamp' }
        ];

        for (const col of columns) {
            console.log(`Checking/Adding column: ${col.name}`);
            try {
                // We use a safe check by attempting to alter and catching "already exists"
                const query = `ALTER TABLE documents ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`;
                await sql(query);
                console.log(`✅ Column ${col.name} is ready.`);
            } catch (error) {
                console.error(`❌ Failed to add column ${col.name}:`, error.message);
            }
        }

        console.log('✅ Briefcase database patch complete.');

    } catch (error) {
        console.error('❌ Briefcase Patch Failed!');
        console.error('Error:', error.message);
        process.exit(1);
    }
}

patchBriefcase();
