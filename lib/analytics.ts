import { logger, logInfo } from '@/lib/logger'
import { NextRequest } from 'next/server'
import { db } from '@/db'
import { analyticsEvents, users } from '@/db/schema'
import { desc, eq, sql, and, gte } from 'drizzle-orm'

// Analytics event types
export type AnalyticsEvent =
  | 'user_signup'
  | 'user_login'
  | 'user_logout'
  | 'page_view'
  | 'ai_agent_interaction'
  | 'goal_created'
  | 'goal_completed'
  | 'task_created'
  | 'task_completed'
  | 'file_uploaded'
  | 'template_saved'
  | 'dashboard_viewed'
  | 'feature_used'
  | 'error_occurred'
  | 'performance_metric'

export interface AnalyticsEventData {
  event: AnalyticsEvent
  userId?: string
  sessionId?: string
  timestamp: Date
  properties: Record<string, any>
  metadata?: {
    userAgent?: string
    ip?: string
    referrer?: string
    url?: string
  }
}

export interface UserMetrics {
  userId: string
  totalSessions: number
  totalPageViews: number
  totalAIInteractions: number
  goalsCreated: number
  goalsCompleted: number
  tasksCreated: number
  tasksCompleted: number
  filesUploaded: number
  templatesSaved: number
  lastActiveAt: Date
  firstSeenAt: Date
  averageSessionDuration: number
  retentionScore: number
}

export interface PerformanceMetrics {
  pageLoadTime: number
  apiResponseTime: number
  errorRate: number
  uptime: number
  memoryUsage: number
  cpuUsage: number
  databaseQueryTime: number
}

export interface UserBusinessMetrics {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number
  userRetentionRate: number
  featureAdoptionRate: Record<string, number>
}

export interface PlatformMetrics extends UserBusinessMetrics {
  conversionRate: number
  churnRate: number
  revenue: number
  mrr: number
}

class AnalyticsService {
  /**
   * Track an analytics event
   */
  async trackEvent(
    event: AnalyticsEvent,
    properties: Record<string, any> = {},
    request?: NextRequest
  ): Promise<void> {
    const metadata = request ? {
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      referrer: request.headers.get('referer') || undefined,
      url: request.url
    } : undefined

    try {
      await db.insert(analyticsEvents).values({
        user_id: properties.userId,
        event,
        properties,
        metadata,
        session_id: properties.sessionId,
        timestamp: new Date()
      })

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        logInfo('📊 Analytics Event', { event, properties })
      }
    } catch (error) {
      console.error('Failed to track analytics event:', error)
    }
  }

  /**
   * Track performance metrics
   */
  async trackPerformance(metrics: Partial<PerformanceMetrics>): Promise<void> {
    // For now, we'll log performance metrics as standard events
    // In a real production app, you might want a dedicated time-series DB or table
    await this.trackEvent('performance_metric', metrics)
  }

  /**
   * Get user metrics
   * Note: This is a heavy operation and should be optimized or cached in production
   */
  async getUserMetrics(userId: string): Promise<UserMetrics | null> {
    // This is a simplified implementation. In production, you'd want to aggregate this 
    // in a background job or materialized view.
    const events = await db.select()
      .from(analyticsEvents)
      .where(eq(analyticsEvents.user_id, userId))

    if (events.length === 0) return null

    const metrics: UserMetrics = {
      userId,
      totalSessions: events.filter(e => e.event === 'user_login').length,
      totalPageViews: events.filter(e => e.event === 'page_view').length,
      totalAIInteractions: events.filter(e => e.event === 'ai_agent_interaction').length,
      goalsCreated: events.filter(e => e.event === 'goal_created').length,
      goalsCompleted: events.filter(e => e.event === 'goal_completed').length,
      tasksCreated: events.filter(e => e.event === 'task_created').length,
      tasksCompleted: events.filter(e => e.event === 'task_completed').length,
      filesUploaded: events.filter(e => e.event === 'file_uploaded').length,
      templatesSaved: events.filter(e => e.event === 'template_saved').length,
      lastActiveAt: events[events.length - 1]?.timestamp || new Date(),
      firstSeenAt: events[0]?.timestamp || new Date(),
      averageSessionDuration: 0, // Complex to calculate without session tracking
      retentionScore: 0 // Placeholder
    }

    return metrics
  }

  /**
   * Get all user metrics
   */
  async getAllUserMetrics(): Promise<UserMetrics[]> {
    // Fetch all users and calculate metrics
    // WARNING: Very inefficient for large user bases. Use with caution.
    const allUsers = await db.select({ id: users.id }).from(users)
    const metrics: UserMetrics[] = []

    for (const user of allUsers) {
      const userMetric = await this.getUserMetrics(user.id)
      if (userMetric) metrics.push(userMetric)
    }

    return metrics
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics[]> {
    const events = await db.select()
      .from(analyticsEvents)
      .where(eq(analyticsEvents.event, 'performance_metric'))
      .orderBy(desc(analyticsEvents.timestamp))
      .limit(50)

    return events.map(e => e.properties as unknown as PerformanceMetrics)
  }

  /**
   * Calculate business metrics (User Safe Version)
   */
  async calculateBusinessMetrics(): Promise<UserBusinessMetrics> {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Helper to count users created after a date
    const countNewUsers = async (date: Date) => {
      const result = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(gte(users.created_at, date))
      return Number(result[0]?.count || 0)
    }

    const totalUsersResult = await db.select({ count: sql<number>`count(*)` }).from(users)
    const totalUsers = Number(totalUsersResult[0]?.count || 0)

    const newUsersToday = await countNewUsers(oneDayAgo)
    const newUsersThisWeek = await countNewUsers(oneWeekAgo)
    const newUsersThisMonth = await countNewUsers(oneMonthAgo)

    // Active users (active in last 7 days)
    // We check analytics events for activity
    const activeUsersResult = await db.select({ count: sql<number>`count(distinct ${analyticsEvents.user_id})` })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.timestamp, oneWeekAgo))
    const activeUsers = Number(activeUsersResult[0]?.count || 0)

    return {
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      userRetentionRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
      featureAdoptionRate: {}, // TODO: Implement
    }
  }

  /**
   * Get Platform Metrics (ADMIN ONLY - Contains Revenue Data)
   */
  async getPlatformMetrics(adminUserId: string): Promise<PlatformMetrics | null> {
    // Verify admin status (this should be robust in production)
    // For now, we assume the caller has verified auth, but we double check role if available
    // const user = await db.query.users.findFirst({ where: eq(users.id, adminUserId) })
    // if (user?.role !== 'admin') return null;

    const baseMetrics = await this.calculateBusinessMetrics()

    return {
      ...baseMetrics,
      conversionRate: 0, // TODO: Implement with real Stripe data
      churnRate: 0, // TODO: Implement with real Stripe data
      revenue: 0, // TODO: Implement with real Stripe data
      mrr: 0 // TODO: Implement with real Stripe data
    }
  }

  /**
   * Get analytics dashboard data
   */
  async getDashboardData(): Promise<{
    events: AnalyticsEventData[]
    userMetrics: UserMetrics[]
    performanceMetrics: PerformanceMetrics[]
    businessMetrics: UserBusinessMetrics
  }> {
    const businessMetrics = await this.calculateBusinessMetrics()
    const performanceMetrics = await this.getPerformanceMetrics()

    const recentEvents = await db.select()
      .from(analyticsEvents)
      .orderBy(desc(analyticsEvents.timestamp))
      .limit(100)

    const events = recentEvents.map(e => ({
      event: e.event as AnalyticsEvent,
      timestamp: e.timestamp!,
      properties: e.properties as Record<string, any>,
      metadata: e.metadata as any,
      userId: e.user_id || undefined,
      sessionId: e.session_id || undefined
    }))

    // For dashboard, we might want top users or something, but for now let's return empty or basic
    // to avoid performance issues with getAllUserMetrics()
    const userMetrics: UserMetrics[] = []

    return {
      events,
      userMetrics,
      performanceMetrics,
      businessMetrics
    }
  }

  /**
   * Clear old data (for memory management) - No longer needed for DB, but could be a cleanup job
   */
  async clearOldData(): Promise<void> {
    // Implementation for DB cleanup if needed
  }
}

// Export singleton instance
export const analytics = new AnalyticsService()

// Helper functions for common tracking scenarios
export const trackUserSignup = (userId: string, properties: Record<string, any> = {}) =>
  analytics.trackEvent('user_signup', { userId, ...properties })

export const trackUserLogin = (userId: string, properties: Record<string, any> = {}) =>
  analytics.trackEvent('user_login', { userId, ...properties })

export const trackPageView = (userId: string, page: string, properties: Record<string, any> = {}) =>
  analytics.trackEvent('page_view', { userId, page, ...properties })

export const trackAIAgentInteraction = (userId: string, agentName: string, properties: Record<string, any> = {}) =>
  analytics.trackEvent('ai_agent_interaction', { userId, agentName, ...properties })

export const trackGoalCreated = (userId: string, goalId: string, properties: Record<string, any> = {}) =>
  analytics.trackEvent('goal_created', { userId, goalId, ...properties })

export const trackGoalCompleted = (userId: string, goalId: string, properties: Record<string, any> = {}) =>
  analytics.trackEvent('goal_completed', { userId, goalId, ...properties })

export const trackTaskCreated = (userId: string, taskId: string, properties: Record<string, any> = {}) =>
  analytics.trackEvent('task_created', { userId, taskId, ...properties })

export const trackTaskCompleted = (userId: string, taskId: string, properties: Record<string, any> = {}) =>
  analytics.trackEvent('task_completed', { userId, taskId, ...properties })

export const trackFileUpload = (userId: string, fileId: string, properties: Record<string, any> = {}) =>
  analytics.trackEvent('file_uploaded', { userId, fileId, ...properties })

export const trackTemplateSaved = (userId: string, templateId: string, properties: Record<string, any> = {}) =>
  analytics.trackEvent('template_saved', { userId, templateId, ...properties })

export const trackError = (userId: string, error: string, properties: Record<string, any> = {}) =>
  analytics.trackEvent('error_occurred', { userId, error, ...properties })

export const trackPerformance = (metrics: Partial<PerformanceMetrics>) =>
  analytics.trackPerformance(metrics)

