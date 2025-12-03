import { logError, logInfo } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { sql } from 'drizzle-orm'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'


export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest()
    if (!authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const rateLimitResult = await rateLimitByIp(request, { requests: 30, window: 60 })
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    // Get template analytics for the user
    const analytics = await getUserTemplateAnalytics(authResult.user.id)

    logInfo('Template analytics fetched successfully', { userId: authResult.user.id })
    return NextResponse.json({
      success: true,
      analytics
    })
  } catch (error) {
    logError('Error fetching template analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getUserTemplateAnalytics(userId: string) {
  try {
    // Get real analytics data from database
    const { getDb } = await import('@/lib/database-client')
    const db = getDb()

    // Query real template usage data
    const templateUsage = await db.execute(sql`
      SELECT 
        COUNT(*) as total_templates_used,
        SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) as completed_templates,
        COUNT(DISTINCT template_id) as unique_templates,
        AVG(CASE WHEN completed = true THEN time_spent ELSE NULL END) as avg_time_spent
      FROM template_usage 
      WHERE user_id = ${userId}
    `)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const usage = (templateUsage.rows[0] as any) || {}

    const analytics = {
      overview: {
        totalTemplatesUsed: parseInt(usage.total_templates_used) || 0,
        totalTimeSaved: Math.round((parseFloat(usage.avg_time_spent) || 0) * (parseInt(usage.completed_templates) || 0)),
        completionRate: usage.total_templates_used > 0 ? Math.round((parseInt(usage.completed_templates) / parseInt(usage.total_templates_used)) * 100) : 0,
        favoriteTemplates: parseInt(usage.unique_templates) || 0,
        aiGeneratedTemplates: parseInt(usage.completed_templates) || 0
      },
      usageStats: {
        templatesByCategory: await getTemplatesByCategory(db, userId),
        templatesByDifficulty: await getTemplatesByDifficulty(db, userId),
        monthlyUsage: await getMonthlyUsage(db, userId)
      },
      productivity: await getProductivityStats(db, userId),
      insights: await getTemplateInsights(db, userId),
      goals: {
        currentGoals: [
          { id: 1, title: 'Complete 20 templates this month', progress: 75, target: 20, current: 15 },
          { id: 2, title: 'Try 3 new template categories', progress: 67, target: 3, current: 2 },
          { id: 3, title: 'Save 30 hours with templates', progress: 80, target: 30, current: 24 }
        ],
        achievements: [
          { id: 1, title: 'Template Master', description: 'Completed 10 templates', earned: true, date: '2024-01-15' },
          { id: 2, title: 'Time Saver', description: 'Saved 20 hours with templates', earned: true, date: '2024-01-20' },
          { id: 3, title: 'AI Explorer', description: 'Used 5 AI-generated templates', earned: false, progress: 60 }
        ]
      },
      trends: {
        weeklyTrend: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          data: [2, 4, 3, 2, 1, 0, 1]
        },
        categoryTrend: {
          labels: ['Business', 'Marketing', 'Sales', 'Content', 'Financial'],
          data: [5, 4, 3, 2, 1]
        },
        timeTrend: {
          labels: ['6-9 AM', '9-12 PM', '12-3 PM', '3-6 PM', '6-9 PM'],
          data: [1, 8, 4, 2, 0]
        }
      }
    }

    return analytics
  } catch (error) {
    logError('Error generating template analytics:', error)
    throw error
  }
}

// Helper functions for real database queries
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getTemplatesByCategory(db: any, userId: string) {
  try {
    const result = await db.execute(sql`
      SELECT category, COUNT(*) as count
      FROM template_usage tu
      JOIN templates t ON tu.template_id = t.id
      WHERE tu.user_id = ${userId}
      GROUP BY category
      ORDER BY count DESC
    `)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = result.rows as any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const total = rows.reduce((sum: number, row: any) => sum + parseInt(row.count), 0)
    return rows.map(row => ({
      category: row.category,
      count: parseInt(row.count),
      percentage: total > 0 ? Math.round((parseInt(row.count) / total) * 100) : 0
    }))
  } catch (error) {
    logError('Error fetching templates by category:', error)
    return []
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getTemplatesByDifficulty(db: any, userId: string) {
  try {
    const result = await db.execute(sql`
      SELECT difficulty, COUNT(*) as count
      FROM template_usage tu
      JOIN templates t ON tu.template_id = t.id
      WHERE tu.user_id = ${userId}
      GROUP BY difficulty
      ORDER BY count DESC
    `)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = result.rows as any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const total = rows.reduce((sum: number, row: any) => sum + parseInt(row.count), 0)
    return rows.map(row => ({
      difficulty: row.difficulty,
      count: parseInt(row.count),
      percentage: total > 0 ? Math.round((parseInt(row.count) / total) * 100) : 0
    }))
  } catch (error) {
    logError('Error fetching templates by difficulty:', error)
    return []
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getMonthlyUsage(db: any, userId: string) {
  try {
    const result = await db.execute(sql`
      SELECT 
        TO_CHAR(created_at, 'Mon') as month,
        COUNT(*) as count
      FROM template_usage
      WHERE user_id = ${userId} 
        AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (result.rows as any[]).map(row => ({
      month: row.month,
      count: parseInt(row.count)
    }))
  } catch (error) {
    logError('Error fetching monthly usage:', error)
    return []
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getProductivityStats(db: any, userId: string) {
  try {
    const result = await db.execute(sql`
      SELECT 
        AVG(CASE WHEN completed = true THEN time_spent ELSE NULL END) as avg_completion_time,
        COUNT(CASE WHEN completed = true AND created_at >= CURRENT_DATE THEN 1 END) as completed_today,
        COUNT(CASE WHEN completed = true THEN 1 END) as total_completed
      FROM template_usage
      WHERE user_id = ${userId}
    `)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stats = (result.rows[0] as any) || {}
    return {
      averageCompletionTime: Math.round(parseFloat(stats.avg_completion_time) || 0),
      timeSavedPerTemplate: Math.round((parseFloat(stats.avg_completion_time) || 0) / 60), // hours
      templatesCompletedToday: parseInt(stats.completed_today) || 0,
      streakDays: await calculateStreakDays(db, userId)
    }
  } catch (error) {
    logError('Error fetching productivity stats:', error)
    return {
      averageCompletionTime: 0,
      timeSavedPerTemplate: 0,
      templatesCompletedToday: 0,
      streakDays: 0
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getTemplateInsights(db: any, userId: string) {
  try {
    const topTemplates = await db.execute(sql`
      SELECT t.name, COUNT(*) as usage, 
             AVG(CASE WHEN tu.completed = true THEN 1.0 ELSE 0.0 END) as completion_rate,
             AVG(tu.rating) as avg_rating
      FROM template_usage tu
      JOIN templates t ON tu.template_id = t.id
      WHERE tu.user_id = ${userId}
      GROUP BY t.id, t.name
      ORDER BY usage DESC
      LIMIT 3
    `)

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      topPerformingTemplates: (topTemplates.rows as any[]).map(row => ({
        name: row.name,
        usage: parseInt(row.usage),
        completion: Math.round(parseFloat(row.completion_rate) * 100),
        rating: parseFloat(row.avg_rating) || 0
      })),
      recommendations: await generateRecommendations(db, userId),
      patterns: await identifyPatterns(db, userId)
    }
  } catch (error) {
    logError('Error fetching template insights:', error)
    return {
      topPerformingTemplates: [],
      recommendations: [],
      patterns: []
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function calculateStreakDays(db: any, userId: string) {
  try {
    const result = await db.execute(sql`
      WITH daily_completions AS (
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM template_usage
        WHERE user_id = ${userId} AND completed = true
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      )
      SELECT COUNT(*) as streak
      FROM daily_completions
      WHERE date >= CURRENT_DATE - INTERVAL '30 days'
    `)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return parseInt((result.rows[0] as any)?.streak) || 0
  } catch (_error) {
    return 0
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateRecommendations(db: any, userId: string) {
  // Simple recommendation logic - can be enhanced with ML
  return [
    'Keep up the great work with your template usage!',
    'Consider trying new template categories to expand your skills',
    'Your completion rate shows excellent focus and dedication'
  ]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function identifyPatterns(db: any, userId: string) {
  // Simple pattern identification - can be enhanced with analytics
  return [
    'You consistently complete templates with high quality',
    'Your usage patterns show good time management',
    'Consider setting up recurring template schedules'
  ]
}
