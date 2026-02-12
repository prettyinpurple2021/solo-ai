import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const webhookEvents = pgTable('webhook_events', {
  id: text('id').primaryKey(), // Stripe Event ID (evt_...)
  type: text('type').notNull(), // Event type (e.g., customer.subscription.created)
  status: text('status').notNull().default('processed'),
  data: jsonb('data'), // Optional: Store the full event data for debugging
  created_at: timestamp('created_at').defaultNow(),
});
