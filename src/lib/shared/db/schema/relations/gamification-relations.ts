
import { relations } from 'drizzle-orm';
import * as users from '../users';
import * as gamification from '../gamification';

export const userCompetitiveStatsRelations = relations(gamification.userCompetitiveStats, ({ one }) => ({
  user: one(users.users, {
    fields: [gamification.userCompetitiveStats.user_id],
    references: [users.users.id],
  }),
}));

export const challengesRelations = relations(gamification.challenges, ({ many }) => ({
  participants: many(gamification.challengeParticipants),
}));

export const challengeParticipantsRelations = relations(gamification.challengeParticipants, ({ one }) => ({
  challenge: one(gamification.challenges, {
    fields: [gamification.challengeParticipants.challenge_id],
    references: [gamification.challenges.id],
  }),
  user: one(users.users, {
    fields: [gamification.challengeParticipants.user_id],
    references: [users.users.id],
  }),
}));

export const achievementsRelations = relations(gamification.achievements, ({ many }) => ({
   
}));

export const userAchievementsRelations = relations(gamification.userAchievements, ({ one }) => ({
   user: one(users.users, {
    fields: [gamification.userAchievements.user_id],
    references: [users.users.id],
  }),
   achievement: one(gamification.achievements, {
    fields: [gamification.userAchievements.achievement_id],
    references: [gamification.achievements.id],
  }),
}));
