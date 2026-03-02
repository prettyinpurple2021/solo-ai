import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkColumns() {
  const result = await pool.query(`
    select table_name, column_name, data_type, is_identity 
    from information_schema.columns 
    where column_name = 'id' and table_name IN ('contacts', 'competitor_reports', 'pivot_analyses') and table_schema = 'public';
  `);
  console.log("SERIAL TABLES IN DB:");
  console.log(result.rows);
  pool.end();
}

checkColumns().catch(console.error);
