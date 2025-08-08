import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/neon/server'
import { authenticateRequest } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data from database
    const client = await createClient()
    const { rows: userData } = await client.query(
      'SELECT id, email, full_name, avatar_url, subscription_tier FROM users WHERE id = $1',
      [user.id]
    )

    const dbUser = userData[0] || user

    // For now, return mock data until we have the full database setup
    const mockDashboardData = {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        full_name: dbUser.full_name || null,
        avatar_url: dbUser.avatar_url || null,
        subscription_tier: dbUser.subscription_tier || 'free',
        level: 1,
        total_points: 0,
        current_streak: 0,
        wellness_score: 50,
        focus_minutes: 0,
        onboarding_completed: false
      },
      todaysStats: {
        tasks_completed: 0,
        total_tasks: 0,
        focus_minutes: 0,
        ai_interactions: 0,
        goals_achieved: 0,
        productivity_score: 0
      },
      todaysTasks: [],
      activeGoals: [],
      recentConversations: [],
      recentAchievements: [],
      weeklyFocus: {
        total_minutes: 0,
        sessions_count: 0,
        average_session: 0
      },
      insights: [
        {
          type: 'welcome',
          title: 'Welcome to SoloBoss AI!',
          description: 'Start by creating your first task or goal to begin building your empire.',
          action: 'Create your first task'
        }
      ]
    }

    return NextResponse.json(mockDashboardData)
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
