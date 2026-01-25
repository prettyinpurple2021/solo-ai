import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local first, then .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('--- Auth Diagnostic ---');
console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 15), '...');

import { getDb } from '../src/lib/database-client';
import { users } from '../src/db/schema';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function runDiag() {
    try {
        console.log('1. Initializing DB...');
        const db = getDb();
        console.log('DB Initialized.');

        console.log('2. Testing connection (SELECT 1)...');
        const health = await db.execute(sql`SELECT 1`);
        console.log('Connection test successful:', health.rows);

        console.log('3. Checking "users" table columns...');
        const columns = await db.execute(sql`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);
        console.log('Users columns:', columns.rows.map(r => r.column_name).join(', '));

        const requiredCols = ['id', 'email', 'password'];
        for (const col of requiredCols) {
            const exists = columns.rows.some(r => r.column_name === col);
            console.log(`Column "${col}" exists:`, exists);
        }

        console.log('4. Querying for a sample user...');
        const allUsers = await db.select().from(users).limit(1);
        console.log('Sample user count:', allUsers.length);
        if (allUsers.length > 0) {
            console.log('Found user:', { id: allUsers[0].id, email: allUsers[0].email, hasPassword: !!allUsers[0].password });
            
            if (allUsers[0].password) {
                console.log('5. Testing bcrypt compare...');
                const match = await bcrypt.compare('test-password', allUsers[0].password);
                console.log('Bcrypt comparison (with dummy password) ran successfully. Match:', match);
            }
        }

        console.log('--- Diagnostic Complete ---');
    } catch (error) {
        console.error('--- DIAGNOSTIC FAILED ---');
        console.error(error);
        process.exit(1);
    }
}

runDiag().then(() => process.exit(0));
