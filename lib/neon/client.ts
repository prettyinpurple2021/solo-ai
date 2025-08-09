import { Pool, PoolClient } from 'pg'

let pool: Pool | null = null

export const createClient = () => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    
    if (!connectionString) {
      // During build time or when env vars are missing, return a mock client
      if (typeof window === 'undefined') {
        // Server-side: throw error only in production builds
        if (process.env.NODE_ENV === 'production') {
          throw new Error('DATABASE_URL is required in production')
        } else {
          console.warn('DATABASE_URL missing - using mock database client for development')
          return {
            query: async () => ({ rows: [], rowCount: 0 }),
            connect: async () => ({
              query: async () => ({ rows: [], rowCount: 0 }),
              release: () => {}
            })
          } as any
        }
      }
      throw new Error('Missing Neon database environment variables. Please set DATABASE_URL')
    }
    
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    // Handle pool errors
    pool.on('error', (err: Error) => {
      console.error('Unexpected error on idle client', err)
    })
  }
  
  return pool
}

// Helper function to get a client from the pool
export const getClient = async (): Promise<PoolClient> => {
  const pool = createClient()
  return await pool.connect()
}

// Helper function for single queries
export const query = async (text: string, params?: any[]) => {
  const client = await getClient()
  try {
    return await client.query(text, params)
  } finally {
    client.release()
  }
}

// Default export for backward compatibility
export default createClient
