
import { db } from './db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Introspecting database schema...');

  try {
    // Get all tables
    const tablesResult = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    const tables = tablesResult.rows.map(r => r.table_name);
    console.log(`Found ${tables.length} tables:`, tables.join(', '));

    const fullSchema: any = {};

    for (const table of tables) {
      // Get columns for each table
      const columnsResult = await db.execute(sql`
        SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = ${table}
        ORDER BY ordinal_position;
      `);
      
      fullSchema[table as string] = columnsResult.rows;
    }

    // console.log(JSON.stringify(fullSchema, null, 2));
    const fs = require('fs');
    fs.writeFileSync('schema_dump.json', JSON.stringify(fullSchema, null, 2));
    console.log('Schema dumped to schema_dump.json');

  } catch (error) {
    console.error('Introspection failed:', error);
  }
  process.exit(0);
}

main();
