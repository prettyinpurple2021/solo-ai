import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { scrapingScheduler } from '@/lib/scraping-scheduler'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * GET /api/scraping/metrics
 * Get overall scraping system metrics and performance statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown'; const { allowed } = rateLimitByIp('api', ip, 60000, 100)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Authentication (admin only)
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const adminEmails = (process.env.ADMIN_EMAILS || 'prettyinpurple2021@gmail.com')
      .split(',').map(e => e.trim()).filter(Boolean)
    if (!adminEmails.includes(user.email)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Get system-wide metrics
    const systemMetrics = scrapingScheduler.getMetrics()
    const status = scrapingScheduler.getStatus()

    // Get user-specific job statistics
    const allJobs = Array.from(scrapingScheduler['jobQueue'].values())
    const userJobs = allJobs.filter(job => job.userId === user.id)

    const userMetrics = {
      totalJobs: userJobs.length,
      activeJobs: userJobs.filter(job => job.status === 'pending' || job.status === 'running').length,
      pausedJobs: userJobs.filter(job => job.status === 'paused').length,
      failedJobs: userJobs.filter(job => job.status === 'failed').length,
      completedJobs: userJobs.filter(job => job.status === 'completed').length,
      jobsByType: {
        website: userJobs.filter(job => job.jobType === 'website').length,
        pricing: userJobs.filter(job => job.jobType === 'pricing').length,
        products: userJobs.filter(job => job.jobType === 'products').length,
        jobs: userJobs.filter(job => job.jobType === 'jobs').length,
      },
      jobsByPriority: {
        critical: userJobs.filter(job => job.priority === 'critical').length,
        high: userJobs.filter(job => job.priority === 'high').length,
        medium: userJobs.filter(job => job.priority === 'medium').length,
        low: userJobs.filter(job => job.priority === 'low').length,
      },
    }

    // Get recent job execution history for the user
    const recentExecutions = []
    for (const job of userJobs) {
      const history = scrapingScheduler.getJobHistory(job.id)
      recentExecutions.push(...history.slice(-3)) // Last 3 executions per job
    }

    // Sort by completion time and take the most recent 20
    recentExecutions.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
    const recentHistory = recentExecutions.slice(0, 20)

    // Calculate user success rate
    const userSuccessRate = recentHistory.length > 0
      ? recentHistory.filter(h => h.success).length / recentHistory.length
      : 0

    // Calculate average execution time for user jobs
    const userAvgExecutionTime = recentHistory.length > 0
      ? recentHistory.reduce((sum, h) => sum + h.executionTime, 0) / recentHistory.length
      : 0

    return NextResponse.json({
      success: true,
      data: {
        systemMetrics,
        status,
        userMetrics: {
          ...userMetrics,
          successRate: userSuccessRate,
          averageExecutionTime: userAvgExecutionTime,
        },
        recentHistory,
        summary: {
          totalUserJobs: userJobs.length,
          activeMonitoring: userJobs.filter(job =>
            job.status === 'pending' || job.status === 'running'
          ).length,
          healthScore: calculateHealthScore(userJobs, recentHistory),
          nextScheduledJob: getNextScheduledJob(userJobs),
        },
      },
    })
  } catch (error) {
    logError('Error fetching scraping metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Calculate a health score for the user's scraping system
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculateHealthScore(jobs: any[], recentHistory: any[]): number {
  if (jobs.length === 0) return 100 // No jobs = no problems

  let score = 100

  // Penalize for failed jobs
  const failedJobs = jobs.filter(job => job.status === 'failed').length
  score -= (failedJobs / jobs.length) * 30

  // Penalize for low success rate in recent executions
  if (recentHistory.length > 0) {
    const successRate = recentHistory.filter(h => h.success).length / recentHistory.length
    score -= (1 - successRate) * 40
  }

  // Penalize for jobs with high retry counts
  const highRetryJobs = jobs.filter(job => job.retryCount > 2).length
  score -= (highRetryJobs / jobs.length) * 20

  // Penalize for very slow execution times
  if (recentHistory.length > 0) {
    const avgTime = recentHistory.reduce((sum, h) => sum + h.executionTime, 0) / recentHistory.length
    if (avgTime > 30000) { // More than 30 seconds
      score -= 10
    }
  }

  return Math.max(0, Math.min(100, score))
}

/**
 * Get the next scheduled job for the user
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNextScheduledJob(jobs: any[]): any {
  const pendingJobs = jobs
    .filter(job => job.status === 'pending')
    .sort((a, b) => a.nextRunAt.getTime() - b.nextRunAt.getTime())

  return pendingJobs.length > 0 ? {
    jobId: pendingJobs[0].id,
    jobType: pendingJobs[0].jobType,
    url: pendingJobs[0].url,
    nextRunAt: pendingJobs[0].nextRunAt,
    priority: pendingJobs[0].priority,
  } : null
}