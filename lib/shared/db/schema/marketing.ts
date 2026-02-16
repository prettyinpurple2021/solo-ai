import { pgTable, text, varchar, timestamp, jsonb, integer, index } from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from 'uuid';
import { users } from './users';

// Marketing Campaigns
export const campaigns = pgTable("campaigns", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default('planned'), // planned, active, completed, paused
  channels: jsonb("channels").default([]),
  budget: integer("budget"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("campaigns_user_id_idx").on(table.userId),
}));

// Creative Assets
export const creativeAssets = pgTable("creative_assets", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  campaignId: text("campaign_id").references(() => campaigns.id, { onDelete: 'set null' }),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // image, video, copy, etc.
  url: varchar("url", { length: 1000 }),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("creative_assets_user_id_idx").on(table.userId),
  campaignIdIdx: index("creative_assets_campaign_id_idx").on(table.campaignId),
}));
