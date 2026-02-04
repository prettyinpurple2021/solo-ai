
import { relations } from 'drizzle-orm';
import * as users from '../users';
import * as social from '../social';

export const postsRelations = relations(social.posts, ({ one, many }) => ({
    author: one(users.users, {
        fields: [social.posts.author_id],
        references: [users.users.id],
    }),
    comments: many(social.postComments),
    reactions: many(social.postReactions),
}));

export const postCommentsRelations = relations(social.postComments, ({ one }) => ({
    post: one(social.posts, {
        fields: [social.postComments.post_id],
        references: [social.posts.id],
    }),
    author: one(users.users, {
        fields: [social.postComments.author_id],
        references: [users.users.id],
    }),
}));

export const followsRelations = relations(social.follows, ({ one }) => ({
  follower: one(users.users, {
    fields: [social.follows.follower_id],
    references: [users.users.id],
    relationName: 'following', // User is following someone
  }),
  following: one(users.users, {
    fields: [social.follows.following_id],
    references: [users.users.id],
    relationName: 'followers', // User is followed by someone
  }),
}));

export const postReactionsRelations = relations(social.postReactions, ({ one }) => ({
    post: one(social.posts, {
        fields: [social.postReactions.post_id],
        references: [social.posts.id],
    }),
    user: one(users.users, {
        fields: [social.postReactions.user_id],
        references: [users.users.id],
    }),
}));

export const pushSubscriptionsRelations = relations(social.pushSubscriptions, ({ one }) => ({
  user: one(users.users, {
    fields: [social.pushSubscriptions.user_id],
    references: [users.users.id],
  }),
}));

export const calendarConnectionsRelations = relations(social.calendarConnections, ({ one }) => ({
   user: one(users.users, {
    fields: [social.calendarConnections.user_id],
    references: [users.users.id],
  }),
}));

export const socialMediaConnectionsRelations = relations(social.socialMediaConnections, ({ one }) => ({
   user: one(users.users, {
    fields: [social.socialMediaConnections.user_id],
    references: [users.users.id],
  }),
}));

export const paymentProviderConnectionsRelations = relations(social.paymentProviderConnections, ({ one }) => ({
   user: one(users.users, {
    fields: [social.paymentProviderConnections.user_id],
    references: [users.users.id],
  }),
}));
