import { relations } from "drizzle-orm/relations";
import { scrapingJobs, scrapingJobResults, users, feedback, customReports, posts, postComments, challenges, challengeParticipants, analyticsEvents, briefcases, calendarConnections, chatConversations, chatMessages, competitiveOpportunities, competitors, deviceApprovals, documents, documentFolders, documentPermissions, documentShareLinks, documentVersions, competitorProfiles, competitorActivities, competitorAlerts, intelligenceData, learningPaths, learningModules, opportunityActions, opportunityMetrics, passwordResetTokens, paymentProviderConnections, goals, tasks, focusSessions, pushSubscriptions, session, socialMediaConnections, taskAnalytics, taskCategories, productivityInsights, workflowTemplates, templateDownloads, userAchievements, achievements, userApiKeys, userBrandSettings, userCompetitiveStats, userMfaSettings, templates, userSessions, userSettings, workflows, workflowExecutions, collaborationSessions, collaborationCheckpoints, collaborationMessages, collaborationParticipants, userLearningProgress, documentActivity, moodEntries, communityPosts, communityComments, communityTopics, follows, commentLikes, postLikes, postReactions, authenticator, account } from "./index";

export const scrapingJobResultsRelations = relations(scrapingJobResults, ({one}) => ({
	scrapingJob: one(scrapingJobs, {
		fields: [scrapingJobResults.jobId],
		references: [scrapingJobs.id]
	}),
}));

export const scrapingJobsRelations = relations(scrapingJobs, ({one, many}) => ({
	scrapingJobResults: many(scrapingJobResults),
	competitorProfile: one(competitorProfiles, {
		fields: [scrapingJobs.competitorId],
		references: [competitorProfiles.id]
	}),
	user: one(users, {
		fields: [scrapingJobs.userId],
		references: [users.id]
	}),
}));

export const feedbackRelations = relations(feedback, ({one}) => ({
	user: one(users, {
		fields: [feedback.userId],
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
	sessions: many(session),
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
	authenticators: many(authenticator),
	accounts: many(account),
}));

export const customReportsRelations = relations(customReports, ({one}) => ({
	user: one(users, {
		fields: [customReports.userId],
		references: [users.id]
	}),
}));

export const postCommentsRelations = relations(postComments, ({one}) => ({
	post: one(posts, {
		fields: [postComments.postId],
		references: [posts.id]
	}),
	user: one(users, {
		fields: [postComments.authorId],
		references: [users.id]
	}),
}));

export const postsRelations = relations(posts, ({one, many}) => ({
	postComments: many(postComments),
	user: one(users, {
		fields: [posts.authorId],
		references: [users.id]
	}),
	postReactions: many(postReactions),
}));

export const challengesRelations = relations(challenges, ({one, many}) => ({
	user: one(users, {
		fields: [challenges.createdBy],
		references: [users.id]
	}),
	challengeParticipants: many(challengeParticipants),
}));

export const challengeParticipantsRelations = relations(challengeParticipants, ({one}) => ({
	challenge: one(challenges, {
		fields: [challengeParticipants.challengeId],
		references: [challenges.id]
	}),
	user: one(users, {
		fields: [challengeParticipants.userId],
		references: [users.id]
	}),
}));

export const analyticsEventsRelations = relations(analyticsEvents, ({one}) => ({
	user: one(users, {
		fields: [analyticsEvents.userId],
		references: [users.id]
	}),
}));

export const briefcasesRelations = relations(briefcases, ({one, many}) => ({
	user: one(users, {
		fields: [briefcases.userId],
		references: [users.id]
	}),
	goals: many(goals),
	tasks: many(tasks),
}));

export const calendarConnectionsRelations = relations(calendarConnections, ({one}) => ({
	user: one(users, {
		fields: [calendarConnections.userId],
		references: [users.id]
	}),
}));

export const chatConversationsRelations = relations(chatConversations, ({one, many}) => ({
	user: one(users, {
		fields: [chatConversations.userId],
		references: [users.id]
	}),
	chatMessages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({one}) => ({
	chatConversation: one(chatConversations, {
		fields: [chatMessages.conversationId],
		references: [chatConversations.id]
	}),
	user: one(users, {
		fields: [chatMessages.userId],
		references: [users.id]
	}),
}));

export const competitiveOpportunitiesRelations = relations(competitiveOpportunities, ({one}) => ({
	user_userId: one(users, {
		fields: [competitiveOpportunities.userId],
		references: [users.id],
		relationName: "competitiveOpportunities_userId_users_id"
	}),
	user_assignedTo: one(users, {
		fields: [competitiveOpportunities.assignedTo],
		references: [users.id],
		relationName: "competitiveOpportunities_assignedTo_users_id"
	}),
}));

export const competitorsRelations = relations(competitors, ({one}) => ({
	user: one(users, {
		fields: [competitors.userId],
		references: [users.id]
	}),
}));

export const deviceApprovalsRelations = relations(deviceApprovals, ({one}) => ({
	user_userId: one(users, {
		fields: [deviceApprovals.userId],
		references: [users.id],
		relationName: "deviceApprovals_userId_users_id"
	}),
	user_approvedBy: one(users, {
		fields: [deviceApprovals.approvedBy],
		references: [users.id],
		relationName: "deviceApprovals_approvedBy_users_id"
	}),
}));

export const documentsRelations = relations(documents, ({one, many}) => ({
	user: one(users, {
		fields: [documents.userId],
		references: [users.id]
	}),
	documentFolder: one(documentFolders, {
		fields: [documents.folderId],
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
		fields: [documentFolders.userId],
		references: [users.id]
	}),
	documentFolder: one(documentFolders, {
		fields: [documentFolders.parentId],
		references: [documentFolders.id],
		relationName: "documentFolders_parentId_documentFolders_id"
	}),
	documentFolders: many(documentFolders, {
		relationName: "documentFolders_parentId_documentFolders_id"
	}),
}));

export const documentPermissionsRelations = relations(documentPermissions, ({one}) => ({
	document: one(documents, {
		fields: [documentPermissions.documentId],
		references: [documents.id]
	}),
	user_userId: one(users, {
		fields: [documentPermissions.userId],
		references: [users.id],
		relationName: "documentPermissions_userId_users_id"
	}),
	user_grantedBy: one(users, {
		fields: [documentPermissions.grantedBy],
		references: [users.id],
		relationName: "documentPermissions_grantedBy_users_id"
	}),
}));

export const documentShareLinksRelations = relations(documentShareLinks, ({one}) => ({
	document: one(documents, {
		fields: [documentShareLinks.documentId],
		references: [documents.id]
	}),
	user: one(users, {
		fields: [documentShareLinks.createdBy],
		references: [users.id]
	}),
}));

export const documentVersionsRelations = relations(documentVersions, ({one}) => ({
	document: one(documents, {
		fields: [documentVersions.documentId],
		references: [documents.id]
	}),
	user: one(users, {
		fields: [documentVersions.createdBy],
		references: [users.id]
	}),
}));

export const competitorProfilesRelations = relations(competitorProfiles, ({one, many}) => ({
	user: one(users, {
		fields: [competitorProfiles.userId],
		references: [users.id]
	}),
	competitorActivities: many(competitorActivities),
	competitorAlerts: many(competitorAlerts),
	intelligenceData: many(intelligenceData),
	scrapingJobs: many(scrapingJobs),
}));

export const competitorActivitiesRelations = relations(competitorActivities, ({one}) => ({
	competitorProfile: one(competitorProfiles, {
		fields: [competitorActivities.competitorId],
		references: [competitorProfiles.id]
	}),
	user: one(users, {
		fields: [competitorActivities.userId],
		references: [users.id]
	}),
}));

export const competitorAlertsRelations = relations(competitorAlerts, ({one}) => ({
	competitorProfile: one(competitorProfiles, {
		fields: [competitorAlerts.competitorId],
		references: [competitorProfiles.id]
	}),
	user: one(users, {
		fields: [competitorAlerts.userId],
		references: [users.id]
	}),
	intelligenceDatum: one(intelligenceData, {
		fields: [competitorAlerts.intelligenceId],
		references: [intelligenceData.id]
	}),
}));

export const intelligenceDataRelations = relations(intelligenceData, ({one, many}) => ({
	competitorAlerts: many(competitorAlerts),
	competitorProfile: one(competitorProfiles, {
		fields: [intelligenceData.competitorId],
		references: [competitorProfiles.id]
	}),
	user: one(users, {
		fields: [intelligenceData.userId],
		references: [users.id]
	}),
}));

export const learningModulesRelations = relations(learningModules, ({one, many}) => ({
	learningPath: one(learningPaths, {
		fields: [learningModules.pathId],
		references: [learningPaths.id]
	}),
	userLearningProgresses: many(userLearningProgress),
}));

export const learningPathsRelations = relations(learningPaths, ({one, many}) => ({
	learningModules: many(learningModules),
	user: one(users, {
		fields: [learningPaths.createdBy],
		references: [users.id]
	}),
}));

export const opportunityActionsRelations = relations(opportunityActions, ({one}) => ({
	user: one(users, {
		fields: [opportunityActions.userId],
		references: [users.id]
	}),
}));

export const opportunityMetricsRelations = relations(opportunityMetrics, ({one}) => ({
	user: one(users, {
		fields: [opportunityMetrics.userId],
		references: [users.id]
	}),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({one}) => ({
	user: one(users, {
		fields: [passwordResetTokens.userId],
		references: [users.id]
	}),
}));

export const paymentProviderConnectionsRelations = relations(paymentProviderConnections, ({one}) => ({
	user: one(users, {
		fields: [paymentProviderConnections.userId],
		references: [users.id]
	}),
}));

export const goalsRelations = relations(goals, ({one, many}) => ({
	user: one(users, {
		fields: [goals.userId],
		references: [users.id]
	}),
	briefcase: one(briefcases, {
		fields: [goals.briefcaseId],
		references: [briefcases.id]
	}),
	tasks: many(tasks),
}));

export const focusSessionsRelations = relations(focusSessions, ({one}) => ({
	task: one(tasks, {
		fields: [focusSessions.taskId],
		references: [tasks.id]
	}),
	user: one(users, {
		fields: [focusSessions.userId],
		references: [users.id]
	}),
}));

export const tasksRelations = relations(tasks, ({one, many}) => ({
	focusSessions: many(focusSessions),
	taskAnalytics: many(taskAnalytics),
	user: one(users, {
		fields: [tasks.userId],
		references: [users.id]
	}),
	goal: one(goals, {
		fields: [tasks.goalId],
		references: [goals.id]
	}),
	briefcase: one(briefcases, {
		fields: [tasks.briefcaseId],
		references: [briefcases.id]
	}),
	task: one(tasks, {
		fields: [tasks.parentTaskId],
		references: [tasks.id],
		relationName: "tasks_parentTaskId_tasks_id"
	}),
	tasks: many(tasks, {
		relationName: "tasks_parentTaskId_tasks_id"
	}),
}));

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({one}) => ({
	user: one(users, {
		fields: [pushSubscriptions.userId],
		references: [users.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(users, {
		fields: [session.userId],
		references: [users.id]
	}),
}));

export const socialMediaConnectionsRelations = relations(socialMediaConnections, ({one}) => ({
	user: one(users, {
		fields: [socialMediaConnections.userId],
		references: [users.id]
	}),
}));

export const taskAnalyticsRelations = relations(taskAnalytics, ({one}) => ({
	user: one(users, {
		fields: [taskAnalytics.userId],
		references: [users.id]
	}),
	task: one(tasks, {
		fields: [taskAnalytics.taskId],
		references: [tasks.id]
	}),
}));

export const taskCategoriesRelations = relations(taskCategories, ({one}) => ({
	user: one(users, {
		fields: [taskCategories.userId],
		references: [users.id]
	}),
}));

export const productivityInsightsRelations = relations(productivityInsights, ({one}) => ({
	user: one(users, {
		fields: [productivityInsights.userId],
		references: [users.id]
	}),
}));

export const templateDownloadsRelations = relations(templateDownloads, ({one}) => ({
	workflowTemplate: one(workflowTemplates, {
		fields: [templateDownloads.templateId],
		references: [workflowTemplates.id]
	}),
	user: one(users, {
		fields: [templateDownloads.userId],
		references: [users.id]
	}),
}));

export const workflowTemplatesRelations = relations(workflowTemplates, ({one, many}) => ({
	templateDownloads: many(templateDownloads),
	user: one(users, {
		fields: [workflowTemplates.createdBy],
		references: [users.id]
	}),
}));

export const userAchievementsRelations = relations(userAchievements, ({one}) => ({
	user: one(users, {
		fields: [userAchievements.userId],
		references: [users.id]
	}),
	achievement: one(achievements, {
		fields: [userAchievements.achievementId],
		references: [achievements.id]
	}),
}));

export const achievementsRelations = relations(achievements, ({many}) => ({
	userAchievements: many(userAchievements),
}));

export const userApiKeysRelations = relations(userApiKeys, ({one}) => ({
	user: one(users, {
		fields: [userApiKeys.userId],
		references: [users.id]
	}),
}));

export const userBrandSettingsRelations = relations(userBrandSettings, ({one}) => ({
	user: one(users, {
		fields: [userBrandSettings.userId],
		references: [users.id]
	}),
}));

export const userCompetitiveStatsRelations = relations(userCompetitiveStats, ({one}) => ({
	user: one(users, {
		fields: [userCompetitiveStats.userId],
		references: [users.id]
	}),
}));

export const userMfaSettingsRelations = relations(userMfaSettings, ({one}) => ({
	user: one(users, {
		fields: [userMfaSettings.userId],
		references: [users.id]
	}),
}));

export const templatesRelations = relations(templates, ({one}) => ({
	user: one(users, {
		fields: [templates.userId],
		references: [users.id]
	}),
}));

export const userSessionsRelations = relations(userSessions, ({one}) => ({
	user: one(users, {
		fields: [userSessions.userId],
		references: [users.id]
	}),
}));

export const userSettingsRelations = relations(userSettings, ({one}) => ({
	user: one(users, {
		fields: [userSettings.userId],
		references: [users.id]
	}),
}));

export const workflowsRelations = relations(workflows, ({one, many}) => ({
	user: one(users, {
		fields: [workflows.userId],
		references: [users.id]
	}),
	workflowExecutions: many(workflowExecutions),
}));

export const workflowExecutionsRelations = relations(workflowExecutions, ({one}) => ({
	workflow: one(workflows, {
		fields: [workflowExecutions.workflowId],
		references: [workflows.id]
	}),
	user: one(users, {
		fields: [workflowExecutions.userId],
		references: [users.id]
	}),
}));

export const collaborationSessionsRelations = relations(collaborationSessions, ({one, many}) => ({
	user: one(users, {
		fields: [collaborationSessions.userId],
		references: [users.id]
	}),
	collaborationCheckpoints: many(collaborationCheckpoints),
	collaborationMessages: many(collaborationMessages),
	collaborationParticipants: many(collaborationParticipants),
}));

export const collaborationCheckpointsRelations = relations(collaborationCheckpoints, ({one}) => ({
	collaborationSession: one(collaborationSessions, {
		fields: [collaborationCheckpoints.sessionId],
		references: [collaborationSessions.id]
	}),
}));

export const collaborationMessagesRelations = relations(collaborationMessages, ({one}) => ({
	collaborationSession: one(collaborationSessions, {
		fields: [collaborationMessages.sessionId],
		references: [collaborationSessions.id]
	}),
}));

export const collaborationParticipantsRelations = relations(collaborationParticipants, ({one}) => ({
	collaborationSession: one(collaborationSessions, {
		fields: [collaborationParticipants.sessionId],
		references: [collaborationSessions.id]
	}),
}));

export const userLearningProgressRelations = relations(userLearningProgress, ({one}) => ({
	user: one(users, {
		fields: [userLearningProgress.userId],
		references: [users.id]
	}),
	learningModule: one(learningModules, {
		fields: [userLearningProgress.moduleId],
		references: [learningModules.id]
	}),
}));

export const documentActivityRelations = relations(documentActivity, ({one}) => ({
	document: one(documents, {
		fields: [documentActivity.documentId],
		references: [documents.id]
	}),
	user: one(users, {
		fields: [documentActivity.userId],
		references: [users.id]
	}),
}));

export const moodEntriesRelations = relations(moodEntries, ({one}) => ({
	user: one(users, {
		fields: [moodEntries.userId],
		references: [users.id]
	}),
}));

export const communityCommentsRelations = relations(communityComments, ({one, many}) => ({
	communityPost: one(communityPosts, {
		fields: [communityComments.postId],
		references: [communityPosts.id]
	}),
	user: one(users, {
		fields: [communityComments.userId],
		references: [users.id]
	}),
	communityComment: one(communityComments, {
		fields: [communityComments.parentId],
		references: [communityComments.id],
		relationName: "communityComments_parentId_communityComments_id"
	}),
	communityComments: many(communityComments, {
		relationName: "communityComments_parentId_communityComments_id"
	}),
	commentLikes: many(commentLikes),
}));

export const communityPostsRelations = relations(communityPosts, ({one, many}) => ({
	communityComments: many(communityComments),
	communityTopic: one(communityTopics, {
		fields: [communityPosts.topicId],
		references: [communityTopics.id]
	}),
	user: one(users, {
		fields: [communityPosts.userId],
		references: [users.id]
	}),
	postLikes: many(postLikes),
}));

export const communityTopicsRelations = relations(communityTopics, ({many}) => ({
	communityPosts: many(communityPosts),
}));

export const followsRelations = relations(follows, ({one}) => ({
	user_followerId: one(users, {
		fields: [follows.followerId],
		references: [users.id],
		relationName: "follows_followerId_users_id"
	}),
	user_followingId: one(users, {
		fields: [follows.followingId],
		references: [users.id],
		relationName: "follows_followingId_users_id"
	}),
}));

export const commentLikesRelations = relations(commentLikes, ({one}) => ({
	communityComment: one(communityComments, {
		fields: [commentLikes.commentId],
		references: [communityComments.id]
	}),
	user: one(users, {
		fields: [commentLikes.userId],
		references: [users.id]
	}),
}));

export const postLikesRelations = relations(postLikes, ({one}) => ({
	communityPost: one(communityPosts, {
		fields: [postLikes.postId],
		references: [communityPosts.id]
	}),
	user: one(users, {
		fields: [postLikes.userId],
		references: [users.id]
	}),
}));

export const postReactionsRelations = relations(postReactions, ({one}) => ({
	post: one(posts, {
		fields: [postReactions.postId],
		references: [posts.id]
	}),
	user: one(users, {
		fields: [postReactions.userId],
		references: [users.id]
	}),
}));

export const authenticatorRelations = relations(authenticator, ({one}) => ({
	user: one(users, {
		fields: [authenticator.userId],
		references: [users.id]
	}),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(users, {
		fields: [account.userId],
		references: [users.id]
	}),
}));