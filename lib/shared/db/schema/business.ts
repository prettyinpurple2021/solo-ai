
import { integer, pgTable, varchar, text, timestamp, boolean, jsonb, decimal, index, uniqueIndex, foreignKey, primaryKey, pgEnum } from 'drizzle-orm/pg-core';
import { v4 as uuidv4 } from 'uuid';
import { users } from './users.ts';

// User Settings table
export const userSettings = pgTable('user_settings', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  category: varchar('category', { length: 100 }).notNull(), // e.g., 'processor', 'notifications'
  settings: jsonb('settings').default('{}').notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('user_settings_user_id_idx').on(table.user_id),
  categoryIdx: index('user_settings_category_idx').on(table.category),
  userCategoryIdx: index('user_settings_user_category_idx').on(table.user_id, table.category),
}));

// SOPs
export const sops = pgTable("sops", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  department: varchar("department", { length: 100 }),
  status: varchar("status", { length: 50 }).default('draft').notNull(),
  version: integer("version").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("sops_user_id_idx").on(table.userId),
}));

// Job Descriptions
export const jobDescriptions = pgTable("job_descriptions", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 255 }).notNull(),
  role: varchar("role", { length: 100 }),
  department: varchar("department", { length: 100 }),
  content: text("content"),
  status: varchar("status", { length: 50 }).default('draft').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("job_descriptions_user_id_idx").on(table.userId),
}));

// Interview Guides
export const interviewGuides = pgTable("interview_guides", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 255 }).notNull(),
  role: varchar("role", { length: 100 }),
  questions: jsonb("questions").default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("interview_guides_user_id_idx").on(table.userId),
}));

// Product Specs
export const productSpecs = pgTable("product_specs", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 255 }).notNull(),
  version: varchar("version", { length: 50 }),
  status: varchar("status", { length: 50 }).default('draft').notNull(),
  content: jsonb("content").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("product_specs_user_id_idx").on(table.userId),
}));

// Legal Docs
export const legalDocs = pgTable("legal_docs", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  content: text("content"),
  status: varchar("status", { length: 50 }).default('draft').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("legal_docs_user_id_idx").on(table.userId),
}));

// Launch Strategies
export const launchStrategies = pgTable("launch_strategies", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 255 }).notNull(),
  phases: jsonb("phases").default([]).notNull(),
  status: varchar("status", { length: 50 }).default('draft').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("launch_strategies_user_id_idx").on(table.userId),
}));

// Subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  stripePriceId: varchar("stripe_price_id", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull(),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("subscriptions_user_id_idx").on(table.userId),
  stripeSubIdx: index("subscriptions_stripe_sub_id_idx").on(table.stripeSubscriptionId),
}));

// Usage Tracking
export const usageTracking = pgTable("usage_tracking", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  feature: varchar("feature", { length: 50 }).notNull(),
  usageCount: integer("usage_count").default(0).notNull(),
  limit: integer("limit"),
  resetAt: timestamp("reset_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("usage_tracking_user_id_idx").on(table.userId),
  featureIdx: index("usage_tracking_feature_idx").on(table.feature),
}));

// Briefcase/Projects table
export const briefcases = pgTable('briefcases', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('active').notNull(),
  is_default: boolean('is_default').default(false).notNull(),
  metadata: jsonb('metadata').default('{}').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('briefcases_user_id_idx').on(table.user_id),
}));

export const briefcaseItems = pgTable('briefcase_items', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  briefcaseId: text('briefcase_id').references(() => briefcases.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  content: jsonb('content').default('{}').notNull(),
  metadata: jsonb('metadata').default('{}').notNull(),
  tags: jsonb('tags').default('[]').notNull(),
  isPrivate: boolean('is_private').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('briefcase_items_user_id_idx').on(table.userId),
  briefcaseIdIdx: index('briefcase_items_briefcase_id_idx').on(table.briefcaseId),
}));

// Goals table
export const goals = pgTable('goals', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  briefcase_id: text('briefcase_id').references(() => briefcases.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  priority: varchar('priority', { length: 20 }).default('medium').notNull(),
  due_date: timestamp('due_date'),
  completed_at: timestamp('completed_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('goals_user_id_idx').on(table.user_id),
  briefcaseIdIdx: index('goals_briefcase_id_idx').on(table.briefcase_id),
}));

// Tasks table
export const tasks = pgTable('tasks', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  goal_id: text('goal_id').references(() => goals.id, { onDelete: 'cascade' }),
  briefcase_id: text('briefcase_id').references(() => briefcases.id, { onDelete: 'cascade' }),
  parent_task_id: text('parent_task_id'),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  priority: varchar('priority', { length: 20 }).default('medium').notNull(),
  category: varchar('category', { length: 100 }),
  tags: jsonb('tags').default('[]').notNull(),
  due_date: timestamp('due_date'),
  estimated_minutes: integer('estimated_minutes'),
  actual_minutes: integer('actual_minutes'),
  energy_level: varchar('energy_level', { length: 20 }).default('medium').notNull(),
  is_recurring: boolean('is_recurring').default(false).notNull(),
  recurrence_pattern: jsonb('recurrence_pattern'),
  ai_suggestions: jsonb('ai_suggestions').default('{}').notNull(),
  completed_at: timestamp('completed_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('tasks_user_id_idx').on(table.user_id),
  goalIdIdx: index('tasks_goal_id_idx').on(table.goal_id),
  briefcaseIdIdx: index('tasks_briefcase_id_idx').on(table.briefcase_id),
  parentTaskFk: foreignKey({
    columns: [table.parent_task_id],
    foreignColumns: [table.id],
  }).onDelete('cascade'),
}));

// Templates table
export const templates = pgTable('templates', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  user_id: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  template_slug: varchar('template_slug', { length: 255 }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  content: text('content').notNull(),
  category: varchar('category', { length: 100 }),
  tier: varchar('tier', { length: 20 }).default('Free').notNull(),
  estimated_minutes: integer('estimated_minutes'),
  difficulty: varchar('difficulty', { length: 20 }).default('Beginner').notNull(),
  tags: jsonb('tags').default('[]').notNull(),
  usage_count: integer('usage_count').default(0).notNull(),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0.00').notNull(),
  is_premium: boolean('is_premium').default(false).notNull(),
  is_public: boolean('is_public').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index('templates_category_idx').on(table.category),
  tierIdx: index('templates_tier_idx').on(table.tier),
}));

// Task Categories table
export const taskCategories = pgTable('task_categories', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  color: varchar('color', { length: 7 }).default('#8B5CF6').notNull(),
  icon: varchar('icon', { length: 50 }),
  is_default: boolean('is_default').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('task_categories_user_id_idx').on(table.user_id),
}));

// Task Analytics table
export const taskAnalytics = pgTable('task_analytics', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  task_id: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 50 }).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  metadata: jsonb('metadata').default('{}').notNull(),
}, (table) => ({
  userIdIdx: index('task_analytics_user_id_idx').on(table.user_id),
  taskIdIdx: index('task_analytics_task_id_idx').on(table.task_id),
}));

// Productivity Insights table
export const productivityInsights = pgTable('productivity_insights', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  insight_type: varchar('insight_type', { length: 50 }).notNull(),
  date: timestamp('date', { mode: 'date' }).notNull(),
  metrics: jsonb('metrics').notNull(),
  ai_recommendations: jsonb('ai_recommendations').default('{}').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('productivity_insights_user_id_idx').on(table.user_id),
}));

// Analytics Events table
export const analyticsEvents = pgTable('analytics_events', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    user_id: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    event: varchar('event', { length: 100 }).notNull(),
    properties: jsonb('properties').default('{}').notNull(),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
    session_id: varchar('session_id', { length: 255 }),
    metadata: jsonb('metadata').default('{}').notNull(),
  }, (table) => ({
    userIdIdx: index('analytics_events_user_id_idx').on(table.user_id),
    eventIdx: index('analytics_events_event_idx').on(table.event),
    timestampIdx: index('analytics_events_timestamp_idx').on(table.timestamp),
  }));

// Focus Sessions table
export const focusSessions = pgTable('focus_sessions', {
    id: text('id').primaryKey().$defaultFn(() => uuidv4()),
    user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    task_id: text('task_id').references(() => tasks.id, { onDelete: 'set null' }),
    started_at: timestamp('started_at').notNull(),
    end_time: timestamp('end_time'),
    duration_minutes: integer('duration_minutes').default(0).notNull(),
    status: varchar('status', { length: 50 }).default('completed').notNull(), 
    notes: text('notes'),
    xp_earned: integer('xp_earned').default(0).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('focus_sessions_user_id_idx').on(table.user_id),
}));

// Custom Reports
export const customReports = pgTable('custom_reports', {
    id: text('id').primaryKey().$defaultFn(() => uuidv4()),
    user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    config: jsonb('config').notNull().default('{}').notNull(), // Stores the report configuration
    schedule: jsonb('schedule'), // Stores scheduling frequency
    is_favorite: boolean('is_favorite').default(false).notNull(),
    last_run_at: timestamp('last_run_at'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  }, (table) => ({
    userIdIdx: index('custom_reports_user_id_idx').on(table.user_id),
}));

// User Brand Settings
export const userBrandSettings = pgTable('user_brand_settings', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
    company_name: varchar('company_name', { length: 255 }),
    tagline: varchar('tagline', { length: 500 }),
    description: text('description'),
    industry: varchar('industry', { length: 100 }),
    target_audience: text('target_audience'),
    brand_personality: jsonb('brand_personality').default('[]').notNull(),
    color_palette: jsonb('color_palette').default('{}').notNull(),
    typography: jsonb('typography').default('{}').notNull(),
    logo_url: varchar('logo_url', { length: 1000 }),
    logo_prompt: text('logo_prompt'),
    moodboard: jsonb('moodboard').default('[]').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  }, (table) => ({
    userIdIdx: index('user_brand_settings_user_id_idx').on(table.user_id),
    industryIdx: index('user_brand_settings_industry_idx').on(table.industry),
}));
