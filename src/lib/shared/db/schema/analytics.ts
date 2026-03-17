import { pgTable, text, timestamp, uuid, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users';

export const trafficLogs = pgTable('traffic_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text('session_id').notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  url: text('url').notNull(),
  referrer: text('referrer'),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  metadata: jsonb('metadata').default({}),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
}, (table) => ({
  sessionIdIdx: index('traffic_logs_session_id_idx').on(table.sessionId),
  userIdIdx: index('traffic_logs_user_id_idx').on(table.userId),
  timestampIdx: index('traffic_logs_timestamp_idx').on(table.timestamp),
}));

// User Consent Logs
export const userConsent = pgTable('user_consent', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  userEmail: text('user_email').notNull(),
  consentType: text('consent_type').notNull(), // cookies, marketing, analytics, necessary
  action: text('action').notNull(), // granted, denied, withdrawn
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('user_consent_user_id_idx').on(table.userId),
  typeIdx: index('user_consent_type_idx').on(table.consentType),
}));

// Data Subject Requests (GDPR/CCPA)
export const dataSubjectRequests = pgTable('data_subject_requests', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  userEmail: text('user_email').notNull(),
  requestType: text('request_type').notNull(), // access, deletion, rectification, portability
  status: text('status').notNull().default('pending'), // pending, processing, completed, rejected
  notes: text('notes'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
}, (table) => ({
  userIdIdx: index('dsr_user_id_idx').on(table.userId),
  statusIdx: index('dsr_status_idx').on(table.status),
}));
