import { relations } from "drizzle-orm/relations";
import { users, goals, tasks, conversations, documents, templateCategories, templates, userTemplates, focusSessions, userAchievements, achievements } from "./schema";

export const goalsRelations = relations(goals, ({one, many}) => ({
	user: one(users, {
		fields: [goals.userId],
		references: [users.id]
	}),
	tasks: many(tasks),
}));

export const usersRelations = relations(users, ({many}) => ({
	goals: many(goals),
	tasks: many(tasks),
	conversations: many(conversations),
	documents: many(documents),
	userTemplates: many(userTemplates),
	focusSessions: many(focusSessions),
	userAchievements: many(userAchievements),
}));

export const tasksRelations = relations(tasks, ({one}) => ({
	user: one(users, {
		fields: [tasks.userId],
		references: [users.id]
	}),
	goal: one(goals, {
		fields: [tasks.goalId],
		references: [goals.id]
	}),
}));

export const conversationsRelations = relations(conversations, ({one}) => ({
	user: one(users, {
		fields: [conversations.userId],
		references: [users.id]
	}),
}));

export const documentsRelations = relations(documents, ({one}) => ({
	user: one(users, {
		fields: [documents.userId],
		references: [users.id]
	}),
}));

export const templatesRelations = relations(templates, ({one}) => ({
	templateCategory: one(templateCategories, {
		fields: [templates.categoryId],
		references: [templateCategories.id]
	}),
}));

export const templateCategoriesRelations = relations(templateCategories, ({many}) => ({
	templates: many(templates),
}));

export const userTemplatesRelations = relations(userTemplates, ({one}) => ({
	user: one(users, {
		fields: [userTemplates.userId],
		references: [users.id]
	}),
}));

export const focusSessionsRelations = relations(focusSessions, ({one}) => ({
	user: one(users, {
		fields: [focusSessions.userId],
		references: [users.id]
	}),
}));

export const userAchievementsRelations = relations(userAchievements, ({one}) => ({
	user: one(users, {
		fields: [userAchievements.userId],
		references: [users.id]
	}),
	achievement: one(achievements, {
		fields: [userAchievements.achievementId],
		references: [achievements.id]
	}),
}));

export const achievementsRelations = relations(achievements, ({many}) => ({
	userAchievements: many(userAchievements),
}));