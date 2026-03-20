import { pgTable, text, varchar, timestamp, jsonb, integer, index, serial, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from './users';

// Marketing Campaigns
export const campaigns = pgTable("campaigns", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default('planned').notNull(), // planned, active, completed, paused
  channels: jsonb("channels").default([]).notNull(),
  budget: integer("budget"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("campaigns_user_id_idx").on(table.userId),
}));

// Creative Assets
export const creativeAssets = pgTable("creative_assets", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  campaignId: text("campaign_id").references(() => campaigns.id, { onDelete: 'set null' }),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // image, video, copy, etc.
  url: varchar("url", { length: 1000 }),
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("creative_assets_user_id_idx").on(table.userId),
  campaignIdIdx: index("creative_assets_campaign_id_idx").on(table.campaignId),
}));

/** Newsletter signups (was created at request-time; now migrated — see `migrations/0003_api_tables_baseline.sql`) */
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  source: varchar("source", { length: 255 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

/** Admin push send audit log */
export const notificationLogs = pgTable("notification_logs", {
  id: serial("id").primaryKey(),
  sent_by: varchar("sent_by", { length: 255 }),
  title: text("title"),
  body: text("body"),
  target_count: integer("target_count"),
  success_count: integer("success_count"),
  error_count: integer("error_count"),
  payload: jsonb("payload"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const exitIntentSurveys = pgTable("exit_intent_surveys", {
  id: serial("id").primaryKey(),
  user_id: varchar("user_id", { length: 255 }),
  role: varchar("role", { length: 120 }),
  goal: text("goal"),
  blocker: text("blocker"),
  email: varchar("email", { length: 255 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const userSurveyStatus = pgTable("user_survey_status", {
  id: serial("id").primaryKey(),
  user_id: varchar("user_id", { length: 255 }),
  survey_type: varchar("survey_type", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userSurveyUnique: uniqueIndex("user_survey_status_user_id_survey_type_key").on(
    table.user_id,
    table.survey_type,
  ),
}));
