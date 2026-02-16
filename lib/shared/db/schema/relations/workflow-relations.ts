
import { relations } from 'drizzle-orm';
import * as users from '../users';
import * as workflow from '../workflow';

export const collaborationSessionsRelations = relations(workflow.collaborationSessions, ({ one, many }) => ({
  user: one(users.users, {
    fields: [workflow.collaborationSessions.user_id],
    references: [users.users.id],
  }),
  participants: many(workflow.collaborationParticipants),
  messages: many(workflow.collaborationMessages),
}));

export const collaborationParticipantsRelations = relations(workflow.collaborationParticipants, ({ one }) => ({
  session: one(workflow.collaborationSessions, {
    fields: [workflow.collaborationParticipants.session_id],
    references: [workflow.collaborationSessions.id],
  }),
}));

export const collaborationMessagesRelations = relations(workflow.collaborationMessages, ({ one }) => ({
  session: one(workflow.collaborationSessions, {
    fields: [workflow.collaborationMessages.session_id],
    references: [workflow.collaborationSessions.id],
  }),
}));

export const collaborationCheckpointsRelations = relations(workflow.collaborationCheckpoints, ({ one }) => ({
  session: one(workflow.collaborationSessions, {
    fields: [workflow.collaborationCheckpoints.session_id],
    references: [workflow.collaborationSessions.id],
  }),
}));

export const chatConversationsRelations = relations(workflow.chatConversations, ({ one, many }) => ({
  user: one(users.users, {
    fields: [workflow.chatConversations.user_id],
    references: [users.users.id],
  }),
  messages: many(workflow.chatMessages),
}));

export const chatMessagesRelations = relations(workflow.chatMessages, ({ one }) => ({
  conversation: one(workflow.chatConversations, {
    fields: [workflow.chatMessages.conversation_id],
    references: [workflow.chatConversations.id],
  }),
  user: one(users.users, {
    fields: [workflow.chatMessages.user_id],
    references: [users.users.id],
  }),
}));

export const workflowRelations = relations(workflow.workflows, ({ one, many }) => ({
  user: one(users.users, {
    fields: [workflow.workflows.user_id],
    references: [users.users.id],
  }),
  executions: many(workflow.workflowExecutions),
  template: one(workflow.workflowTemplates, {
    fields: [workflow.workflows.template_id],
    references: [workflow.workflowTemplates.id],
  }),
}));

export const workflowExecutionsRelations = relations(workflow.workflowExecutions, ({ one }) => ({
  workflow: one(workflow.workflows, {
    fields: [workflow.workflowExecutions.workflow_id],
    references: [workflow.workflows.id],
  }),
  user: one(users.users, {
    fields: [workflow.workflowExecutions.user_id],
    references: [users.users.id],
  }),
}));

export const workflowTemplatesRelations = relations(workflow.workflowTemplates, ({ one, many }) => ({
  createdBy: one(users.users, {
    fields: [workflow.workflowTemplates.created_by],
    references: [users.users.id],
  }),
  downloads: many(workflow.templateDownloads),
}));

export const templateDownloadsRelations = relations(workflow.templateDownloads, ({ one }) => ({
  template: one(workflow.workflowTemplates, {
    fields: [workflow.templateDownloads.template_id],
    references: [workflow.workflowTemplates.id],
  }),
  user: one(users.users, {
    fields: [workflow.templateDownloads.user_id],
    references: [users.users.id],
  }),
}));
