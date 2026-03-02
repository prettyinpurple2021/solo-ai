import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as sharedSchema from '../../src/lib/shared/db/schema';

const schema = { ...sharedSchema };
import dotenv from 'dotenv';
import { logInfo, logWarn, logError } from '../utils/logger';

dotenv.config({ path: '../.env.local' });
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    logWarn("DATABASE_URL is not defined. The backend will crash if you try to query the DB.");
}

const pool = new Pool({
    connectionString: connectionString,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
    logError('Unexpected error on idle client', err);
    // Don't exit process, pool handles this
});

pool.on('connect', (client) => {
    client.on('error', (err) => {
        logError('Error on active client:', err);
    });
});

// Test connection
pool.connect()
    .then(client => {
        logInfo("Connected to Neon Database (Pool)");
        client.release();
    })
    .catch(err => logError("Failed to connect to Neon Database", err));

// Drizzle supports Pool directly
export const db = drizzle(pool as any, { schema });

// Re-export common operators to avoid "dual package hazard"
export { eq, gt, lt, gte, lte, ne, isNull, isNotNull, inArray, notInArray, exists, notExists, and, or, not, asc, desc, sql } from 'drizzle-orm';
