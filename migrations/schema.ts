import { pgTable, unique, uuid, text, jsonb, boolean, timestamp, index, foreignKey, check, integer, date, bigint } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: uuid().primaryKey().notNull(),
	email: text().notNull(),
	fullName: text("full_name"),
	avatarUrl: text("avatar_url"),
	companyName: text("company_name"),
	industry: text(),
	businessType: text("business_type"),
	phone: text(),
	website: text(),
	bio: text(),
	timezone: text().default('America/New_York'),
	notificationPreferences: jsonb("notification_preferences").default({"push":true,"email":true,"marketing":false}),
	onboardingCompleted: boolean("onboarding_completed").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("users_email_key").on(table.email),
]);

export const goals = pgTable("goals", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	title: text().notNull(),
	description: text(),
	priority: text().default('medium'),
	status: text().default('pending'),
	progress: integer().default(0),
	deadline: date(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_goals_deadline").using("btree", table.deadline.asc().nullsLast().op("date_ops")),
	index("idx_goals_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "goals_user_id_fkey"
		}).onDelete("cascade"),
	check("goals_priority_check", sql`priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])`),
	check("goals_status_check", sql`status = ANY (ARRAY['pending'::text, 'in-progress'::text, 'completed'::text, 'cancelled'::text])`),
	check("goals_progress_check", sql`(progress >= 0) AND (progress <= 100)`),
]);

export const tasks = pgTable("tasks", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	goalId: uuid("goal_id"),
	title: text().notNull(),
	description: text(),
	priority: text().default('medium'),
	status: text().default('pending'),
	dueDate: timestamp("due_date", { withTimezone: true, mode: 'string' }),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_tasks_due_date").using("btree", table.dueDate.asc().nullsLast().op("timestamptz_ops")),
	index("idx_tasks_goal_id").using("btree", table.goalId.asc().nullsLast().op("uuid_ops")),
	index("idx_tasks_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "tasks_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.goalId],
			foreignColumns: [goals.id],
			name: "tasks_goal_id_fkey"
		}).onDelete("set null"),
	check("tasks_priority_check", sql`priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])`),
	check("tasks_status_check", sql`status = ANY (ARRAY['pending'::text, 'in-progress'::text, 'completed'::text, 'cancelled'::text])`),
]);

export const conversations = pgTable("conversations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	agentName: text("agent_name").notNull(),
	title: text(),
	messages: jsonb().default([]),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_conversations_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "conversations_user_id_fkey"
		}).onDelete("cascade"),
]);

export const documents = pgTable("documents", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	filename: text().notNull(),
	originalFilename: text("original_filename").notNull(),
	fileSize: integer("file_size").notNull(),
	mimeType: text("mime_type").notNull(),
	// TODO: failed to parse database type 'bytea'
	fileData: unknown("file_data").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_documents_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "documents_user_id_fkey"
		}).onDelete("cascade"),
]);

export const templateCategories = pgTable("template_categories", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "template_categories_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	category: text().notNull(),
	icon: text(),
	description: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const templates = pgTable("templates", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "templates_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	title: text().notNull(),
	description: text(),
	slug: text().notNull(),
	isInteractive: boolean("is_interactive").default(false).notNull(),
	requiredRole: text("required_role").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	categoryId: bigint("category_id", { mode: "number" }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_templates_slug").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [templateCategories.id],
			name: "templates_category_id_fkey"
		}),
	unique("templates_slug_key").on(table.slug),
]);

export const userTemplates = pgTable("user_templates", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "user_templates_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	userId: uuid("user_id").notNull(),
	templateSlug: text("template_slug").notNull(),
	templateData: jsonb("template_data").notNull(),
	title: text().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_user_templates_slug").using("btree", table.templateSlug.asc().nullsLast().op("text_ops")),
	index("idx_user_templates_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_templates_user_id_fkey"
		}).onDelete("cascade"),
]);

export const focusSessions = pgTable("focus_sessions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	title: text().notNull(),
	durationMinutes: integer("duration_minutes").notNull(),
	startTime: timestamp("start_time", { withTimezone: true, mode: 'string' }).notNull(),
	endTime: timestamp("end_time", { withTimezone: true, mode: 'string' }),
	status: text().default('active'),
	notes: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_focus_sessions_start_time").using("btree", table.startTime.asc().nullsLast().op("timestamptz_ops")),
	index("idx_focus_sessions_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "focus_sessions_user_id_fkey"
		}).onDelete("cascade"),
	check("focus_sessions_status_check", sql`status = ANY (ARRAY['active'::text, 'completed'::text, 'interrupted'::text])`),
]);

export const userAchievements = pgTable("user_achievements", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	achievementId: uuid("achievement_id").notNull(),
	earnedAt: timestamp("earned_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_user_achievements_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_achievements_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.achievementId],
			foreignColumns: [achievements.id],
			name: "user_achievements_achievement_id_fkey"
		}).onDelete("cascade"),
	unique("user_achievements_user_id_achievement_id_key").on(table.userId, table.achievementId),
]);

export const achievements = pgTable("achievements", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	title: text().notNull(),
	description: text(),
	icon: text(),
	category: text(),
	points: integer().default(0),
	criteria: jsonb(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("achievements_name_key").on(table.name),
]);

export const aiAgents = pgTable("ai_agents", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	displayName: text("display_name").notNull(),
	description: text(),
	personality: text(),
	capabilities: text().array(),
	accentColor: text("accent_color"),
	systemPrompt: text("system_prompt"),
	modelPreference: text("model_preference").default('gpt-4'),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("ai_agents_name_key").on(table.name),
]);
