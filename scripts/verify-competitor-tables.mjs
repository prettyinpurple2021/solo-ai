import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function verifyTables() {
  try {
    console.log('Checking for competitor intelligence tables...')
    
    // Check all tables in the database
    const allTables = await sql`
      SELECT table_name, table_schema
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    
    console.log('All tables in public schema:')
    allTables.forEach(table => {
      console.log(`- ${table.table_name}`)
    })
    
    // Check specifically for our tables
    const competitorTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%competitor%'
      ORDER BY table_name
    `
    
    console.log('\nCompetitor-related tables:')
    competitorTables.forEach(table => {
      console.log(`- ${table.table_name}`)
    })
    
    // Check for intelligence tables
    const intelligenceTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%intelligence%'
      ORDER BY table_name
    `
    
    console.log('\nIntelligence-related tables:')
    intelligenceTables.forEach(table => {
      console.log(`- ${table.table_name}`)
    })
    
  } catch (error) {
    console.error('Error verifying tables:', error)
  }
}

verifyTables()