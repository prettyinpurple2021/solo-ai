import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testAlter() {
  try {
    await pool.query(`CREATE TABLE test_identity_alter (id integer GENERATED ALWAYS AS IDENTITY);`);
    console.log("Created table");
    
    try {
      await pool.query(`ALTER TABLE test_identity_alter ALTER COLUMN id SET DATA TYPE text;`);
      console.log("Alter succeeded - Drizzle's cast-first approach works.");
    } catch(e) {
      console.error("Alter failed:", e.message);
    }
    
    await pool.query(`DROP TABLE test_identity_alter;`);
  } catch(e) {
    console.error("Error setting up:", e.message);
  } finally {
    pool.end();
  }
}

testAlter();
