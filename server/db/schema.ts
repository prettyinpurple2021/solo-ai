import { pgTable, index, foreignKey, text, boolean, jsonb, integer, timestamp, varchar, uniqueIndex, unique, numeric, check, serial, primaryKey, pgSequence, pgEnum, vector } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const feedbackStatus = pgEnum("feedback_status", ['pending', 'in_progress', 'resolved', 'closed', 'dismissed'])
export const feedbackType = pgEnum("feedback_type", ['bug', 'feature_request', 'comment', 'error', 'other'])

export const usersIdSeq = pgSequence("users_id_seq", {  startWith: "1", increment: "1", minValue: "1", maxValue: "9223372036854775807", cache: "1", cycle: false })

export const scrapingJobResults = pgTable("scraping_job_results", {
	id: text().primaryKey().notNull(),
	jobId: text("job_id").notNull(),
	success: boolean().notNull(),
	data: jsonb(),
	error: text(),
	executionTime: integer("execution_time").notNull(),
	changesDetected: boolean("changes_detected").default(false).notNull(),
	retryCount: integer("retry_count").default(0).notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("scraping_job_results_completed_at_idx").using("btree", table.completedAt.asc().nullsLast().op("timestamp_ops")),
	index("scraping_job_results_job_id_idx").using("btree", table.jobId.asc().nullsLast().op("text_ops")),
	index("scraping_job_results_success_idx").using("btree", table.success.asc().nullsLast().op("bool_ops")),
	foreignKey({
			columns: [table.jobId],
			foreignColumns: [scrapingJobs.id],
			name: "scraping_job_results_job_id_scraping_jobs_id_fk"
		}).onDelete("cascade"),
]);

export const feedback = pgTable("feedback", {
	id: text().primaryKey().notNull(),
	userId: text("user_id"),
	type: text().notNull(),
	title: text(),
	message: text().notNull(),
	browserInfo: jsonb("browser_info"),
	screenshotUrl: text("screenshot_url"),
	status: text().default('pending').notNull(),
	priority: text().default('medium').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "feedback_user_id_users_id_fk"
		}).onDelete("set null"),
]);

export const customReports = pgTable("custom_reports", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	config: jsonb().default({}).notNull(),
	schedule: jsonb(),
	isFavorite: boolean("is_favorite").default(false),
	lastRunAt: timestamp("last_run_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("custom_reports_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "custom_reports_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const postComments = pgTable("post_comments", {
	id: text().primaryKey().notNull(),
	postId: text("post_id").notNull(),
	authorId: text("author_id").notNull(),
	content: text().notNull(),
	likesCount: integer("likes_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("post_comments_author_id_idx").using("btree", table.authorId.asc().nullsLast().op("text_ops")),
	index("post_comments_post_id_idx").using("btree", table.postId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.id],
			name: "post_comments_post_id_posts_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "post_comments_author_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const challenges = pgTable("challenges", {
	id: text().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	emoji: varchar({ length: 10 }).default('🏆'),
	participantsCount: integer("participants_count").default(0),
	deadline: timestamp({ mode: 'string' }),
	rewardPoints: integer("reward_points").default(0),
	rewardBadge: varchar("reward_badge", { length: 100 }),
	difficulty: varchar({ length: 20 }).default('medium'),
	category: varchar({ length: 50 }).default('general'),
	createdBy: text("created_by"),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("challenges_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("challenges_deadline_idx").using("btree", table.deadline.asc().nullsLast().op("timestamp_ops")),
	index("challenges_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "challenges_created_by_users_id_fk"
		}).onDelete("set null"),
]);

export const challengeParticipants = pgTable("challenge_participants", {
	id: text().primaryKey().notNull(),
	challengeId: text("challenge_id").notNull(),
	userId: text("user_id").notNull(),
	status: varchar({ length: 20 }).default('joined'),
	progress: integer().default(0),
	joinedAt: timestamp("joined_at", { mode: 'string' }).defaultNow(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
}, (table) => [
	index("challenge_participants_challenge_id_idx").using("btree", table.challengeId.asc().nullsLast().op("text_ops")),
	uniqueIndex("challenge_participants_unique_idx").using("btree", table.challengeId.asc().nullsLast().op("text_ops"), table.userId.asc().nullsLast().op("text_ops")),
	index("challenge_participants_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.challengeId],
			foreignColumns: [challenges.id],
			name: "challenge_participants_challenge_id_challenges_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "challenge_participants_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const achievements = pgTable("achievements", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "achievements_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar({ length: 255 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	icon: varchar({ length: 100 }),
	points: integer().default(0),
	category: varchar({ length: 100 }),
	requirements: jsonb().default({}),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("achievements_name_unique").on(table.name),
]);

export const analyticsEvents = pgTable("analytics_events", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "analytics_events_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: text("user_id"),
	event: varchar({ length: 100 }).notNull(),
	properties: jsonb().default({}),
	timestamp: timestamp({ mode: 'string' }).defaultNow(),
	sessionId: varchar("session_id", { length: 255 }),
	metadata: jsonb().default({}),
}, (table) => [
	index("analytics_events_event_idx").using("btree", table.event.asc().nullsLast().op("text_ops")),
	index("analytics_events_timestamp_idx").using("btree", table.timestamp.asc().nullsLast().op("timestamp_ops")),
	index("analytics_events_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "analytics_events_user_id_users_id_fk"
		}).onDelete("set null"),
]);

export const briefcases = pgTable("briefcases", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	status: varchar({ length: 50 }).default('active'),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "briefcases_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const calendarConnections = pgTable("calendar_connections", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "calendar_connections_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: text("user_id").notNull(),
	provider: varchar({ length: 50 }).notNull(),
	accessToken: text("access_token").notNull(),
	refreshToken: text("refresh_token"),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	email: varchar({ length: 255 }),
	name: varchar({ length: 255 }),
	isActive: boolean("is_active").default(true),
	lastSyncedAt: timestamp("last_synced_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("calendar_connections_provider_idx").using("btree", table.provider.asc().nullsLast().op("text_ops")),
	index("calendar_connections_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "calendar_connections_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const chatConversations = pgTable("chat_conversations", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	userId: text("user_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	agentId: varchar("agent_id", { length: 50 }).notNull(),
	agentName: varchar("agent_name", { length: 100 }).notNull(),
	lastMessage: text("last_message"),
	lastMessageAt: timestamp("last_message_at", { mode: 'string' }),
	messageCount: integer("message_count").default(0),
	isArchived: boolean("is_archived").default(false),
	metadata: jsonb().default({}),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("chat_conversations_agent_id_idx").using("btree", table.agentId.asc().nullsLast().op("text_ops")),
	index("chat_conversations_is_archived_idx").using("btree", table.isArchived.asc().nullsLast().op("bool_ops")),
	index("chat_conversations_last_message_at_idx").using("btree", table.lastMessageAt.asc().nullsLast().op("timestamp_ops")),
	index("chat_conversations_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "chat_conversations_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const chatMessages = pgTable("chat_messages", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	conversationId: varchar("conversation_id", { length: 255 }).notNull(),
	userId: text("user_id").notNull(),
	role: varchar({ length: 20 }).notNull(),
	content: text().notNull(),
	metadata: jsonb().default({}),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("chat_messages_conversation_id_idx").using("btree", table.conversationId.asc().nullsLast().op("text_ops")),
	index("chat_messages_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("chat_messages_role_idx").using("btree", table.role.asc().nullsLast().op("text_ops")),
	index("chat_messages_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.conversationId],
			foreignColumns: [chatConversations.id],
			name: "chat_messages_conversation_id_chat_conversations_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "chat_messages_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const competitiveOpportunities = pgTable("competitive_opportunities", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	competitorId: text("competitor_id").notNull(),
	intelligenceId: text("intelligence_id"),
	opportunityType: varchar("opportunity_type", { length: 50 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	confidence: numeric({ precision: 3, scale:  2 }).notNull(),
	impact: varchar({ length: 20 }).notNull(),
	effort: varchar({ length: 20 }).notNull(),
	timing: varchar({ length: 20 }).notNull(),
	priorityScore: numeric("priority_score", { precision: 5, scale:  2 }).notNull(),
	evidence: jsonb().default([]),
	recommendations: jsonb().default([]),
	status: varchar({ length: 50 }).default('identified'),
	assignedTo: text("assigned_to"),
	implementationNotes: text("implementation_notes"),
	roiEstimate: numeric("roi_estimate", { precision: 10, scale:  2 }),
	actualRoi: numeric("actual_roi", { precision: 10, scale:  2 }),
	successMetrics: jsonb("success_metrics").default({}),
	tags: jsonb().default([]),
	isArchived: boolean("is_archived").default(false),
	detectedAt: timestamp("detected_at", { mode: 'string' }).defaultNow(),
	startedAt: timestamp("started_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("competitive_opportunities_competitor_id_idx").using("btree", table.competitorId.asc().nullsLast().op("text_ops")),
	index("competitive_opportunities_detected_at_idx").using("btree", table.detectedAt.asc().nullsLast().op("timestamp_ops")),
	index("competitive_opportunities_impact_idx").using("btree", table.impact.asc().nullsLast().op("text_ops")),
	index("competitive_opportunities_is_archived_idx").using("btree", table.isArchived.asc().nullsLast().op("bool_ops")),
	index("competitive_opportunities_priority_score_idx").using("btree", table.priorityScore.asc().nullsLast().op("numeric_ops")),
	index("competitive_opportunities_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("competitive_opportunities_type_idx").using("btree", table.opportunityType.asc().nullsLast().op("text_ops")),
	index("competitive_opportunities_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "competitive_opportunities_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.assignedTo],
			foreignColumns: [users.id],
			name: "competitive_opportunities_assigned_to_users_id_fk"
		}).onDelete("set null"),
]);

export const competitors = pgTable("competitors", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	website: varchar({ length: 500 }),
	description: text(),
	strengths: jsonb().default([]),
	weaknesses: jsonb().default([]),
	opportunities: jsonb().default([]),
	threats: jsonb().default([]),
	marketPosition: varchar("market_position", { length: 100 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "competitors_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const deviceApprovals = pgTable("device_approvals", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "device_approvals_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: text("user_id").notNull(),
	deviceFingerprint: varchar("device_fingerprint", { length: 255 }).notNull(),
	deviceName: varchar("device_name", { length: 255 }),
	deviceType: varchar("device_type", { length: 50 }),
	ipAddress: varchar("ip_address", { length: 45 }),
	userAgent: text("user_agent"),
	isApproved: boolean("is_approved").default(false),
	approvedAt: timestamp("approved_at", { mode: 'string' }),
	approvedBy: varchar("approved_by", { length: 255 }),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("device_approvals_device_fingerprint_idx").using("btree", table.deviceFingerprint.asc().nullsLast().op("text_ops")),
	index("device_approvals_expires_at_idx").using("btree", table.expiresAt.asc().nullsLast().op("timestamp_ops")),
	index("device_approvals_is_approved_idx").using("btree", table.isApproved.asc().nullsLast().op("bool_ops")),
	index("device_approvals_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "device_approvals_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.approvedBy],
			foreignColumns: [users.id],
			name: "device_approvals_approved_by_users_id_fk"
		}),
]);

export const documents = pgTable("documents", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	folderId: text("folder_id"),
	name: varchar({ length: 255 }).notNull(),
	originalName: varchar("original_name", { length: 255 }).notNull(),
	fileType: varchar("file_type", { length: 50 }).notNull(),
	mimeType: varchar("mime_type", { length: 100 }).notNull(),
	size: integer().notNull(),
	fileUrl: varchar("file_url", { length: 1000 }),
	category: varchar({ length: 100 }).default('uncategorized'),
	description: text(),
	tags: jsonb().default([]),
	metadata: jsonb().default({}),
	aiInsights: jsonb("ai_insights").default({}),
	isFavorite: boolean("is_favorite").default(false),
	isPublic: boolean("is_public").default(false),
	downloadCount: integer("download_count").default(0),
	viewCount: integer("view_count").default(0),
	lastAccessed: timestamp("last_accessed", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("documents_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("documents_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("documents_file_type_idx").using("btree", table.fileType.asc().nullsLast().op("text_ops")),
	index("documents_folder_id_idx").using("btree", table.folderId.asc().nullsLast().op("text_ops")),
	index("documents_is_favorite_idx").using("btree", table.isFavorite.asc().nullsLast().op("bool_ops")),
	index("documents_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("documents_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "documents_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.folderId],
			foreignColumns: [documentFolders.id],
			name: "documents_folder_id_document_folders_id_fk"
		}).onDelete("set null"),
]);

export const documentFolders = pgTable("document_folders", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	parentId: text("parent_id"),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	color: varchar({ length: 7 }).default('#8B5CF6'),
	icon: varchar({ length: 50 }),
	isDefault: boolean("is_default").default(false),
	fileCount: integer("file_count").default(0),
	totalSize: integer("total_size").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("document_folders_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("document_folders_parent_id_idx").using("btree", table.parentId.asc().nullsLast().op("text_ops")),
	index("document_folders_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "document_folders_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "document_folders_parent_id_document_folders_id_fk"
		}).onDelete("cascade"),
]);

export const documentPermissions = pgTable("document_permissions", {
	id: text().primaryKey().notNull(),
	documentId: text("document_id").notNull(),
	userId: text("user_id"),
	email: varchar({ length: 255 }),
	role: varchar({ length: 20 }).default('viewer').notNull(),
	grantedBy: text("granted_by").notNull(),
	grantedAt: timestamp("granted_at", { mode: 'string' }).defaultNow(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	isActive: boolean("is_active").default(true),
}, (table) => [
	index("document_permissions_document_id_idx").using("btree", table.documentId.asc().nullsLast().op("text_ops")),
	index("document_permissions_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("document_permissions_role_idx").using("btree", table.role.asc().nullsLast().op("text_ops")),
	index("document_permissions_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.documentId],
			foreignColumns: [documents.id],
			name: "document_permissions_document_id_documents_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "document_permissions_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.grantedBy],
			foreignColumns: [users.id],
			name: "document_permissions_granted_by_users_id_fk"
		}),
]);

export const documentShareLinks = pgTable("document_share_links", {
	id: text().primaryKey().notNull(),
	documentId: text("document_id").notNull(),
	createdBy: text("created_by").notNull(),
	url: varchar({ length: 1000 }).notNull(),
	passwordHash: varchar("password_hash", { length: 255 }),
	permissions: varchar({ length: 20 }).default('view').notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	maxAccessCount: integer("max_access_count"),
	accessCount: integer("access_count").default(0),
	downloadEnabled: boolean("download_enabled").default(true),
	requireAuth: boolean("require_auth").default(false),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("document_share_links_created_by_idx").using("btree", table.createdBy.asc().nullsLast().op("text_ops")),
	index("document_share_links_document_id_idx").using("btree", table.documentId.asc().nullsLast().op("text_ops")),
	index("document_share_links_expires_at_idx").using("btree", table.expiresAt.asc().nullsLast().op("timestamp_ops")),
	index("document_share_links_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	foreignKey({
			columns: [table.documentId],
			foreignColumns: [documents.id],
			name: "document_share_links_document_id_documents_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "document_share_links_created_by_users_id_fk"
		}),
]);

export const documentVersions = pgTable("document_versions", {
	id: text().primaryKey().notNull(),
	documentId: text("document_id").notNull(),
	versionNumber: integer("version_number").notNull(),
	name: varchar({ length: 255 }).notNull(),
	fileType: varchar("file_type", { length: 50 }).notNull(),
	size: integer().notNull(),
	changeSummary: text("change_summary"),
	createdBy: text("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	fileUrl: varchar("file_url", { length: 2048 }).notNull(),
	storageProvider: varchar("storage_provider", { length: 50 }),
	checksum: varchar({ length: 128 }),
}, (table) => [
	index("document_versions_created_by_idx").using("btree", table.createdBy.asc().nullsLast().op("text_ops")),
	index("document_versions_document_id_idx").using("btree", table.documentId.asc().nullsLast().op("text_ops")),
	index("document_versions_version_number_idx").using("btree", table.versionNumber.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.documentId],
			foreignColumns: [documents.id],
			name: "document_versions_document_id_documents_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "document_versions_created_by_users_id_fk"
		}),
]);

export const competitorProfiles = pgTable("competitor_profiles", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	domain: varchar({ length: 255 }),
	description: text(),
	industry: varchar({ length: 100 }),
	headquarters: varchar({ length: 255 }),
	foundedYear: integer("founded_year"),
	employeeCount: integer("employee_count"),
	fundingAmount: numeric("funding_amount", { precision: 15, scale:  2 }),
	fundingStage: varchar("funding_stage", { length: 50 }),
	threatLevel: varchar("threat_level", { length: 20 }).default('medium').notNull(),
	monitoringStatus: varchar("monitoring_status", { length: 20 }).default('active').notNull(),
	socialMediaHandles: jsonb("social_media_handles").default({}),
	keyPersonnel: jsonb("key_personnel").default([]),
	products: jsonb().default([]),
	marketPosition: jsonb("market_position").default({}),
	competitiveAdvantages: jsonb("competitive_advantages").default([]),
	vulnerabilities: jsonb().default([]),
	monitoringConfig: jsonb("monitoring_config").default({}),
	lastAnalyzed: timestamp("last_analyzed", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("competitor_profiles_domain_idx").using("btree", table.domain.asc().nullsLast().op("text_ops")),
	index("competitor_profiles_industry_idx").using("btree", table.industry.asc().nullsLast().op("text_ops")),
	index("competitor_profiles_monitoring_status_idx").using("btree", table.monitoringStatus.asc().nullsLast().op("text_ops")),
	index("competitor_profiles_threat_level_idx").using("btree", table.threatLevel.asc().nullsLast().op("text_ops")),
	index("competitor_profiles_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "competitor_profiles_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const competitorActivities = pgTable("competitor_activities", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "competitor_activities_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	competitorId: text("competitor_id").notNull(),
	userId: text("user_id").notNull(),
	activityType: varchar("activity_type", { length: 50 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	sourceUrl: varchar("source_url", { length: 1000 }),
	sourceType: varchar("source_type", { length: 50 }).notNull(),
	importance: varchar({ length: 20 }).default('medium').notNull(),
	confidence: numeric({ precision: 3, scale:  2 }).default('0.00'),
	metadata: jsonb().default({}),
	tags: jsonb().default([]),
	detectedAt: timestamp("detected_at", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("competitor_activities_activity_type_idx").using("btree", table.activityType.asc().nullsLast().op("text_ops")),
	index("competitor_activities_competitor_id_idx").using("btree", table.competitorId.asc().nullsLast().op("text_ops")),
	index("competitor_activities_detected_at_idx").using("btree", table.detectedAt.asc().nullsLast().op("timestamp_ops")),
	index("competitor_activities_importance_idx").using("btree", table.importance.asc().nullsLast().op("text_ops")),
	index("competitor_activities_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.competitorId],
			foreignColumns: [competitorProfiles.id],
			name: "competitor_activities_competitor_id_competitor_profiles_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "competitor_activities_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const competitorAlerts = pgTable("competitor_alerts", {
	id: text().primaryKey().notNull(),
	competitorId: text("competitor_id").notNull(),
	userId: text("user_id").notNull(),
	intelligenceId: text("intelligence_id"),
	alertType: varchar("alert_type", { length: 100 }).notNull(),
	severity: varchar({ length: 20 }).default('info').notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	sourceData: jsonb("source_data").default({}),
	actionItems: jsonb("action_items").default([]),
	recommendedActions: jsonb("recommended_actions").default([]),
	isRead: boolean("is_read").default(false),
	isArchived: boolean("is_archived").default(false),
	acknowledgedAt: timestamp("acknowledged_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("competitor_alerts_alert_type_idx").using("btree", table.alertType.asc().nullsLast().op("text_ops")),
	index("competitor_alerts_competitor_id_idx").using("btree", table.competitorId.asc().nullsLast().op("text_ops")),
	index("competitor_alerts_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("competitor_alerts_is_archived_idx").using("btree", table.isArchived.asc().nullsLast().op("bool_ops")),
	index("competitor_alerts_is_read_idx").using("btree", table.isRead.asc().nullsLast().op("bool_ops")),
	index("competitor_alerts_severity_idx").using("btree", table.severity.asc().nullsLast().op("text_ops")),
	index("competitor_alerts_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.competitorId],
			foreignColumns: [competitorProfiles.id],
			name: "competitor_alerts_competitor_id_competitor_profiles_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "competitor_alerts_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.intelligenceId],
			foreignColumns: [intelligenceData.id],
			name: "competitor_alerts_intelligence_id_intelligence_data_id_fk"
		}).onDelete("set null"),
]);

export const learningModules = pgTable("learning_modules", {
	id: text().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	content: text().notNull(),
	durationMinutes: integer("duration_minutes").default(15),
	pathId: text("path_id").notNull(),
	moduleType: varchar("module_type", { length: 50 }).default('article'),
	order: integer().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.pathId],
			foreignColumns: [learningPaths.id],
			name: "learning_modules_path_id_learning_paths_id_fk"
		}).onDelete("cascade"),
]);

export const opportunityActions = pgTable("opportunity_actions", {
	id: text().primaryKey().notNull(),
	opportunityId: text("opportunity_id").notNull(),
	userId: text("user_id").notNull(),
	actionType: varchar("action_type", { length: 50 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	priority: varchar({ length: 20 }).default('medium'),
	estimatedEffortHours: integer("estimated_effort_hours"),
	actualEffortHours: integer("actual_effort_hours"),
	estimatedCost: numeric("estimated_cost", { precision: 10, scale:  2 }),
	actualCost: numeric("actual_cost", { precision: 10, scale:  2 }),
	expectedOutcome: text("expected_outcome"),
	actualOutcome: text("actual_outcome"),
	status: varchar({ length: 50 }).default('pending'),
	dueDate: timestamp("due_date", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("opportunity_actions_due_date_idx").using("btree", table.dueDate.asc().nullsLast().op("timestamp_ops")),
	index("opportunity_actions_opportunity_id_idx").using("btree", table.opportunityId.asc().nullsLast().op("text_ops")),
	index("opportunity_actions_priority_idx").using("btree", table.priority.asc().nullsLast().op("text_ops")),
	index("opportunity_actions_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("opportunity_actions_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "opportunity_actions_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const notificationJobs = pgTable("notification_jobs", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "notification_jobs_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	title: varchar({ length: 255 }).notNull(),
	body: text().notNull(),
	icon: varchar({ length: 500 }),
	badge: varchar({ length: 500 }),
	image: varchar({ length: 500 }),
	tag: varchar({ length: 100 }),
	requireInteraction: boolean("require_interaction").default(false),
	silent: boolean().default(false),
	vibrate: jsonb(),
	userIds: jsonb("user_ids").default([]),
	allUsers: boolean("all_users").default(false),
	scheduledTime: timestamp("scheduled_time", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	createdBy: varchar("created_by", { length: 255 }),
	attempts: integer().default(0),
	maxAttempts: integer("max_attempts").default(3),
	status: varchar({ length: 50 }).default('pending'),
	error: text(),
	processedAt: timestamp("processed_at", { mode: 'string' }),
});

export const opportunityMetrics = pgTable("opportunity_metrics", {
	id: text().primaryKey().notNull(),
	opportunityId: text("opportunity_id").notNull(),
	userId: text("user_id").notNull(),
	metricName: varchar("metric_name", { length: 100 }).notNull(),
	metricType: varchar("metric_type", { length: 50 }).notNull(),
	baselineValue: numeric("baseline_value", { precision: 15, scale:  4 }),
	targetValue: numeric("target_value", { precision: 15, scale:  4 }),
	currentValue: numeric("current_value", { precision: 15, scale:  4 }),
	unit: varchar({ length: 50 }),
	measurementDate: timestamp("measurement_date", { mode: 'string' }).defaultNow(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("opportunity_metrics_measurement_date_idx").using("btree", table.measurementDate.asc().nullsLast().op("timestamp_ops")),
	index("opportunity_metrics_metric_name_idx").using("btree", table.metricName.asc().nullsLast().op("text_ops")),
	index("opportunity_metrics_opportunity_id_idx").using("btree", table.opportunityId.asc().nullsLast().op("text_ops")),
	index("opportunity_metrics_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "opportunity_metrics_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const passwordResetTokens = pgTable("password_reset_tokens", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "password_reset_tokens_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: text("user_id").notNull(),
	token: varchar({ length: 255 }).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	usedAt: timestamp("used_at", { mode: 'string' }),
	ipAddress: varchar("ip_address", { length: 45 }),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("password_reset_tokens_expires_at_idx").using("btree", table.expiresAt.asc().nullsLast().op("timestamp_ops")),
	index("password_reset_tokens_token_idx").using("btree", table.token.asc().nullsLast().op("text_ops")),
	index("password_reset_tokens_used_at_idx").using("btree", table.usedAt.asc().nullsLast().op("timestamp_ops")),
	index("password_reset_tokens_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "password_reset_tokens_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("password_reset_tokens_token_unique").on(table.token),
]);

export const paymentProviderConnections = pgTable("payment_provider_connections", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "payment_provider_connections_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: text("user_id").notNull(),
	provider: varchar({ length: 50 }).notNull(),
	accountId: varchar("account_id", { length: 255 }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	accountEmail: varchar("account_email", { length: 255 }),
	accountName: varchar("account_name", { length: 255 }),
	webhookSecret: text("webhook_secret"),
	isActive: boolean("is_active").default(true),
	lastSyncedAt: timestamp("last_synced_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("payment_provider_connections_provider_idx").using("btree", table.provider.asc().nullsLast().op("text_ops")),
	index("payment_provider_connections_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("payment_provider_connections_user_provider_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.provider.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "payment_provider_connections_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const posts = pgTable("posts", {
	id: text().primaryKey().notNull(),
	content: text().notNull(),
	authorId: text("author_id").notNull(),
	image: varchar({ length: 1000 }),
	likesCount: integer("likes_count").default(0),
	commentsCount: integer("comments_count").default(0),
	sharesCount: integer("shares_count").default(0),
	tags: jsonb().default([]),
	achievementContext: jsonb("achievement_context"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("posts_author_id_idx").using("btree", table.authorId.asc().nullsLast().op("text_ops")),
	index("posts_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "posts_author_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const intelligenceData = pgTable("intelligence_data", {
	id: text().primaryKey().notNull(),
	competitorId: text("competitor_id").notNull(),
	userId: text("user_id").notNull(),
	sourceType: varchar("source_type", { length: 50 }).notNull(),
	sourceUrl: varchar("source_url", { length: 1000 }),
	dataType: varchar("data_type", { length: 100 }).notNull(),
	rawContent: jsonb("raw_content"),
	extractedData: jsonb("extracted_data").default({}),
	analysisResults: jsonb("analysis_results").default([]),
	confidence: numeric({ precision: 3, scale:  2 }).default('0.00'),
	importance: varchar({ length: 20 }).default('medium').notNull(),
	tags: jsonb().default([]),
	collectedAt: timestamp("collected_at", { mode: 'string' }).defaultNow(),
	processedAt: timestamp("processed_at", { mode: 'string' }),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("intelligence_data_collected_at_idx").using("btree", table.collectedAt.asc().nullsLast().op("timestamp_ops")),
	index("intelligence_data_competitor_id_idx").using("btree", table.competitorId.asc().nullsLast().op("text_ops")),
	index("intelligence_data_data_type_idx").using("btree", table.dataType.asc().nullsLast().op("text_ops")),
	index("intelligence_data_expires_at_idx").using("btree", table.expiresAt.asc().nullsLast().op("timestamp_ops")),
	index("intelligence_data_importance_idx").using("btree", table.importance.asc().nullsLast().op("text_ops")),
	index("intelligence_data_source_type_idx").using("btree", table.sourceType.asc().nullsLast().op("text_ops")),
	index("intelligence_data_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.competitorId],
			foreignColumns: [competitorProfiles.id],
			name: "intelligence_data_competitor_id_competitor_profiles_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "intelligence_data_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const goals = pgTable("goals", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	briefcaseId: text("briefcase_id"),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	status: varchar({ length: 50 }).default('pending'),
	priority: varchar({ length: 20 }).default('medium'),
	dueDate: timestamp("due_date", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "goals_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.briefcaseId],
			foreignColumns: [briefcases.id],
			name: "goals_briefcase_id_briefcases_id_fk"
		}).onDelete("cascade"),
]);

export const focusSessions = pgTable("focus_sessions", {
	id: integer().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	startedAt: timestamp("started_at", { mode: 'string' }).notNull(),
	durationMinutes: integer("duration_minutes").default(0),
	taskId: text("task_id"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	endTime: timestamp("end_time", { mode: 'string' }),
	status: varchar({ length: 50 }).default('completed'),
	xpEarned: integer("xp_earned").default(0),
}, (table) => [
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "focus_sessions_task_id_tasks_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "focus_sessions_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const pushSubscriptions = pgTable("push_subscriptions", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "push_subscriptions_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: text("user_id").notNull(),
	endpoint: varchar({ length: 1000 }).notNull(),
	p256DhKey: varchar("p256dh_key", { length: 500 }).notNull(),
	authKey: varchar("auth_key", { length: 500 }).notNull(),
	deviceInfo: jsonb("device_info").default({}),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("push_subscriptions_endpoint_idx").using("btree", table.endpoint.asc().nullsLast().op("text_ops")),
	index("push_subscriptions_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("push_subscriptions_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "push_subscriptions_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const scrapingJobs = pgTable("scraping_jobs", {
	id: text().primaryKey().notNull(),
	competitorId: text("competitor_id").notNull(),
	userId: text("user_id").notNull(),
	jobType: varchar("job_type", { length: 50 }).notNull(),
	url: varchar({ length: 1000 }).notNull(),
	priority: varchar({ length: 20 }).default('medium').notNull(),
	frequencyType: varchar("frequency_type", { length: 20 }).default('interval').notNull(),
	frequencyValue: varchar("frequency_value", { length: 100 }).notNull(),
	frequencyTimezone: varchar("frequency_timezone", { length: 50 }),
	nextRunAt: timestamp("next_run_at", { mode: 'string' }).notNull(),
	lastRunAt: timestamp("last_run_at", { mode: 'string' }),
	retryCount: integer("retry_count").default(0).notNull(),
	maxRetries: integer("max_retries").default(3).notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	config: jsonb().default({}).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("scraping_jobs_competitor_id_idx").using("btree", table.competitorId.asc().nullsLast().op("text_ops")),
	index("scraping_jobs_job_type_idx").using("btree", table.jobType.asc().nullsLast().op("text_ops")),
	index("scraping_jobs_next_run_at_idx").using("btree", table.nextRunAt.asc().nullsLast().op("timestamp_ops")),
	index("scraping_jobs_priority_idx").using("btree", table.priority.asc().nullsLast().op("text_ops")),
	index("scraping_jobs_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("scraping_jobs_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.competitorId],
			foreignColumns: [competitorProfiles.id],
			name: "scraping_jobs_competitor_id_competitor_profiles_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "scraping_jobs_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const session = pgTable("session", {
	sessionToken: text().primaryKey().notNull(),
	userId: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "session_userId_users_id_fk"
		}).onDelete("cascade"),
]);

export const socialMediaConnections = pgTable("social_media_connections", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "social_media_connections_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: text("user_id").notNull(),
	platform: varchar({ length: 50 }).notNull(),
	accessToken: text("access_token").notNull(),
	refreshToken: text("refresh_token"),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	tokenSecret: text("token_secret"),
	accountId: varchar("account_id", { length: 255 }),
	accountHandle: varchar("account_handle", { length: 255 }),
	accountEmail: varchar("account_email", { length: 255 }),
	accountName: varchar("account_name", { length: 255 }),
	scopes: text(),
	isActive: boolean("is_active").default(true),
	lastSyncedAt: timestamp("last_synced_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("social_media_connections_platform_idx").using("btree", table.platform.asc().nullsLast().op("text_ops")),
	index("social_media_connections_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("social_media_connections_user_platform_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.platform.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "social_media_connections_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const taskAnalytics = pgTable("task_analytics", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	taskId: text("task_id").notNull(),
	action: varchar({ length: 50 }).notNull(),
	timestamp: timestamp({ mode: 'string' }).defaultNow(),
	metadata: jsonb().default({}),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "task_analytics_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "task_analytics_task_id_tasks_id_fk"
		}).onDelete("cascade"),
]);

export const taskCategories = pgTable("task_categories", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	name: varchar({ length: 100 }).notNull(),
	color: varchar({ length: 7 }).default('#8B5CF6'),
	icon: varchar({ length: 50 }),
	isDefault: boolean("is_default").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "task_categories_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const productivityInsights = pgTable("productivity_insights", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	insightType: varchar("insight_type", { length: 50 }).notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	metrics: jsonb().notNull(),
	aiRecommendations: jsonb("ai_recommendations").default({}),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "productivity_insights_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const templateDownloads = pgTable("template_downloads", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "template_downloads_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	templateId: integer("template_id").notNull(),
	userId: text("user_id").notNull(),
	downloadedAt: timestamp("downloaded_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.templateId],
			foreignColumns: [workflowTemplates.id],
			name: "template_downloads_template_id_workflow_templates_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "template_downloads_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const userAchievements = pgTable("user_achievements", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "user_achievements_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: text("user_id").notNull(),
	achievementId: integer("achievement_id").notNull(),
	earnedAt: timestamp("earned_at", { mode: 'string' }).defaultNow(),
	metadata: jsonb().default({}),
}, (table) => [
	uniqueIndex("user_achievements_unique_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.achievementId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_achievements_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.achievementId],
			foreignColumns: [achievements.id],
			name: "user_achievements_achievement_id_achievements_id_fk"
		}).onDelete("cascade"),
]);

export const userApiKeys = pgTable("user_api_keys", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "user_api_keys_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: text("user_id").notNull(),
	service: varchar({ length: 100 }).notNull(),
	keyValue: text("key_value").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("user_api_keys_service_idx").using("btree", table.service.asc().nullsLast().op("text_ops")),
	index("user_api_keys_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("user_api_keys_user_service_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.service.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_api_keys_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const userBrandSettings = pgTable("user_brand_settings", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "user_brand_settings_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: text("user_id").notNull(),
	companyName: varchar("company_name", { length: 255 }),
	tagline: varchar({ length: 500 }),
	description: text(),
	industry: varchar({ length: 100 }),
	targetAudience: text("target_audience"),
	brandPersonality: jsonb("brand_personality").default([]),
	colorPalette: jsonb("color_palette").default({}),
	typography: jsonb().default({}),
	logoUrl: varchar("logo_url", { length: 1000 }),
	logoPrompt: text("logo_prompt"),
	moodboard: jsonb().default([]),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("user_brand_settings_industry_idx").using("btree", table.industry.asc().nullsLast().op("text_ops")),
	index("user_brand_settings_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_brand_settings_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("user_brand_settings_user_id_unique").on(table.userId),
]);

export const userCompetitiveStats = pgTable("user_competitive_stats", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	competitorsMonitored: integer("competitors_monitored").default(0),
	intelligenceGathered: integer("intelligence_gathered").default(0),
	alertsProcessed: integer("alerts_processed").default(0),
	opportunitiesIdentified: integer("opportunities_identified").default(0),
	competitiveTasksCompleted: integer("competitive_tasks_completed").default(0),
	marketVictories: integer("market_victories").default(0),
	threatResponses: integer("threat_responses").default(0),
	intelligenceStreaks: integer("intelligence_streaks").default(0),
	competitiveAdvantagePoints: integer("competitive_advantage_points").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_competitive_stats_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const userMfaSettings = pgTable("user_mfa_settings", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "user_mfa_settings_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: text("user_id").notNull(),
	totpSecret: varchar("totp_secret", { length: 255 }),
	totpEnabled: boolean("totp_enabled").default(false),
	totpBackupCodes: jsonb("totp_backup_codes").default([]),
	webauthnEnabled: boolean("webauthn_enabled").default(false),
	webauthnCredentials: jsonb("webauthn_credentials").default([]),
	recoveryCodes: jsonb("recovery_codes").default([]),
	mfaRequired: boolean("mfa_required").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("user_mfa_settings_totp_enabled_idx").using("btree", table.totpEnabled.asc().nullsLast().op("bool_ops")),
	index("user_mfa_settings_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("user_mfa_settings_webauthn_enabled_idx").using("btree", table.webauthnEnabled.asc().nullsLast().op("bool_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_mfa_settings_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("user_mfa_settings_user_id_unique").on(table.userId),
]);

export const templates = pgTable("templates", {
	id: text().primaryKey().notNull(),
	userId: text("user_id"),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	content: text().notNull(),
	category: varchar({ length: 100 }),
	tier: varchar({ length: 20 }).default('Free'),
	estimatedMinutes: integer("estimated_minutes"),
	difficulty: varchar({ length: 20 }).default('Beginner'),
	tags: jsonb().default([]),
	usageCount: integer("usage_count").default(0),
	rating: numeric({ precision: 3, scale:  2 }).default('0.00'),
	isPremium: boolean("is_premium").default(false),
	isPublic: boolean("is_public").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	templateSlug: varchar("template_slug", { length: 255 }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "templates_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const tasks = pgTable("tasks", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	goalId: text("goal_id"),
	briefcaseId: text("briefcase_id"),
	parentTaskId: text("parent_task_id"),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	status: varchar({ length: 50 }).default('pending'),
	priority: varchar({ length: 20 }).default('medium'),
	category: varchar({ length: 100 }),
	tags: jsonb().default([]),
	dueDate: timestamp("due_date", { mode: 'string' }),
	estimatedMinutes: integer("estimated_minutes"),
	actualMinutes: integer("actual_minutes"),
	energyLevel: varchar("energy_level", { length: 20 }).default('medium'),
	isRecurring: boolean("is_recurring").default(false),
	recurrencePattern: jsonb("recurrence_pattern"),
	aiSuggestions: jsonb("ai_suggestions").default({}),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "tasks_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.goalId],
			foreignColumns: [goals.id],
			name: "tasks_goal_id_goals_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.briefcaseId],
			foreignColumns: [briefcases.id],
			name: "tasks_briefcase_id_briefcases_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.parentTaskId],
			foreignColumns: [table.id],
			name: "tasks_parent_task_id_tasks_id_fk"
		}).onDelete("cascade"),
]);

export const workflowTemplates = pgTable("workflow_templates", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "workflow_templates_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	category: varchar({ length: 100 }).default('general'),
	tags: jsonb().default([]),
	workflowData: jsonb("workflow_data").notNull(),
	isPublic: boolean("is_public").default(false),
	featured: boolean().default(false),
	createdBy: varchar("created_by", { length: 255 }),
	usageCount: integer("usage_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "workflow_templates_created_by_users_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	name: text(),
	email: text().notNull(),
	emailVerified: timestamp({ mode: 'string' }),
	image: text(),
	password: text(),
	username: text(),
	fullName: text("full_name"),
	role: text().default('user').notNull(),
	xp: integer().default(0),
	level: integer().default(1),
	totalActions: integer("total_actions").default(0),
	suspended: boolean().default(false),
	suspendedAt: timestamp("suspended_at", { mode: 'string' }),
	suspendedReason: text("suspended_reason"),
	stripeCustomerId: text("stripe_customer_id"),
	subscriptionTier: text("subscription_tier").default('free').notNull(),
	subscriptionStatus: text("subscription_status").default('active'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	stripeSubscriptionId: text("stripe_subscription_id"),
	currentPeriodStart: timestamp("current_period_start", { mode: 'string' }),
	currentPeriodEnd: timestamp("current_period_end", { mode: 'string' }),
	cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
	dateOfBirth: timestamp("date_of_birth", { mode: 'string' }),
	isVerified: boolean("is_verified").default(false),
	onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
	bio: text(),
	adminPinHash: text("admin_pin_hash"),
	stackUserId: text("stack_user_id"),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const userSessions = pgTable("user_sessions", {
	id: varchar({ length: 255 }).primaryKey().notNull(),
	userId: text("user_id").notNull(),
	refreshToken: varchar("refresh_token", { length: 500 }).notNull(),
	deviceFingerprint: varchar("device_fingerprint", { length: 255 }).notNull(),
	deviceName: varchar("device_name", { length: 255 }),
	deviceType: varchar("device_type", { length: 50 }),
	ipAddress: varchar("ip_address", { length: 45 }),
	userAgent: text("user_agent"),
	isRememberMe: boolean("is_remember_me").default(false),
	rememberMeExpiresAt: timestamp("remember_me_expires_at", { mode: 'string' }),
	lastActivity: timestamp("last_activity", { mode: 'string' }).defaultNow(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("user_sessions_device_fingerprint_idx").using("btree", table.deviceFingerprint.asc().nullsLast().op("text_ops")),
	index("user_sessions_expires_at_idx").using("btree", table.expiresAt.asc().nullsLast().op("timestamp_ops")),
	index("user_sessions_last_activity_idx").using("btree", table.lastActivity.asc().nullsLast().op("timestamp_ops")),
	index("user_sessions_refresh_token_idx").using("btree", table.refreshToken.asc().nullsLast().op("text_ops")),
	index("user_sessions_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_sessions_user_id_users_id_fk"
		}).onDelete("cascade"),
	unique("user_sessions_refresh_token_unique").on(table.refreshToken),
]);

export const userSettings = pgTable("user_settings", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	category: varchar({ length: 100 }).notNull(),
	settings: jsonb().default({}),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("user_settings_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("user_settings_user_category_idx").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.category.asc().nullsLast().op("text_ops")),
	index("user_settings_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_settings_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const workflows = pgTable("workflows", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "workflows_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: text("user_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	version: varchar({ length: 50 }).default('1.0.0'),
	status: varchar({ length: 50 }).default('draft'),
	triggerType: varchar("trigger_type", { length: 100 }).notNull(),
	triggerConfig: jsonb("trigger_config").default({}),
	nodes: jsonb().default([]),
	edges: jsonb().default([]),
	variables: jsonb().default({}),
	settings: jsonb().default({}),
	category: varchar({ length: 100 }).default('general'),
	tags: jsonb().default([]),
	templateId: integer("template_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "workflows_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const workflowExecutions = pgTable("workflow_executions", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "workflow_executions_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	workflowId: integer("workflow_id").notNull(),
	userId: text("user_id").notNull(),
	status: varchar({ length: 50 }).default('running'),
	startedAt: timestamp("started_at", { mode: 'string' }).defaultNow(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	duration: integer(),
	input: jsonb().default({}),
	output: jsonb().default({}),
	variables: jsonb().default({}),
	options: jsonb().default({}),
	error: jsonb(),
	logs: jsonb().default([]),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.workflowId],
			foreignColumns: [workflows.id],
			name: "workflow_executions_workflow_id_workflows_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "workflow_executions_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const learningPaths = pgTable("learning_paths", {
	id: text().primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
	category: varchar({ length: 100 }).notNull(),
	difficulty: varchar({ length: 50 }).notNull(),
	tags: jsonb().default([]),
	createdBy: text("created_by"),
	isPublic: boolean("is_public").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "learning_paths_created_by_users_id_fk"
		}).onDelete("set null"),
]);

export const collaborationSessions = pgTable("collaboration_sessions", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	goal: text().notNull(),
	status: varchar({ length: 50 }).default('active'),
	configuration: jsonb().default({}),
	metadata: jsonb().default({}),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("collaboration_sessions_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "collaboration_sessions_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const collaborationCheckpoints = pgTable("collaboration_checkpoints", {
	id: text().primaryKey().notNull(),
	sessionId: text("session_id").notNull(),
	timestamp: timestamp({ mode: 'string' }).defaultNow(),
	state: jsonb().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("collaboration_checkpoints_session_id_idx").using("btree", table.sessionId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.sessionId],
			foreignColumns: [collaborationSessions.id],
			name: "collaboration_checkpoints_session_id_collaboration_sessions_id_"
		}).onDelete("cascade"),
]);

export const collaborationMessages = pgTable("collaboration_messages", {
	id: text().primaryKey().notNull(),
	sessionId: text("session_id").notNull(),
	fromAgentId: varchar("from_agent_id", { length: 50 }).notNull(),
	content: text().notNull(),
	messageType: varchar("message_type", { length: 50 }).default('text'),
	metadata: jsonb().default({}),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("collaboration_messages_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("collaboration_messages_session_id_idx").using("btree", table.sessionId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.sessionId],
			foreignColumns: [collaborationSessions.id],
			name: "collaboration_messages_session_id_collaboration_sessions_id_fk"
		}).onDelete("cascade"),
]);

export const collaborationParticipants = pgTable("collaboration_participants", {
	id: text().primaryKey().notNull(),
	sessionId: text("session_id").notNull(),
	agentId: varchar("agent_id", { length: 50 }).notNull(),
	role: varchar({ length: 50 }).default('member'),
	joinedAt: timestamp("joined_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("collaboration_participants_agent_id_idx").using("btree", table.agentId.asc().nullsLast().op("text_ops")),
	index("collaboration_participants_session_id_idx").using("btree", table.sessionId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.sessionId],
			foreignColumns: [collaborationSessions.id],
			name: "collaboration_participants_session_id_collaboration_sessions_id"
		}).onDelete("cascade"),
]);

export const userLearningProgress = pgTable("user_learning_progress", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	moduleId: text("module_id").notNull(),
	status: varchar({ length: 50 }).default('not_started'),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	lastAccessedAt: timestamp("last_accessed_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_learning_progress_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.moduleId],
			foreignColumns: [learningModules.id],
			name: "user_learning_progress_module_id_learning_modules_id_fk"
		}).onDelete("cascade"),
]);

export const documentActivity = pgTable("document_activity", {
	id: text().primaryKey().notNull(),
	documentId: text("document_id").notNull(),
	userId: text("user_id").notNull(),
	action: varchar({ length: 50 }).notNull(),
	details: jsonb().default({}),
	timestamp: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
	index("document_activity_document_id_idx").using("btree", table.documentId.asc().nullsLast().op("text_ops")),
	index("document_activity_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.documentId],
			foreignColumns: [documents.id],
			name: "document_activity_document_id_documents_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "document_activity_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const moodEntries = pgTable("mood_entries", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	energyLevel: integer("energy_level").notNull(),
	moodLabel: varchar("mood_label", { length: 50 }),
	note: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "mood_entries_user_id_users_id_fk"
		}).onDelete("cascade"),
	check("energy_check", sql`(energy_level >= 1) AND (energy_level <= 5)`),
]);

export const communityComments = pgTable("community_comments", {
	id: text().primaryKey().notNull(),
	postId: text("post_id").notNull(),
	userId: text("user_id").notNull(),
	parentId: text("parent_id"),
	content: text().notNull(),
	isSolution: boolean("is_solution").default(false),
	likeCount: integer("like_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("community_comments_parent_id_idx").using("btree", table.parentId.asc().nullsLast().op("text_ops")),
	index("community_comments_post_id_idx").using("btree", table.postId.asc().nullsLast().op("text_ops")),
	index("community_comments_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [communityPosts.id],
			name: "community_comments_post_id_community_posts_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "community_comments_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "community_comments_parent_id_fk"
		}).onDelete("set null"),
]);

export const communityPosts = pgTable("community_posts", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	topicId: text("topic_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	content: text().notNull(),
	isPinned: boolean("is_pinned").default(false),
	viewCount: integer("view_count").default(0),
	likeCount: integer("like_count").default(0),
	commentCount: integer("comment_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("community_posts_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("community_posts_topic_id_idx").using("btree", table.topicId.asc().nullsLast().op("text_ops")),
	index("community_posts_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.topicId],
			foreignColumns: [communityTopics.id],
			name: "community_posts_topic_id_community_topics_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "community_posts_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const communityTopics = pgTable("community_topics", {
	id: text().primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	slug: varchar({ length: 50 }).notNull(),
	description: text(),
	icon: varchar({ length: 50 }),
	order: integer().default(0),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("community_topics_name_unique").on(table.name),
	unique("community_topics_slug_unique").on(table.slug),
]);

export const userSurveyStatus = pgTable("user_survey_status", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id", { length: 255 }),
	surveyType: varchar("survey_type", { length: 50 }).notNull(),
	status: varchar({ length: 20 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	unique("user_survey_status_user_id_survey_type_key").on(table.userId, table.surveyType),
]);

export const follows = pgTable("follows", {
	followerId: text("follower_id").notNull(),
	followingId: text("following_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("follows_follower_idx").using("btree", table.followerId.asc().nullsLast().op("text_ops")),
	index("follows_following_idx").using("btree", table.followingId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.followerId],
			foreignColumns: [users.id],
			name: "follows_follower_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.followingId],
			foreignColumns: [users.id],
			name: "follows_following_id_users_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.followerId, table.followingId], name: "follows_follower_id_following_id_pk"}),
]);

export const verificationToken = pgTable("verificationToken", {
	identifier: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	primaryKey({ columns: [table.identifier, table.token], name: "verificationToken_identifier_token_pk"}),
]);

export const commentLikes = pgTable("comment_likes", {
	commentId: text("comment_id").notNull(),
	userId: text("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("comment_likes_comment_id_idx").using("btree", table.commentId.asc().nullsLast().op("text_ops")),
	index("comment_likes_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.commentId],
			foreignColumns: [communityComments.id],
			name: "comment_likes_comment_id_community_comments_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "comment_likes_user_id_users_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.commentId, table.userId], name: "comment_likes_comment_id_user_id_pk"}),
]);

export const postLikes = pgTable("post_likes", {
	postId: text("post_id").notNull(),
	userId: text("user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("post_likes_post_id_idx").using("btree", table.postId.asc().nullsLast().op("text_ops")),
	index("post_likes_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [communityPosts.id],
			name: "post_likes_post_id_community_posts_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "post_likes_user_id_users_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.postId, table.userId], name: "post_likes_post_id_user_id_pk"}),
]);

export const postReactions = pgTable("post_reactions", {
	postId: text("post_id").notNull(),
	userId: text("user_id").notNull(),
	type: varchar({ length: 20 }).default('like').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("post_reactions_post_id_idx").using("btree", table.postId.asc().nullsLast().op("text_ops")),
	index("post_reactions_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.postId],
			foreignColumns: [posts.id],
			name: "post_reactions_post_id_posts_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "post_reactions_user_id_users_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.postId, table.userId], name: "post_reactions_post_id_user_id_pk"}),
]);

export const authenticator = pgTable("authenticator", {
	credentialId: text().notNull(),
	userId: text().notNull(),
	providerAccountId: text().notNull(),
	credentialPublicKey: text().notNull(),
	counter: integer().notNull(),
	credentialDeviceType: text().notNull(),
	credentialBackedUp: boolean().notNull(),
	transports: text(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "authenticator_userId_users_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.credentialId, table.userId], name: "authenticator_userId_credentialID_pk"}),
	unique("authenticator_credentialID_unique").on(table.credentialId),
]);

export const account = pgTable("account", {
	userId: text().notNull(),
	type: text().notNull(),
	provider: text().notNull(),
	providerAccountId: text().notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: integer("expires_at"),
	tokenType: text("token_type"),
	scope: text(),
	idToken: text("id_token"),
	sessionState: text("session_state"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "account_userId_users_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.provider, table.providerAccountId], name: "account_provider_providerAccountId_pk"}),
]);

export const pitchDecks = pgTable("pitch_decks", {
  id: text().primaryKey().notNull(),
  userId: text("user_id").notNull(),
  name: varchar({ length: 255 }).notNull(),
  content: jsonb().default({}),
  version: integer().default(1),
  isTemplate: boolean("is_template").default(false),
  theme: varchar({ length: 50 }),
  thumbnail: varchar({ length: 1000 }),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const searchIndex = pgTable("search_index", {
  id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "search_index_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
  userId: text("user_id").notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: text("entity_id").notNull(),
  title: varchar({ length: 255 }).notNull(),
  content: text().notNull(),
  tags: jsonb().default([]),
  metadata: jsonb().default({}),
  embedding: vector("embedding", { dimensions: 1536 }),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const competitorReports = pgTable("competitor_reports", {
  id: text().primaryKey().notNull(),
  userId: text("user_id").notNull(),
  competitorId: text("competitor_id"),
  title: varchar({ length: 255 }).notNull(),
  type: varchar({ length: 50 }).notNull(),
  content: jsonb().default({}),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const sops = pgTable("sops", {
  id: text().primaryKey().notNull(),
  userId: text("user_id").notNull(),
  title: varchar({ length: 255 }).notNull(),
  content: text(),
  department: varchar({ length: 100 }),
  status: varchar({ length: 50 }).default('draft'),
  version: integer().default(1),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const jobDescriptions = pgTable("job_descriptions", {
  id: text().primaryKey().notNull(),
  userId: text("user_id").notNull(),
  title: varchar({ length: 255 }).notNull(),
  role: varchar({ length: 100 }),
  department: varchar({ length: 100 }),
  content: text(),
  status: varchar({ length: 50 }).default('draft'),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const interviewGuides = pgTable("interview_guides", {
  id: text().primaryKey().notNull(),
  userId: text("user_id").notNull(),
  title: varchar({ length: 255 }).notNull(),
  role: varchar({ length: 100 }),
  questions: jsonb().default([]),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const productSpecs = pgTable("product_specs", {
  id: text().primaryKey().notNull(),
  userId: text("user_id").notNull(),
  title: varchar({ length: 255 }).notNull(),
  version: varchar({ length: 50 }),
  status: varchar({ length: 50 }).default('draft'),
  content: jsonb().default({}),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const pivotAnalyses = pgTable("pivot_analyses", {
  id: text().primaryKey().notNull(),
  userId: text("user_id").notNull(),
  title: varchar({ length: 255 }).notNull(),
  scenario: text(),
  impact: jsonb().default({}),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const legalDocs = pgTable("legal_docs", {
  id: text().primaryKey().notNull(),
  userId: text("user_id").notNull(),
  title: varchar({ length: 255 }).notNull(),
  type: varchar({ length: 50 }).notNull(),
  content: text(),
  status: varchar({ length: 50 }).default('draft'),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const trainingHistory = pgTable("training_history", {
  id: text().primaryKey().notNull(),
  userId: text("user_id").notNull(),
  moduleId: text("module_id").notNull(),
  score: integer(),
  completedAt: timestamp("completed_at", { mode: 'string' }).defaultNow(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const simulations = pgTable("simulations", {
  id: text().primaryKey().notNull(),
  userId: text("user_id").notNull(),
  title: varchar({ length: 255 }).notNull(),
  type: varchar({ length: 50 }),
  parameters: jsonb().default({}),
  results: jsonb().default({}),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: text().primaryKey().notNull(),
  userId: text("user_id").notNull(),
  name: varchar({ length: 255 }).notNull(),
  status: varchar({ length: 50 }).default('planned'),
  channels: jsonb().default([]),
  budget: integer(),
  startDate: timestamp("start_date", { mode: 'string' }),
  endDate: timestamp("end_date", { mode: 'string' }),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const creativeAssets = pgTable("creative_assets", {
  id: text().primaryKey().notNull(),
  userId: text("user_id").notNull(),
  title: varchar({ length: 255 }).notNull(),
  type: varchar({ length: 50 }).notNull(),
  url: varchar({ length: 1000 }),
  campaignId: text("campaign_id"),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const codeSnippets = pgTable("code_snippets", {
  id: text().primaryKey().notNull(),
  userId: text("user_id").notNull(),
  title: varchar({ length: 255 }).notNull(),
  language: varchar({ length: 50 }).notNull(),
  code: text().notNull(),
  description: text(),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const launchStrategies = pgTable("launch_strategies", {
  id: text().primaryKey().notNull(),
  userId: text("user_id").notNull(),
  title: varchar({ length: 255 }).notNull(),
  phases: jsonb().default([]),
  status: varchar({ length: 50 }).default('draft'),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const tribeBlueprints = pgTable("tribe_blueprints", {
  id: text().primaryKey().notNull(),
  userId: text("user_id").notNull(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  members: jsonb().default([]),
  roles: jsonb().default([]),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const boardReports = pgTable("board_reports", {
  id: text().primaryKey().notNull(),
  userId: text("user_id").notNull(),
  title: varchar({ length: 255 }).notNull(),
  period: varchar({ length: 50 }),
  content: jsonb().default({}),
  status: varchar({ length: 50 }).default('draft'),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const agentInstructions = pgTable("agent_instructions", {
  id: text().primaryKey().notNull(),
  userId: text("user_id").notNull(),
  agentRole: varchar("agent_role", { length: 50 }).notNull(),
  instructions: text().notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const warRoomSessions = pgTable("war_room_sessions", {
  id: text().primaryKey().notNull(),
  userId: text("user_id").notNull(),
  title: varchar({ length: 255 }).notNull(),
  objective: text(),
  participants: jsonb().default([]),
  status: varchar({ length: 50 }).default('active'),
  startedAt: timestamp("started_at", { mode: 'string' }).defaultNow(),
  endedAt: timestamp("ended_at", { mode: 'string' }),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  priority: varchar("priority", { length: 20 }).default('medium'),
  actionUrl: text("action_url"),
  read: boolean("read").default(false),
  sentAt: timestamp("sent_at", { mode: 'date' }),
  createdAt: timestamp("created_at", { mode: 'date' }).defaultNow(),
});

export const notificationPreferences = pgTable("notification_preferences", {
  id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "notification_preferences_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
  userId: text("user_id").notNull(),
  emailEnabled: boolean("email_enabled").default(true),
  smsEnabled: boolean("sms_enabled").default(false),
  inAppEnabled: boolean("in_app_enabled").default(true),
  taskDeadlines: boolean("task_deadlines").default(true),
  financialAlerts: boolean("financial_alerts").default(true),
  competitorAlerts: boolean("competitor_alerts").default(true),
  dailyDigest: boolean("daily_digest").default(true),
  digestTime: varchar("digest_time", { length: 10 }).default('08:00'),
  createdAt: timestamp("created_at", { mode: 'date' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'date' }).defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePriceId: text("stripe_price_id"),
  tier: varchar({ length: 50 }),
  status: varchar({ length: 50 }),
  currentPeriodEnd: timestamp("current_period_end", { mode: 'date' }),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const usageTracking = pgTable("usage_tracking", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  month: varchar({ length: 7 }).notNull(),
  aiGenerations: integer("ai_generations").default(0),
  competitorsTracked: integer("competitors_tracked").default(0),
  businessProfiles: integer("business_profiles").default(0),
  createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});
