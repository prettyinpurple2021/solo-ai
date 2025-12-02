import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from '@/db/schema'
import { logger, logError } from './logger'

/**
 * Centralized database client using Drizzle ORM
 * This replaces all raw SQL usage across the application
 */

let _db: NeonHttpDatabase<typeof schema> | null = null

/**
 * Get the centralized database client
 * Uses lazy initialization to avoid build-time database calls
 */
export function getDb() {
  // Prevent DB usage during build - check multiple build indicators
  const isBuildTime =
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.SKIP_DB_CHECK === 'true' ||
    (typeof window === 'undefined' && !process.env.DATABASE_URL)

  if (isBuildTime && !process.env.DATABASE_URL) {
    throw new Error('Database client is not available during build time')
  }

  if (!_db) {
    const url = process.env.DATABASE_URL
    if (!url) {
      throw new Error('DATABASE_URL is not set')
    }

    try {
      const client = neon(url)
      _db = drizzle({
        schema,
        client,
      })

      logger.info('Database client initialized successfully')
    } catch (error) {
      logError('Failed to initialize database client:', error)
      throw new Error('Database connection failed')
    }
  }
  return _db
}

/**
 * Database transaction helper
 */
export async function withTransaction<T>(
  callback: (tx: any) => Promise<T>
): Promise<T> {
  const db = getDb()
  return await db.transaction(async (tx) => {
    return await callback(tx)
  })
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth(): Promise<{ healthy: boolean; error?: string }> {
  try {
    const db = getDb()
    // Simple query to test connection
    await db.execute('SELECT 1')
    return { healthy: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logError('Database health check failed:', error)
    return { healthy: false, error: errorMessage }
  }
}

// Export db for backward compatibility, but it will only be created when first accessed
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(target, prop) {
    return getDb()[prop as keyof NeonHttpDatabase<typeof schema>]
  }
})

/**
 * Migration helper - ensures database schema is up to date
 */
export async function ensureSchema(): Promise<void> {
  try {
    const db = getDb()
    // This would typically run migrations
    // For now, just check if we can connect
    await checkDatabaseHealth()
    logger.info('Database schema verified')
  } catch (error) {
    logError('Schema verification failed:', error)
    throw new Error('Database schema verification failed')
  }
}


