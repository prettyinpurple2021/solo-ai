
import { integer, pgTable, varchar, text, timestamp, boolean, jsonb, decimal, index, uniqueIndex, foreignKey, primaryKey, pgEnum, vector } from 'drizzle-orm/pg-core';
import { v4 as uuidv4 } from 'uuid';
import { users } from './users';

// Pitch Decks table
export const pitchDecks = pgTable("pitch_decks", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  theme: varchar("theme", { length: 50 }).notNull().default('modern'),
  thumbnail: varchar("thumbnail", { length: 1000 }),
  isPublic: boolean("is_public").notNull().default(false),
  isTemplate: boolean("is_template").notNull().default(false),
  version: integer("version").notNull().default(1),
  status: varchar("status", { length: 50 }).notNull().default('draft'),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("pitch_decks_user_id_idx").on(table.userId),
  statusIdx: index("pitch_decks_status_idx").on(table.status),
}));

// Slides table
export const slides = pgTable("slides", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  deckId: text("deck_id").notNull().references(() => pitchDecks.id, { onDelete: 'cascade' }),
  order: integer("order").notNull(),
  layout: varchar("layout", { length: 50 }).notNull().default('blank'),
  title: varchar("title", { length: 255 }),
  content: jsonb("content").notNull().default({}),
  notes: text("notes"),
  isVisible: boolean("is_visible").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  deckIdIdx: index("slides_deck_id_idx").on(table.deckId),
  deckOrderIdx: index("slides_deck_order_idx").on(table.deckId, table.order),
}));

// Slide Components table
export const slideComponents = pgTable("slide_components", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  slideId: text("slide_id").notNull().references(() => slides.id, { onDelete: 'cascade' }),
  type: varchar("type", { length: 50 }).notNull(),
  content: jsonb("content").notNull(),
  position: jsonb("position").notNull(), // x, y, width, height, rotation
  style: jsonb("style").notNull().default({}),
  animation: jsonb("animation").notNull().default({}),
  zIndex: integer("z_index").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  slideIdIdx: index("slide_components_slide_id_idx").on(table.slideId),
}));

// Training History
export const trainingHistory = pgTable("training_history", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  moduleId: text("module_id").notNull(),
  score: integer("score"),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("training_history_user_id_idx").on(table.userId),
  moduleIdIdx: index("training_history_module_id_idx").on(table.moduleId),
}));

// Code Snippets
export const codeSnippets = pgTable("code_snippets", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 255 }).notNull(),
  language: varchar("language", { length: 50 }).notNull(),
  code: text("code").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("code_snippets_user_id_idx").on(table.userId),
  languageIdx: index("code_snippets_language_idx").on(table.language),
}));

// Document Folders table
export const documentFolders = pgTable('document_folders', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  parent_id: text('parent_id'),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  color: varchar('color', { length: 7 }).notNull().default('#8B5CF6'),
  icon: varchar('icon', { length: 50 }),
  is_default: boolean('is_default').notNull().default(false),
  file_count: integer('file_count').notNull().default(0),
  total_size: integer('total_size').notNull().default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('document_folders_user_id_idx').on(table.user_id),
  parentIdIdx: index('document_folders_parent_id_idx').on(table.parent_id),
  nameIdx: index('document_folders_name_idx').on(table.name),
  parentFolderFk: foreignKey({
    columns: [table.parent_id],
    foreignColumns: [table.id],
  }).onDelete('cascade'),
}));

// Documents table
export const documents = pgTable('documents', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  folder_id: text('folder_id').references(() => documentFolders.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  original_name: varchar('original_name', { length: 255 }).notNull(),
  file_type: varchar('file_type', { length: 50 }).notNull(),
  mime_type: varchar('mime_type', { length: 100 }).notNull(),
  size: integer('size').notNull(),
  file_url: varchar('file_url', { length: 1000 }).notNull(), 
  category: varchar('category', { length: 100 }).default('uncategorized').notNull(),
  description: text('description'),
  tags: jsonb('tags').default('[]').notNull(),
  metadata: jsonb('metadata').default('{}').notNull(),
  ai_insights: jsonb('ai_insights').default('{}').notNull(),
  embedding: vector("embedding", { dimensions: 1536 }),
  is_favorite: boolean('is_favorite').default(false).notNull(),
  is_public: boolean('is_public').default(false).notNull(),
  download_count: integer('download_count').default(0).notNull(),
  view_count: integer('view_count').default(0).notNull(),
  last_accessed: timestamp('last_accessed'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('documents_user_id_idx').on(table.user_id),
  folderIdIdx: index('documents_folder_id_idx').on(table.folder_id),
  categoryIdx: index('documents_category_idx').on(table.category),
  fileTypeIdx: index('documents_file_type_idx').on(table.file_type),
  isFavoriteIdx: index('documents_is_favorite_idx').on(table.is_favorite),
  createdAtIdx: index('documents_created_at_idx').on(table.created_at),
  nameIdx: index('documents_name_idx').on(table.name),
}));

// Document Versions table
export const documentVersions = pgTable('document_versions', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  document_id: text('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  version_number: integer('version_number').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  file_type: varchar('file_type', { length: 50 }).notNull(),
  size: integer('size').notNull(),
  file_url: varchar('file_url', { length: 2048 }).notNull(),
  storage_provider: varchar('storage_provider', { length: 50 }),
  checksum: varchar('checksum', { length: 128 }),
  change_summary: text('change_summary'),
  created_by: text('created_by').notNull().references(() => users.id),
  created_at: timestamp('created_at').defaultNow().notNull(),
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
  granted_at: timestamp('granted_at').defaultNow().notNull(),
  expires_at: timestamp('expires_at'),
  is_active: boolean('is_active').default(true).notNull(),
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
  access_count: integer('access_count').default(0).notNull(),
  download_enabled: boolean('download_enabled').default(true).notNull(),
  require_auth: boolean('require_auth').default(false).notNull(),
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
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
  details: jsonb('details').default('{}').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
}, (table) => ({
    documentIdIdx: index('document_activity_document_id_idx').on(table.document_id),
    userIdIdx: index('document_activity_user_id_idx').on(table.user_id),
}));

// Learning Paths table
export const learningPaths = pgTable('learning_paths', {
    id: text('id').primaryKey().$defaultFn(() => uuidv4()),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(),
    category: varchar('category', { length: 100 }).notNull(), // marketing, finance, etc.
    difficulty: varchar('difficulty', { length: 50 }).notNull(), // beginner, intermediate, advanced
    tags: jsonb('tags').default('[]').notNull(),
    created_by: text('created_by').references(() => users.id, { onDelete: 'set null' }),
    is_public: boolean('is_public').notNull().default(false),
    created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index('learning_paths_category_idx').on(table.category),
  difficultyIdx: index('learning_paths_difficulty_idx').on(table.difficulty),
}));
  
export const learningModules = pgTable('learning_modules', {
    id: text('id').primaryKey().$defaultFn(() => uuidv4()),
    path_id: text('path_id').notNull().references(() => learningPaths.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    content: text('content').notNull(), // markdown or video URL
    module_type: varchar('module_type', { length: 50 }).default('article').notNull(), // article, video, quiz
    order: integer('order').notNull(),
    duration_minutes: integer('duration_minutes').default(15).notNull(),
    difficulty: varchar('difficulty', { length: 50 }).default('beginner').notNull(),
    skills_covered: jsonb('skills_covered').default('[]').notNull(),
    prerequisites: jsonb('prerequisites').default('[]').notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  pathIdIdx: index('learning_modules_path_id_idx').on(table.path_id),
}));
  
export const userLearningProgress = pgTable('user_learning_progress', {
    id: text('id').primaryKey().$defaultFn(() => uuidv4()),
    user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    module_id: text('module_id').notNull().references(() => learningModules.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 50 }).default('not_started').notNull(), // in_progress, completed
    metadata: jsonb('metadata').default({}).notNull(),
    last_position: integer('last_position'),
    completed_at: timestamp('completed_at'),
    last_accessed_at: timestamp('last_accessed_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('user_learning_progress_user_id_idx').on(table.user_id),
  moduleIdIdx: index('user_learning_progress_module_id_idx').on(table.module_id),
  userModuleIdx: uniqueIndex('user_learning_progress_user_module_idx').on(table.user_id, table.module_id),
}));
  
// Feedback table
export const feedbackTypeEnum = pgEnum('feedback_type', ['bug', 'feature_request', 'comment', 'error', 'other', 'post_report']);
export const feedbackStatusEnum = pgEnum('feedback_status', ['pending', 'in_progress', 'resolved', 'closed', 'dismissed']);
export const feedback = pgTable('feedback', {
    id: text('id').primaryKey().$defaultFn(() => uuidv4()),
    user_id: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    type: feedbackTypeEnum('type').notNull(),
    title: text('title'),
    message: text('message').notNull(),
    browser_info: jsonb('browser_info'),
    screenshot_url: text('screenshot_url'),
    status: feedbackStatusEnum('status').notNull().default('pending'),
    priority: text('priority').notNull().default('medium'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('feedback_user_id_idx').on(table.user_id),
  statusIdx: index('feedback_status_idx').on(table.status),
}));
