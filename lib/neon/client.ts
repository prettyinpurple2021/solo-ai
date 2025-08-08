import { Pool } from 'pg'

let pool: Pool | null = null

export const createClient = () => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    
    if (!connectionString) {
      // During build time or when env vars are missing, return a mock client
      if (typeof window === 'undefined') {
        // Server-side: throw error only in production builds
        if (process.env.NODE_ENV === 'production') {
          console.warn('Neon database environment variables missing during build - features requiring database will be disabled')
          return null as any
        }
      }
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
