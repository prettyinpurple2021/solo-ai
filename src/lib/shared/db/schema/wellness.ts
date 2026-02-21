import { pgTable, text, timestamp, integer, varchar, check, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { v4 as uuidv4 } from 'uuid';

// Mood/Energy Tracker
export const moodEntries = pgTable('mood_entries', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  energy_level: integer('energy_level').notNull(), // 1-5 scale
  mood_label: varchar('mood_label', { length: 50 }).notNull(), // e.g., "Motivated", "Tired", "Anxious"
  note: text('note'),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index('mood_entries_user_id_idx').on(table.user_id),
    createdAtIdx: index('mood_entries_created_at_idx').on(table.created_at),
    energyCheck: check('energy_check', sql`${table.energy_level} >= 1 AND ${table.energy_level} <= 5`)
}));


