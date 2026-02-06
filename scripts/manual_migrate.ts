

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

async function main() {
    console.log('Starting manual migration...');
    
    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL is not set in .env.local');
        process.exit(1);
    }

    const migrationFile = path.join(process.cwd(), 'migrations', '0002_large_wallop.sql');
    console.log(`Reading migration file: ${migrationFile}`);
    
    if (!fs.existsSync(migrationFile)) {
        console.error('Migration file not found');
        process.exit(1);
    }

    const content = fs.readFileSync(migrationFile, 'utf-8');
    const statements = content.split('--> statement-breakpoint')
        .map(s => s.trim())
        .filter(s => s.length > 0);

    console.log(`Found ${statements.length} statements.`);

    // Use raw pg client
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: true // Neon usually requires SSL
    });

    const client = await pool.connect();


    try {
        // Run without transaction to allow partial success
        for (const statement of statements) {
            try {
                // Shorten for log
                const preview = statement.length > 50 ? statement.substring(0, 50) + '...' : statement;
                console.log(`Executing: ${preview}`);
                
                await client.query(statement);
                console.log('  -> Success');
            } catch (e: any) {
                console.error(`  -> Error executing statement: ${e.message}`);
                // Continue? Most existing relation errors are fine.
                // But for ALTER TABLE causing errors, we might want to be careful.
                // However, if table exists, CREATE TABLE fails. That's fine.
                if (e.message.includes('already exists')) {
                    console.log('  -> Ignoring expected "already exists" error.');
                } else {
                    console.warn('  -> WARNING: Unexpected error. Continuing...');
                }
            }
        }

        console.log('Migration finished (partial/full success).');
    } catch (err) {
        console.error('Migration failed critically:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }

}

main().catch(console.error);

