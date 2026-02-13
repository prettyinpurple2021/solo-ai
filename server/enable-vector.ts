import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';
import { logInfo, logError } from './utils/logger';

// Load env from .env.local in current directory (server/)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  logError('DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL);

async function main() {
  logInfo('Enabling vector extension...');
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS vector`;
    logInfo('Vector extension enabled successfully.');
  } catch (e) {
    logError('Error enabling vector extension', e);
  } finally {
    await sql.end();
  }
}

main();
