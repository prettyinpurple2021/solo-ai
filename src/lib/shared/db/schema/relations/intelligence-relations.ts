
import { relations } from 'drizzle-orm';
import * as users from '../users';
import * as intelligence from '../intelligence';

export const competitorProfilesRelations = relations(intelligence.competitorProfiles, ({ one, many }) => ({
  user: one(users.users, {
    fields: [intelligence.competitorProfiles.user_id],
    references: [users.users.id],
  }),
  intelligenceData: many(intelligence.intelligenceData),
  alerts: many(intelligence.competitorAlerts),
  scrapingJobs: many(intelligence.scrapingJobs),
  opportunities: many(intelligence.competitiveOpportunities),
}));

export const intelligenceDataRelations = relations(intelligence.intelligenceData, ({ one, many }) => ({
  competitor: one(intelligence.competitorProfiles, {
    fields: [intelligence.intelligenceData.competitor_id],
    references: [intelligence.competitorProfiles.id],
  }),
  user: one(users.users, {
    fields: [intelligence.intelligenceData.user_id],
    references: [users.users.id],
  }),
  alerts: many(intelligence.competitorAlerts),
}));

export const competitorAlertsRelations = relations(intelligence.competitorAlerts, ({ one }) => ({
  competitor: one(intelligence.competitorProfiles, {
    fields: [intelligence.competitorAlerts.competitor_id],
    references: [intelligence.competitorProfiles.id],
  }),
  user: one(users.users, {
    fields: [intelligence.competitorAlerts.user_id],
    references: [users.users.id],
  }),
  intelligence: one(intelligence.intelligenceData, {
    fields: [intelligence.competitorAlerts.intelligence_id],
    references: [intelligence.intelligenceData.id],
  }),
}));

export const scrapingJobsRelations = relations(intelligence.scrapingJobs, ({ one, many }) => ({
  competitor: one(intelligence.competitorProfiles, {
    fields: [intelligence.scrapingJobs.competitor_id],
    references: [intelligence.competitorProfiles.id],
  }),
  user: one(users.users, {
    fields: [intelligence.scrapingJobs.user_id],
    references: [users.users.id],
  }),
  results: many(intelligence.scrapingJobResults),
}));

export const scrapingJobResultsRelations = relations(intelligence.scrapingJobResults, ({ one }) => ({
  job: one(intelligence.scrapingJobs, {
    fields: [intelligence.scrapingJobResults.job_id],
    references: [intelligence.scrapingJobs.id],
  }),
}));

export const competitiveOpportunitiesRelations = relations(intelligence.competitiveOpportunities, ({ one, many }) => ({
  user: one(users.users, {
    fields: [intelligence.competitiveOpportunities.user_id],
    references: [users.users.id],
  }),
  competitor: one(intelligence.competitorProfiles, {
    fields: [intelligence.competitiveOpportunities.competitor_id],
    references: [intelligence.competitorProfiles.id],
  }),
  intelligence: one(intelligence.intelligenceData, {
    fields: [intelligence.competitiveOpportunities.intelligence_id],
    references: [intelligence.intelligenceData.id],
  }),
  assignedUser: one(users.users, {
    fields: [intelligence.competitiveOpportunities.assigned_to],
    references: [users.users.id],
  }),
  actions: many(intelligence.opportunityActions),
  metrics: many(intelligence.opportunityMetrics),
}));

export const opportunityActionsRelations = relations(intelligence.opportunityActions, ({ one }) => ({
  opportunity: one(intelligence.competitiveOpportunities, {
    fields: [intelligence.opportunityActions.opportunity_id],
    references: [intelligence.competitiveOpportunities.id],
  }),
  user: one(users.users, {
    fields: [intelligence.opportunityActions.user_id],
    references: [users.users.id],
  }),
}));

export const opportunityMetricsRelations = relations(intelligence.opportunityMetrics, ({ one }) => ({
  opportunity: one(intelligence.competitiveOpportunities, {
    fields: [intelligence.opportunityMetrics.opportunity_id],
    references: [intelligence.competitiveOpportunities.id],
  }),
  user: one(users.users, {
    fields: [intelligence.opportunityMetrics.user_id],
    references: [users.users.id],
  }),
}));

export const competitorActivitiesRelations = relations(intelligence.competitorActivities, ({ one }) => ({
  competitor: one(intelligence.competitorProfiles, {
    fields: [intelligence.competitorActivities.competitor_id],
    references: [intelligence.competitorProfiles.id],
  }),
  user: one(users.users, {
    fields: [intelligence.competitorActivities.user_id],
    references: [users.users.id],
  }),
}));
