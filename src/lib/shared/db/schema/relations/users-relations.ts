
import { relations } from 'drizzle-orm';
import * as users from '../users';
import * as business from '../business';
import * as content from '../content';
import * as social from '../social';
import * as workflow from '../workflow';
import * as gamification from '../gamification';

export const usersRelations = relations(users.users, ({ many, one }) => ({
  accounts: many(users.accounts),
  sessions: many(users.sessions),
  briefcases: many(business.briefcases),
  goals: many(business.goals),
  tasks: many(business.tasks),
  documents: many(content.documents),
  settings: one(business.userSettings), 
  posts: many(social.posts),
  comments: many(social.postComments),
  likes: many(social.postReactions),
  followers: many(social.follows, { relationName: 'followers' }), 
  following: many(social.follows, { relationName: 'following' }),
  collaborationSessions: many(workflow.collaborationSessions),
  chatConversations: many(workflow.chatConversations),
  achievements: many(gamification.userAchievements),
}));
