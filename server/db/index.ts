import { drizzle } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as sharedSchema from '../../src/lib/shared/db/schema';

const schema = { ...sharedSchema };
import { logInfo, logWarn, logError } from '../utils/logger';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    logWarn("DATABASE_URL is not defined. The backend will crash if you try to query the DB.");
}

type ServerDb = NodePgDatabase<typeof schema>;

let pool: Pool | null = null;
let dbInstance: ServerDb | null = null;

function isTestRuntime(): boolean {
    return process.env.NODE_ENV === 'test' || Boolean(process.env.JEST_WORKER_ID);
}

function getPool(): Pool {
    if (pool) {
        return pool;
    }

    pool = new Pool({
        connectionString: connectionString,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => {
        logError('Unexpected error on idle client', err);
    });

    pool.on('connect', (client) => {
        client.on('error', (err) => {
            logError('Error on active client:', err);
        });
    });

    // Avoid eager TCP + late logs in Jest when routes import `db` but never query.
    if (!isTestRuntime() && connectionString) {
        void pool
            .connect()
            .then((client) => {
                logInfo("Connected to Neon Database (Pool)");
                client.release();
            })
            .catch((err) => logError("Failed to connect to Neon Database", err));
    }

    return pool;
}

function getDbInstance(): ServerDb {
    if (!dbInstance) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- drizzle Pool generic matches runtime pool
        dbInstance = drizzle(getPool() as any, { schema });
    }
    return dbInstance;
}

/**
 * Lazy `db` proxy so importing Express routes in tests does not open a pg pool
 * until the first query runs.
 */
export const db = new Proxy({} as ServerDb, {
    get(_target, prop, _proxyReceiver) {
        const real = getDbInstance();
        // Pass `real` as Reflect.get's receiver so getters (e.g. relational `query`) see correct `this`.
        const value = Reflect.get(real as object, prop, real);
        return typeof value === 'function' ? value.bind(real) : value;
    },
});

/**
 * Close the shared pool (Jest teardown / graceful shutdown).
 */
export async function closeServerDatabasePool(): Promise<void> {
    if (!pool) {
        return;
    }
    try {
        await pool.end();
    } finally {
        pool = null;
        dbInstance = null;
    }
}

// Re-export common operators to avoid "dual package hazard"
export { eq, gt, lt, gte, lte, ne, isNull, isNotNull, inArray, notInArray, exists, notExists, and, or, not, asc, desc, sql, count } from 'drizzle-orm';
