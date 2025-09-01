#!/usr/bin/env node

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import pg from 'pg'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const { Client } = pg

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    await client.connect()
    console.log('Connected to database')

    // Read the migration file
    const migrationPath = join(__dirname, '..', 'migrations', '011_competitive_opportunities_schema.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf8')

    console.log('Running competitive opportunities migration...')
    
    // Execute the migration
    await client.query(migrationSQL)
    
    console.log('✅ Competitive opportunities migration completed successfully')

    // Verify tables were created
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('competitive_opportunities', 'opportunity_actions', 'opportunity_metrics')
      ORDER BY table_name
    `)

    console.log('Created tables:')
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`)
    })

    // Verify indexes were created
    const indexesResult = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename IN ('competitive_opportunities', 'opportunity_actions', 'opportunity_metrics')
      ORDER BY indexname
    `)

    console.log('Created indexes:')
    indexesResult.rows.forEach(row => {
      console.log(`  - ${row.indexname}`)
    })

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigration()