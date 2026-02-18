import { pgTable, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

export const webhookEvents = pgTable('webhook_events', {
  id: text('id').primaryKey(), // Stripe Event ID (evt_...)
  type: text('type').notNull(), // Event type (e.g., customer.subscription.created)
  status: text('status').notNull().default('processed'),
  data: jsonb('data').default('{}').notNull(), // Optional: Store the full event data for debugging
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  typeIdx: index('webhook_events_type_idx').on(table.type),
  statusIdx: index('webhook_events_status_idx').on(table.status),
}));
