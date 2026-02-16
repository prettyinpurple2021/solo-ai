
import { integer, pgTable, varchar, text, timestamp, boolean, jsonb, decimal, index, uniqueIndex, foreignKey, primaryKey, pgEnum } from 'drizzle-orm/pg-core';
import { v4 as uuidv4 } from 'uuid';
import { users } from './users';

// User Competitive Stats table for gamification
export const userCompetitiveStats = pgTable('user_competitive_stats', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  competitors_monitored: integer('competitors_monitored').default(0),
  intelligence_gathered: integer('intelligence_gathered').default(0),
  alerts_processed: integer('alerts_processed').default(0),
  opportunities_identified: integer('opportunities_identified').default(0),
  competitive_tasks_completed: integer('competitive_tasks_completed').default(0),
  market_victories: integer('market_victories').default(0),
  threat_responses: integer('threat_responses').default(0),
  intelligence_streaks: integer('intelligence_streaks').default(0),
  competitive_advantage_points: integer('competitive_advantage_points').default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Challenges table
export const challenges = pgTable('challenges', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  emoji: varchar('emoji', { length: 10 }).default('🏆'),
  participants_count: integer('participants_count').default(0),
  deadline: timestamp('deadline'),
  reward_points: integer('reward_points').default(0),
  reward_badge: varchar('reward_badge', { length: 100 }),
  difficulty: varchar('difficulty', { length: 20 }).default('medium'), // easy, medium, hard, legendary
  category: varchar('category', { length: 50 }).default('general'),
  created_by: text('created_by').references(() => users.id, { onDelete: 'set null' }),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  isActiveIdx: index('challenges_is_active_idx').on(table.is_active),
  deadlineIdx: index('challenges_deadline_idx').on(table.deadline),
  categoryIdx: index('challenges_category_idx').on(table.category),
}));

// Challenge Participants table
export const challengeParticipants = pgTable('challenge_participants', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  challenge_id: text('challenge_id').notNull().references(() => challenges.id, { onDelete: 'cascade' }),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).default('joined'), // joined, completed, failed
  progress: integer('progress').default(0), // 0-100
  joined_at: timestamp('joined_at').defaultNow(),
  completed_at: timestamp('completed_at'),
}, (table) => ({
  challengeIdIdx: index('challenge_participants_challenge_id_idx').on(table.challenge_id),
  userIdIdx: index('challenge_participants_user_id_idx').on(table.user_id),
  uniqueParticipant: uniqueIndex('challenge_participants_unique_idx').on(table.challenge_id, table.user_id),
}));

// Achievements table
export const achievements = pgTable('achievements', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 100 }),
  points: integer('points').default(0),
  category: varchar('category', { length: 100 }),
  requirements: jsonb('requirements').default('{}'),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
});

// User achievements table
export const userAchievements = pgTable('user_achievements', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  achievement_id: integer('achievement_id').notNull().references(() => achievements.id, { onDelete: 'cascade' }),
  earned_at: timestamp('earned_at').defaultNow(),
  metadata: jsonb('metadata').default('{}'),
}, (table) => ({
    uniqueUserAchievement: uniqueIndex('user_achievements_unique_idx').on(table.user_id, table.achievement_id),
}));
