
import { relations } from 'drizzle-orm';
import * as users from '../users';
import * as content from '../content';

export const documentsRelations = relations(content.documents, ({ one, many }) => ({
  user: one(users.users, {
    fields: [content.documents.user_id],
    references: [users.users.id],
  }),
  folder: one(content.documentFolders, {
    fields: [content.documents.folder_id],
    references: [content.documentFolders.id],
  }),
  versions: many(content.documentVersions),
  permissions: many(content.documentPermissions),
  shareLinks: many(content.documentShareLinks),
  activity: many(content.documentActivity),
}));

export const documentFoldersRelations = relations(content.documentFolders, ({ one, many }) => ({
  user: one(users.users, {
    fields: [content.documentFolders.user_id],
    references: [users.users.id],
  }),
  parent: one(content.documentFolders, {
    fields: [content.documentFolders.parent_id],
    references: [content.documentFolders.id],
  }),
  children: many(content.documentFolders),
  documents: many(content.documents),
}));

export const documentVersionsRelations = relations(content.documentVersions, ({ one }) => ({
  document: one(content.documents, {
    fields: [content.documentVersions.document_id],
    references: [content.documents.id],
  }),
  createdBy: one(users.users, {
    fields: [content.documentVersions.created_by],
    references: [users.users.id],
  }),
}));

export const documentPermissionsRelations = relations(content.documentPermissions, ({ one }) => ({
  document: one(content.documents, {
    fields: [content.documentPermissions.document_id],
    references: [content.documents.id],
  }),
  user: one(users.users, {
    fields: [content.documentPermissions.user_id],
    references: [users.users.id],
  }),
  grantedBy: one(users.users, {
    fields: [content.documentPermissions.granted_by],
    references: [users.users.id],
  }),
}));

export const documentShareLinksRelations = relations(content.documentShareLinks, ({ one }) => ({
  document: one(content.documents, {
    fields: [content.documentShareLinks.document_id],
    references: [content.documents.id],
  }),
  createdBy: one(users.users, {
    fields: [content.documentShareLinks.created_by],
    references: [users.users.id],
  }),
}));

export const documentActivityRelations = relations(content.documentActivity, ({ one }) => ({
  document: one(content.documents, {
    fields: [content.documentActivity.document_id],
    references: [content.documents.id],
  }),
  user: one(users.users, {
    fields: [content.documentActivity.user_id],
    references: [users.users.id],
  }),
}));

export const feedbackRelations = relations(content.feedback, ({ one }) => ({
   user: one(users.users, {
    fields: [content.feedback.user_id],
    references: [users.users.id],
  }),
}));

export const learningPathsRelations = relations(content.learningPaths, ({ one, many }) => ({
  creator: one(users.users, {
    fields: [content.learningPaths.created_by],
    references: [users.users.id],
  }),
  modules: many(content.learningModules),
}));

export const learningModulesRelations = relations(content.learningModules, ({ one }) => ({
  path: one(content.learningPaths, {
    fields: [content.learningModules.path_id],
    references: [content.learningPaths.id],
  }),
}));

export const userLearningProgressRelations = relations(content.userLearningProgress, ({ one }) => ({
  user: one(users.users, {
    fields: [content.userLearningProgress.user_id],
    references: [users.users.id],
  }),
  module: one(content.learningModules, {
    fields: [content.userLearningProgress.module_id],
    references: [content.learningModules.id],
  }),
}));
