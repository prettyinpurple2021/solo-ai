import { integer, pgTable, varchar, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
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

// Tasks table
export const tasks = pgTable('tasks', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  goal_id: integer('goal_id').references(() => goals.id, { onDelete: 'cascade' }),
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

// Posts table (existing)
export const posts = pgTable('posts', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull().default(''),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  briefcases: many(briefcases),
  goals: many(goals),
  tasks: many(tasks),
  templates: many(templates),
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

export const tasksRelations = relations(tasks, ({ one }) => ({
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
}));

export const templatesRelations = relations(templates, ({ one }) => ({
  user: one(users, {
    fields: [templates.user_id],
    references: [users.id],
  }),
}));