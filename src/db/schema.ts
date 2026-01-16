import { integer, pgTable, varchar, text, timestamp, boolean, jsonb, decimal, index, uuid, foreignKey, primaryKey, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Users table - matches actual database structure
// Users table - NextAuth compatible
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  password: text('password'), // For Credentials provider
  username: text('username'),
  full_name: text('full_name'),
  bio: text('bio'),
  role: text('role').default('user'),
  xp: integer('xp').default(0),
  level: integer('level').default(1),
  total_actions: integer('total_actions').default(0),
  suspended: boolean('suspended').default(false),
  suspended_at: timestamp('suspended_at'),
      suspended_reason: text('suspended_reason'),
  stripe_customer_id: text('stripe_customer_id'),
  subscription_tier: text('subscription_tier').default('free'),
  subscription_status: text('subscription_status').default('active'),
  stripe_subscription_id: text('stripe_subscription_id'),
  current_period_start: timestamp('current_period_start'),
  current_period_end: timestamp('current_period_end'),
  cancel_at_period_end: boolean('cancel_at_period_end').default(false),
  date_of_birth: timestamp('date_of_birth'),
  is_verified: boolean('is_verified').default(false),
  onboarding_completed: boolean('onboarding_completed').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
)

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  })
)

// User Settings table
export const userSettings = pgTable('user_settings', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  category: varchar('category', { length: 100 }).notNull(), // e.g., 'processor', 'notifications'
  settings: jsonb('settings').default('{}'),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('user_settings_user_id_idx').on(table.user_id),
  categoryIdx: index('user_settings_category_idx').on(table.category),
  userCategoryIdx: index('user_settings_user_category_idx').on(table.user_id, table.category),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.user_id],
    references: [users.id],
  }),
}));

// Briefcase/Projects table
export const briefcases = pgTable('briefcases', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).default('active'),
  metadata: jsonb('metadata'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Goals table
export const goals = pgTable('goals', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  briefcase_id: text('briefcase_id').references(() => briefcases.id, { onDelete: 'cascade' }),
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
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  goal_id: text('goal_id').references(() => goals.id, { onDelete: 'cascade' }),
  briefcase_id: text('briefcase_id').references(() => briefcases.id, { onDelete: 'cascade' }),
  parent_task_id: text('parent_task_id'),
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
}, (table) => ({
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
  tier: varchar('tier', { length: 20 }).default('Free'),
  estimated_minutes: integer('estimated_minutes'),
  difficulty: varchar('difficulty', { length: 20 }).default('Beginner'),
  tags: jsonb('tags').default('[]'),
  usage_count: integer('usage_count').default(0),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0.00'),
  is_premium: boolean('is_premium').default(false),
  is_public: boolean('is_public').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Task Categories table
export const taskCategories = pgTable('task_categories', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  color: varchar('color', { length: 7 }).default('#8B5CF6'),
  icon: varchar('icon', { length: 50 }),
  is_default: boolean('is_default').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Competitors table
export const competitors = pgTable('competitors', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  website: varchar('website', { length: 500 }),
  description: text('description'),
  strengths: jsonb('strengths').default('[]'),
  weaknesses: jsonb('weaknesses').default('[]'),
  opportunities: jsonb('opportunities').default('[]'),
  threats: jsonb('threats').default('[]'),
  market_position: varchar('market_position', { length: 100 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Task Analytics table
export const taskAnalytics = pgTable('task_analytics', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  task_id: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 50 }).notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
  metadata: jsonb('metadata').default('{}'),
});

// Productivity Insights table
export const productivityInsights = pgTable('productivity_insights', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  insight_type: varchar('insight_type', { length: 50 }).notNull(),
  date: timestamp('date', { mode: 'date' }).notNull(),
  metrics: jsonb('metrics').notNull(),
  ai_recommendations: jsonb('ai_recommendations').default('{}'),
  created_at: timestamp('created_at').defaultNow(),
});

// Posts table (existing)
export const posts = pgTable('posts', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull().default(''),
});

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

// Competitor Profiles table
export const competitorProfiles = pgTable('competitor_profiles', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
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
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  competitor_id: text('competitor_id').notNull().references(() => competitorProfiles.id, { onDelete: 'cascade' }),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
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
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  competitor_id: text('competitor_id').notNull().references(() => competitorProfiles.id, { onDelete: 'cascade' }),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  intelligence_id: text('intelligence_id').references(() => intelligenceData.id, { onDelete: 'set null' }),
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

// Scraping Jobs table
export const scrapingJobs = pgTable('scraping_jobs', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  competitor_id: text('competitor_id').notNull().references(() => competitorProfiles.id, { onDelete: 'cascade' }),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  job_type: varchar('job_type', { length: 50 }).notNull(),
  url: varchar('url', { length: 1000 }).notNull(),
  priority: varchar('priority', { length: 20 }).notNull().default('medium'),
  frequency_type: varchar('frequency_type', { length: 20 }).notNull().default('interval'),
  frequency_value: varchar('frequency_value', { length: 100 }).notNull(),
  frequency_timezone: varchar('frequency_timezone', { length: 50 }),
  next_run_at: timestamp('next_run_at').notNull(),
  last_run_at: timestamp('last_run_at'),
  retry_count: integer('retry_count').notNull().default(0),
  max_retries: integer('max_retries').notNull().default(3),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  config: jsonb('config').notNull().default('{}'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  competitorIdIdx: index('scraping_jobs_competitor_id_idx').on(table.competitor_id),
  userIdIdx: index('scraping_jobs_user_id_idx').on(table.user_id),
  statusIdx: index('scraping_jobs_status_idx').on(table.status),
  priorityIdx: index('scraping_jobs_priority_idx').on(table.priority),
  nextRunAtIdx: index('scraping_jobs_next_run_at_idx').on(table.next_run_at),
  jobTypeIdx: index('scraping_jobs_job_type_idx').on(table.job_type),
}));

// Scraping Job Results table
export const scrapingJobResults = pgTable('scraping_job_results', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  job_id: text('job_id').notNull().references(() => scrapingJobs.id, { onDelete: 'cascade' }),
  success: boolean('success').notNull(),
  data: jsonb('data'),
  error: text('error'),
  execution_time: integer('execution_time').notNull(),
  changes_detected: boolean('changes_detected').notNull().default(false),
  retry_count: integer('retry_count').notNull().default(0),
  completed_at: timestamp('completed_at').defaultNow(),
  created_at: timestamp('created_at').defaultNow(),
}, (table) => ({
  jobIdIdx: index('scraping_job_results_job_id_idx').on(table.job_id),
  successIdx: index('scraping_job_results_success_idx').on(table.success),
  completedAtIdx: index('scraping_job_results_completed_at_idx').on(table.completed_at),
}));

// Competitive Opportunities table
export const competitiveOpportunities = pgTable('competitive_opportunities', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  competitor_id: text('competitor_id').notNull().references(() => competitorProfiles.id, { onDelete: 'cascade' }),
  intelligence_id: text('intelligence_id').references(() => intelligenceData.id, { onDelete: 'set null' }),
  opportunity_type: varchar('opportunity_type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  confidence: decimal('confidence', { precision: 3, scale: 2 }).notNull(),
  impact: varchar('impact', { length: 20 }).notNull(),
  effort: varchar('effort', { length: 20 }).notNull(),
  timing: varchar('timing', { length: 20 }).notNull(),
  priority_score: decimal('priority_score', { precision: 5, scale: 2 }).notNull(),
  evidence: jsonb('evidence').default('[]'),
  recommendations: jsonb('recommendations').default('[]'),
  status: varchar('status', { length: 50 }).default('identified'),
  assigned_to: text('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  implementation_notes: text('implementation_notes'),
  roi_estimate: decimal('roi_estimate', { precision: 10, scale: 2 }),
  actual_roi: decimal('actual_roi', { precision: 10, scale: 2 }),
  success_metrics: jsonb('success_metrics').default('{}'),
  tags: jsonb('tags').default('[]'),
  is_archived: boolean('is_archived').default(false),
  detected_at: timestamp('detected_at').defaultNow(),
  started_at: timestamp('started_at'),
  completed_at: timestamp('completed_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('competitive_opportunities_user_id_idx').on(table.user_id),
  competitorIdIdx: index('competitive_opportunities_competitor_id_idx').on(table.competitor_id),
  opportunityTypeIdx: index('competitive_opportunities_type_idx').on(table.opportunity_type),
  impactIdx: index('competitive_opportunities_impact_idx').on(table.impact),
  statusIdx: index('competitive_opportunities_status_idx').on(table.status),
  priorityScoreIdx: index('competitive_opportunities_priority_score_idx').on(table.priority_score),
  detectedAtIdx: index('competitive_opportunities_detected_at_idx').on(table.detected_at),
  isArchivedIdx: index('competitive_opportunities_is_archived_idx').on(table.is_archived),
}));

// Opportunity Actions table
export const opportunityActions = pgTable('opportunity_actions', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  opportunity_id: text('opportunity_id').notNull().references(() => competitiveOpportunities.id, { onDelete: 'cascade' }),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action_type: varchar('action_type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  priority: varchar('priority', { length: 20 }).default('medium'),
  estimated_effort_hours: integer('estimated_effort_hours'),
  actual_effort_hours: integer('actual_effort_hours'),
  estimated_cost: decimal('estimated_cost', { precision: 10, scale: 2 }),
  actual_cost: decimal('actual_cost', { precision: 10, scale: 2 }),
  expected_outcome: text('expected_outcome'),
  actual_outcome: text('actual_outcome'),
  status: varchar('status', { length: 50 }).default('pending'),
  due_date: timestamp('due_date'),
  completed_at: timestamp('completed_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  opportunityIdIdx: index('opportunity_actions_opportunity_id_idx').on(table.opportunity_id),
  userIdIdx: index('opportunity_actions_user_id_idx').on(table.user_id),
  statusIdx: index('opportunity_actions_status_idx').on(table.status),
  priorityIdx: index('opportunity_actions_priority_idx').on(table.priority),
  dueDateIdx: index('opportunity_actions_due_date_idx').on(table.due_date),
}));

// Opportunity Metrics table
export const opportunityMetrics = pgTable('opportunity_metrics', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  opportunity_id: text('opportunity_id').notNull().references(() => competitiveOpportunities.id, { onDelete: 'cascade' }),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  metric_name: varchar('metric_name', { length: 100 }).notNull(),
  metric_type: varchar('metric_type', { length: 50 }).notNull(),
  baseline_value: decimal('baseline_value', { precision: 15, scale: 4 }),
  target_value: decimal('target_value', { precision: 15, scale: 4 }),
  current_value: decimal('current_value', { precision: 15, scale: 4 }),
  unit: varchar('unit', { length: 50 }),
  measurement_date: timestamp('measurement_date').defaultNow(),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  opportunityIdIdx: index('opportunity_metrics_opportunity_id_idx').on(table.opportunity_id),
  userIdIdx: index('opportunity_metrics_user_id_idx').on(table.user_id),
  metricNameIdx: index('opportunity_metrics_metric_name_idx').on(table.metric_name),
  measurementDateIdx: index('opportunity_metrics_measurement_date_idx').on(table.measurement_date),
}));

// Documents table for Briefcase
export const documents = pgTable('documents', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  folder_id: text('folder_id').references(() => documentFolders.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  original_name: varchar('original_name', { length: 255 }).notNull(),
  file_type: varchar('file_type', { length: 50 }).notNull(),
  mime_type: varchar('mime_type', { length: 100 }).notNull(),
  size: integer('size').notNull(),
  file_url: varchar('file_url', { length: 1000 }), // URL to file storage
  category: varchar('category', { length: 100 }).default('uncategorized'),
  description: text('description'),
  tags: jsonb('tags').default('[]'),
  metadata: jsonb('metadata').default('{}'),
  ai_insights: jsonb('ai_insights').default('{}'),
  is_favorite: boolean('is_favorite').default(false),
  is_public: boolean('is_public').default(false),
  download_count: integer('download_count').default(0),
  view_count: integer('view_count').default(0),
  last_accessed: timestamp('last_accessed'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('documents_user_id_idx').on(table.user_id),
  folderIdIdx: index('documents_folder_id_idx').on(table.folder_id),
  categoryIdx: index('documents_category_idx').on(table.category),
  fileTypeIdx: index('documents_file_type_idx').on(table.file_type),
  isFavoriteIdx: index('documents_is_favorite_idx').on(table.is_favorite),
  createdAtIdx: index('documents_created_at_idx').on(table.created_at),
  nameIdx: index('documents_name_idx').on(table.name),
}));

// Document Folders table
export const documentFolders = pgTable('document_folders', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  parent_id: text('parent_id'),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  color: varchar('color', { length: 7 }).default('#8B5CF6'),
  icon: varchar('icon', { length: 50 }),
  is_default: boolean('is_default').default(false),
  file_count: integer('file_count').default(0),
  total_size: integer('total_size').default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('document_folders_user_id_idx').on(table.user_id),
  parentIdIdx: index('document_folders_parent_id_idx').on(table.parent_id),
  nameIdx: index('document_folders_name_idx').on(table.name),
  parentFolderFk: foreignKey({
    columns: [table.parent_id],
    foreignColumns: [table.id],
  }).onDelete('cascade'),
}));

// Document Versions table
export const documentVersions = pgTable('document_versions', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  document_id: text('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  version_number: integer('version_number').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  file_type: varchar('file_type', { length: 50 }).notNull(),
  size: integer('size').notNull(),
  file_data: text('file_data').notNull(), // Store file content directly in database
  change_summary: text('change_summary'),
  created_by: text('created_by').notNull().references(() => users.id),
  created_at: timestamp('created_at').defaultNow(),
}, (table) => ({
  documentIdIdx: index('document_versions_document_id_idx').on(table.document_id),
  versionNumberIdx: index('document_versions_version_number_idx').on(table.version_number),
  createdByIdx: index('document_versions_created_by_idx').on(table.created_by),
}));

// Document Permissions table
export const documentPermissions = pgTable('document_permissions', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  document_id: text('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  user_id: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }),
  role: varchar('role', { length: 20 }).notNull().default('viewer'),
  granted_by: text('granted_by').notNull().references(() => users.id),
  granted_at: timestamp('granted_at').defaultNow(),
  expires_at: timestamp('expires_at'),
  is_active: boolean('is_active').default(true),
}, (table) => ({
  documentIdIdx: index('document_permissions_document_id_idx').on(table.document_id),
  userIdIdx: index('document_permissions_user_id_idx').on(table.user_id),
  emailIdx: index('document_permissions_email_idx').on(table.email),
  roleIdx: index('document_permissions_role_idx').on(table.role),
}));

// Document Share Links table
export const documentShareLinks = pgTable('document_share_links', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  document_id: text('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  created_by: text('created_by').notNull().references(() => users.id),
  url: varchar('url', { length: 1000 }).notNull(),
  password_hash: varchar('password_hash', { length: 255 }),
  permissions: varchar('permissions', { length: 20 }).notNull().default('view'),
  expires_at: timestamp('expires_at'),
  max_access_count: integer('max_access_count'),
  access_count: integer('access_count').default(0),
  download_enabled: boolean('download_enabled').default(true),
  require_auth: boolean('require_auth').default(false),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
}, (table) => ({
  documentIdIdx: index('document_share_links_document_id_idx').on(table.document_id),
  createdByIdx: index('document_share_links_created_by_idx').on(table.created_by),
  isActiveIdx: index('document_share_links_is_active_idx').on(table.is_active),
  expiresAtIdx: index('document_share_links_expires_at_idx').on(table.expires_at),
}));

// Document Activity table
export const documentActivity = pgTable('document_activity', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  document_id: text('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 50 }).notNull(),
  details: jsonb('details').default('{}'),
  ip_address: varchar('ip_address', { length: 45 }),
  user_agent: text('user_agent'),
  created_at: timestamp('created_at').defaultNow(),
}, (table) => ({
  documentIdIdx: index('document_activity_document_id_idx').on(table.document_id),
  userIdIdx: index('document_activity_user_id_idx').on(table.user_id),
  actionIdx: index('document_activity_action_idx').on(table.action),
  createdAtIdx: index('document_activity_created_at_idx').on(table.created_at),
}));
// Feedback enums
export const feedbackTypeEnum = pgEnum('feedback_type', ['bug', 'feature_request', 'comment', 'error', 'other']);
export const feedbackStatusEnum = pgEnum('feedback_status', ['pending', 'in_progress', 'resolved', 'closed', 'dismissed']);
export const feedbackPriorityEnum = pgEnum('feedback_priority', ['low', 'medium', 'high', 'critical']);

// Custom Reports table
export const customReports = pgTable('custom_reports', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  config: jsonb('config').notNull().default('{}'), // Stores the report configuration (metrics, filters, visualization type)
  schedule: jsonb('schedule'), // Stores scheduling frequency and recipients
  is_favorite: boolean('is_favorite').default(false),
  last_run_at: timestamp('last_run_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('custom_reports_user_id_idx').on(table.user_id),
}));

// Feedback table for user submissions
export const feedback = pgTable('feedback', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  user_id: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  type: text('type').notNull(),
  title: text('title'),
  message: text('message').notNull(),
  browser_info: jsonb('browser_info'),
  screenshot_url: text('screenshot_url'),
  status: text('status').notNull().default('pending'),
  priority: text('priority').notNull().default('medium'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('feedback_user_id_idx').on(table.user_id),
  typeIdx: index('feedback_type_idx').on(table.type),
  statusIdx: index('feedback_status_idx').on(table.status),
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

export const userCompetitiveStatsRelations = relations(userCompetitiveStats, ({ one }) => ({
  user: one(users, {
    fields: [userCompetitiveStats.user_id],
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
  scrapingJobs: many(scrapingJobs),
  opportunities: many(competitiveOpportunities),
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

// Scraping Jobs Relations
export const scrapingJobsRelations = relations(scrapingJobs, ({ one, many }) => ({
  competitor: one(competitorProfiles, {
    fields: [scrapingJobs.competitor_id],
    references: [competitorProfiles.id],
  }),
  user: one(users, {
    fields: [scrapingJobs.user_id],
    references: [users.id],
  }),
  results: many(scrapingJobResults),
}));

export const scrapingJobResultsRelations = relations(scrapingJobResults, ({ one }) => ({
  job: one(scrapingJobs, {
    fields: [scrapingJobResults.job_id],
    references: [scrapingJobs.id],
  }),
}));

// Competitive Opportunities Relations
export const competitiveOpportunitiesRelations = relations(competitiveOpportunities, ({ one, many }) => ({
  user: one(users, {
    fields: [competitiveOpportunities.user_id],
    references: [users.id],
  }),
  competitor: one(competitorProfiles, {
    fields: [competitiveOpportunities.competitor_id],
    references: [competitorProfiles.id],
  }),
  intelligence: one(intelligenceData, {
    fields: [competitiveOpportunities.intelligence_id],
    references: [intelligenceData.id],
  }),
  assignedUser: one(users, {
    fields: [competitiveOpportunities.assigned_to],
    references: [users.id],
  }),
  actions: many(opportunityActions),
  metrics: many(opportunityMetrics),
}));

export const opportunityActionsRelations = relations(opportunityActions, ({ one }) => ({
  opportunity: one(competitiveOpportunities, {
    fields: [opportunityActions.opportunity_id],
    references: [competitiveOpportunities.id],
  }),
  user: one(users, {
    fields: [opportunityActions.user_id],
    references: [users.id],
  }),
}));

export const opportunityMetricsRelations = relations(opportunityMetrics, ({ one }) => ({
  opportunity: one(competitiveOpportunities, {
    fields: [opportunityMetrics.opportunity_id],
    references: [competitiveOpportunities.id],
  }),
  user: one(users, {
    fields: [opportunityMetrics.user_id],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  user: one(users, {
    fields: [documents.user_id],
    references: [users.id],
  }),
  folder: one(documentFolders, {
    fields: [documents.folder_id],
    references: [documentFolders.id],
  }),
  versions: many(documentVersions),
  permissions: many(documentPermissions),
  shareLinks: many(documentShareLinks),
  activity: many(documentActivity),
}));

export const documentFoldersRelations = relations(documentFolders, ({ one, many }) => ({
  user: one(users, {
    fields: [documentFolders.user_id],
    references: [users.id],
  }),
  parent: one(documentFolders, {
    fields: [documentFolders.parent_id],
    references: [documentFolders.id],
  }),
  children: many(documentFolders),
  documents: many(documents),
}));

export const documentVersionsRelations = relations(documentVersions, ({ one }) => ({
  document: one(documents, {
    fields: [documentVersions.document_id],
    references: [documents.id],
  }),
  createdBy: one(users, {
    fields: [documentVersions.created_by],
    references: [users.id],
  }),
}));

export const documentPermissionsRelations = relations(documentPermissions, ({ one }) => ({
  document: one(documents, {
    fields: [documentPermissions.document_id],
    references: [documents.id],
  }),
  user: one(users, {
    fields: [documentPermissions.user_id],
    references: [users.id],
  }),
  grantedBy: one(users, {
    fields: [documentPermissions.granted_by],
    references: [users.id],
  }),
}));

export const documentShareLinksRelations = relations(documentShareLinks, ({ one }) => ({
  document: one(documents, {
    fields: [documentShareLinks.document_id],
    references: [documents.id],
  }),
  createdBy: one(users, {
    fields: [documentShareLinks.created_by],
    references: [users.id],
  }),
}));

export const documentActivityRelations = relations(documentActivity, ({ one }) => ({
  document: one(documents, {
    fields: [documentActivity.document_id],
    references: [documents.id],
  }),
  user: one(users, {
    fields: [documentActivity.user_id],
    references: [users.id],
  }),
}));

// Calendar Connections table
export const calendarConnections = pgTable('calendar_connections', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 50 }).notNull(), // google, outlook, apple
  access_token: text('access_token').notNull(),
  refresh_token: text('refresh_token'),
  expires_at: timestamp('expires_at'),
  email: varchar('email', { length: 255 }),
  name: varchar('name', { length: 255 }),
  is_active: boolean('is_active').default(true),
  last_synced_at: timestamp('last_synced_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('calendar_connections_user_id_idx').on(table.user_id),
  providerIdx: index('calendar_connections_provider_idx').on(table.provider),
}));

// Social Media Connections table - for users to connect their own accounts
export const socialMediaConnections = pgTable('social_media_connections', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  platform: varchar('platform', { length: 50 }).notNull(), // linkedin, twitter, facebook, instagram, youtube
  access_token: text('access_token').notNull(),
  refresh_token: text('refresh_token'),
  expires_at: timestamp('expires_at'),
  token_secret: text('token_secret'), // For OAuth 1.0a (Twitter)
  account_id: varchar('account_id', { length: 255 }), // Platform-specific account ID
  account_handle: varchar('account_handle', { length: 255 }), // Username/handle
  account_email: varchar('account_email', { length: 255 }),
  account_name: varchar('account_name', { length: 255 }),
  scopes: text('scopes'), // Comma-separated list of granted scopes
  is_active: boolean('is_active').default(true),
  last_synced_at: timestamp('last_synced_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('social_media_connections_user_id_idx').on(table.user_id),
  platformIdx: index('social_media_connections_platform_idx').on(table.platform),
  userPlatformIdx: index('social_media_connections_user_platform_idx').on(table.user_id, table.platform),
}));

// Payment Provider Connections table - for users to connect their own payment processors
export const paymentProviderConnections = pgTable('payment_provider_connections', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 50 }).notNull(), // stripe, paypal, square, etc.
  account_id: varchar('account_id', { length: 255 }), // Provider account ID (e.g., Stripe Account ID)
  access_token: text('access_token'), // For OAuth providers
  refresh_token: text('refresh_token'),
  expires_at: timestamp('expires_at'),
  account_email: varchar('account_email', { length: 255 }),
  account_name: varchar('account_name', { length: 255 }),
  webhook_secret: text('webhook_secret'), // For receiving webhooks
  is_active: boolean('is_active').default(true),
  last_synced_at: timestamp('last_synced_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('payment_provider_connections_user_id_idx').on(table.user_id),
  providerIdx: index('payment_provider_connections_provider_idx').on(table.provider),
  userProviderIdx: index('payment_provider_connections_user_provider_idx').on(table.user_id, table.provider),
}));

// Learning Modules table
export const learningModules = pgTable('learning_modules', {
  id: varchar('id', { length: 255 }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  content: text('content'), // For simple modules, or link to external content
  duration_minutes: integer('duration_minutes').notNull(),
  difficulty: varchar('difficulty', { length: 20 }).notNull().default('beginner'), // beginner, intermediate, advanced
  category: varchar('category', { length: 100 }).notNull(),
  skills_covered: jsonb('skills_covered').default('[]'),
  prerequisites: jsonb('prerequisites').default('[]'),
  is_published: boolean('is_published').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  categoryIdx: index('learning_modules_category_idx').on(table.category),
  difficultyIdx: index('learning_modules_difficulty_idx').on(table.difficulty),
}));

// User Learning Progress table
export const userProgress = pgTable('user_progress', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  module_id: varchar('module_id', { length: 255 }).notNull().references(() => learningModules.id, { onDelete: 'cascade' }),
  completion_percentage: integer('completion_percentage').default(0),
  time_spent: integer('time_spent').default(0), // in minutes
  last_accessed: timestamp('last_accessed').defaultNow(),
  started_at: timestamp('started_at').defaultNow(),
  completed_at: timestamp('completed_at'),
  status: varchar('status', { length: 20 }).default('not_started'), // not_started, in_progress, completed
  data: jsonb('data').default('{}'), // Store interactive state/answers
}, (table) => ({
  userIdIdx: index('user_progress_user_id_idx').on(table.user_id),
  moduleIdIdx: index('user_progress_module_id_idx').on(table.module_id),
  statusIdx: index('user_progress_status_idx').on(table.status),
}));

// Skill Assessments table
export const skillAssessments = pgTable('skill_assessments', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  skill_name: varchar('skill_name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }),
  current_level: integer('current_level').default(1),
  target_level: integer('target_level').default(5),
  gap_score: integer('gap_score').default(0),
  assessed_at: timestamp('assessed_at').defaultNow(),
  next_assessment_due: timestamp('next_assessment_due'),
}, (table) => ({
  userIdIdx: index('skill_assessments_user_id_idx').on(table.user_id),
  skillNameIdx: index('skill_assessments_skill_name_idx').on(table.skill_name),
}));

// Quiz Scores table
export const quizScores = pgTable('quiz_scores', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  module_id: varchar('module_id', { length: 255 }).references(() => learningModules.id, { onDelete: 'cascade' }),
  score: integer('score').notNull(),
  max_score: integer('max_score').default(100),
  passed: boolean('passed').default(false),
  completed_at: timestamp('completed_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('quiz_scores_user_id_idx').on(table.user_id),
  moduleIdIdx: index('quiz_scores_module_id_idx').on(table.module_id),
}));

// User Brand Settings table
export const userBrandSettings = pgTable('user_brand_settings', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  company_name: varchar('company_name', { length: 255 }),
  tagline: varchar('tagline', { length: 500 }),
  description: text('description'),
  industry: varchar('industry', { length: 100 }),
  target_audience: text('target_audience'),
  brand_personality: jsonb('brand_personality').default('[]'),
  color_palette: jsonb('color_palette').default('{}'),
  typography: jsonb('typography').default('{}'),
  logo_url: varchar('logo_url', { length: 1000 }),
  logo_prompt: text('logo_prompt'),
  moodboard: jsonb('moodboard').default('[]'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('user_brand_settings_user_id_idx').on(table.user_id),
  industryIdx: index('user_brand_settings_industry_idx').on(table.industry),
}));

// User Brand Settings Relations
export const userBrandSettingsRelations = relations(userBrandSettings, ({ one }) => ({
  user: one(users, {
    fields: [userBrandSettings.user_id],
    references: [users.id],
  }),
}));

// Push Subscriptions table
export const pushSubscriptions = pgTable('push_subscriptions', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  endpoint: varchar('endpoint', { length: 1000 }).notNull(),
  p256dh_key: varchar('p256dh_key', { length: 500 }).notNull(),
  auth_key: varchar('auth_key', { length: 500 }).notNull(),
  device_info: jsonb('device_info').default('{}'),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('push_subscriptions_user_id_idx').on(table.user_id),
  endpointIdx: index('push_subscriptions_endpoint_idx').on(table.endpoint),
  isActiveIdx: index('push_subscriptions_is_active_idx').on(table.is_active),
}));

// Push Subscriptions Relations
export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [pushSubscriptions.user_id],
    references: [users.id],
  }),
}));

// Competitor Activities table
export const competitorActivities = pgTable('competitor_activities', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  competitor_id: text('competitor_id').notNull().references(() => competitorProfiles.id, { onDelete: 'cascade' }),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  activity_type: varchar('activity_type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  source_url: varchar('source_url', { length: 1000 }),
  source_type: varchar('source_type', { length: 50 }).notNull(),
  importance: varchar('importance', { length: 20 }).notNull().default('medium'),
  confidence: decimal('confidence', { precision: 3, scale: 2 }).default('0.00'),
  metadata: jsonb('metadata').default('{}'),
  tags: jsonb('tags').default('[]'),
  detected_at: timestamp('detected_at').defaultNow(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  competitorIdIdx: index('competitor_activities_competitor_id_idx').on(table.competitor_id),
  userIdIdx: index('competitor_activities_user_id_idx').on(table.user_id),
  activityTypeIdx: index('competitor_activities_activity_type_idx').on(table.activity_type),
  importanceIdx: index('competitor_activities_importance_idx').on(table.importance),
  detectedAtIdx: index('competitor_activities_detected_at_idx').on(table.detected_at),
}));

// Competitor Activities Relations
export const competitorActivitiesRelations = relations(competitorActivities, ({ one }) => ({
  competitor: one(competitorProfiles, {
    fields: [competitorActivities.competitor_id],
    references: [competitorProfiles.id],
  }),
  user: one(users, {
    fields: [competitorActivities.user_id],
    references: [users.id],
  }),
}));

// Chat Conversations table
export const chatConversations = pgTable('chat_conversations', {
  id: varchar('id', { length: 255 }).primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  agent_id: varchar('agent_id', { length: 50 }).notNull(),
  agent_name: varchar('agent_name', { length: 100 }).notNull(),
  last_message: text('last_message'),
  last_message_at: timestamp('last_message_at'),
  message_count: integer('message_count').default(0),
  is_archived: boolean('is_archived').default(false),
  metadata: jsonb('metadata').default('{}'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('chat_conversations_user_id_idx').on(table.user_id),
  agentIdIdx: index('chat_conversations_agent_id_idx').on(table.agent_id),
  lastMessageAtIdx: index('chat_conversations_last_message_at_idx').on(table.last_message_at),
  isArchivedIdx: index('chat_conversations_is_archived_idx').on(table.is_archived),
}));

// Chat Conversations Relations
export const chatConversationsRelations = relations(chatConversations, ({ one, many }) => ({
  user: one(users, {
    fields: [chatConversations.user_id],
    references: [users.id],
  }),
  messages: many(chatMessages),
}));

// Chat Messages table
export const chatMessages = pgTable('chat_messages', {
  id: varchar('id', { length: 255 }).primaryKey(),
  conversation_id: varchar('conversation_id', { length: 255 }).notNull().references(() => chatConversations.id, { onDelete: 'cascade' }),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull(), // 'user' or 'assistant'
  content: text('content').notNull(),
  metadata: jsonb('metadata').default('{}'),
  created_at: timestamp('created_at').defaultNow(),
}, (table) => ({
  conversationIdIdx: index('chat_messages_conversation_id_idx').on(table.conversation_id),
  userIdIdx: index('chat_messages_user_id_idx').on(table.user_id),
  roleIdx: index('chat_messages_role_idx').on(table.role),
  createdAtIdx: index('chat_messages_created_at_idx').on(table.created_at),
}));

// Chat Messages Relations
export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  conversation: one(chatConversations, {
    fields: [chatMessages.conversation_id],
    references: [chatConversations.id],
  }),
  user: one(users, {
    fields: [chatMessages.user_id],
    references: [users.id],
  }),
}));

// Workflows table
export const workflows = pgTable('workflows', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  version: varchar('version', { length: 50 }).default('1.0.0'),
  status: varchar('status', { length: 50 }).default('draft'),
  trigger_type: varchar('trigger_type', { length: 100 }).notNull(),
  trigger_config: jsonb('trigger_config').default('{}'),
  nodes: jsonb('nodes').default('[]'),
  edges: jsonb('edges').default('[]'),
  variables: jsonb('variables').default('{}'),
  settings: jsonb('settings').default('{}'),
  category: varchar('category', { length: 100 }).default('general'),
  tags: jsonb('tags').default('[]'),
  template_id: integer('template_id'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Workflow executions table
export const workflowExecutions = pgTable('workflow_executions', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  workflow_id: integer('workflow_id').notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 50 }).default('running'),
  started_at: timestamp('started_at').defaultNow(),
  completed_at: timestamp('completed_at'),
  duration: integer('duration'), // in milliseconds
  input: jsonb('input').default('{}'),
  output: jsonb('output').default('{}'),
  variables: jsonb('variables').default('{}'),
  options: jsonb('options').default('{}'),
  error: jsonb('error'),
  logs: jsonb('logs').default('[]'),
  created_at: timestamp('created_at').defaultNow(),
});

// Workflow templates table
export const workflowTemplates = pgTable('workflow_templates', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }).default('general'),
  tags: jsonb('tags').default('[]'),
  workflow_data: jsonb('workflow_data').notNull(),
  is_public: boolean('is_public').default(false),
  featured: boolean('featured').default(false),
  created_by: varchar('created_by', { length: 255 }).references(() => users.id),
  usage_count: integer('usage_count').default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Template downloads table
export const templateDownloads = pgTable('template_downloads', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  template_id: integer('template_id').notNull().references(() => workflowTemplates.id, { onDelete: 'cascade' }),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  downloaded_at: timestamp('downloaded_at').defaultNow(),
});

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
});

// Focus sessions table
export const focusSessions = pgTable('focus_sessions', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  started_at: timestamp('started_at').defaultNow(),
  ended_at: timestamp('ended_at'),
  duration_minutes: integer('duration_minutes'),
  task_id: text('task_id').references(() => tasks.id),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow(),
});

// Notification jobs table
export const notificationJobs = pgTable('notification_jobs', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),
  icon: varchar('icon', { length: 500 }),
  badge: varchar('badge', { length: 500 }),
  image: varchar('image', { length: 500 }),
  tag: varchar('tag', { length: 100 }),
  require_interaction: boolean('require_interaction').default(false),
  silent: boolean('silent').default(false),
  vibrate: jsonb('vibrate'),
  user_ids: jsonb('user_ids').default('[]'),
  all_users: boolean('all_users').default(false),
  scheduled_time: timestamp('scheduled_time').defaultNow(),
  created_at: timestamp('created_at').defaultNow(),
  created_by: varchar('created_by', { length: 255 }),
  attempts: integer('attempts').default(0),
  max_attempts: integer('max_attempts').default(3),
  status: varchar('status', { length: 50 }).default('pending'),
  error: text('error'),
  processed_at: timestamp('processed_at'),
});

// User Sessions table for cookie-based auth
export const userSessions = pgTable('user_sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  refresh_token: varchar('refresh_token', { length: 500 }).notNull().unique(),
  device_fingerprint: varchar('device_fingerprint', { length: 255 }).notNull(),
  device_name: varchar('device_name', { length: 255 }),
  device_type: varchar('device_type', { length: 50 }),
  ip_address: varchar('ip_address', { length: 45 }),
  user_agent: text('user_agent'),
  is_remember_me: boolean('is_remember_me').default(false),
  remember_me_expires_at: timestamp('remember_me_expires_at'),
  last_activity: timestamp('last_activity').defaultNow(),
  expires_at: timestamp('expires_at').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('user_sessions_user_id_idx').on(table.user_id),
  refreshTokenIdx: index('user_sessions_refresh_token_idx').on(table.refresh_token),
  deviceFingerprintIdx: index('user_sessions_device_fingerprint_idx').on(table.device_fingerprint),
  expiresAtIdx: index('user_sessions_expires_at_idx').on(table.expires_at),
  lastActivityIdx: index('user_sessions_last_activity_idx').on(table.last_activity),
}));

// Password reset tokens table
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expires_at: timestamp('expires_at').notNull(),
  used_at: timestamp('used_at'),
  ip_address: varchar('ip_address', { length: 45 }),
  user_agent: text('user_agent'),
  created_at: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('password_reset_tokens_user_id_idx').on(table.user_id),
  tokenIdx: index('password_reset_tokens_token_idx').on(table.token),
  expiresAtIdx: index('password_reset_tokens_expires_at_idx').on(table.expires_at),
  usedAtIdx: index('password_reset_tokens_used_at_idx').on(table.used_at),
}));

// User 2FA/MFA settings table
export const userMfaSettings = pgTable('user_mfa_settings', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  totp_secret: varchar('totp_secret', { length: 255 }),
  totp_enabled: boolean('totp_enabled').default(false),
  totp_backup_codes: jsonb('totp_backup_codes').default('[]'),
  webauthn_enabled: boolean('webauthn_enabled').default(false),
  webauthn_credentials: jsonb('webauthn_credentials').default('[]'),
  recovery_codes: jsonb('recovery_codes').default('[]'),
  mfa_required: boolean('mfa_required').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('user_mfa_settings_user_id_idx').on(table.user_id),
  totpEnabledIdx: index('user_mfa_settings_totp_enabled_idx').on(table.totp_enabled),
  webauthnEnabledIdx: index('user_mfa_settings_webauthn_enabled_idx').on(table.webauthn_enabled),
}));

// Device approvals table
export const deviceApprovals = pgTable('device_approvals', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  device_fingerprint: varchar('device_fingerprint', { length: 255 }).notNull(),
  device_name: varchar('device_name', { length: 255 }),
  device_type: varchar('device_type', { length: 50 }),
  ip_address: varchar('ip_address', { length: 45 }),
  user_agent: text('user_agent'),
  is_approved: boolean('is_approved').default(false),
  approved_at: timestamp('approved_at'),
  approved_by: varchar('approved_by', { length: 255 }).references(() => users.id),
  expires_at: timestamp('expires_at'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('device_approvals_user_id_idx').on(table.user_id),
  deviceFingerprintIdx: index('device_approvals_device_fingerprint_idx').on(table.device_fingerprint),
  isApprovedIdx: index('device_approvals_is_approved_idx').on(table.is_approved),
  expiresAtIdx: index('device_approvals_expires_at_idx').on(table.expires_at),
}));

export const workflowRelations = relations(workflows, ({ one, many }) => ({
  user: one(users, {
    fields: [workflows.user_id],
    references: [users.id],
  }),
  executions: many(workflowExecutions),
  template: one(workflowTemplates, {
    fields: [workflows.template_id],
    references: [workflowTemplates.id],
  }),
}));

export const workflowExecutionRelations = relations(workflowExecutions, ({ one }) => ({
  workflow: one(workflows, {
    fields: [workflowExecutions.workflow_id],
    references: [workflows.id],
  }),
  user: one(users, {
    fields: [workflowExecutions.user_id],
    references: [users.id],
  }),
}));

export const workflowTemplateRelations = relations(workflowTemplates, ({ one, many }) => ({
  creator: one(users, {
    fields: [workflowTemplates.created_by],
    references: [users.id],
  }),
  downloads: many(templateDownloads),
  workflows: many(workflows),
}));

export const templateDownloadRelations = relations(templateDownloads, ({ one }) => ({
  template: one(workflowTemplates, {
    fields: [templateDownloads.template_id],
    references: [workflowTemplates.id],
  }),
  user: one(users, {
    fields: [templateDownloads.user_id],
    references: [users.id],
  }),
}));

export const achievementRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.user_id],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievement_id],
    references: [achievements.id],
  }),
}));

export const focusSessionRelations = relations(focusSessions, ({ one }) => ({
  user: one(users, {
    fields: [focusSessions.user_id],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [focusSessions.task_id],
    references: [tasks.id],
  }),
}));

export const passwordResetTokenRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.user_id],
    references: [users.id],
  }),
}));

// Analytics Events table
export const analyticsEvents = pgTable('analytics_events', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  event: varchar('event', { length: 100 }).notNull(),
  properties: jsonb('properties').default('{}'),
  timestamp: timestamp('timestamp').defaultNow(),
  session_id: varchar('session_id', { length: 255 }),
  metadata: jsonb('metadata').default('{}'),
}, (table) => ({
  userIdIdx: index('analytics_events_user_id_idx').on(table.user_id),
  eventIdx: index('analytics_events_event_idx').on(table.event),
  timestampIdx: index('analytics_events_timestamp_idx').on(table.timestamp),
}));

export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  user: one(users, {
    fields: [analyticsEvents.user_id],
    references: [users.id],
  }),
}));

// User API Keys table - for users to store their own API keys
export const userApiKeys = pgTable('user_api_keys', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  service: varchar('service', { length: 100 }).notNull(), // e.g., 'openai', 'anthropic', 'google'
  key_value: text('key_value').notNull(), // Encrypted/hashed API key
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('user_api_keys_user_id_idx').on(table.user_id),
  serviceIdx: index('user_api_keys_service_idx').on(table.service),
  userServiceIdx: index('user_api_keys_user_service_idx').on(table.user_id, table.service),
}));


export const feedbackRelations = relations(feedback, ({ one }) => ({
  user: one(users, {
    fields: [feedback.user_id],
    references: [users.id],
  }),
}));

// Global Relations
export const usersRelations = relations(users, ({ many, one }) => ({
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
  scrapingJobs: many(scrapingJobs),
  competitiveOpportunities: many(competitiveOpportunities),
  opportunityActions: many(opportunityActions),
  opportunityMetrics: many(opportunityMetrics),
  competitiveStats: many(userCompetitiveStats),
  documents: many(documents),
  documentFolders: many(documentFolders),
  documentVersions: many(documentVersions),
  documentPermissions: many(documentPermissions),
  documentShareLinks: many(documentShareLinks),
  documentActivity: many(documentActivity),
  brandSettings: one(userBrandSettings),
  pushSubscriptions: many(pushSubscriptions),
  competitorActivities: many(competitorActivities),
  chatConversations: many(chatConversations),
  chatMessages: many(chatMessages),
  passwordResetTokens: many(passwordResetTokens),
  feedback: many(feedback),
}));
