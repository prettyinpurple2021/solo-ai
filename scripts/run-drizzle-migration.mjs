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

async function runDrizzleMigration() {
  try {
    console.log('Running Drizzle-generated migration...')
    
    // Read the Drizzle migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '0002_sloppy_mikhail_rasputin.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Split by statement breakpoint
    const statements = migrationSQL
      .split('--> statement-breakpoint')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0)
    
    console.log(`Executing ${statements.length} SQL statements...`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim()
      if (statement) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`)
          await sql.unsafe(statement)
          console.log(`✅ Statement ${i + 1} executed successfully`)
        } catch (error) {
          if (error.message.includes('already exists') || error.message.includes('duplicate')) {
            console.log(`⚠️  Statement ${i + 1} skipped (already exists)`)
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message)
            console.error(`Statement was: ${statement.substring(0, 200)}...`)
            // Continue with next statement instead of failing
          }
        }
      }
    }
    
    console.log('Migration completed!')
    
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
      
      // Add the update triggers
      console.log('Adding update triggers...')
      
      try {
        await sql.unsafe(`
          CREATE OR REPLACE FUNCTION update_updated_at_column()
          RETURNS TRIGGER AS $$
          BEGIN
              NEW.updated_at = now();
              RETURN NEW;
          END;
          $$ language 'plpgsql';
        `)
        
        await sql.unsafe(`
          CREATE TRIGGER update_competitor_profiles_updated_at 
              BEFORE UPDATE ON competitor_profiles 
              FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `)
        
        await sql.unsafe(`
          CREATE TRIGGER update_intelligence_data_updated_at 
              BEFORE UPDATE ON intelligence_data 
              FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `)
        
        await sql.unsafe(`
          CREATE TRIGGER update_competitor_alerts_updated_at 
              BEFORE UPDATE ON competitor_alerts 
              FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `)
        
        console.log('✅ Update triggers added successfully!')
        
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log('⚠️  Triggers already exist, skipping...')
        } else {
          console.error('❌ Error adding triggers:', error.message)
        }
      }
      
    } else {
      console.log('⚠️  Some tables may not have been created. Please check the logs.')
    }
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runDrizzleMigration()