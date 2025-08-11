import 'server-only'
import { Pool } from 'pg'

let pool: Pool | null = null

export const createClient = async () => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    
    if (!connectionString) {
      throw new Error('Missing Neon database environment variables. Please set DATABASE_URL')
    }
    
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
  }
  
  return pool
}

// Default export for backward compatibility
export default createClient
