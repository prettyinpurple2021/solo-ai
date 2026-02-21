import { relations } from 'drizzle-orm';
import { users } from '../users';
import { communityTopics, communityPosts, communityComments, postLikes, commentLikes } from '../community';

export const communityTopicsRelations = relations(communityTopics, ({ many }) => ({
  posts: many(communityPosts),
}));

export const communityPostsRelations = relations(communityPosts, ({ one, many }) => ({
  author: one(users, {
    fields: [communityPosts.user_id],
    references: [users.id],
  }),
  topic: one(communityTopics, {
    fields: [communityPosts.topic_id],
    references: [communityTopics.id],
  }),
  comments: many(communityComments),
  likes: many(postLikes), 
}));

export const communityCommentsRelations = relations(communityComments, ({ one, many }) => ({
  author: one(users, {
    fields: [communityComments.user_id],
    references: [users.id],
  }),
  post: one(communityPosts, {
    fields: [communityComments.post_id],
    references: [communityPosts.id],
  }),
  parent: one(communityComments, {
    fields: [communityComments.parent_id],
    references: [communityComments.id],
    relationName: 'replies'
  }),
  replies: many(communityComments, {
    relationName: 'replies'
  }),
  likes: many(commentLikes),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  user: one(users, {
    fields: [postLikes.user_id],
    references: [users.id],
  }),
  post: one(communityPosts, {
    fields: [postLikes.post_id],
    references: [communityPosts.id],
  }),
}));

export const commentLikesRelations = relations(commentLikes, ({ one }) => ({
  user: one(users, {
    fields: [commentLikes.user_id],
    references: [users.id],
  }),
  comment: one(communityComments, {
    fields: [commentLikes.comment_id],
    references: [communityComments.id],
  }),
}));
