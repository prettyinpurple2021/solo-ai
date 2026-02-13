import { db } from './db';
import { sql } from 'drizzle-orm';
import { logInfo, logError } from './utils/logger';

async function main() {
    logInfo('Creating missing AI tables...');

    // Competitor Reports
    await db.execute(sql`DROP TABLE IF EXISTS competitor_reports;`);
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS competitor_reports (
            id SERIAL PRIMARY KEY,
            user_id TEXT NOT NULL,
            competitor_name TEXT NOT NULL,
            threat_level TEXT,
            mission_brief TEXT,
            intel JSONB,
            vulnerabilities JSONB,
            strengths JSONB,
            metrics JSONB,
            generated_at TIMESTAMP DEFAULT NOW()
        );
    `);
    logInfo('Created competitor_reports');

    // Board Reports
    await db.execute(sql`DROP TABLE IF EXISTS board_reports;`);
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS board_reports (
            id SERIAL PRIMARY KEY,
            user_id TEXT NOT NULL,
            ceo_score INTEGER,
            consensus TEXT,
            executive_summary TEXT,
            grades JSONB,
            generated_at TIMESTAMP DEFAULT NOW()
        );
    `);
    logInfo('Created board_reports');

    // Pivot Analyses
    await db.execute(sql`DROP TABLE IF EXISTS pivot_analyses;`);
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS pivot_analyses (
            id SERIAL PRIMARY KEY,
            user_id TEXT NOT NULL,
            gaps JSONB,
            generated_at TIMESTAMP DEFAULT NOW()
        );
    `);
    logInfo('Created pivot_analyses');

    // War Room Sessions
    await db.execute(sql`DROP TABLE IF EXISTS war_room_sessions;`);
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS war_room_sessions (
            id SERIAL PRIMARY KEY,
            user_id TEXT NOT NULL,
            topic TEXT,
            consensus TEXT,
            action_plan JSONB,
            dialogue JSONB,
            created_at TIMESTAMP DEFAULT NOW()
        );
    `);
    logInfo('Created war_room_sessions');

    // Contacts
    await db.execute(sql`DROP TABLE IF EXISTS contacts;`);
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS contacts (
            id SERIAL PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            email TEXT,
            company TEXT,
            role TEXT,
            notes TEXT,
            linkedin_url TEXT,
            tags TEXT[],
            last_contact TIMESTAMP,
            relationship TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
    `);
    logInfo('Created contacts');

    // Pitch Decks (Update for title)
    // NOTE: This drops existing decks! In production, use ALTER TABLE. Here we assume localized dev/new schema.
    await db.execute(sql`DROP TABLE IF EXISTS pitch_decks;`);
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS pitch_decks (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title VARCHAR(255) NOT NULL,
            content JSONB DEFAULT '{}',
            version INTEGER DEFAULT 1,
            is_template BOOLEAN DEFAULT FALSE,
            theme VARCHAR(50),
            thumbnail VARCHAR(1000),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
    `);
    logInfo('Recreated pitch_decks with correct schema');

    logInfo('All missing AI tables created successfully.');
    process.exit(0);
}

main().catch((err) => {
    logError('Migration failed', err);
    process.exit(1);
});
