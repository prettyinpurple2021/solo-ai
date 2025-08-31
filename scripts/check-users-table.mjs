import { neon } from '@neondatabase/serverless'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function checkUsersTable() {
  try {
    console.log('Checking users table structure...')
    
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
      ORDER BY ordinal_position
    `
    
    console.log('Users table columns:')
    columns.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`)
    })
    
  } catch (error) {
    console.error('Error checking users table:', error)
  }
}

checkUsersTable()