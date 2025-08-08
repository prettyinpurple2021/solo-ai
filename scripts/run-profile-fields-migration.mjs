import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('🚀 Starting profile fields migration...')
    
    // Read the migration SQL file
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '006_add_user_profile_fields.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf8')
    
    console.log('📄 Executing migration SQL...')
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      console.error('❌ Migration failed:', error)
      process.exit(1)
    }
    
    console.log('✅ Profile fields migration completed successfully!')
    console.log('📋 Added fields:')
    console.log('   - first_name (TEXT)')
    console.log('   - last_name (TEXT)')
    console.log('   - date_of_birth (DATE)')
    console.log('   - username (TEXT, UNIQUE)')
    console.log('   - Added constraints for age verification and data validation')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
runMigration()
