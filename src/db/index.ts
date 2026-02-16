// Re-export the centralized database client
export { getDb, db, withTransaction, checkDatabaseHealth } from '../lib/database-client'
export * from '@/shared/db/schema'
