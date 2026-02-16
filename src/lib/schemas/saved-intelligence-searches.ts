import { pgTable, varchar, text, jsonb, timestamp, integer, boolean } from 'drizzle-orm/pg-core'

// Saved searches table schema
export const savedIntelligenceSearches = pgTable('saved_intelligence_searches', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: varchar('user_id', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  search_params: jsonb('search_params').notNull(),
  is_favorite: boolean('is_favorite').default(false),
  last_used: timestamp('last_used'),
  use_count: integer('use_count').default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})
