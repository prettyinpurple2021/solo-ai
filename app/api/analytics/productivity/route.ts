import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { neon } from '@neondatabase/serverless'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



// Force dynamic rendering
export const dynamic = 'force-dynamic'

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return neon(url)
}

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const range = url.searchParams.get('range') || 'week'

    const sql = getSql()

    // Calculate date range
    const now = new Date()
    const startDate = new Date()

    switch (range) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Get task analytics
    const tasks = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'pending' AND due_date < NOW() THEN 1 END) as overdue
      FROM tasks 
      WHERE user_id = ${user.id} AND created_at >= ${startDate.toISOString()}
    `

    // Get goal analytics
    const goals = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'achieved' THEN 1 END) as achieved,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress
      FROM goals 
      WHERE user_id = ${user.id} AND created_at >= ${startDate.toISOString()}
    `

    // Get focus session analytics
    const focusSessions = await sql`
      SELECT 
        COUNT(*) as total_sessions,
        COALESCE(SUM(duration_minutes), 0) as total_minutes,
        COALESCE(AVG(duration_minutes), 0) as avg_duration,
        COUNT(CASE WHEN DATE(started_at) >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as weekly_sessions,
        COALESCE(SUM(CASE WHEN DATE(started_at) >= CURRENT_DATE - INTERVAL '7 days' THEN duration_minutes ELSE 0 END), 0) as weekly_minutes
      FROM focus_sessions 
      WHERE user_id = ${user.id} AND started_at >= ${startDate.toISOString()}
    `

    // Get weekly trends (compare with previous period)
    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - (range === 'week' ? 7 : range === 'month' ? 30 : 90))

    // Get focus session trends
    const previousFocusSessions = await sql`
      SELECT 
        COUNT(*) as total_sessions,
        COALESCE(SUM(duration_minutes), 0) as total_minutes
      FROM focus_sessions 
      WHERE user_id = ${user.id} 
        AND started_at >= ${previousStartDate.toISOString()} 
        AND started_at < ${startDate.toISOString()}
    `

    // Get productivity insights
    const insights = await sql`
      SELECT 
        insight_type,
        metrics
      FROM productivity_insights 
      WHERE user_id = ${user.id} AND date >= ${startDate.toISOString()}
      ORDER BY date DESC
      LIMIT 10
    `

    // Calculate completion rate
    const taskData = tasks[0] || { total: 0, completed: 0, pending: 0, overdue: 0 }
    const goalData = goals[0] || { total: 0, achieved: 0, in_progress: 0 }
    const focusData = focusSessions[0] || { total_sessions: 0, total_minutes: 0, avg_duration: 0, weekly_sessions: 0, weekly_minutes: 0 }
    const previousFocusData = previousFocusSessions[0] || { total_sessions: 0, total_minutes: 0 }

    const completionRate = taskData.total > 0 ? Math.round((taskData.completed / taskData.total) * 100) : 0
    const achievementRate = goalData.total > 0 ? Math.round((goalData.achieved / goalData.total) * 100) : 0

    // Calculate focus trends
    const focusTrend = previousFocusData.total_minutes > 0
      ? Math.round(((focusData.total_minutes / Math.max(focusData.total_sessions, 1)) - (previousFocusData.total_minutes / Math.max(previousFocusData.total_sessions, 1))) * 100)
      : 0

    const previousTasks = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
      FROM tasks 
      WHERE user_id = ${user.id} 
        AND created_at >= ${previousStartDate.toISOString()} 
        AND created_at < ${startDate.toISOString()}
    `

    const previousTaskData = previousTasks[0] || { total: 0, completed: 0 }
    const weeklyTrend = previousTaskData.total > 0
      ? Math.round(((taskData.completed / taskData.total) - (previousTaskData.completed / previousTaskData.total)) * 100)
      : 0

    // Get most productive day and time from actual data
    const dailyProductivity = await sql`
      SELECT 
        EXTRACT(DOW FROM created_at) as day_of_week,
        COUNT(*) as task_count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count
      FROM tasks 
      WHERE user_id = ${user.id} AND created_at >= ${startDate.toISOString()}
      GROUP BY EXTRACT(DOW FROM created_at)
      ORDER BY (COUNT(CASE WHEN status = 'completed' THEN 1 END)::FLOAT / NULLIF(COUNT(*), 0)) DESC
      LIMIT 1
    `

    const hourlyProductivity = await sql`
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour_of_day,
        COUNT(*) as task_count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count
      FROM tasks 
      WHERE user_id = ${user.id} AND created_at >= ${startDate.toISOString()}
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY (COUNT(CASE WHEN status = 'completed' THEN 1 END)::FLOAT / NULLIF(COUNT(*), 0)) DESC
      LIMIT 1
    `

    // Process insights for recommendations
    const commonDistractions: string[] = []
    const recommendations: string[] = []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    insights.forEach((insight: any) => {
      if (insight.insight_type === 'distraction_analysis' && insight.metrics) {
        const metrics = typeof insight.metrics === 'string' ? JSON.parse(insight.metrics) : insight.metrics
        if (metrics.distractions) {
          commonDistractions.push(...metrics.distractions)
        }
      }
      if (insight.insight_type === 'recommendations' && insight.metrics) {
        const metrics = typeof insight.metrics === 'string' ? JSON.parse(insight.metrics) : insight.metrics
        if (metrics.recommendations) {
          recommendations.push(...metrics.recommendations)
        }
      }
    })

    // Helper function to get day name from day of week
    const getDayName = (dayOfWeek: number) => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      return days[dayOfWeek] || 'Monday'
    }

    // Helper function to format time
    const formatTime = (hour: number) => {
      const endHour = hour + 2
      return `${hour}:00 ${hour < 12 ? 'AM' : 'PM'} - ${endHour}:00 ${endHour < 12 ? 'AM' : 'PM'}`
    }

    const analyticsData = {
      tasks: {
        total: parseInt(taskData.total) || 0,
        completed: parseInt(taskData.completed) || 0,
        pending: parseInt(taskData.pending) || 0,
        overdue: parseInt(taskData.overdue) || 0,
        completionRate,
        weeklyTrend
      },
      goals: {
        total: parseInt(goalData.total) || 0,
        achieved: parseInt(goalData.achieved) || 0,
        inProgress: parseInt(goalData.in_progress) || 0,
        achievementRate,
        weeklyProgress: parseInt(goalData.achieved) || 0
      },
      focus: {
        totalSessions: parseInt(focusData.total_sessions) || 0,
        totalHours: Math.round((parseInt(focusData.total_minutes) || 0) / 60 * 10) / 10,
        averageSessionLength: Math.round((parseInt(focusData.avg_duration) || 0) * 10) / 10,
        weeklyHours: Math.round((parseInt(focusData.weekly_minutes) || 0) / 60 * 10) / 10,
        weeklyTrend: focusTrend
      },
      productivity: {
        overallScore: completionRate,
        weeklyScore: completionRate + weeklyTrend,
        monthlyScore: completionRate,
        improvement: weeklyTrend
      },
      insights: {
        topPerformingDay: dailyProductivity.length > 0 ? getDayName(parseInt(dailyProductivity[0].day_of_week)) : "Monday",
        mostProductiveTime: hourlyProductivity.length > 0 ? formatTime(parseInt(hourlyProductivity[0].hour_of_day)) : "9:00 AM - 11:00 AM",
        commonDistractions: commonDistractions.slice(0, 3),
        recommendations: recommendations.slice(0, 3)
      }
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    logError('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 })
  }
}

// POST endpoint for tracking focus sessions
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, sessionData } = body

    const sql = getSql()

    if (action === 'start_focus_session') {
      // Start a new focus session
      const { planned_duration_minutes, task_id, session_type = 'focus' } = sessionData

      const result = await sql`
        INSERT INTO focus_sessions (
          user_id, 
          planned_duration_minutes, 
          task_id, 
          session_type, 
          started_at, 
          status
        ) VALUES (
          ${user.id}, 
          ${planned_duration_minutes || 25}, 
          ${task_id || null}, 
          ${session_type}, 
          NOW(), 
          'active'
        )
        RETURNING id, started_at
      `

      return NextResponse.json({
        success: true,
        session: result[0],
        message: 'Focus session started successfully'
      })
    }

    if (action === 'end_focus_session') {
      // End an existing focus session
      const { session_id, actual_duration_minutes, completed = false, notes } = sessionData

      const result = await sql`
        UPDATE focus_sessions 
        SET 
          duration_minutes = ${actual_duration_minutes},
          completed_at = NOW(),
          status = ${completed ? 'completed' : 'interrupted'},
          notes = ${notes || null},
          updated_at = NOW()
        WHERE id = ${session_id} AND user_id = ${user.id}
        RETURNING *
      `

      if (result.length === 0) {
        return NextResponse.json({ error: 'Focus session not found' }, { status: 404 })
      }

      // Update productivity insights based on completed session
      await updateProductivityInsights(user.id, result[0], sql)

      return NextResponse.json({
        success: true,
        session: result[0],
        message: 'Focus session ended successfully'
      })
    }

    if (action === 'track_distraction') {
      // Track a distraction during focus session
      const { session_id, distraction_type, description, timestamp } = sessionData

      await sql`
        INSERT INTO focus_session_distractions (
          session_id,
          distraction_type,
          description,
          occurred_at
        ) VALUES (
          ${session_id},
          ${distraction_type},
          ${description || null},
          ${timestamp ? new Date(timestamp) : new Date()}
        )
      `

      return NextResponse.json({
        success: true,
        message: 'Distraction tracked successfully'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    logError('Focus session tracking error:', error)
    return NextResponse.json({ error: 'Failed to track focus session' }, { status: 500 })
  }
}

// Helper function to update productivity insights
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateProductivityInsights(userId: string, session: any, sql: any) {
  try {
    const completionRate = session.status === 'completed' ? 1 : 0
    const efficiencyScore = session.duration_minutes / session.planned_duration_minutes

    // Get recent sessions for trend analysis
    const recentSessions = await sql`
      SELECT AVG(duration_minutes) as avg_duration, COUNT(*) as session_count
      FROM focus_sessions 
      WHERE user_id = ${userId} 
        AND completed_at >= NOW() - INTERVAL '7 days'
        AND status = 'completed'
    `

    const insights = {
      session_completion_rate: completionRate,
      efficiency_score: Math.min(efficiencyScore, 2), // Cap at 200%
      avg_session_duration: recentSessions[0]?.avg_duration || session.duration_minutes,
      weekly_session_count: recentSessions[0]?.session_count || 0,
      session_date: new Date().toISOString().split('T')[0]
    }

    // Store or update productivity insight
    await sql`
      INSERT INTO productivity_insights (
        user_id,
        date,
        insight_type,
        metrics,
        created_at
      ) VALUES (
        ${userId},
        CURRENT_DATE,
        'focus_session_analysis',
        ${JSON.stringify(insights)},
        NOW()
      )
      ON CONFLICT (user_id, date, insight_type) 
      DO UPDATE SET 
        metrics = ${JSON.stringify(insights)},
        updated_at = NOW()
    `

    // Generate recommendations based on performance
    const recommendations = []
    if (efficiencyScore < 0.8) {
      recommendations.push('Consider breaking tasks into smaller chunks')
      recommendations.push('Try the Pomodoro Technique with 25-minute sessions')
    }
    if (completionRate === 0) {
      recommendations.push('Identify and eliminate common distractions')
      recommendations.push('Start with shorter focus sessions to build momentum')
    }

    if (recommendations.length > 0) {
      await sql`
        INSERT INTO productivity_insights (
          user_id,
          date,
          insight_type,
          metrics,
          created_at
        ) VALUES (
          ${userId},
          CURRENT_DATE,
          'recommendations',
          ${JSON.stringify({ recommendations })},
          NOW()
        )
        ON CONFLICT (user_id, date, insight_type) 
        DO UPDATE SET 
          metrics = ${JSON.stringify({ recommendations })},
          updated_at = NOW()
      `
    }
  } catch (error) {
    logError('Error updating productivity insights:', error)
    // Don't throw - this is a secondary operation
  }
}
