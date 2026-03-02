import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function main() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    console.log('Sending queries...');
    await sql`ALTER TABLE briefcases ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb NOT NULL;`;
    await sql`ALTER TABLE briefcase_items ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb NOT NULL;`;
    await sql`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb NOT NULL;`;
    await sql`ALTER TABLE admin_actions ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb NOT NULL;`;
    await sql`ALTER TABLE chat_history ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb NOT NULL;`;
    await sql`ALTER TABLE competitor_news_articles ADD COLUMN IF NOT EXISTS sentiment numeric(3,2);`;
    console.log('Success!');
  } catch(e) {
    console.error('Err:', e);
  }
  process.exit(0);
}

main();
