import { pgTable, text, timestamp, uuid, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users';

export const trafficLogs = pgTable('traffic_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull(),
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
