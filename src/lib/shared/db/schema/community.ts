import { integer, pgTable, varchar, text, timestamp, boolean, index, primaryKey, foreignKey, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

export const communityTopics = pgTable('community_topics', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 50 }).notNull().unique(), // e.g. "General", "Wins", "Marketing"
  slug: varchar('slug', { length: 50 }).notNull().unique(), // e.g. "general", "wins"
  description: text('description'),
  icon: varchar('icon', { length: 50 }), // Lucide icon name
  order: integer('order').default(0).notNull(),
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const communityPosts = pgTable('community_posts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  topic_id: text('topic_id').notNull().references(() => communityTopics.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(), // Markdown supported
  image: varchar('image', { length: 1000 }),
  tags: jsonb('tags').default('[]').notNull(),
  metadata: jsonb('metadata').default('{}').notNull(),
  is_pinned: boolean('is_pinned').default(false).notNull(),
  view_count: integer('view_count').default(0).notNull(),
  like_count: integer('like_count').default(0).notNull(),
  comment_count: integer('comment_count').default(0).notNull(),
  shares_count: integer('shares_count').default(0).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index('community_posts_user_id_idx').on(table.user_id),
    topicIdIdx: index('community_posts_topic_id_idx').on(table.topic_id),
    createdAtIdx: index('community_posts_created_at_idx').on(table.created_at),
}));

export const communityComments = pgTable('community_comments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  post_id: text('post_id').notNull().references(() => communityPosts.id, { onDelete: 'cascade' }),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  parent_id: text('parent_id'), 
  content: text('content').notNull(),
  is_solution: boolean('is_solution').default(false).notNull(), 
  like_count: integer('like_count').default(0).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    postIdIdx: index('community_comments_post_id_idx').on(table.post_id),
    userIdIdx: index('community_comments_user_id_idx').on(table.user_id),
    parentIdIdx: index('community_comments_parent_id_idx').on(table.parent_id),
    parentFk: foreignKey({
        columns: [table.parent_id],
        foreignColumns: [table.id],
        name: 'community_comments_parent_id_fk'
    }).onDelete('set null'),
}));

export const postLikes = pgTable('post_likes', {
    post_id: text('post_id').notNull().references(() => communityPosts.id, { onDelete: 'cascade' }),
    user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    pk: primaryKey({ columns: [table.post_id, table.user_id] }),
    postIdIdx: index('post_likes_post_id_idx').on(table.post_id),
    userIdIdx: index('post_likes_user_id_idx').on(table.user_id),
}));

export const commentLikes = pgTable('comment_likes', {
    comment_id: text('comment_id').notNull().references(() => communityComments.id, { onDelete: 'cascade' }),
    user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    pk: primaryKey({ columns: [table.comment_id, table.user_id] }),
    commentIdIdx: index('comment_likes_comment_id_idx').on(table.comment_id),
    userIdIdx: index('comment_likes_user_id_idx').on(table.user_id),
}));
