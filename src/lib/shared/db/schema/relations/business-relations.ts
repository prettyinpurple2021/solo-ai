
import { relations } from 'drizzle-orm';
import * as users from '../users';
import * as business from '../business';

export const userSettingsRelations = relations(business.userSettings, ({ one }) => ({
  user: one(users.users, {
    fields: [business.userSettings.user_id],
    references: [users.users.id],
  }),
}));

export const briefcasesRelations = relations(business.briefcases, ({ one, many }) => ({
  user: one(users.users, {
    fields: [business.briefcases.user_id],
    references: [users.users.id],
  }),
  goals: many(business.goals),
  tasks: many(business.tasks),
}));

export const goalsRelations = relations(business.goals, ({ one, many }) => ({
  user: one(users.users, {
    fields: [business.goals.user_id],
    references: [users.users.id],
  }),
  briefcase: one(business.briefcases, {
    fields: [business.goals.briefcase_id],
    references: [business.briefcases.id],
  }),
  tasks: many(business.tasks),
}));

export const tasksRelations = relations(business.tasks, ({ one, many }) => ({
  user: one(users.users, {
    fields: [business.tasks.user_id],
    references: [users.users.id],
  }),
  goal: one(business.goals, {
    fields: [business.tasks.goal_id],
    references: [business.goals.id],
  }),
  briefcase: one(business.briefcases, {
    fields: [business.tasks.briefcase_id],
    references: [business.briefcases.id],
  }),
  parentTask: one(business.tasks, {
    fields: [business.tasks.parent_task_id],
    references: [business.tasks.id],
  }),
  subtasks: many(business.tasks),
  analytics: many(business.taskAnalytics),
}));

export const templatesRelations = relations(business.templates, ({ one }) => ({
  user: one(users.users, {
    fields: [business.templates.user_id],
    references: [users.users.id],
  }),
}));

export const taskCategoriesRelations = relations(business.taskCategories, ({ one }) => ({
  user: one(users.users, {
    fields: [business.taskCategories.user_id],
    references: [users.users.id],
  }),
}));

export const taskAnalyticsRelations = relations(business.taskAnalytics, ({ one }) => ({
  user: one(users.users, {
    fields: [business.taskAnalytics.user_id],
    references: [users.users.id],
  }),
  task: one(business.tasks, {
    fields: [business.taskAnalytics.task_id],
    references: [business.tasks.id],
  }),
}));

export const productivityInsightsRelations = relations(business.productivityInsights, ({ one }) => ({
  user: one(users.users, {
    fields: [business.productivityInsights.user_id],
    references: [users.users.id],
  }),
}));

export const userBrandSettingsRelations = relations(business.userBrandSettings, ({ one }) => ({
  user: one(users.users, {
    fields: [business.userBrandSettings.user_id],
    references: [users.users.id],
  }),
}));

export const customReportsRelations = relations(business.customReports, ({ one }) => ({
   user: one(users.users, {
    fields: [business.customReports.user_id],
    references: [users.users.id],
  }),
}));
