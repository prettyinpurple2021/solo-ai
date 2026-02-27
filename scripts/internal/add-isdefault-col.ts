import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    console.log("Checking if column exists...");
    try {
      await pool.query('ALTER TABLE "briefcases" ADD COLUMN "is_default" boolean DEFAULT false;');
      console.log("Column 'is_default' added to 'briefcases' table.");
    } catch (e: any) {
        console.log("Error adding column:", e.message);
    }
  } catch (err: any) {
    console.error("General error:", err.message);
  } finally {
    await pool.end();
  }
}
run();
