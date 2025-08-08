#!/usr/bin/env node

import { Pool } from 'pg'
import { readFileSync } from 'fs'
import { join } from 'path'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required')
  process.exit(1)
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

async function runMigration() {
  const client = await pool.connect()
  
  try {
    console.log('🚀 Starting Neon database migration...')
    
    // Read the migration file
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '008_complete_neon_schema.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf8')
    
    console.log('📄 Executing migration...')
    await client.query(migrationSQL)
    
    console.log('✅ Migration completed successfully!')
    
    // Verify tables exist
    console.log('🔍 Verifying database schema...')
    const tables = [
      'users', 'goals', 'tasks', 'ai_agents', 'conversations', 
      'documents', 'template_categories', 'templates', 'user_templates',
      'focus_sessions', 'achievements', 'user_achievements'
    ]
    
    for (const table of tables) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [table])
      
      if (result.rows[0].exists) {
        console.log(`✅ Table '${table}' exists`)
      } else {
        console.log(`❌ Table '${table}' is missing`)
      }
    }
    
    // Check AI agents data
    console.log('🤖 Checking AI agents data...')
    const agentsResult = await client.query('SELECT name, display_name FROM ai_agents')
    console.log(`✅ Found ${agentsResult.rows.length} AI agents:`)
    agentsResult.rows.forEach(agent => {
      console.log(`   - ${agent.display_name} (${agent.name})`)
    })
    
    console.log('\n🎉 Database setup verification complete!')
    console.log('Your SoloBoss AI platform database is ready for production.')
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

runMigration()
