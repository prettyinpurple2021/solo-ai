import { logError, logInfo } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import * as jose from 'jose'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return neon(url)
}

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// JWT authentication helper
async function authenticateRequest(request: NextRequest) {
  try {
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get('authorization')
    const cookieToken = request.cookies.get('auth_token')?.value

    let token: string | null = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else if (cookieToken) {
      token = cookieToken
    }

    if (!token) {
      logError('Dashboard API: No authorization token found')
      return { user: null, error: 'No authorization found' }
    }

    if (!process.env.JWT_SECRET) {
      logError('Dashboard API: JWT_SECRET is not set')
      return { user: null, error: 'JWT secret not configured' }
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload: decoded } = await jose.jwtVerify(token, secret)
    logInfo('Dashboard API: JWT token verified successfully', { userId: decoded.userId })

    return {
      user: {
        id: decoded.userId,
        email: decoded.email,
        full_name: decoded.full_name || null,
        avatar_url: null,
        subscription_tier: 'free',
        level: 1,
        total_points: 0,
        current_streak: 0,
        wellness_score: 50,
        focus_minutes: 0,
        onboarding_completed: false
      },
      error: null
    }
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logError('Dashboard API: Authentication error:', error as any)
    return { user: null, error: 'Authentication failed' }
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request (JWT)
    const { user, error } = await authenticateRequest(request)

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data from database or create if doesn't exist
    const sql = getSql()

    // Use the user ID directly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let dbUserId = user.id as any

    // First, try to get existing user data by ID
    let userData = await sql`
      SELECT id, email, full_name, avatar_url, subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id, current_period_start, current_period_end, cancel_at_period_end, is_verified, created_at, updated_at
      FROM users 
      WHERE id = ${dbUserId}
    `

    let dbUser = userData[0]

    // If not found by ID, try by email
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!dbUser && (user.email as any)) {
      const emailUserData = await sql`
        SELECT id, email, full_name, avatar_url, subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id, current_period_start, current_period_end, cancel_at_period_end, is_verified, created_at, updated_at
        FROM users 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        WHERE email = ${user.email as any}
      `
      dbUser = emailUserData[0]
      if (dbUser) {
        // Update the dbUserId to match the existing user's ID
        dbUserId = dbUser.id
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        logInfo('Found user by email, updating dbUserId', { oldId: user.id, newId: dbUserId, email: user.email as any })
      }
    }

    // If user doesn't exist in database, create them (with conflict handling)
    if (!dbUser) {
      try {
        const newUser = await sql`
          INSERT INTO users (id, email, full_name, avatar_url, subscription_tier, subscription_status, cancel_at_period_end, is_verified, created_at, updated_at)
          VALUES (${dbUserId}, ${user.email}, ${user.full_name}, ${user.avatar_url}, 'launch', 'active', false, false, NOW(), NOW())
          RETURNING id, email, full_name, avatar_url, subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id, current_period_start, current_period_end, cancel_at_period_end, is_verified, created_at, updated_at
        `
        dbUser = newUser[0]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (insertError: any) {
        // Handle duplicate key constraint - user might have been created by another request
        if (insertError?.code === '23505' && insertError?.constraint === 'users_email_key') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          logInfo('User already exists, fetching existing user', { email: user.email as any })
          // Fetch the existing user
          const existingUser = await sql`
            SELECT id, email, full_name, avatar_url, subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id, current_period_start, current_period_end, cancel_at_period_end, is_verified, created_at, updated_at
            FROM users 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            WHERE email = ${user.email as any}
          `
          dbUser = existingUser[0]
        } else {
          throw insertError // Re-throw if it's a different error
        }
      }
    }

    // Get basic data from existing tables (simplified for now)
    // PERFORMANCE OPTIMIZATION: Execute all queries in parallel using Promise.allSettled
    // This reduces total query time from ~N queries sequential to single parallel batch
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let todaysStatsRes: any, todaysTasksRes: any, activeGoalsRes: any, conversationsRes: any, achievementsRes: any, weeklyFocusRes: any, briefcasesRes: any, userStatsRes: any;

    const defaultUserStats = [{
      total_tasks_completed: 0,
      total_tasks: 0,
      tasks_completed_today: 0,
      goals_achieved: 0,
      ai_interactions: 0,
      total_focus_minutes: 0,
      user_level: 1,
      total_points: 0,
      current_streak: 0,
      wellness_score: 50
    }];
    const defaultTodaysStats = [{ tasks_completed: 0, total_tasks: 0, focus_minutes: 0, ai_interactions: 0, goals_achieved: 0, productivity_score: 0 }];
    const defaultWeeklyFocus = [{ total_minutes: 0, sessions_count: 0, average_session: 0 }];

    // Execute all database queries in parallel for maximum performance
    const results = await Promise.allSettled([
      // Query 1: User stats
      sql`
        SELECT 
          COALESCE(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END), 0) AS total_tasks_completed,
          COALESCE(COUNT(DISTINCT t.id), 0) AS total_tasks,
          COALESCE(SUM(CASE WHEN t.status = 'completed' AND DATE(t.updated_at) = CURRENT_DATE THEN 1 ELSE 0 END), 0) AS tasks_completed_today,
          COALESCE(COUNT(DISTINCT CASE WHEN g.status = 'completed' THEN g.id END), 0) AS goals_achieved,
          COALESCE(COUNT(DISTINCT c.id), 0) AS ai_interactions,
          COALESCE(SUM(CASE WHEN t.estimated_minutes IS NOT NULL THEN t.estimated_minutes ELSE 0 END), 0) AS total_focus_minutes,
          GREATEST(1, FLOOR(COALESCE(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END), 0) / 10) + 1) AS user_level,
          (COALESCE(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END), 0) * 10) + 
          (COALESCE(COUNT(DISTINCT CASE WHEN g.status = 'completed' THEN g.id END), 0) * 50) AS total_points,
          COALESCE((
            SELECT COUNT(DISTINCT DATE(updated_at))
            FROM tasks 
            WHERE user_id = ${dbUserId} 
              AND status = 'completed' 
              AND updated_at >= CURRENT_DATE - INTERVAL '30 days'
          ), 0) AS current_streak,
          LEAST(100, GREATEST(0, 
            CASE 
              WHEN COUNT(DISTINCT t.id) = 0 THEN 50
              ELSE ROUND(
                (COALESCE(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END), 0)::FLOAT / 
                 NULLIF(COUNT(DISTINCT t.id), 0)) * 100
              )
            END
          )) AS wellness_score
        FROM users u
        LEFT JOIN tasks t ON u.id = t.user_id
        LEFT JOIN goals g ON u.id = g.user_id
        LEFT JOIN conversations c ON u.id = c.user_id
        WHERE u.id = ${dbUserId}
      `,

      // Query 2: Today's stats (optimized - removed subqueries)
      sql`
        SELECT 
            COALESCE(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END),0) AS tasks_completed,
            COUNT(t.id) AS total_tasks,
            COALESCE(SUM(CASE WHEN fs.duration_minutes IS NOT NULL THEN fs.duration_minutes ELSE 0 END), 0) AS focus_minutes,
            COALESCE(COUNT(DISTINCT c.id), 0) AS ai_interactions,
            COALESCE(COUNT(DISTINCT CASE WHEN g.status = 'completed' THEN g.id END), 0) AS goals_achieved,
            CASE 
              WHEN COUNT(t.id) = 0 THEN 0
              ELSE ROUND(
                (COALESCE(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END), 0)::FLOAT / 
                 COUNT(t.id)) * 100
              )
            END AS productivity_score
         FROM tasks t
         LEFT JOIN focus_sessions fs ON t.user_id = fs.user_id AND DATE(fs.started_at) = CURRENT_DATE
         LEFT JOIN conversations c ON t.user_id = c.user_id AND DATE(c.last_message_at) = CURRENT_DATE
         LEFT JOIN goals g ON t.user_id = g.user_id AND g.status = 'completed' AND DATE(g.updated_at) = CURRENT_DATE
         WHERE t.user_id = ${dbUserId} AND DATE(t.updated_at) = CURRENT_DATE
      `,

      // Query 3: Today's tasks
      sql`
        SELECT id, title, description, status, priority, due_date
           FROM tasks
          WHERE user_id = ${dbUserId}
          ORDER BY COALESCE(due_date, NOW()) ASC
          LIMIT 10
      `,

      // Query 4: Briefcases
      sql`
        SELECT 
          b.id, b.title, b.description, b.status, b.metadata,
          b.created_at, b.updated_at,
          COUNT(DISTINCT g.id) as goal_count,
          COUNT(DISTINCT t.id) as task_count
        FROM briefcases b
        LEFT JOIN goals g ON b.id = g.briefcase_id
        LEFT JOIN tasks t ON b.id = t.briefcase_id
        WHERE b.user_id = ${dbUserId}
        GROUP BY b.id, b.title, b.description, b.status, b.metadata, b.created_at, b.updated_at
        ORDER BY b.updated_at DESC
        LIMIT 6
      `,

      // Query 5: Active goals
      sql`
        SELECT 
          g.id, g.title, g.description, g.target_date, g.category, g.status,
          COALESCE(
            ROUND(
              (COUNT(CASE WHEN t.status = 'completed' THEN 1 END)::FLOAT / 
               NULLIF(COUNT(t.id), 0)) * 100
            ), 0
          ) AS progress_percentage,
          COUNT(t.id) AS tasks_total,
          COUNT(CASE WHEN t.status = 'completed' THEN 1 END) AS tasks_completed
        FROM goals g
        LEFT JOIN tasks t ON g.id = t.goal_id
        WHERE g.user_id = ${dbUserId} AND g.status = 'active'
        GROUP BY g.id, g.title, g.description, g.target_date, g.category, g.status
        ORDER BY g.updated_at DESC
        LIMIT 5
      `,

      // Query 6: Recent conversations
      sql`
        SELECT 
          c.id, c.title, c.last_message_at,
          a.name, a.display_name, a.accent_color
        FROM conversations c
        LEFT JOIN agents a ON c.agent_id = a.id
        WHERE c.user_id = ${dbUserId}
        ORDER BY c.last_message_at DESC
        LIMIT 5
      `,

      // Query 7: Recent achievements
      sql`
        SELECT 
          ua.id, ua.earned_at,
          a.name, a.title, a.description, a.icon, a.points
        FROM user_achievements ua
        LEFT JOIN achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = ${dbUserId}
        ORDER BY ua.earned_at DESC
        LIMIT 5
      `,

      // Query 8: Weekly focus sessions
      sql`
        SELECT 
          COALESCE(SUM(duration_minutes), 0) AS total_minutes,
          COUNT(*) AS sessions_count,
          CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND(AVG(duration_minutes), 1)
          END AS average_session
        FROM focus_sessions 
        WHERE user_id = ${dbUserId} 
          AND started_at >= CURRENT_DATE - INTERVAL '7 days'
      `
    ])

    // Extract results with fallbacks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userStatsRes = results[0].status === 'fulfilled' ? (results[0] as any).value : defaultUserStats
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    todaysStatsRes = results[1].status === 'fulfilled' ? (results[1] as any).value : defaultTodaysStats
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    todaysTasksRes = results[2].status === 'fulfilled' ? (results[2] as any).value : []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    briefcasesRes = results[3].status === 'fulfilled' ? (results[3] as any).value : []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activeGoalsRes = results[4].status === 'fulfilled' ? (results[4] as any).value : []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    conversationsRes = results[5].status === 'fulfilled' ? (results[5] as any).value : []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    achievementsRes = results[6].status === 'fulfilled' ? (results[6] as any).value : []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    weeklyFocusRes = results[7].status === 'fulfilled' ? (results[7] as any).value : defaultWeeklyFocus

    const todaysStatsRow = todaysStatsRes[0] || {
      tasks_completed: 0,
      total_tasks: 0,
      focus_minutes: 0,
      ai_interactions: 0,
      goals_achieved: 0,
      productivity_score: 0,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const todaysTasks = todaysTasksRes.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      status: r.status,
      priority: r.priority,
      due_date: r.due_date,
      goal: null, // Simplified for now
    }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeGoals = activeGoalsRes.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      progress_percentage: r.progress_percentage,
      target_date: r.target_date,
      category: r.category,
      tasks_total: r.tasks_total,
      tasks_completed: r.tasks_completed,
    }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recentConversations = conversationsRes.map((r: any) => ({
      id: r.id,
      title: null,
      last_message_at: r.last_message_at,
      agent: { name: r.name, display_name: r.display_name, accent_color: r.accent_color },
    }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recentAchievements = achievementsRes.map((r: any) => ({
      id: r.id,
      earned_at: r.earned_at,
      achievement: { name: r.name, title: r.title, description: r.description, icon: r.icon, points: r.points },
    }))

    const weeklyFocusRow = weeklyFocusRes[0] || { total_minutes: 0, sessions_count: 0, average_session: 0 }

    // Transform briefcases data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recentBriefcases = briefcasesRes.map((b: any) => ({
      id: b.id,
      title: b.title,
      description: b.description,
      status: b.status,
      goal_count: parseInt(b.goal_count),
      task_count: parseInt(b.task_count),
      created_at: b.created_at,
      updated_at: b.updated_at,
    }))

    // Generate some sample insights for new users
    const insights = todaysTasks.length === 0 && recentBriefcases.length === 0 ? [
      {
        type: 'welcome',
        title: 'Welcome to SoloSuccess AI!',
        description: 'Start by creating your first briefcase (project) to get organized.',
        action: 'Create Briefcase'
      }
    ] : []

    // Get real user stats from database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userStats = (userStatsRes?.[0] as any) || {
      total_tasks_completed: 0,
      total_tasks: 0,
      tasks_completed_today: 0,
      goals_achieved: 0,
      ai_interactions: 0,
      total_focus_minutes: 0,
      user_level: 1,
      total_points: 0,
      current_streak: 0,
      wellness_score: 50
    };

    const responseData = {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        full_name: dbUser.full_name || user.full_name || null,
        avatar_url: dbUser.avatar_url || user.avatar_url || null,
        subscription_tier: dbUser.subscription_tier || 'free',
        level: userStats.user_level, // Real level based on completed tasks
        total_points: userStats.total_points, // Real points based on achievements
        current_streak: userStats.current_streak, // Real streak based on activity
        wellness_score: userStats.wellness_score, // Real wellness score based on completion rate
        focus_minutes: userStats.total_focus_minutes, // Real focus minutes from tasks
        onboarding_completed: dbUser.onboarding_completed || false, // Real onboarding status
      },
      todaysStats: todaysStatsRow,
      todaysTasks,
      activeGoals,
      recentConversations,
      recentAchievements,
      recentBriefcases,
      weeklyFocus: weeklyFocusRow,
      insights,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logError('Dashboard API error:', error as any)
    logError('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    )
  }
}
