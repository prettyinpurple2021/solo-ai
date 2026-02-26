import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { users } from '../../src/lib/shared/db/schema/users';
import { achievements, challenges } from '../../src/lib/shared/db/schema/gamification';
import { notifications } from '../../src/lib/shared/db/schema/users';
import { like, or, eq } from 'drizzle-orm';


dotenv.config({ path: '../../.env.local' });
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

const REPLACEMENTS: Array<{ regex: RegExp; replacement: string }> = [
    { regex: /boss\s*babe/gi, replacement: 'Elite Founder' },
    { regex: /girl\s*boss/gi, replacement: 'Visionary' },
    { regex: /(?<!\w)boss(?!\w)/gi, replacement: 'Founder' }, // standalone boss
    { regex: /(?<!\w)bosses(?!\w)/gi, replacement: 'Founders' }, // standalone bosses
];

function applyReplacements(text: string): { text: string; changed: boolean } {
    if (!text) return { text, changed: false };
    let newText = text;
    let changed = false;
    for (const { regex, replacement } of REPLACEMENTS) {
        const replaced = newText.replace(regex, replacement);
        if (replaced !== newText) {
            newText = replaced;
            changed = true;
        }
    }
    return { text: newText, changed };
}

async function migrateUsers(dryRun: boolean) {
    console.log('Scanning users table...');
    const matchedUsers = await db.select({ id: users.id, bio: users.bio }).from(users).where(
        or(
            like(users.bio, '%boss%')
        )
    );

    let updatedCount = 0;
    for (const user of matchedUsers) {
        if (user.bio) {
            const result = applyReplacements(user.bio);
            if (result.changed) {
                console.log(`[User ${user.id}] Bio matches.`);
                if (!dryRun) {
                    await db.update(users).set({ bio: result.text }).where(eq(users.id, user.id));
                } else {
                    console.log(`  -> "${user.bio}" => "${result.text}"`);
                }
                updatedCount++;
            }
        }
    }
    console.log(`Finished users table. Updated ${updatedCount} rows.\n`);
}

async function migrateAchievements(dryRun: boolean) {
    console.log('Scanning achievements table...');
    const matchedAchievements = await db.select({ id: achievements.id, title: achievements.title, description: achievements.description }).from(achievements).where(
        or(
            like(achievements.title, '%boss%'),
            like(achievements.description, '%boss%')
        )
    );

    let updatedCount = 0;
    for (const ach of matchedAchievements) {
        let changed = false;
        const updates: Partial<typeof achievements.$inferInsert> = {};

        if (ach.title) {
            const res = applyReplacements(ach.title);
            if (res.changed) {
                updates.title = res.text;
                changed = true;
                if (dryRun) console.log(`  -> Title: "${ach.title}" => "${res.text}"`);
            }
        }

        if (ach.description) {
            const res = applyReplacements(ach.description);
            if (res.changed) {
                updates.description = res.text;
                changed = true;
                if (dryRun) console.log(`  -> Description: "${ach.description}" => "${res.text}"`);
            }
        }

        if (changed) {
            console.log(`[Achievement ${ach.id}] Matches found.`);
            if (!dryRun) {
                await db.update(achievements).set(updates).where(eq(achievements.id, ach.id));
            }
            updatedCount++;
        }
    }
    console.log(`Finished achievements table. Updated ${updatedCount} rows.\n`);
}

async function migrateChallenges(dryRun: boolean) {
    console.log('Scanning challenges table...');
    const matchedChallenges = await db.select({ id: challenges.id, title: challenges.title, description: challenges.description }).from(challenges).where(
        or(
            like(challenges.title, '%boss%'),
            like(challenges.description, '%boss%')
        )
    );

    let updatedCount = 0;
    for (const cha of matchedChallenges) {
        let changed = false;
        const updates: Partial<typeof challenges.$inferInsert> = {};

        if (cha.title) {
            const res = applyReplacements(cha.title);
            if (res.changed) {
                updates.title = res.text;
                changed = true;
                if (dryRun) console.log(`  -> Title: "${cha.title}" => "${res.text}"`);
            }
        }

        if (cha.description) {
            const res = applyReplacements(cha.description);
            if (res.changed) {
                updates.description = res.text;
                changed = true;
                if (dryRun) console.log(`  -> Description: "${cha.description}" => "${res.text}"`);
            }
        }

        if (changed) {
            console.log(`[Challenge ${cha.id}] Matches found.`);
            if (!dryRun) {
                await db.update(challenges).set(updates).where(eq(challenges.id, cha.id));
            }
            updatedCount++;
        }
    }
    console.log(`Finished challenges table. Updated ${updatedCount} rows.\n`);
}

async function migrateNotifications(dryRun: boolean) {
    console.log('Scanning notifications table...');
    const matchedNotifs = await db.select({ id: notifications.id, title: notifications.title, message: notifications.message }).from(notifications).where(
        or(
            like(notifications.title, '%boss%'),
            like(notifications.message, '%boss%')
        )
    );

    let updatedCount = 0;
    for (const notif of matchedNotifs) {
        let changed = false;
        const updates: Partial<typeof notifications.$inferInsert> = {};

        if (notif.title) {
            const res = applyReplacements(notif.title);
            if (res.changed) {
                updates.title = res.text;
                changed = true;
                if (dryRun) console.log(`  -> Title: "${notif.title}" => "${res.text}"`);
            }
        }

        if (notif.message) {
            const res = applyReplacements(notif.message);
            if (res.changed) {
                updates.message = res.text;
                changed = true;
                if (dryRun) console.log(`  -> Message: "${notif.message}" => "${res.text}"`);
            }
        }

        if (changed) {
            console.log(`[Notification ${notif.id}] Matches found.`);
            if (!dryRun) {
                await db.update(notifications).set(updates).where(eq(notifications.id, notif.id));
            }
            updatedCount++;
        }
    }
    console.log(`Finished notifications table. Updated ${updatedCount} rows.\n`);
}

async function run() {
    const isDryRun = process.argv.includes('--dry-run');
    if (isDryRun) {
        console.log('=== DRY RUN MODE: No database records will be modified ===');
    } else {
        console.log('=== LIVE DB UPDATE MODE: Proceeding with updates ===');
        // Give a few seconds to cancel
        await new Promise(r => setTimeout(r, 3000));
    }

    try {
        await migrateUsers(isDryRun);
        await migrateAchievements(isDryRun);
        await migrateChallenges(isDryRun);
        await migrateNotifications(isDryRun);
        console.log('Migration script completed successfully.');
    } catch (e) {
        console.error('Error during migration script', e);
    } finally {
        process.exit(0);
    }
}

run();
