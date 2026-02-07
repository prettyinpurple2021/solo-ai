
import { db } from './db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Fixing users table id sequence...');
  try {
    // 1. Create sequence if not exists
    await db.execute(sql`CREATE SEQUENCE IF NOT EXISTS users_id_seq;`);
    
    // 2. Sync sequence with max id
    // check if there are users first
    const maxIdResult = await db.execute(sql`SELECT MAX(id) as max_id FROM users`);
    const maxId = maxIdResult.rows[0].max_id as number || 0;
    
    // update sequence to max_id + 1
    // valid syntax for setval is setval('sequence_name', value, is_called)
    // if table is empty, start at 1. if not empty, start at max+1
    // actually setval(seq, val, true) means nextval will be val+1.
    // setval(seq, val, false) means nextval will be val.
    
    const nextVal = maxId + 1;
    console.log(`Max ID is: ${maxId}, setting sequence to it.`);
    
    // Use raw string interpolation for the integer to avoid binding issues with setval
    // Ensure maxId is an integer
    const safeMaxId = Math.floor(maxId);
    
    // We use sql.raw or just construct the string. 
    // Drizzle sql`` with interpolation uses params. 
    // Let's try explicit cast.
    await db.execute(sql`SELECT setval('users_id_seq', ${safeMaxId}, true)`); 

    // 3. Set default value for id column
    await db.execute(sql`ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq')`);
    
    console.log(`Sequence fixed. Next ID will be > ${maxId}`);
    
  } catch (error) {
    console.error('Fix failed:', error);
  }
  process.exit(0);
}
main();
