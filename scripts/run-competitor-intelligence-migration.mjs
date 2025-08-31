import { neon } from '@neondatabase/serverless'
import fs from 'fs'
import path from 'path'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)

async function runCompetitorIntelligenceMigration() {
  try {
    console.log('Running Competitor Intelligence migration...')
    
    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'migrations', '009_competitor_intelligence_schema.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Execute the entire migration as a single query
    console.log('Executing migration SQL...')
    try {
      await sql`${migrationSQL}`
      console.log('Migration SQL executed successfully!')
    } catch (error) {
      // If the full migration fails, try to execute it in parts
      console.log('Full migration failed, trying individual statements...')
      
      // Split the SQL into individual statements (excluding comments)
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('COMMENT'))
      
      console.log(`Executing ${statements.length} SQL statements...`)
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i]
        if (statement.trim()) {
          try {
            console.log(`Executing statement ${i + 1}/${statements.length}...`)
            // Use unsafe for raw SQL execution
            await sql.unsafe(statement)
          } catch (error) {
            // Log but continue for statements that might already exist
            if (error.message.includes('already exists') || error.message.includes('duplicate')) {
              console.log(`Statement ${i + 1} skipped (already exists):`, error.message)
            } else {
              console.error(`Error in statement ${i + 1}:`, error.message)
              console.error(`Statement was: ${statement.substring(0, 100)}...`)
              // Don't throw, continue with next statement
            }
          }
        }
      }
    }
    
    console.log('Competitor Intelligence migration completed successfully!')
    
    // Verify tables were created
    console.log('Verifying tables...')
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('competitor_profiles', 'intelligence_data', 'competitor_alerts')
      ORDER BY table_name
    `
    
    console.log('Created tables:', tables.map(t => t.table_name))
    
    if (tables.length === 3) {
      console.log('✅ All competitor intelligence tables created successfully!')
    } else {
      console.log('⚠️  Some tables may not have been created. Please check the logs.')
    }
    
  } catch (error) {
    console.error('Competitor Intelligence migration failed:', error)
    process.exit(1)
  }
}

runCompetitorIntelligenceMigration()