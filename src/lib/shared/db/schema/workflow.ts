
import { uuid, integer, pgTable, varchar, text, timestamp, boolean, jsonb, decimal, index, uniqueIndex, foreignKey, primaryKey, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

// Workflows table
export const workflows = pgTable('workflows', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  version: varchar('version', { length: 50 }).default('1.0.0').notNull(),
  status: varchar('status', { length: 50 }).default('draft').notNull(),
  trigger_type: varchar('trigger_type', { length: 100 }).notNull(),
  trigger_config: jsonb('trigger_config').default('{}').notNull(),
  nodes: jsonb('nodes').default('[]').notNull(),
  edges: jsonb('edges').default('[]').notNull(),
  variables: jsonb('variables').default('{}').notNull(),
  settings: jsonb('settings').default('{}').notNull(),
  category: varchar('category', { length: 100 }).default('general').notNull(),
  tags: jsonb('tags').default('[]').notNull(),
  template_id: uuid('template_id'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('workflows_user_id_idx').on(table.user_id),
}));

// Workflow executions table
export const workflowExecutions = pgTable('workflow_executions', {
  id: uuid('id').defaultRandom().primaryKey(),
  workflow_id: uuid('workflow_id').notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 50 }).default('running').notNull(),
  started_at: timestamp('started_at').defaultNow().notNull(),
  completed_at: timestamp('completed_at'),
  duration: integer('duration'), // in milliseconds
  input: jsonb('input').default('{}').notNull(),
  output: jsonb('output').default('{}').notNull(),
  variables: jsonb('variables').default('{}').notNull(),
  options: jsonb('options').default('{}').notNull(),
  error: jsonb('error'),
  logs: jsonb('logs').default('[]').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  workflowIdIdx: index('workflow_exec_workflow_id_idx').on(table.workflow_id),
  userIdIdx: index('workflow_exec_user_id_idx').on(table.user_id),
}));

// Workflow templates table
export const workflowTemplates = pgTable('workflow_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }).default('general').notNull(),
  tags: jsonb('tags').default('[]').notNull(),
  workflow_data: jsonb('workflow_data').notNull(),
  is_public: boolean('is_public').default(false).notNull(),
  featured: boolean('featured').default(false).notNull(),
  created_by: varchar('created_by', { length: 255 }).references(() => users.id),
  usage_count: integer('usage_count').default(0).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index('workflow_temp_category_idx').on(table.category),
}));

// Template downloads table
export const templateDownloads = pgTable('template_downloads', {
  id: uuid('id').defaultRandom().primaryKey(),
  template_id: uuid('template_id').notNull().references(() => workflowTemplates.id, { onDelete: 'cascade' }),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  downloaded_at: timestamp('downloaded_at').defaultNow().notNull(),
}, (table) => ({
  templateIdIdx: index('template_down_template_id_idx').on(table.template_id),
  userIdIdx: index('template_down_user_id_idx').on(table.user_id),
}));

// Collaboration Sessions table
export const collaborationSessions = pgTable('collaboration_sessions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  goal: text('goal').notNull(),
  status: varchar('status', { length: 50 }).default('active').notNull(), // active, paused, completed, archived
  configuration: jsonb('configuration').default('{}').notNull(),
  metadata: jsonb('metadata').default('{}').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('collaboration_sessions_user_id_idx').on(table.user_id),
}));

// Collaboration Participants table
export const collaborationParticipants = pgTable('collaboration_participants', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  session_id: text('session_id').notNull().references(() => collaborationSessions.id, { onDelete: 'cascade' }),
  agent_id: varchar('agent_id', { length: 50 }).notNull(), // e.g., 'roxy', 'echo'
  role: varchar('role', { length: 50 }).default('member').notNull(),
  joined_at: timestamp('joined_at').defaultNow().notNull(),
}, (table) => ({
  sessionIdIdx: index('collaboration_participants_session_id_idx').on(table.session_id),
  agentIdIdx: index('collaboration_participants_agent_id_idx').on(table.agent_id),
}));

// Collaboration Messages table
export const collaborationMessages = pgTable('collaboration_messages', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  session_id: text('session_id').notNull().references(() => collaborationSessions.id, { onDelete: 'cascade' }),
  from_agent_id: varchar('from_agent_id', { length: 50 }).notNull(), // 'user' or agent_id
  content: text('content').notNull(),
  message_type: varchar('message_type', { length: 50 }).default('text').notNull(), // text, tool_use, tool_result, system
  metadata: jsonb('metadata').default('{}').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  sessionIdIdx: index('collaboration_messages_session_id_idx').on(table.session_id),
  createdAtIdx: index('collaboration_messages_created_at_idx').on(table.created_at),
}));

// Collaboration Checkpoints table
export const collaborationCheckpoints = pgTable('collaboration_checkpoints', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  session_id: text('session_id').notNull().references(() => collaborationSessions.id, { onDelete: 'cascade' }),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  state: jsonb('state').notNull(),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  sessionIdIdx: index('collaboration_checkpoints_session_id_idx').on(table.session_id),
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
  message_count: integer('message_count').default(0).notNull(),
  is_archived: boolean('is_archived').default(false).notNull(),
  metadata: jsonb('metadata').default('{}').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('chat_conversations_user_id_idx').on(table.user_id),
  agentIdIdx: index('chat_conversations_agent_id_idx').on(table.agent_id),
  lastMessageAtIdx: index('chat_conversations_last_message_at_idx').on(table.last_message_at),
  isArchivedIdx: index('chat_conversations_is_archived_idx').on(table.is_archived),
}));

// Chat Messages table
export const chatMessages = pgTable('chat_messages', {
  id: varchar('id', { length: 255 }).primaryKey(),
  conversation_id: varchar('conversation_id', { length: 255 }).notNull().references(() => chatConversations.id, { onDelete: 'cascade' }),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull(), // 'user' or 'assistant'
  content: text('content').notNull(),
  metadata: jsonb('metadata').default('{}').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  conversationIdIdx: index('chat_messages_conversation_id_idx').on(table.conversation_id),
  userIdIdx: index('chat_messages_user_id_idx').on(table.user_id),
  roleIdx: index('chat_messages_role_idx').on(table.role),
  createdAtIdx: index('chat_messages_created_at_idx').on(table.created_at),
}));

// Notification jobs table
export const notificationJobs = pgTable('notification_jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),
  icon: varchar('icon', { length: 500 }),
  badge: varchar('badge', { length: 500 }),
  image: varchar('image', { length: 500 }),
  tag: varchar('tag', { length: 100 }),
  require_interaction: boolean('require_interaction').default(false).notNull(),
  silent: boolean('silent').default(false).notNull(),
  vibrate: jsonb('vibrate').default('[]').notNull(),
  user_ids: jsonb('user_ids').default('[]').notNull(),
  all_users: boolean('all_users').default(false).notNull(),
  scheduled_time: timestamp('scheduled_time').defaultNow().notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  created_by: varchar('created_by', { length: 255 }),
  attempts: integer('attempts').default(0).notNull(),
  max_attempts: integer('max_attempts').default(3).notNull(),
  status: varchar('status', { length: 50 }).default('pending').notNull(),
  error: text('error'),
  processed_at: timestamp('processed_at'),
});

// Chat History (for long-term storage and retrieval)
export const chatHistory = pgTable("chat_history", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  conversationId: varchar("conversation_id", { length: 255 }).notNull(),
  agentId: varchar("agent_id", { length: 50 }).notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  tokens: integer("tokens"),
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("chat_history_user_id_idx").on(table.userId),
  convIdIdx: index("chat_history_conv_id_idx").on(table.conversationId),
}));

