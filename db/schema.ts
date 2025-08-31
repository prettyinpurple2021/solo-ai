import { integer, pgTable, varchar, text, timestamp, boolean, jsonb, decimal, index, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  full_name: varchar('full_name', { length: 255 }),
  username: varchar('username', { length: 100 }).unique(),
  date_of_birth: timestamp('date_of_birth'),
  avatar_url: varchar('avatar_url', { length: 500 }),
  subscription_tier: varchar('subscription_tier', { length: 50 }).default('free'),
  subscription_status: varchar('subscription_status', { length: 50 }).default('active'),
  is_verified: boolean('is_verified').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Briefcase/Projects table
export const briefcases = pgTable('briefcases', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('active'),
  metadata: jsonb('metadata'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Goals table
export const goals = pgTable('goals', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  briefcase_id: integer('briefcase_id').references(() => briefcases.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('pending'),
  priority: varchar('priority', { length: 20 }).default('medium'),
  due_date: timestamp('due_date'),
  completed_at: timestamp('completed_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Tasks table (enhanced)
export const tasks = pgTable('tasks', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  goal_id: integer('goal_id').references(() => goals.id, { onDelete: 'cascade' }),
  briefcase_id: integer('briefcase_id').references(() => briefcases.id, { onDelete: 'cascade' }),
  parent_task_id: integer('parent_task_id').references(() => tasks.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('pending'),
  priority: varchar('priority', { length: 20 }).default('medium'),
  category: varchar('category', { length: 100 }),
  tags: jsonb('tags').default('[]'),
  due_date: timestamp('due_date'),
  estimated_minutes: integer('estimated_minutes'),
  actual_minutes: integer('actual_minutes'),
  energy_level: varchar('energy_level', { length: 20 }).default('medium'),
  is_recurring: boolean('is_recurring').default(false),
  recurrence_pattern: jsonb('recurrence_pattern'),
  ai_suggestions: jsonb('ai_suggestions').default('{}'),
  completed_at: timestamp('completed_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Templates table
export const templates = pgTable('templates', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  content: text('content').notNull(),
  category: varchar('category', { length: 100 }),
  is_public: boolean('is_public').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Task Categories table
export const taskCategories = pgTable('task_categories', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  color: varchar('color', { length: 7 }).default('#8B5CF6'),
  icon: varchar('icon', { length: 50 }),
  is_default: boolean('is_default').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Task Analytics table
export const taskAnalytics = pgTable('task_analytics', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  task_id: integer('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 50 }).notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
  metadata: jsonb('metadata').default('{}'),
});

// Productivity Insights table
export const productivityInsights = pgTable('productivity_insights', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  insight_type: varchar('insight_type', { length: 50 }).notNull(),
  date: timestamp('date', { mode: 'date' }).notNull(),
  metrics: jsonb('metrics').notNull(),
  ai_recommendations: jsonb('ai_recommendations').default('{}'),
  created_at: timestamp('created_at').defaultNow(),
});

// Posts table (existing)
export const posts = pgTable('posts', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull().default(''),
});

// Competitor Profiles table
export const competitorProfiles = pgTable('competitor_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  domain: varchar('domain', { length: 255 }),
  description: text('description'),
  industry: varchar('industry', { length: 100 }),
  headquarters: varchar('headquarters', { length: 255 }),
  founded_year: integer('founded_year'),
  employee_count: integer('employee_count'),
  funding_amount: decimal('funding_amount', { precision: 15, scale: 2 }),
  funding_stage: varchar('funding_stage', { length: 50 }),
  threat_level: varchar('threat_level', { length: 20 }).notNull().default('medium'),
  monitoring_status: varchar('monitoring_status', { length: 20 }).notNull().default('active'),
  social_media_handles: jsonb('social_media_handles').default('{}'),
  key_personnel: jsonb('key_personnel').default('[]'),
  products: jsonb('products').default('[]'),
  market_position: jsonb('market_position').default('{}'),
  competitive_advantages: jsonb('competitive_advantages').default('[]'),
  vulnerabilities: jsonb('vulnerabilities').default('[]'),
  monitoring_config: jsonb('monitoring_config').default('{}'),
  last_analyzed: timestamp('last_analyzed'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('competitor_profiles_user_id_idx').on(table.user_id),
  threatLevelIdx: index('competitor_profiles_threat_level_idx').on(table.threat_level),
  monitoringStatusIdx: index('competitor_profiles_monitoring_status_idx').on(table.monitoring_status),
  domainIdx: index('competitor_profiles_domain_idx').on(table.domain),
  industryIdx: index('competitor_profiles_industry_idx').on(table.industry),
}));

// Intelligence Data table
export const intelligenceData = pgTable('intelligence_data', {
  id: uuid('id').primaryKey().defaultRandom(),
  competitor_id: uuid('competitor_id').notNull().references(() => competitorProfiles.id, { onDelete: 'cascade' }),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  source_type: varchar('source_type', { length: 50 }).notNull(),
  source_url: varchar('source_url', { length: 1000 }),
  data_type: varchar('data_type', { length: 100 }).notNull(),
  raw_content: jsonb('raw_content'),
  extracted_data: jsonb('extracted_data').default('{}'),
  analysis_results: jsonb('analysis_results').default('[]'),
  confidence: decimal('confidence', { precision: 3, scale: 2 }).default('0.00'),
  importance: varchar('importance', { length: 20 }).notNull().default('medium'),
  tags: jsonb('tags').default('[]'),
  collected_at: timestamp('collected_at').defaultNow(),
  processed_at: timestamp('processed_at'),
  expires_at: timestamp('expires_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  competitorIdIdx: index('intelligence_data_competitor_id_idx').on(table.competitor_id),
  userIdIdx: index('intelligence_data_user_id_idx').on(table.user_id),
  sourceTypeIdx: index('intelligence_data_source_type_idx').on(table.source_type),
  dataTypeIdx: index('intelligence_data_data_type_idx').on(table.data_type),
  importanceIdx: index('intelligence_data_importance_idx').on(table.importance),
  collectedAtIdx: index('intelligence_data_collected_at_idx').on(table.collected_at),
  expiresAtIdx: index('intelligence_data_expires_at_idx').on(table.expires_at),
}));

// Competitor Alerts table
export const competitorAlerts = pgTable('competitor_alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  competitor_id: uuid('competitor_id').notNull().references(() => competitorProfiles.id, { onDelete: 'cascade' }),
  user_id: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  intelligence_id: uuid('intelligence_id').references(() => intelligenceData.id, { onDelete: 'set null' }),
  alert_type: varchar('alert_type', { length: 100 }).notNull(),
  severity: varchar('severity', { length: 20 }).notNull().default('info'),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  source_data: jsonb('source_data').default('{}'),
  action_items: jsonb('action_items').default('[]'),
  recommended_actions: jsonb('recommended_actions').default('[]'),
  is_read: boolean('is_read').default(false),
  is_archived: boolean('is_archived').default(false),
  acknowledged_at: timestamp('acknowledged_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  competitorIdIdx: index('competitor_alerts_competitor_id_idx').on(table.competitor_id),
  userIdIdx: index('competitor_alerts_user_id_idx').on(table.user_id),
  alertTypeIdx: index('competitor_alerts_alert_type_idx').on(table.alert_type),
  severityIdx: index('competitor_alerts_severity_idx').on(table.severity),
  isReadIdx: index('competitor_alerts_is_read_idx').on(table.is_read),
  isArchivedIdx: index('competitor_alerts_is_archived_idx').on(table.is_archived),
  createdAtIdx: index('competitor_alerts_created_at_idx').on(table.created_at),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  briefcases: many(briefcases),
  goals: many(goals),
  tasks: many(tasks),
  templates: many(templates),
  taskCategories: many(taskCategories),
  taskAnalytics: many(taskAnalytics),
  productivityInsights: many(productivityInsights),
  competitorProfiles: many(competitorProfiles),
  intelligenceData: many(intelligenceData),
  competitorAlerts: many(competitorAlerts),
}));

export const briefcasesRelations = relations(briefcases, ({ one, many }) => ({
  user: one(users, {
    fields: [briefcases.user_id],
    references: [users.id],
  }),
  goals: many(goals),
  tasks: many(tasks),
}));

export const goalsRelations = relations(goals, ({ one, many }) => ({
  user: one(users, {
    fields: [goals.user_id],
    references: [users.id],
  }),
  briefcase: one(briefcases, {
    fields: [goals.briefcase_id],
    references: [briefcases.id],
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  user: one(users, {
    fields: [tasks.user_id],
    references: [users.id],
  }),
  goal: one(goals, {
    fields: [tasks.goal_id],
    references: [goals.id],
  }),
  briefcase: one(briefcases, {
    fields: [tasks.briefcase_id],
    references: [briefcases.id],
  }),
  parentTask: one(tasks, {
    fields: [tasks.parent_task_id],
    references: [tasks.id],
  }),
  subtasks: many(tasks),
  analytics: many(taskAnalytics),
}));

export const templatesRelations = relations(templates, ({ one }) => ({
  user: one(users, {
    fields: [templates.user_id],
    references: [users.id],
  }),
}));

export const taskCategoriesRelations = relations(taskCategories, ({ one }) => ({
  user: one(users, {
    fields: [taskCategories.user_id],
    references: [users.id],
  }),
}));

export const taskAnalyticsRelations = relations(taskAnalytics, ({ one }) => ({
  user: one(users, {
    fields: [taskAnalytics.user_id],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [taskAnalytics.task_id],
    references: [tasks.id],
  }),
}));

export const productivityInsightsRelations = relations(productivityInsights, ({ one }) => ({
  user: one(users, {
    fields: [productivityInsights.user_id],
    references: [users.id],
  }),
}));

// Competitor Intelligence Relations
export const competitorProfilesRelations = relations(competitorProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [competitorProfiles.user_id],
    references: [users.id],
  }),
  intelligenceData: many(intelligenceData),
  alerts: many(competitorAlerts),
}));

export const intelligenceDataRelations = relations(intelligenceData, ({ one, many }) => ({
  competitor: one(competitorProfiles, {
    fields: [intelligenceData.competitor_id],
    references: [competitorProfiles.id],
  }),
  user: one(users, {
    fields: [intelligenceData.user_id],
    references: [users.id],
  }),
  alerts: many(competitorAlerts),
}));

export const competitorAlertsRelations = relations(competitorAlerts, ({ one }) => ({
  competitor: one(competitorProfiles, {
    fields: [competitorAlerts.competitor_id],
    references: [competitorProfiles.id],
  }),
  user: one(users, {
    fields: [competitorAlerts.user_id],
    references: [users.id],
  }),
  intelligence: one(intelligenceData, {
    fields: [competitorAlerts.intelligence_id],
    references: [intelligenceData.id],
  }),
}));