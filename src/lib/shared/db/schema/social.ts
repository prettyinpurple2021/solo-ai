
import { uuid, integer, pgTable, varchar, text, timestamp, boolean, jsonb, decimal, index, uniqueIndex, foreignKey, primaryKey, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

// Posts table
export const posts = pgTable('posts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  author_id: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  image: varchar('image', { length: 1000 }),
  likes_count: integer('likes_count').default(0).notNull(),
    comments_count: integer('comments_count').default(0).notNull(),
    shares_count: integer('shares_count').default(0).notNull(),
    tags: jsonb('tags').default('[]').notNull(),
    achievement_context: jsonb('achievement_context').default('{}'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    authorIdIdx: index('posts_author_id_idx').on(table.author_id),
    createdAtIdx: index('posts_created_at_idx').on(table.created_at),
}));

export const postComments = pgTable('post_comments', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    post_id: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    author_id: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    likes_count: integer('likes_count').default(0).notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    postIdIdx: index('post_comments_post_id_idx').on(table.post_id),
    authorIdIdx: index('post_comments_author_id_idx').on(table.author_id),
}));

export const follows = pgTable('follows', {
  follower_id: text('follower_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  following_id: text('following_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.follower_id, table.following_id] }),
  followerIdx: index('follows_follower_idx').on(table.follower_id),
  followingIdx: index('follows_following_idx').on(table.following_id),
}));

export const postReactions = pgTable('post_reactions', {
    post_id: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
    user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 20 }).default('like').notNull(), // like, dislike, love, fire, party
    created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    pk: primaryKey({ columns: [table.post_id, table.user_id] }),
    postIdIdx: index('post_reactions_post_id_idx').on(table.post_id),
    userIdIdx: index('post_reactions_user_id_idx').on(table.user_id),
}));

// Calendar Connections
export const calendarConnections = pgTable('calendar_connections', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 50 }).notNull(), // google, outlook, apple
  access_token: text('access_token').notNull(),
  refresh_token: text('refresh_token'),
  expires_at: timestamp('expires_at'),
  email: varchar('email', { length: 255 }),
  name: varchar('name', { length: 255 }),
  is_active: boolean('is_active').default(true).notNull(),
  last_synced_at: timestamp('last_synced_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('calendar_connections_user_id_idx').on(table.user_id),
  providerIdx: index('calendar_connections_provider_idx').on(table.provider),
}));

// Social Media Connections
export const socialMediaConnections = pgTable('social_media_connections', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  platform: varchar('platform', { length: 50 }).notNull(), // linkedin, twitter, facebook, instagram, youtube
  access_token: text('access_token').notNull(),
  refresh_token: text('refresh_token'),
  expires_at: timestamp('expires_at'),
  token_secret: text('token_secret'), // For OAuth 1.0a (Twitter)
  account_id: varchar('account_id', { length: 255 }), // Platform-specific account ID
  account_handle: varchar('account_handle', { length: 255 }), // Username/handle
  account_email: varchar('account_email', { length: 255 }),
  account_name: varchar('account_name', { length: 255 }),
  scopes: text('scopes'), // Comma-separated list of granted scopes
  is_active: boolean('is_active').default(true).notNull(),
  last_synced_at: timestamp('last_synced_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('social_media_connections_user_id_idx').on(table.user_id),
  platformIdx: index('social_media_connections_platform_idx').on(table.platform),
  userPlatformIdx: index('social_media_connections_user_platform_idx').on(table.user_id, table.platform),
}));

// Payment Provider Connections
export const paymentProviderConnections = pgTable('payment_provider_connections', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 50 }).notNull(), // stripe, paypal, square, etc.
  account_id: varchar('account_id', { length: 255 }), 
  access_token: text('access_token'), 
  refresh_token: text('refresh_token'),
  expires_at: timestamp('expires_at'),
  account_email: varchar('account_email', { length: 255 }),
  account_name: varchar('account_name', { length: 255 }),
  webhook_secret: text('webhook_secret'), 
  is_active: boolean('is_active').default(true).notNull(),
  last_synced_at: timestamp('last_synced_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('payment_provider_connections_user_id_idx').on(table.user_id),
  providerIdx: index('payment_provider_connections_provider_idx').on(table.provider),
  userProviderIdx: index('payment_provider_connections_user_provider_idx').on(table.user_id, table.provider),
}));

// Push Subscriptions
export const pushSubscriptions = pgTable('push_subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  endpoint: varchar('endpoint', { length: 1000 }).notNull(),
  p256dh_key: varchar('p256dh_key', { length: 500 }).notNull(),
  auth_key: varchar('auth_key', { length: 500 }).notNull(),
  device_info: jsonb('device_info').default('{}').notNull(),
  is_active: boolean('is_active').default(true).notNull(),
  last_used_at: timestamp('last_used_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('push_subscriptions_user_id_idx').on(table.user_id),
  endpointIdx: index('push_subscriptions_endpoint_idx').on(table.endpoint),
  isActiveIdx: index('push_subscriptions_is_active_idx').on(table.is_active),
  endpointUnique: uniqueIndex('push_subscriptions_endpoint_unique').on(table.endpoint),
}));

