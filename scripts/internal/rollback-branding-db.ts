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

// INVERTED Replacements for Rollback
const REPLACEMENTS: Array<{ regex: RegExp; replacement: string }> = [
    { regex: /Elite\s*Founder/gi, replacement: 'Boss Babe' },
    { regex: /Visionary/gi, replacement: 'Girl Boss' },
    { regex: /\bFounders\b/gi, replacement: 'Bosses' },
    { regex: /\bFounder\b/gi, replacement: 'Boss' }
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

async function rollbackUsers(dryRun: boolean) {
    console.log('Scanning users table for rollback...');
    const matchedUsers = await db.select({ id: users.id, bio: users.bio }).from(users).where(
        or(like(users.bio, '%Founder%'), like(users.bio, '%Visionary%'))
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
    console.log(`Finished users table rollback. Updated ${updatedCount} rows.\n`);
}

async function rollbackAchievements(dryRun: boolean) {
    console.log('Scanning achievements table for rollback...');
    const matchedAchievements = await db.select({ id: achievements.id, title: achievements.title, description: achievements.description }).from(achievements).where(
        or(like(achievements.title, '%Founder%'), like(achievements.description, '%Founder%'), like(achievements.title, '%Visionary%'), like(achievements.description, '%Visionary%'))
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
    console.log(`Finished achievements table rollback. Updated ${updatedCount} rows.\n`);
}

async function rollbackChallenges(dryRun: boolean) {
    console.log('Scanning challenges table for rollback...');
    const matchedChallenges = await db.select({ id: challenges.id, title: challenges.title, description: challenges.description }).from(challenges).where(
        or(like(challenges.title, '%Founder%'), like(challenges.description, '%Founder%'), like(challenges.title, '%Visionary%'), like(challenges.description, '%Visionary%'))
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
    console.log(`Finished challenges table rollback. Updated ${updatedCount} rows.\n`);
}

async function rollbackNotifications(dryRun: boolean) {
    console.log('Scanning notifications table for rollback...');
    const matchedNotifs = await db.select({ id: notifications.id, title: notifications.title, message: notifications.message }).from(notifications).where(
        or(like(notifications.title, '%Founder%'), like(notifications.message, '%Founder%'), like(notifications.title, '%Visionary%'), like(notifications.message, '%Visionary%'))
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
    console.log(`Finished notifications table rollback. Updated ${updatedCount} rows.\n`);
}

async function run() {
    const isDryRun = process.argv.includes('--dry-run');

    if (isDryRun) {
        console.log('=== DRY RUN MODE: No database records will be modified ===');
    } else {
        console.log('=== LIVE DB ROLLBACK MODE: Proceeding with updates ===');
        // Give a few seconds to cancel
        await new Promise(r => setTimeout(r, 3000));
    }

    try {
        await rollbackUsers(isDryRun);
        await rollbackAchievements(isDryRun);
        await rollbackChallenges(isDryRun);
        await rollbackNotifications(isDryRun);
        console.log('Rollback script completed successfully.');
    } catch (e) {
        console.error('Error during rollback script', e);
    } finally {
        process.exit(0);
    }
}

run();
