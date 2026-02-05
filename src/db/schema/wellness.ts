import { pgTable, text, timestamp, integer, varchar, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { v4 as uuidv4 } from 'uuid';

// Mood/Energy Tracker
export const moodEntries = pgTable('mood_entries', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  energy_level: integer('energy_level').notNull(), // 1-5 scale
  mood_label: varchar('mood_label', { length: 50 }), // e.g., "Motivated", "Tired", "Anxious"
  note: text('note'),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    energyCheck: check('energy_check', sql`${table.energy_level} >= 1 AND ${table.energy_level} <= 5`)
}));


