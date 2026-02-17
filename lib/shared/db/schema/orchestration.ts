
import { pgTable, text, varchar, timestamp, jsonb, index, foreignKey, serial, integer, boolean, uniqueIndex } from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from 'uuid';
import { users } from './users';

// Boardroom Sessions
export const boardroomSessions = pgTable("boardroom_sessions", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 255 }).notNull(),
  goal: text("goal").notNull(),
  status: varchar("status", { length: 50 }).default('active'),
  config: jsonb("config").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("boardroom_sessions_user_id_idx").on(table.userId),
}));

// Boardroom Messages
export const boardroomMessages = pgTable("boardroom_messages", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  sessionId: text("session_id").notNull().references(() => boardroomSessions.id, { onDelete: 'cascade' }),
  agentId: varchar("agent_id", { length: 50 }).notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  sessionIdIdx: index("boardroom_messages_session_id_idx").on(table.sessionId),
}));

// War Room Sessions
export const warRoomSessions = pgTable("war_room_sessions", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  topic: text("topic").notNull(),
  status: varchar("status", { length: 50 }).default('active'),
  consensus: text("consensus"),
  actionPlan: jsonb("action_plan").default([]),
  dialogue: jsonb("dialogue").default([]),
  state: jsonb("state").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("war_room_sessions_user_id_idx").on(table.userId),
}));

// Agent Instructions
export const agentInstructions = pgTable("agent_instructions", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  agentId: varchar("agent_id", { length: 50 }).notNull(),
  agentRole: varchar("agent_role", { length: 50 }),
  instruction: text("instruction").notNull(),
  version: varchar("version", { length: 20 }).default('1.0.0'),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("agent_inst_user_id_idx").on(table.userId),
}));

// Tribe Blueprints
export const tribeBlueprints = pgTable("tribe_blueprints", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  members: jsonb("members").default([]),
  roles: jsonb("roles").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("tribe_blueprints_user_id_idx").on(table.userId),
}));

// Board Reports
export const boardReports = pgTable("board_reports", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  ceoScore: integer("ceo_score"),
  consensus: text("consensus"),
  executiveSummary: text("executive_summary"),
  grades: jsonb("grades").default({}),
  generatedAt: timestamp("generated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("board_reports_user_id_idx").on(table.userId),
}));

// Agent Memory (Long-term persistent state for agents)
export const agentMemory = pgTable("agent_memory", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  agentId: varchar("agent_id", { length: 50 }).notNull(),
  memory: jsonb("memory").default({}), // Stores context, history, preferences, relationships
  lastInteraction: timestamp("last_interaction").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdAgentIdIdx: uniqueIndex("agent_memory_user_agent_idx").on(table.userId, table.agentId),
}));

