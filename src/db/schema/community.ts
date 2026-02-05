import { integer, pgTable, varchar, text, timestamp, boolean, index, primaryKey } from 'drizzle-orm/pg-core';
import { v4 as uuidv4 } from 'uuid';
import { users } from './users';

export const communityTopics = pgTable('community_topics', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  name: varchar('name', { length: 50 }).notNull().unique(), // e.g. "General", "Wins", "Marketing"
  slug: varchar('slug', { length: 50 }).notNull().unique(), // e.g. "general", "wins"
  description: text('description'),
  icon: varchar('icon', { length: 50 }), // Lucide icon name
  order: integer('order').default(0),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
});

export const communityPosts = pgTable('community_posts', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  topic_id: text('topic_id').notNull().references(() => communityTopics.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(), // Markdown supported
  is_pinned: boolean('is_pinned').default(false),
  view_count: integer('view_count').default(0),
  like_count: integer('like_count').default(0),
  comment_count: integer('comment_count').default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
    userIdIdx: index('community_posts_user_id_idx').on(table.user_id),
    topicIdIdx: index('community_posts_topic_id_idx').on(table.topic_id),
    createdAtIdx: index('community_posts_created_at_idx').on(table.created_at),
}));

export const communityComments = pgTable('community_comments', {
  id: text('id').primaryKey().$defaultFn(() => uuidv4()),
  post_id: text('post_id').notNull().references(() => communityPosts.id, { onDelete: 'cascade' }),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  parent_id: text('parent_id'), // Self-reference for replies
  content: text('content').notNull(),
  is_solution: boolean('is_solution').default(false), // Like "accepted answer"
  like_count: integer('like_count').default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
    postIdIdx: index('community_comments_post_id_idx').on(table.post_id),
    userIdIdx: index('community_comments_user_id_idx').on(table.user_id),
    parentIdIdx: index('community_comments_parent_id_idx').on(table.parent_id),
}));

export const communityLikes = pgTable('community_likes', {
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  entity_type: varchar('entity_type', { length: 20 }).notNull(), // 'post' or 'comment'
  entity_id: text('entity_id').notNull(),
  created_at: timestamp('created_at').defaultNow(),
}, (table) => ({
    pk: primaryKey({ columns: [table.user_id, table.entity_type, table.entity_id] }),
    entityIdx: index('community_likes_entity_idx').on(table.entity_type, table.entity_id),
}));
