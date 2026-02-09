
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL);

async function main() {
  console.log('Restoring AI tables...');

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS business_context (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        company_name TEXT,
        founder_name TEXT,
        industry TEXT,
        description TEXT,
        brand_dna JSONB,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
    `;
    console.log('Created business_context table.');

    await sql`
      CREATE TABLE IF NOT EXISTS daily_intelligence (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        priority_actions JSONB,
        alerts JSONB,
        insights JSONB,
        motivational_message TEXT,
        created_at TIMESTAMP DEFAULT now()
      );
    `;
    console.log('Created daily_intelligence table.');

    await sql`
      CREATE TABLE IF NOT EXISTS admin_actions (
        id SERIAL PRIMARY KEY,
        admin_user_id TEXT NOT NULL,
        action TEXT NOT NULL,
        target_user_id TEXT,
        details JSONB,
        created_at TIMESTAMP DEFAULT now()
      );
    `;
    console.log('Created admin_actions table.');

  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await sql.end();
  }
}

main();
