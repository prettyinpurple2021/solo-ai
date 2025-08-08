import { readFileSync } from 'fs'
import { join } from 'path'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('')
  console.error('Please check your .env.local file and ensure these variables are set correctly.')
  process.exit(1)
}

async function showMigration() {
  try {
    console.log('🚀 Profile Fields Migration')
    console.log('📡 Environment variables loaded successfully!')
    console.log('')
    console.log('📋 To complete the migration, please run the following SQL in your Supabase SQL Editor:')
    console.log('')
    console.log('🔗 Go to: https://supabase.com/dashboard/project/[YOUR-PROJECT-ID]/sql/new')
    console.log('')
    console.log('📄 Copy and paste this SQL:')
    console.log('')
    console.log('='.repeat(80))
    
    // Read and display the migration SQL
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '006_add_user_profile_fields.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf8')
    console.log(migrationSQL)
    
    console.log('='.repeat(80))
    console.log('')
    console.log('✅ After running the SQL, your enhanced sign-up form will be ready!')
    console.log('')
    console.log('📋 This migration will add:')
    console.log('   - first_name (TEXT)')
    console.log('   - last_name (TEXT)')
    console.log('   - date_of_birth (DATE)')
    console.log('   - username (TEXT, UNIQUE)')
    console.log('   - Age verification constraints (18+ years old)')
    console.log('   - Data validation constraints')
    
  } catch (error) {
    console.error('❌ Error reading migration file:', error)
    process.exit(1)
  }
}

// Show the migration
showMigration()
