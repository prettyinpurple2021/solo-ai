#!/usr/bin/env node

/**
 * This script runs the migration to add the user_templates index and verify updated_at triggers.
 * It connects to Neon database directly using the DATABASE_URL environment variable.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env.local if available
dotenv.config({ path: '.env.local' });
dotenv.config(); // Fallback to .env

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const { Pool } = pg;
  
  // Get database URL from environment variable
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }
  
  console.log('🔄 Connecting to database...');
  
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    // Read migration SQL file
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '010_add_user_templates_index.sql');
    const migrationSql = readFileSync(migrationPath, 'utf8');
    
    console.log('🔄 Running migration: 010_add_user_templates_index.sql');
    
    // Execute migration
    await pool.query(migrationSql);
    
    // Verify index was created
    const { rows: indexes } = await pool.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'user_templates'
        AND indexname = 'idx_user_templates_user_created'
    `);
    
    if (indexes.length > 0) {
      console.log('✅ Index idx_user_templates_user_created created successfully');
    } else {
      console.error('❌ Failed to create index idx_user_templates_user_created');
      process.exit(1);
    }
    
    // Verify trigger exists
    const { rows: triggers } = await pool.query(`
      SELECT trigger_name
      FROM information_schema.triggers
      WHERE event_object_table = 'user_templates'
        AND trigger_name = 'update_user_templates_updated_at'
    `);
    
    if (triggers.length > 0) {
      console.log('✅ Trigger update_user_templates_updated_at verified');
    } else {
      console.error('❌ Trigger update_user_templates_updated_at not found');
      process.exit(1);
    }
    
    // Verify idempotency_keys table exists
    const { rows: tables } = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'idempotency_keys'
    `);
    
    if (tables.length > 0) {
      console.log('✅ Table idempotency_keys created successfully');
    } else {
      console.error('❌ Failed to create table idempotency_keys');
      process.exit(1);
    }
    
    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
