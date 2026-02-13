import { db } from './db';
import { sql } from 'drizzle-orm';
import { logInfo, logError } from './utils/logger';

async function listTables() {
    try {
        const result = await db.execute(sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE';
        `);
        logInfo('Database Tables:', { tables: result.rows.map((r: any) => r.table_name).sort() });
        process.exit(0);
    } catch (error) {
        logError('Error listing tables', error);
        process.exit(1);
    }
}

listTables();
