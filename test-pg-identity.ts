import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Missing process.env.DATABASE_URL");
  process.exit(1);
}
const pool = new Pool({ connectionString: databaseUrl });

async function testAlter() {
  try {
    await pool.query(`CREATE TABLE test_identity_alter (id integer GENERATED ALWAYS AS IDENTITY);`);
    console.log("Created table");
    
    try {
      await pool.query(`ALTER TABLE test_identity_alter ALTER COLUMN id SET DATA TYPE text;`);
      console.log("Alter succeeded - Drizzle's cast-first approach works.");
    } catch(e) {
      console.error("Alter failed:", e instanceof Error ? e.message : String(e));
    }
    
    await pool.query(`DROP TABLE test_identity_alter;`);
  } catch(e) {
    console.error("Error setting up:", e instanceof Error ? e.message : String(e));
  } finally {
    await pool.end();
  }
}

testAlter().catch((err) => {
  console.error("Unhandled error:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
