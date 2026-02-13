import { db } from './db';
import { sql } from 'drizzle-orm';
import { logInfo, logError } from './utils/logger';

async function createChatHistoryTable() {
    try {
        logInfo('Creating chat_history table...');
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS chat_history (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL,
                agent_id TEXT NOT NULL,
                role TEXT NOT NULL,
                text TEXT NOT NULL,
                timestamp BIGINT NOT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            );
            
            CREATE INDEX IF NOT EXISTS chat_history_user_agent_idx ON chat_history (user_id, agent_id);
        `);
        logInfo('chat_history table created successfully.');
    } catch (error) {
        logError('Error creating chat_history table', error);
    }
    process.exit(0);
}

createChatHistoryTable();
