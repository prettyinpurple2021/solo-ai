
import { db } from './db';
import { sql } from 'drizzle-orm';

async function listTables() {
    try {
        const result = await db.execute(sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE';
        `);
        console.log('Database Tables:', result.rows.map((r: any) => r.table_name).sort());
        process.exit(0);
    } catch (error) {
        console.error('Error listing tables:', error);
        process.exit(1);
    }
}

listTables();
