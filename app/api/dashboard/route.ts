import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/neon/server'
import { authenticateRequest } from '@/lib/auth-server'

export async function GET(_request: NextRequest) {
  try {
    // Authenticate the request
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data from database or create if doesn't exist
    const client = await createClient()
    
    // First, try to get existing user data
    let { rows: userData } = await client.query(
      'SELECT id, email, full_name, avatar_url, subscription_tier, level, total_points, current_streak, wellness_score, focus_minutes, onboarding_completed FROM users WHERE id = $1',
      [user.id]
    )

    let dbUser = userData[0]

    // If user doesn't exist in database, create them
    if (!dbUser) {
      const { rows: newUser } = await client.query(
        `INSERT INTO users (id, email, full_name, avatar_url, subscription_tier, level, total_points, current_streak, wellness_score, focus_minutes, onboarding_completed, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
         RETURNING id, email, full_name, avatar_url, subscription_tier, level, total_points, current_streak, wellness_score, focus_minutes, onboarding_completed`,
        [
          user.id,
          user.email,
          user.full_name,
          user.avatar_url,
          'free',
          1,
          0,
          0,
          50,
          0,
          false
        ]
      )
      dbUser = newUser[0]
    }

    // Aggregate real dashboard data from Neon
    const [todaysStatsRes, todaysTasksRes, activeGoalsRes, conversationsRes, achievementsRes, weeklyFocusRes] = await Promise.all([
      client.query(
        `SELECT 
            COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END),0) AS tasks_completed,
            COUNT(*) AS total_tasks,
            0 AS focus_minutes,
            0 AS ai_interactions,
            0 AS goals_achieved,
            0 AS productivity_score
         FROM tasks 
         WHERE user_id = $1 AND DATE(updated_at) = CURRENT_DATE`,
        [user.id]
      ),
      client.query(
        `SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date,
                g.id AS goal_id, g.title AS goal_title, g.category AS goal_category
           FROM tasks t
           LEFT JOIN goals g ON g.id = t.goal_id
          WHERE t.user_id = $1
          ORDER BY COALESCE(t.due_date, NOW()) ASC
          LIMIT 10`,
        [user.id]
      ),
      client.query(
        `SELECT id, title, description, progress_percentage, target_date, category,
                0 AS tasks_total,
                0 AS tasks_completed
           FROM goals
          WHERE user_id = $1 AND status = 'active'
          ORDER BY created_at DESC
          LIMIT 6`,
        [user.id]
      ),
      client.query(
        `SELECT c.id, c.created_at AS last_message_at,
                a.name, a.display_name, a.accent_color
           FROM conversations c
           JOIN ai_agents a ON a.name = c.agent_id
          WHERE c.user_id = $1
          ORDER BY c.created_at DESC
          LIMIT 6`,
        [user.id]
      ),
      client.query(
        `SELECT ua.id, ua.earned_at, 
                a.name, a.title, a.description, a.icon, a.points
           FROM user_achievements ua
           JOIN achievements a ON a.id = ua.achievement_id
          WHERE ua.user_id = $1
          ORDER BY ua.earned_at DESC
          LIMIT 6`,
        [user.id]
      ),
      client.query(
        `SELECT COALESCE(SUM(duration_minutes),0) AS total_minutes,
                COUNT(*) AS sessions_count,
                COALESCE(AVG(duration_minutes),0) AS average_session
           FROM focus_sessions
          WHERE user_id = $1
            AND started_at >= NOW() - INTERVAL '7 days'`,
        [user.id]
      ),
    ])

    const todaysStatsRow = todaysStatsRes.rows[0] || {
      tasks_completed: 0,
      total_tasks: 0,
      focus_minutes: 0,
      ai_interactions: 0,
      goals_achieved: 0,
      productivity_score: 0,
    }

    const todaysTasks = todaysTasksRes.rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      status: r.status,
      priority: r.priority,
      due_date: r.due_date,
      goal: r.goal_id
        ? { id: r.goal_id, title: r.goal_title, category: r.goal_category }
        : null,
    }))

    const activeGoals = activeGoalsRes.rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      progress_percentage: r.progress_percentage,
      target_date: r.target_date,
      category: r.category,
      tasks_total: r.tasks_total,
      tasks_completed: r.tasks_completed,
    }))

    const recentConversations = conversationsRes.rows.map((r) => ({
      id: r.id,
      title: null,
      last_message_at: r.last_message_at,
      agent: { name: r.name, display_name: r.display_name, accent_color: r.accent_color },
    }))

    const recentAchievements = achievementsRes.rows.map((r) => ({
      id: r.id,
      earned_at: r.earned_at,
      achievement: { name: r.name, title: r.title, description: r.description, icon: r.icon, points: r.points },
    }))

    const weeklyFocusRow = weeklyFocusRes.rows[0] || { total_minutes: 0, sessions_count: 0, average_session: 0 }

    // Generate some sample insights for new users
    const insights = todaysTasks.length === 0 ? [
      {
        type: 'welcome',
        title: 'Welcome to SoloBoss AI!',
        description: 'Start by creating your first goal or task to get organized.',
        action: 'Create Goal'
      }
    ] : []

    const responseData = {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        full_name: dbUser.full_name || user.full_name || null,
        avatar_url: dbUser.avatar_url || user.avatar_url || null,
        subscription_tier: dbUser.subscription_tier || 'free',
        level: dbUser.level ?? 1,
        total_points: dbUser.total_points ?? 0,
        current_streak: dbUser.current_streak ?? 0,
        wellness_score: dbUser.wellness_score ?? 50,
        focus_minutes: dbUser.focus_minutes ?? 0,
        onboarding_completed: dbUser.onboarding_completed ?? false,
      },
      todaysStats: todaysStatsRow,
      todaysTasks,
      activeGoals,
      recentConversations,
      recentAchievements,
      weeklyFocus: weeklyFocusRow,
      insights,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
