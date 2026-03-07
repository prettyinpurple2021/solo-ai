
import { uuid, integer, pgTable, varchar, text, timestamp, boolean, jsonb, decimal, index, uniqueIndex, foreignKey, primaryKey, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

// User Competitive Stats table for gamification
export const userCompetitiveStats = pgTable('user_competitive_stats', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  competitors_monitored: integer('competitors_monitored').default(0).notNull(),
  intelligence_gathered: integer('intelligence_gathered').default(0).notNull(),
  alerts_processed: integer('alerts_processed').default(0).notNull(),
  opportunities_identified: integer('opportunities_identified').default(0).notNull(),
  competitive_tasks_completed: integer('competitive_tasks_completed').default(0).notNull(),
  market_victories: integer('market_victories').default(0).notNull(),
  threat_responses: integer('threat_responses').default(0).notNull(),
  intelligence_streaks: integer('intelligence_streaks').default(0).notNull(),
  competitive_advantage_points: integer('competitive_advantage_points').default(0).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('user_competitive_stats_user_id_idx').on(table.user_id),
}));

// Challenges table
export const challenges = pgTable('challenges', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  emoji: varchar('emoji', { length: 10 }).default('🏆').notNull(),
  participants_count: integer('participants_count').default(0).notNull(),
  deadline: timestamp('deadline'),
  reward_points: integer('reward_points').default(0).notNull(),
  reward_badge: varchar('reward_badge', { length: 100 }),
  difficulty: varchar('difficulty', { length: 20 }).default('medium').notNull(), // easy, medium, hard, legendary
  category: varchar('category', { length: 50 }).default('general').notNull(),
  created_by: text('created_by').references(() => users.id, { onDelete: 'set null' }),
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  isActiveIdx: index('challenges_is_active_idx').on(table.is_active),
  deadlineIdx: index('challenges_deadline_idx').on(table.deadline),
  categoryIdx: index('challenges_category_idx').on(table.category),
}));

// Challenge Participants table
export const challengeParticipants = pgTable('challenge_participants', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  challenge_id: text('challenge_id').notNull().references(() => challenges.id, { onDelete: 'cascade' }),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).default('joined').notNull(), // joined, completed, failed
  progress: integer('progress').default(0).notNull(), // 0-100
  joined_at: timestamp('joined_at').defaultNow().notNull(),
  completed_at: timestamp('completed_at'),
}, (table) => ({
  challengeIdIdx: index('challenge_participants_challenge_id_idx').on(table.challenge_id),
  userIdIdx: index('challenge_participants_user_id_idx').on(table.user_id),
  uniqueParticipant: uniqueIndex('challenge_participants_unique_idx').on(table.challenge_id, table.user_id),
}));

// Achievements table
export const achievements = pgTable('achievements', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 100 }),
  points: integer('points').default(0).notNull(),
  category: varchar('category', { length: 100 }),
  requirements: jsonb('requirements').default('{}').notNull(),
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// User achievements table
export const userAchievements = pgTable('user_achievements', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  achievement_id: uuid('achievement_id').notNull().references(() => achievements.id, { onDelete: 'cascade' }),
  earned_at: timestamp('earned_at').defaultNow().notNull(),
  metadata: jsonb('metadata').default('{}').notNull(),
}, (table) => ({
    uniqueUserAchievement: uniqueIndex('user_achievements_unique_idx').on(table.user_id, table.achievement_id),
}));

