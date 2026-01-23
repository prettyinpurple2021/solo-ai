import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL not found');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log('Connecting to DB...');
    const client = await pool.connect();
    console.log('Connected! Resetting public schema...');
    
    await client.query('DROP SCHEMA public CASCADE');
    await client.query('CREATE SCHEMA public');
    await client.query('GRANT ALL ON SCHEMA public TO postgres');
    await client.query('GRANT ALL ON SCHEMA public TO public');
    
    console.log('✅ Reset complete');
    client.release();
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
