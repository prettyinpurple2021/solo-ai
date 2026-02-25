import { Client } from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const sql = fs.readFileSync('migrations/0004_fantastic_paladin.sql', 'utf8');
  const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);
  for (const s of statements) {
    console.log('Running:', s.substring(0, 50) + '...');
    try { 
        await client.query(s); 
        console.log('Success.');
    } catch(e: any) { 
        console.error('Error:', e.message); 
    }
  }
  await client.end();
}
run();
