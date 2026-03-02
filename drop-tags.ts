import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Missing process.env.DATABASE_URL");
  process.exit(1);
}
const pool = new pg.Pool({
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
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`Failed to drop tags in ${tableName}:`, msg);
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

dropTagsColumns().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
}).finally(() => {
  pool.end().catch(err => {
    console.error("Error closing connection pool:", err);
    process.exitCode = 1;
  });
});
