import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';
import { logInfo, logError } from './utils/logger';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.DATABASE_URL) {
  logError('DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL);

async function main() {
  logInfo('Creating briefcase tables...');
  try {
    // user_briefcases
    await sql`
      CREATE TABLE IF NOT EXISTS user_briefcases (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS user_briefcases_user_id_idx ON user_briefcases (user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS user_briefcases_default_idx ON user_briefcases (user_id, is_default);`;

    // briefcase_items
    await sql`
      CREATE TABLE IF NOT EXISTS briefcase_items (
        id VARCHAR(255) PRIMARY KEY,
        briefcase_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        content JSONB,
        blob_url TEXT,
        file_size BIGINT,
        mime_type VARCHAR(255),
        tags TEXT[] DEFAULT '{}',
        metadata JSONB DEFAULT '{}',
        is_private BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        CONSTRAINT briefcase_items_type_check CHECK (type IN ('avatar', 'chat', 'brand', 'template_save', 'document', 'ai_interaction'))
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS briefcase_items_briefcase_id_idx ON briefcase_items (briefcase_id);`;
    await sql`CREATE INDEX IF NOT EXISTS briefcase_items_user_id_idx ON briefcase_items (user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS briefcase_items_type_idx ON briefcase_items (type);`;
    // GIN index for tags
    await sql`CREATE INDEX IF NOT EXISTS briefcase_items_tags_idx ON briefcase_items USING GIN (tags);`;

    logInfo('Briefcase tables created successfully.');
  } catch (e) {
    logError('Error creating tables', e);
  } finally {
    await sql.end();
  }
}

main();
