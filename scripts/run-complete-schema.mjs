#!/usr/bin/env node

import { Pool } from 'pg'
import * as dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required')
  process.exit(1)
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

async function runCompleteSchema() {
  console.log('🚀 Setting up complete SoloBoss AI database schema...\n')

  try {
    // Read the schema file
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const schemaPath = join(__dirname, 'complete-database-schema.sql')
    
    console.log('📄 Reading schema file...')
    const schemaSQL = readFileSync(schemaPath, 'utf8')
    
    console.log('🔧 Executing schema...')
    await pool.query(schemaSQL)
    
    console.log('✅ Complete database schema setup successful!')
    
    // Verify the setup
    console.log('\n🔍 Verifying setup...')
    const tables = [
      'users', 'goals', 'tasks', 'ai_agents', 'conversations', 
      'documents', 'template_categories', 'templates', 'user_templates',
      'focus_sessions', 'achievements', 'user_achievements'
    ]
    
    for (const table of tables) {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [table])
      
      if (result.rows[0].exists) {
        console.log(`   ✅ ${table}`)
      } else {
        console.log(`   ❌ ${table} - MISSING`)
      }
    }
    
    // Check AI agents
    console.log('\n🤖 Checking AI agents:')
    const agentsResult = await pool.query('SELECT name, display_name FROM ai_agents ORDER BY name')
    if (agentsResult.rows.length > 0) {
      console.log(`   ✅ Found ${agentsResult.rows.length} AI agents:`)
      agentsResult.rows.forEach(agent => {
        console.log(`      - ${agent.display_name} (${agent.name})`)
      })
    } else {
      console.log('   ❌ No AI agents found')
    }
    
    // Check achievements
    console.log('\n🏆 Checking achievements:')
    const achievementsResult = await pool.query('SELECT name, title FROM achievements ORDER BY name')
    if (achievementsResult.rows.length > 0) {
      console.log(`   ✅ Found ${achievementsResult.rows.length} achievements:`)
      achievementsResult.rows.forEach(achievement => {
        console.log(`      - ${achievement.title} (${achievement.name})`)
      })
    } else {
      console.log('   ❌ No achievements found')
    }
    
    console.log('\n🎉 Database setup completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('   1. Run `npm run dev` to start the development server')
    console.log('   2. Visit http://localhost:3000 to see your app')
    console.log('   3. Create a user account to test the functionality')
    console.log('   4. Check the /dashboard to see the BossRoom interface')
    console.log('\n💡 Tip: The AI agents are ready to chat! Try starting a conversation.')
    
    return true

  } catch (error) {
    console.error('❌ Database setup failed:', error)
    return false
  } finally {
    await pool.end()
  }
}

// Run the setup
runCompleteSchema().then((success) => {
  process.exit(success ? 0 : 1)
})
