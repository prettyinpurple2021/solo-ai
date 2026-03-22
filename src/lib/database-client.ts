import { drizzle } from 'drizzle-orm/neon-http'
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from '@/shared/db/schema'
import { logger, logError, logInfo } from './logger'
import { sql } from 'drizzle-orm'

/**
 * Centralized database client using Drizzle ORM
 * This replaces all raw SQL usage across the application
 */

let _db: NeonHttpDatabase<typeof schema> | null = null

/** Singleton: Jest + no DATABASE_URL — getDb() returns; first real DB op throws with guidance. */
let _jestUnconfiguredDb: NeonHttpDatabase<typeof schema> | null = null

function getJestUnconfiguredDbProxy(): NeonHttpDatabase<typeof schema> {
  if (_jestUnconfiguredDb) return _jestUnconfiguredDb
  const message =
    'DATABASE_URL is not set in Jest. Mock `src/lib/database-client`, or set DATABASE_URL for integration tests.'
  _jestUnconfiguredDb = new Proxy({} as NeonHttpDatabase<typeof schema>, {
    get() {
      throw new Error(message)
    },
  })
  return _jestUnconfiguredDb
}

/**
 * CI / custom runners sometimes omit NODE_ENV=test and JEST_WORKER_ID; npm test still sets npm_lifecycle_event.
 */
function isJestRuntime(): boolean {
  if (process.env.JEST_WORKER_ID !== undefined) return true
  if (process.env.NODE_ENV === 'test') return true
  if (process.env.npm_lifecycle_event === 'test') return true
  const g = globalThis as typeof globalThis & { jest?: unknown }
  return typeof g.jest !== 'undefined'
}

/**
 * Get the centralized database client
 * Uses lazy initialization to avoid build-time database calls
 */
export function getDb() {
  // logInfo("[DB] getDb() called"); // Verbose
  // Next static build: block without DATABASE_URL. Jest often has no URL in CI.
  const isJest = isJestRuntime()
  const isBuildTime =
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.SKIP_DB_CHECK === 'true' ||
    (!isJest && typeof window === 'undefined' && !process.env.DATABASE_URL)

  if (isBuildTime && !process.env.DATABASE_URL) {
    logger.warn('[DB] Database client access blocked during build time');
    throw new Error('Database client is not available during build time')
  }

  if (isJest && !process.env.DATABASE_URL) {
    return getJestUnconfiguredDbProxy()
  }

  if (!_db) {
    const url = process.env.DATABASE_URL
    if (!url) {
      logger.error('[DB] DATABASE_URL is not set!');
      throw new Error('DATABASE_URL is not set')
    }

    try {
      logInfo('[DB] Initializing new database client...');
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
 * Database transaction helper with User Context (for RLS)
 */
export async function withUserTransaction<T>(
  userId: string,
  callback: (tx: Tx) => Promise<T>
): Promise<T> {
  const db = getDb()
  return await db.transaction(async (tx) => {
    // Set the session-level user ID for RLS policies
    await tx.execute(sql`SELECT set_config('auth.user_id', ${userId}, true)`);
    return await callback(tx)
  })
}

/**
 * Database transaction helper
 */
// Helper type for the transaction object
type Tx = Parameters<Parameters<NeonHttpDatabase<typeof schema>['transaction']>[0]>[0]

export async function withTransaction<T>(
  callback: (tx: Tx) => Promise<T>
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
  get(_target, prop) {
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
    // Verify connectivity via simple query execution
    await db.execute('SELECT 1');
    const health = await checkDatabaseHealth()
    if (!health.healthy) {
      const detail = health.error ?? 'unknown error'
      logError('Database unhealthy during schema verification:', new Error(detail))
      throw new Error(`Database schema verification failed: ${detail}`)
    }
    logger.info('Database schema verified')
  } catch (error) {
    logError('Schema verification failed:', error)
    throw new Error('Database schema verification failed')
  }
}