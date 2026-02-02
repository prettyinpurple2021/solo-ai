import { integer, pgTable, varchar, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { users } from './schema';

// Challenges table
export const challenges = pgTable('challenges', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }),
  difficulty: varchar('difficulty', { length: 50 }).default('Easy'),
  rewardPoints: integer('reward_points').default(0),
  rewardBadge: varchar('reward_badge', { length: 255 }),
  deadline: timestamp('deadline'),
  is_active: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User Challenges table
export const userChallenges = pgTable('user_challenges', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  challengeId: text('challenge_id').notNull().references(() => challenges.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).default('joined'), // joined, completed, failed
  progress: integer('progress').default(0),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('user_challenges_user_id_idx').on(table.userId),
  challengeIdIdx: index('user_challenges_challenge_id_idx').on(table.challengeId),
}));

export const userChallengesRelations = relations(userChallenges, ({ one }) => ({
  user: one(users, {
    fields: [userChallenges.userId],
    references: [users.id],
  }),
  challenge: one(challenges, {
    fields: [userChallenges.challengeId],
    references: [challenges.id],
  }),
}));
