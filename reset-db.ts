import * as dotenv from 'dotenv';
dotenv.config();
import { getDb } from './lib/database-client';
import { sql } from 'drizzle-orm';

async function reset() {
    const db = getDb();
    try {
        console.log('Dropping all tables...');
        // Drop all tables in public schema
        await db.execute(sql`
      DO $$ DECLARE
          r RECORD;
      BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
              EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;
      END $$;
    `);
        console.log('All tables dropped.');
    } catch (e) {
        console.error('Error:', e);
    }
    process.exit(0);
}

reset();
