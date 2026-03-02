import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fixTags() {
  try {
    const tablesQuery = await pool.query(`
      SELECT table_name 
      FROM information_schema.columns 
      WHERE column_name = 'tags' AND table_schema = 'public'
    `);
    
    for (const row of tablesQuery.rows) {
      const tableName = row.table_name;
      console.log(`Fixing tags column in table: ${tableName}`);
      try {
        await pool.query(`ALTER TABLE "${tableName}" DROP COLUMN tags;`);
        console.log(`Successfully dropped tags column in ${tableName}`);
      } catch (err) {
        console.error(`Failed to drop tags in ${tableName}:`, err.message);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

fixTags();
