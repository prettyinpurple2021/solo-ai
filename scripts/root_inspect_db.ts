import * as dotenv from 'dotenv';
dotenv.config(); // Try default .env
console.log('DATABASE_URL set:', !!process.env.DATABASE_URL);
import { getDb } from './src/lib/database-client';
import { sql } from 'drizzle-orm';

async function inspect() {
    const db = getDb();
    try {
        // Check users table schema (id type)
        const schemaResult = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'id';
    `);
        console.log('Users ID Type:', schemaResult.rows);

        // Check row count
        const countResult = await db.execute(sql`SELECT count(*) FROM users`);
        console.log('User Count:', countResult.rows[0]);

        // Check a sample user
        const userResult = await db.execute(sql`SELECT * FROM users LIMIT 1`);
        console.log('Sample User:', userResult.rows[0]);

    } catch (e) {
        console.error('Error:', e);
    }
    process.exit(0);
}

inspect();
