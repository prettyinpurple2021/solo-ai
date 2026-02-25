import { relations } from "drizzle-orm/relations";

import { 
  users, 
  accounts, 
  sessions, 
  authenticators, 
  passwordResetTokens, 
  userMfaSettings, 
  deviceApprovals, 
  userSessions, 
  userApiKeys 
} from "./users";

import {
  userSkills,
  assessments,
  assessmentSubmissions
} from "./learning";

import { 
  feedback, 
  documents, 
  documentFolders, 
  documentPermissions, 
  documentShareLinks, 
  documentVersions, 
  documentActivity, 
  learningPaths, 
  learningModules, 
  userLearningProgress 
} from "./content";

import { 
  customReports, 
  userBrandSettings, 
  userSettings, 
  goals, 
  tasks, 
  briefcases, 
  taskAnalytics, 
  taskCategories, 
  productivityInsights, 
  analyticsEvents, 
  focusSessions, 
  templates 
} from "./business";

import { 
  communityPosts, 
  communityComments, 
  communityTopics, 
  postLikes, 
  commentLikes 
} from "./community";

import { 
  posts, 
  postComments, 
  follows, 
  postReactions, 
  calendarConnections, 
  socialMediaConnections, 
  paymentProviderConnections, 
  pushSubscriptions 
} from "./social";

import { 
  competitors, 
  competitorProfiles, 
  competitorActivities, 
  competitorAlerts, 
  intelligenceData, 
  scrapingJobs, 
  scrapingJobResults, 
  competitiveOpportunities, 
  opportunityActions, 
  opportunityMetrics 
} from "./intelligence";

import { 
  workflows, 
  workflowExecutions, 
  workflowTemplates, 
  templateDownloads, 
  collaborationSessions, 
  collaborationParticipants, 
  collaborationMessages, 
  collaborationCheckpoints, 
  chatConversations, 
  chatMessages 
} from "./workflow";

import { 
  userCompetitiveStats, 
  challenges, 
  challengeParticipants, 
  achievements, 
  userAchievements 
} from "./gamification";

import { moodEntries } from "./wellness";

export const scrapingJobResultsRelations = relations(scrapingJobResults, ({one}) => ({
	scrapingJob: one(scrapingJobs, {
		fields: [scrapingJobResults.job_id],
		references: [scrapingJobs.id]
	}),
}));

export const scrapingJobsRelations = relations(scrapingJobs, ({one, many}) => ({
	scrapingJobResults: many(scrapingJobResults),
	competitorProfile: one(competitorProfiles, {
		fields: [scrapingJobs.competitor_id],
		references: [competitorProfiles.id]
	}),
	user: one(users, {
		fields: [scrapingJobs.user_id],
		references: [users.id]
	}),
}));

export const feedbackRelations = relations(feedback, ({one}) => ({
	user: one(users, {
		fields: [feedback.user_id],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	feedbacks: many(feedback),
	customReports: many(customReports),
	postComments: many(postComments),
	challenges: many(challenges),
	challengeParticipants: many(challengeParticipants),
	analyticsEvents: many(analyticsEvents),
	briefcases: many(briefcases),
	calendarConnections: many(calendarConnections),
	chatConversations: many(chatConversations),
	chatMessages: many(chatMessages),
	competitiveOpportunities_userId: many(competitiveOpportunities, {
		relationName: "competitiveOpportunities_userId_users_id"
	}),
	competitiveOpportunities_assignedTo: many(competitiveOpportunities, {
		relationName: "competitiveOpportunities_assignedTo_users_id"
	}),
	competitors: many(competitors),
	deviceApprovals_userId: many(deviceApprovals, {
		relationName: "deviceApprovals_userId_users_id"
	}),
	deviceApprovals_approvedBy: many(deviceApprovals, {
		relationName: "deviceApprovals_approvedBy_users_id"
	}),
	documents: many(documents),
	documentFolders: many(documentFolders),
	documentPermissions_userId: many(documentPermissions, {
		relationName: "documentPermissions_userId_users_id"
	}),
	documentPermissions_grantedBy: many(documentPermissions, {
		relationName: "documentPermissions_grantedBy_users_id"
	}),
	documentShareLinks: many(documentShareLinks),
	documentVersions: many(documentVersions),
	competitorProfiles: many(competitorProfiles),
	competitorActivities: many(competitorActivities),
	competitorAlerts: many(competitorAlerts),
	opportunityActions: many(opportunityActions),
	opportunityMetrics: many(opportunityMetrics),
	passwordResetTokens: many(passwordResetTokens),
	paymentProviderConnections: many(paymentProviderConnections),
	posts: many(posts),
	intelligenceData: many(intelligenceData),
	goals: many(goals),
	focusSessions: many(focusSessions),
	pushSubscriptions: many(pushSubscriptions),
	scrapingJobs: many(scrapingJobs),
	sessions: many(sessions),
	socialMediaConnections: many(socialMediaConnections),
	taskAnalytics: many(taskAnalytics),
	taskCategories: many(taskCategories),
	productivityInsights: many(productivityInsights),
	templateDownloads: many(templateDownloads),
	userAchievements: many(userAchievements),
	userApiKeys: many(userApiKeys),
	userBrandSettings: many(userBrandSettings),
	userCompetitiveStats: many(userCompetitiveStats),
	userMfaSettings: many(userMfaSettings),
	templates: many(templates),
	tasks: many(tasks),
	workflowTemplates: many(workflowTemplates),
	userSessions: many(userSessions),
	userSettings: many(userSettings),
	workflows: many(workflows),
	workflowExecutions: many(workflowExecutions),
	learningPaths: many(learningPaths),
	collaborationSessions: many(collaborationSessions),
	userLearningProgresses: many(userLearningProgress),
	userSkills: many(userSkills),
	assessmentSubmissions: many(assessmentSubmissions),
	documentActivities: many(documentActivity),
	moodEntries: many(moodEntries),
	communityComments: many(communityComments),
	communityPosts: many(communityPosts),
	follows_followerId: many(follows, {
		relationName: "follows_followerId_users_id"
	}),
	follows_followingId: many(follows, {
		relationName: "follows_followingId_users_id"
	}),
	commentLikes: many(commentLikes),
	postLikes: many(postLikes),
	postReactions: many(postReactions),
	authenticators: many(authenticators),
	accounts: many(accounts),
}));

export const customReportsRelations = relations(customReports, ({one}) => ({
	user: one(users, {
		fields: [customReports.user_id],
		references: [users.id]
	}),
}));

export const postCommentsRelations = relations(postComments, ({one}) => ({
	post: one(posts, {
		fields: [postComments.post_id],
		references: [posts.id]
	}),
	author: one(users, {
		fields: [postComments.author_id],
		references: [users.id]
	}),
}));

export const postsRelations = relations(posts, ({one, many}) => ({
	postComments: many(postComments),
	author: one(users, {
		fields: [posts.author_id],
		references: [users.id]
	}),
	reactions: many(postReactions),
}));

export const challengesRelations = relations(challenges, ({one, many}) => ({
	user: one(users, {
		fields: [challenges.created_by],
		references: [users.id]
	}),
	challengeParticipants: many(challengeParticipants),
}));

export const challengeParticipantsRelations = relations(challengeParticipants, ({one}) => ({
	challenge: one(challenges, {
		fields: [challengeParticipants.challenge_id],
		references: [challenges.id]
	}),
	user: one(users, {
		fields: [challengeParticipants.user_id],
		references: [users.id]
	}),
}));

export const analyticsEventsRelations = relations(analyticsEvents, ({one}) => ({
	user: one(users, {
		fields: [analyticsEvents.user_id],
		references: [users.id]
	}),
}));

export const briefcasesRelations = relations(briefcases, ({one, many}) => ({
	user: one(users, {
		fields: [briefcases.user_id],
		references: [users.id]
	}),
	goals: many(goals),
	tasks: many(tasks),
}));

export const calendarConnectionsRelations = relations(calendarConnections, ({one}) => ({
	user: one(users, {
		fields: [calendarConnections.user_id],
		references: [users.id]
	}),
}));

export const chatConversationsRelations = relations(chatConversations, ({one, many}) => ({
	user: one(users, {
		fields: [chatConversations.user_id],
		references: [users.id]
	}),
	chatMessages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({one}) => ({
	chatConversation: one(chatConversations, {
		fields: [chatMessages.conversation_id],
		references: [chatConversations.id]
	}),
	user: one(users, {
		fields: [chatMessages.user_id],
		references: [users.id]
	}),
}));

export const competitiveOpportunitiesRelations = relations(competitiveOpportunities, ({one}) => ({
	user_userId: one(users, {
		fields: [competitiveOpportunities.user_id],
		references: [users.id],
		relationName: "competitiveOpportunities_userId_users_id"
	}),
	user_assignedTo: one(users, {
		fields: [competitiveOpportunities.assigned_to],
		references: [users.id],
		relationName: "competitiveOpportunities_assignedTo_users_id"
	}),
}));

export const competitorsRelations = relations(competitors, ({one}) => ({
	user: one(users, {
		fields: [competitors.user_id],
		references: [users.id]
	}),
}));

export const deviceApprovalsRelations = relations(deviceApprovals, ({one}) => ({
	user_userId: one(users, {
		fields: [deviceApprovals.user_id],
		references: [users.id],
		relationName: "deviceApprovals_userId_users_id"
	}),
	user_approvedBy: one(users, {
		fields: [deviceApprovals.approved_by],
		references: [users.id],
		relationName: "deviceApprovals_approvedBy_users_id"
	}),
}));

export const documentsRelations = relations(documents, ({one, many}) => ({
	user: one(users, {
		fields: [documents.user_id],
		references: [users.id]
	}),
	documentFolder: one(documentFolders, {
		fields: [documents.folder_id],
		references: [documentFolders.id]
	}),
	documentPermissions: many(documentPermissions),
	documentShareLinks: many(documentShareLinks),
	documentVersions: many(documentVersions),
	documentActivities: many(documentActivity),
}));

export const documentFoldersRelations = relations(documentFolders, ({one, many}) => ({
	documents: many(documents),
	user: one(users, {
		fields: [documentFolders.user_id],
		references: [users.id]
	}),
	documentFolder: one(documentFolders, {
		fields: [documentFolders.parent_id],
		references: [documentFolders.id],
		relationName: "documentFolders_parentId_documentFolders_id"
	}),
	documentFolders: many(documentFolders, {
		relationName: "documentFolders_parentId_documentFolders_id"
	}),
}));

export const documentPermissionsRelations = relations(documentPermissions, ({one}) => ({
	document: one(documents, {
		fields: [documentPermissions.document_id],
		references: [documents.id]
	}),
	user_userId: one(users, {
		fields: [documentPermissions.user_id],
		references: [users.id],
		relationName: "documentPermissions_userId_users_id"
	}),
	user_grantedBy: one(users, {
		fields: [documentPermissions.granted_by],
		references: [users.id],
		relationName: "documentPermissions_grantedBy_users_id"
	}),
}));

export const documentShareLinksRelations = relations(documentShareLinks, ({one}) => ({
	document: one(documents, {
		fields: [documentShareLinks.document_id],
		references: [documents.id]
	}),
	user: one(users, {
		fields: [documentShareLinks.created_by],
		references: [users.id]
	}),
}));

export const documentVersionsRelations = relations(documentVersions, ({one}) => ({
	document: one(documents, {
		fields: [documentVersions.document_id],
		references: [documents.id]
	}),
	user: one(users, {
		fields: [documentVersions.created_by],
		references: [users.id]
	}),
}));

export const competitorProfilesRelations = relations(competitorProfiles, ({one, many}) => ({
	user: one(users, {
		fields: [competitorProfiles.user_id],
		references: [users.id]
	}),
	competitorActivities: many(competitorActivities),
	competitorAlerts: many(competitorAlerts),
	intelligenceData: many(intelligenceData),
	scrapingJobs: many(scrapingJobs),
}));

export const competitorActivitiesRelations = relations(competitorActivities, ({one}) => ({
	competitorProfile: one(competitorProfiles, {
		fields: [competitorActivities.competitor_id],
		references: [competitorProfiles.id]
	}),
	user: one(users, {
		fields: [competitorActivities.user_id],
		references: [users.id]
	}),
}));

export const competitorAlertsRelations = relations(competitorAlerts, ({one}) => ({
	competitorProfile: one(competitorProfiles, {
		fields: [competitorAlerts.competitor_id],
		references: [competitorProfiles.id]
	}),
	user: one(users, {
		fields: [competitorAlerts.user_id],
		references: [users.id]
	}),
	intelligenceDatum: one(intelligenceData, {
		fields: [competitorAlerts.intelligence_id],
		references: [intelligenceData.id]
	}),
}));

export const intelligenceDataRelations = relations(intelligenceData, ({one, many}) => ({
	competitorAlerts: many(competitorAlerts),
	competitorProfile: one(competitorProfiles, {
		fields: [intelligenceData.competitor_id],
		references: [competitorProfiles.id]
	}),
	user: one(users, {
		fields: [intelligenceData.user_id],
		references: [users.id]
	}),
}));

export const learningModulesRelations = relations(learningModules, ({one, many}) => ({
	path: one(learningPaths, {
		fields: [learningModules.path_id],
		references: [learningPaths.id]
	}),
	userLearningProgresses: many(userLearningProgress),
	assessments: many(assessments),
}));

export const learningPathsRelations = relations(learningPaths, ({one, many}) => ({
	modules: many(learningModules),
	user: one(users, {
		fields: [learningPaths.created_by],
		references: [users.id]
	}),
}));

export const opportunityActionsRelations = relations(opportunityActions, ({one}) => ({
	user: one(users, {
		fields: [opportunityActions.user_id],
		references: [users.id]
	}),
}));

export const opportunityMetricsRelations = relations(opportunityMetrics, ({one}) => ({
	user: one(users, {
		fields: [opportunityMetrics.user_id],
		references: [users.id]
	}),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({one}) => ({
	user: one(users, {
		fields: [passwordResetTokens.user_id],
		references: [users.id]
	}),
}));

export const paymentProviderConnectionsRelations = relations(paymentProviderConnections, ({one}) => ({
	user: one(users, {
		fields: [paymentProviderConnections.user_id],
		references: [users.id]
	}),
}));

export const goalsRelations = relations(goals, ({one, many}) => ({
	user: one(users, {
		fields: [goals.user_id],
		references: [users.id]
	}),
	briefcase: one(briefcases, {
		fields: [goals.briefcase_id],
		references: [briefcases.id]
	}),
	tasks: many(tasks),
}));

export const focusSessionsRelations = relations(focusSessions, ({one}) => ({
	task: one(tasks, {
		fields: [focusSessions.task_id],
		references: [tasks.id]
	}),
	user: one(users, {
		fields: [focusSessions.user_id],
		references: [users.id]
	}),
}));

export const tasksRelations = relations(tasks, ({one, many}) => ({
	focusSessions: many(focusSessions),
	taskAnalytics: many(taskAnalytics),
	user: one(users, {
		fields: [tasks.user_id],
		references: [users.id]
	}),
	goal: one(goals, {
		fields: [tasks.goal_id],
		references: [goals.id]
	}),
	briefcase: one(briefcases, {
		fields: [tasks.briefcase_id],
		references: [briefcases.id]
	}),
	task: one(tasks, {
		fields: [tasks.parent_task_id],
		references: [tasks.id],
		relationName: "tasks_parentTaskId_tasks_id"
	}),
	tasks: many(tasks, {
		relationName: "tasks_parentTaskId_tasks_id"
	}),
}));

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({one}) => ({
	user: one(users, {
		fields: [pushSubscriptions.user_id],
		references: [users.id]
	}),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	}),
}));

export const socialMediaConnectionsRelations = relations(socialMediaConnections, ({one}) => ({
	user: one(users, {
		fields: [socialMediaConnections.user_id],
		references: [users.id]
	}),
}));

export const taskAnalyticsRelations = relations(taskAnalytics, ({one}) => ({
	user: one(users, {
		fields: [taskAnalytics.user_id],
		references: [users.id]
	}),
	task: one(tasks, {
		fields: [taskAnalytics.task_id],
		references: [tasks.id]
	}),
}));

export const taskCategoriesRelations = relations(taskCategories, ({one}) => ({
	user: one(users, {
		fields: [taskCategories.user_id],
		references: [users.id]
	}),
}));

export const productivityInsightsRelations = relations(productivityInsights, ({one}) => ({
	user: one(users, {
		fields: [productivityInsights.user_id],
		references: [users.id]
	}),
}));

export const templateDownloadsRelations = relations(templateDownloads, ({one}) => ({
	workflowTemplate: one(workflowTemplates, {
		fields: [templateDownloads.template_id],
		references: [workflowTemplates.id]
	}),
	user: one(users, {
		fields: [templateDownloads.user_id],
		references: [users.id]
	}),
}));

export const workflowTemplatesRelations = relations(workflowTemplates, ({one, many}) => ({
	templateDownloads: many(templateDownloads),
	user: one(users, {
		fields: [workflowTemplates.created_by],
		references: [users.id]
	}),
}));

export const userAchievementsRelations = relations(userAchievements, ({one}) => ({
	user: one(users, {
		fields: [userAchievements.user_id],
		references: [users.id]
	}),
	achievement: one(achievements, {
		fields: [userAchievements.achievement_id],
		references: [achievements.id]
	}),
}));

export const achievementsRelations = relations(achievements, ({many}) => ({
	userAchievements: many(userAchievements),
}));

export const userApiKeysRelations = relations(userApiKeys, ({one}) => ({
	user: one(users, {
		fields: [userApiKeys.user_id],
		references: [users.id]
	}),
}));

export const userBrandSettingsRelations = relations(userBrandSettings, ({one}) => ({
	user: one(users, {
		fields: [userBrandSettings.user_id],
		references: [users.id]
	}),
}));

export const userCompetitiveStatsRelations = relations(userCompetitiveStats, ({one}) => ({
	user: one(users, {
		fields: [userCompetitiveStats.user_id],
		references: [users.id]
	}),
}));

export const userMfaSettingsRelations = relations(userMfaSettings, ({one}) => ({
	user: one(users, {
		fields: [userMfaSettings.user_id],
		references: [users.id]
	}),
}));

export const templatesRelations = relations(templates, ({one}) => ({
	user: one(users, {
		fields: [templates.user_id],
		references: [users.id]
	}),
}));

export const userSessionsRelations = relations(userSessions, ({one}) => ({
	user: one(users, {
		fields: [userSessions.user_id],
		references: [users.id]
	}),
}));

export const userSettingsRelations = relations(userSettings, ({one}) => ({
	user: one(users, {
		fields: [userSettings.user_id],
		references: [users.id]
	}),
}));

export const workflowsRelations = relations(workflows, ({one, many}) => ({
	user: one(users, {
		fields: [workflows.user_id],
		references: [users.id]
	}),
	workflowExecutions: many(workflowExecutions),
}));

export const workflowExecutionsRelations = relations(workflowExecutions, ({one}) => ({
	workflow: one(workflows, {
		fields: [workflowExecutions.workflow_id],
		references: [workflows.id]
	}),
	user: one(users, {
		fields: [workflowExecutions.user_id],
		references: [users.id]
	}),
}));

export const collaborationSessionsRelations = relations(collaborationSessions, ({one, many}) => ({
	user: one(users, {
		fields: [collaborationSessions.user_id],
		references: [users.id]
	}),
	checkpoints: many(collaborationCheckpoints),
	messages: many(collaborationMessages),
	participants: many(collaborationParticipants),
}));

export const collaborationCheckpointsRelations = relations(collaborationCheckpoints, ({one}) => ({
	collaborationSessions: one(collaborationSessions, {
		fields: [collaborationCheckpoints.session_id],
		references: [collaborationSessions.id]
	}),
}));

export const collaborationMessagesRelations = relations(collaborationMessages, ({one}) => ({
	collaborationSessions: one(collaborationSessions, {
		fields: [collaborationMessages.session_id],
		references: [collaborationSessions.id]
	}),
}));

export const collaborationParticipantsRelations = relations(collaborationParticipants, ({one}) => ({
	collaborationSessions: one(collaborationSessions, {
		fields: [collaborationParticipants.session_id],
		references: [collaborationSessions.id]
	}),
}));

export const userLearningProgressRelations = relations(userLearningProgress, ({one}) => ({
	user: one(users, {
		fields: [userLearningProgress.user_id],
		references: [users.id]
	}),
	learningModule: one(learningModules, {
		fields: [userLearningProgress.module_id],
		references: [learningModules.id]
	}),
}));

export const documentActivityRelations = relations(documentActivity, ({one}) => ({
	document: one(documents, {
		fields: [documentActivity.document_id],
		references: [documents.id]
	}),
	user: one(users, {
		fields: [documentActivity.user_id],
		references: [users.id]
	}),
}));

export const moodEntriesRelations = relations(moodEntries, ({one}) => ({
	user: one(users, {
		fields: [moodEntries.user_id],
		references: [users.id]
	}),
}));

export const communityCommentsRelations = relations(communityComments, ({one, many}) => ({
	communityPost: one(communityPosts, {
		fields: [communityComments.post_id],
		references: [communityPosts.id]
	}),
	user: one(users, {
		fields: [communityComments.user_id],
		references: [users.id]
	}),
	communityComment: one(communityComments, {
		fields: [communityComments.parent_id],
		references: [communityComments.id],
		relationName: "communityComments_parentId_communityComments_id"
	}),
	communityComments: many(communityComments, {
		relationName: "communityComments_parentId_communityComments_id"
	}),
	commentLikes: many(commentLikes),
}));

export const communityPostsRelations = relations(communityPosts, ({one, many}) => ({
	comments: many(communityComments),
	topic: one(communityTopics, {
		fields: [communityPosts.topic_id],
		references: [communityTopics.id]
	}),
	author: one(users, {
		fields: [communityPosts.user_id],
		references: [users.id]
	}),
	postLikes: many(postLikes),
}));

export const communityTopicsRelations = relations(communityTopics, ({many}) => ({
	communityPosts: many(communityPosts),
}));

export const followsRelations = relations(follows, ({one}) => ({
	user_followerId: one(users, {
		fields: [follows.follower_id],
		references: [users.id],
		relationName: "follows_followerId_users_id"
	}),
	user_followingId: one(users, {
		fields: [follows.following_id],
		references: [users.id],
		relationName: "follows_followingId_users_id"
	}),
}));

export const commentLikesRelations = relations(commentLikes, ({one}) => ({
	communityComment: one(communityComments, {
		fields: [commentLikes.comment_id],
		references: [communityComments.id]
	}),
	user: one(users, {
		fields: [commentLikes.user_id],
		references: [users.id]
	}),
}));

export const postLikesRelations = relations(postLikes, ({one}) => ({
	communityPost: one(communityPosts, {
		fields: [postLikes.post_id],
		references: [communityPosts.id]
	}),
	user: one(users, {
		fields: [postLikes.user_id],
		references: [users.id]
	}),
}));

export const userSkillsRelations = relations(userSkills, ({one}) => ({
	user: one(users, {
		fields: [userSkills.user_id],
		references: [users.id]
	}),
}));

export const assessmentsRelations = relations(assessments, ({one, many}) => ({
	module: one(learningModules, {
		fields: [assessments.module_id],
		references: [learningModules.id]
	}),
	submissions: many(assessmentSubmissions),
}));

export const assessmentSubmissionsRelations = relations(assessmentSubmissions, ({one}) => ({
	user: one(users, {
		fields: [assessmentSubmissions.user_id],
		references: [users.id]
	}),
	assessment: one(assessments, {
		fields: [assessmentSubmissions.assessment_id],
		references: [assessments.id]
	}),
}));

export const postReactionsRelations = relations(postReactions, ({one}) => ({
	post: one(posts, {
		fields: [postReactions.post_id],
		references: [posts.id]
	}),
	user: one(users, {
		fields: [postReactions.user_id],
		references: [users.id]
	}),
}));

export const authenticatorsRelations = relations(authenticators, ({one}) => ({
	user: one(users, {
		fields: [authenticators.userId],
		references: [users.id]
	}),
}));

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
}));
