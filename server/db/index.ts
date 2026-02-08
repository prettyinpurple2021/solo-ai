import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env.local' });
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.warn("⚠️  WARNING: DATABASE_URL is not defined. The backend will crash if you try to query the DB.");
}

const client = new Client({
    connectionString: connectionString,
});

const connectDB = async () => {
    try {
        await client.connect();
        console.log("✅ Connected to Neon Database");
    } catch (err) {
        console.error("❌ Failed to connect to Neon Database:", err);
    }
};

connectDB();


export const db = drizzle(client, { schema });

// Re-export common operators to avoid "dual package hazard"
export { eq, gt, lt, gte, lte, ne, isNull, isNotNull, inArray, notInArray, exists, notExists, and, or, not, asc, desc, sql } from 'drizzle-orm';
