
import { db } from './db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Inspecting users table id column...');
  try {
    const result = await db.execute(sql`
      SELECT column_name, column_default, is_nullable, identity_generation, data_type
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'id';
    `);
    console.log('Users ID Column info:', result.rows);

    const result2 = await db.execute(sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'analytics_events' AND column_name = 'user_id';
    `);
    console.log('Analytics Events UserID Column info:', result2.rows);
  } catch (error) {
    console.error('Inspection failed:', error);
  }
  process.exit(0);
}
main();
