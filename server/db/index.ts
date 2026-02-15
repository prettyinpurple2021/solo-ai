import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './schema';
import dotenv from 'dotenv';
import { logInfo, logWarn, logError } from '../utils/logger';

dotenv.config({ path: '../.env.local' });
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    logWarn("DATABASE_URL is not defined. The backend will crash if you try to query the DB.");
}

const client = new Client({
    connectionString: connectionString,
});

const connectDB = async () => {
    try {
        await client.connect();
        logInfo("Connected to Neon Database");
    } catch (err) {
        logError("Failed to connect to Neon Database", err);
    }
};

connectDB();


import * as relations from './relations';

export const db = drizzle(client as any, { schema: { ...schema, ...relations } });

// Re-export common operators to avoid "dual package hazard"
export { eq, gt, lt, gte, lte, ne, isNull, isNotNull, inArray, notInArray, exists, notExists, and, or, not, asc, desc, sql } from 'drizzle-orm';
