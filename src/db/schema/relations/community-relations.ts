import { relations } from 'drizzle-orm';
import { users } from '../users';
import { communityTopics, communityPosts, communityComments, communityLikes } from '../community';

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
  likes: many(communityLikes), 
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
}));

export const communityLikesRelations = relations(communityLikes, ({ one }) => ({
  user: one(users, {
    fields: [communityLikes.user_id],
    references: [users.id],
  }),
}));
