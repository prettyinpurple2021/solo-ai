const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Missing process.env.DATABASE_URL");
  process.exit(1);
}
const pool = new Pool({
  connectionString: databaseUrl,
});

async function dropTagsColumns() {
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
        const safeTableName = tableName.replace(/"/g, '""');
        await pool.query(`ALTER TABLE "${safeTableName}" DROP COLUMN tags;`);
        console.log(`Successfully dropped tags column in ${tableName}`);
      } catch (err) {
        console.error(`Failed to drop tags in ${tableName}:`, err.message);
        process.exitCode = 1;
      }
    }
  } catch (err) {
    console.error('Error:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

dropTagsColumns();
