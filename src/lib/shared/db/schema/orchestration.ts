
import { pgTable, text, varchar, timestamp, jsonb, index, foreignKey, serial, integer, boolean, uniqueIndex } from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from 'uuid';
import { users } from './users';

// Boardroom Sessions
export const boardroomSessions = pgTable("boardroom_sessions", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 255 }).notNull(),
  goal: text("goal").notNull(),
  status: varchar("status", { length: 50 }).default('active').notNull(),
  config: jsonb("config").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  sessionIdIdx: index("boardroom_messages_session_id_idx").on(table.sessionId),
  agentIdIdx: index("boardroom_messages_agent_id_idx").on(table.agentId),
}));

// War Room Sessions
export const warRoomSessions = pgTable("war_room_sessions", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  topic: text("topic").notNull(),
  status: varchar("status", { length: 50 }).default('active').notNull(),
  consensus: text("consensus"),
  actionPlan: jsonb("action_plan").default([]).notNull(),
  dialogue: jsonb("dialogue").default([]).notNull(),
  state: jsonb("state").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
  version: varchar("version", { length: 20 }).default('1.0.0').notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("agent_inst_user_id_idx").on(table.userId),
  agentIdIdx: index("agent_inst_agent_id_idx").on(table.agentId),
}));

// Tribe Blueprints
export const tribeBlueprints = pgTable("tribe_blueprints", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  members: jsonb("members").default([]).notNull(),
  roles: jsonb("roles").default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
  grades: jsonb("grades").default({}).notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("board_reports_user_id_idx").on(table.userId),
}));

// Agent Memory (Long-term persistent state for agents)
export const agentMemory = pgTable("agent_memory", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  agentId: varchar("agent_id", { length: 50 }).notNull(),
  memory: jsonb("memory").default({}).notNull(), // Stores context, history, preferences, relationships
  lastInteraction: timestamp("last_interaction").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdAgentIdIdx: uniqueIndex("agent_memory_user_agent_idx").on(table.userId, table.agentId),
}));

// Agent Actions (For tracking tool use and human-in-the-loop approvals)
export const agentActions = pgTable("agent_actions", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  agentId: varchar("agent_id", { length: 50 }).notNull(),
  actionType: varchar("action_type", { length: 100 }).notNull(), // sendEmail, scheduleMeeting, etc.
  status: varchar("status", { length: 50 }).default('pending_approval').notNull(), // pending_approval, approved, rejected, executing, completed, failed
  payload: jsonb("payload").default({}).notNull(), // The parameters for the tool
  result: jsonb("result").default({}), // The result of execution
  error: text("error"),
  requiresApproval: boolean("requires_approval").default(true).notNull(),
  approvedAt: timestamp("approved_at"),
  executedAt: timestamp("executed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("agent_actions_user_id_idx").on(table.userId),
  statusIdx: index("agent_actions_status_idx").on(table.status),
}));
