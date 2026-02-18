
import { integer, pgTable, varchar, text, timestamp, boolean, jsonb, decimal, index, uniqueIndex, foreignKey, primaryKey, pgEnum, vector, serial } from 'drizzle-orm/pg-core';
import { v4 as uuidv4 } from 'uuid';
import { users } from './users.ts';
import { competitorProfiles } from './intelligence.ts'; // For self-reference in intelligenceData if needed, but it's already in the same file.

// Contacts
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  email: text("email"),
  company: text("company"),
  role: text("role"),
  notes: text("notes"),
  linkedinUrl: text("linkedin_url"),
  tags: text("tags").array(),
  lastContact: timestamp("last_contact"),
  relationship: text("relationship"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("contacts_user_id_idx").on(table.userId),
}));

// Competitor Reports
export const competitorReports = pgTable("competitor_reports", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  competitorName: text("competitor_name").notNull(),
  threatLevel: text("threat_level"),
  missionBrief: text("mission_brief"),
  intel: jsonb("intel").default('[]').notNull(),
  vulnerabilities: jsonb("vulnerabilities").default('[]').notNull(),
  strengths: jsonb("strengths").default('[]').notNull(),
  metrics: jsonb("metrics").default('{}').notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("competitor_reports_user_id_idx").on(table.userId),
}));

// Pivot Analyses
export const pivotAnalyses = pgTable("pivot_analyses", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  gaps: jsonb("gaps").default('[]').notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("pivot_analyses_user_id_idx").on(table.userId),
}));

// Business Context (Unified Context for Agents)
export const businessContext = pgTable("business_context", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  contextType: varchar("context_type", { length: 50 }).notNull(), // goals, values, mission, operations
  content: text("content").notNull(),
  metadata: jsonb("metadata").default('{}').notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("business_context_user_id_idx").on(table.userId),
  typeIdx: index("business_context_type_idx").on(table.contextType),
}));

// Daily Intelligence
export const dailyIntelligence = pgTable("daily_intelligence", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: timestamp("date").defaultNow().notNull(),
  summary: text("summary").notNull(),
  highlights: jsonb("highlights").default('[]').notNull(),
  priorityActions: jsonb("priority_actions").default('[]').notNull(),
  alerts: jsonb("alerts").default('[]').notNull(),
  motivationalMessage: text("motivational_message"),
  riskLevel: varchar("risk_level", { length: 20 }).default('low').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("daily_intel_user_id_idx").on(table.userId),
  dateIdx: index("daily_intel_date_idx").on(table.date),
}));

// Market Intelligence Cache
export const marketIntelligenceCache = pgTable("market_intelligence_cache", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  query: text("query").notNull(),
  results: jsonb("results").notNull(),
  source: varchar("source", { length: 50 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  queryIdx: index("market_intel_query_idx").on(table.query),
}));

// Competitor News Articles
export const competitorNewsArticles = pgTable("competitor_news_articles", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  competitorId: text("competitor_id").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  content: text("content"),
  sentiment: decimal("sentiment", { precision: 3, scale: 2 }),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  competitorIdIdx: index("competitor_news_comp_id_idx").on(table.competitorId),
}));

// Competitor Social Mentions
export const competitorSocialMentions = pgTable("competitor_social_mentions", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  competitorId: text("competitor_id").notNull(),
  platform: varchar("platform", { length: 50 }).notNull(),
  content: text("content").notNull(),
  author: varchar("author", { length: 100 }),
  engagement: integer("engagement").default(0).notNull(),
  mentionDate: timestamp("mention_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  competitorIdIdx: index("competitor_social_comp_id_idx").on(table.competitorId),
}));

// Search Index table for RAG and global search
export const searchIndex = pgTable("search_index", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  entityType: varchar("entity_type", { length: 50 }).notNull(), // e.g., 'document', 'competitor', 'task'
  entityId: text("entity_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  tags: jsonb("tags").default('[]').notNull(),
  metadata: jsonb("metadata").default('{}').notNull(),
  embedding: vector("embedding", { dimensions: 1536 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("search_index_user_id_idx").on(table.userId),
  entityTypeIdx: index("search_index_entity_type_idx").on(table.entityType),
  entityIdIdx: index("search_index_entity_id_idx").on(table.entityId),
}));

// Competitors table (Simple)
export const competitors = pgTable('competitors', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  website: varchar('website', { length: 500 }),
  description: text('description'),
  strengths: jsonb('strengths').default('[]').notNull(),
  weaknesses: jsonb('weaknesses').default('[]').notNull(),
  opportunities: jsonb('opportunities').default('[]').notNull(),
  threats: jsonb('threats').default('[]').notNull(),
  market_position: varchar('market_position', { length: 100 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('competitors_user_id_idx').on(table.user_id),
}));

// Competitor Profiles table (Detailed)
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
  social_media_handles: jsonb('social_media_handles').default('{}').notNull(),
  key_personnel: jsonb('key_personnel').default('[]').notNull(),
  products: jsonb('products').default('[]').notNull(),
  market_position: jsonb('market_position').default('{}').notNull(),
  competitive_advantages: jsonb('competitive_advantages').default('[]').notNull(),
  vulnerabilities: jsonb('vulnerabilities').default('[]').notNull(),
  monitoring_config: jsonb('monitoring_config').default('{}').notNull(),
  last_analyzed: timestamp('last_analyzed'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
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
  extracted_data: jsonb('extracted_data').default('{}').notNull(),
  analysis_results: jsonb('analysis_results').default('[]').notNull(),
  confidence: decimal('confidence', { precision: 3, scale: 2 }).default('0.00').notNull(),
  importance: varchar('importance', { length: 20 }).notNull().default('medium'),
  tags: jsonb('tags').default('[]').notNull(),
  collected_at: timestamp('collected_at').defaultNow().notNull(),
  processed_at: timestamp('processed_at'),
  expires_at: timestamp('expires_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
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
  source_data: jsonb('source_data').default('{}').notNull(),
  action_items: jsonb('action_items').default('[]').notNull(),
  recommended_actions: jsonb('recommended_actions').default('[]').notNull(),
  is_read: boolean('is_read').default(false).notNull(),
  is_archived: boolean('is_archived').default(false).notNull(),
  acknowledged_at: timestamp('acknowledged_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
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
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
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
  completed_at: timestamp('completed_at').defaultNow().notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
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
  evidence: jsonb('evidence').default('[]').notNull(),
  recommendations: jsonb('recommendations').default('[]').notNull(),
  status: varchar('status', { length: 50 }).default('identified').notNull(),
  assigned_to: text('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  implementation_notes: text('implementation_notes'),
  roi_estimate: decimal('roi_estimate', { precision: 10, scale: 2 }),
  actual_roi: decimal('actual_roi', { precision: 10, scale: 2 }),
  success_metrics: jsonb('success_metrics').default('{}').notNull(),
  tags: jsonb('tags').default('[]').notNull(),
  is_archived: boolean('is_archived').default(false).notNull(),
  detected_at: timestamp('detected_at').defaultNow().notNull(),
  started_at: timestamp('started_at'),
  completed_at: timestamp('completed_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
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
  priority: varchar('priority', { length: 20 }).default('medium').notNull(),
  estimated_effort_hours: integer('estimated_effort_hours'),
  actual_effort_hours: integer('actual_effort_hours'),
  estimated_cost: decimal('estimated_cost', { precision: 10, scale: 2 }),
  actual_cost: decimal('actual_cost', { precision: 10, scale: 2 }),
  expected_outcome: text('expected_outcome'),
  actual_outcome: text('actual_outcome'),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  due_date: timestamp('due_date'),
  completed_at: timestamp('completed_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
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
  measurement_date: timestamp('measurement_date').defaultNow().notNull(),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  opportunityIdIdx: index('opportunity_metrics_opportunity_id_idx').on(table.opportunity_id),
  userIdIdx: index('opportunity_metrics_user_id_idx').on(table.user_id),
  metricNameIdx: index('opportunity_metrics_metric_name_idx').on(table.metric_name),
  measurementDateIdx: index('opportunity_metrics_measurement_date_idx').on(table.measurement_date),
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
    confidence: decimal('confidence', { precision: 3, scale: 2 }).default('0.00').notNull(),
    metadata: jsonb('metadata').default('{}').notNull(),
    tags: jsonb('tags').default('[]').notNull(),
    detected_at: timestamp('detected_at').defaultNow().notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  }, (table) => ({
    competitorIdIdx: index('competitor_activities_competitor_id_idx').on(table.competitor_id),
    userIdIdx: index('competitor_activities_user_id_idx').on(table.user_id),
    activityTypeIdx: index('competitor_activities_activity_type_idx').on(table.activity_type),
    importanceIdx: index('competitor_activities_importance_idx').on(table.importance),
    detectedAtIdx: index('competitor_activities_detected_at_idx').on(table.detected_at),
  }));
