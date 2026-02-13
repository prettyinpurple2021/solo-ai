import { db } from './db';
import { sql } from 'drizzle-orm';
import { logInfo, logError } from './utils/logger';

async function main() {
  logInfo('Inspecting users table id column...');
  try {
    const result = await db.execute(sql`
      SELECT column_name, column_default, is_nullable, identity_generation, data_type
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'id';
    `);
    logInfo('Users ID Column info:', { rows: result.rows });

    const result2 = await db.execute(sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'analytics_events' AND column_name = 'user_id';
    `);
    logInfo('Analytics Events UserID Column info:', { rows: result2.rows });
  } catch (error) {
    logError('Inspection failed', error);
  }
  process.exit(0);
}
main();
