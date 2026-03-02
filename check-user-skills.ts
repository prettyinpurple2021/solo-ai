import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkColumns() {
  try {
    const result = await pool.query(`
      select table_name, column_name, data_type, is_identity 
      from information_schema.columns 
      where table_name = 'user_skills' and column_name = 'id' and table_schema = 'public';
    `);
    console.log("USER_SKILLS ID DB TYPE:");
    console.log(result.rows);
  } finally {
    await pool.end();
  }
}

checkColumns().catch(console.error);
