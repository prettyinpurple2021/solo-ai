import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, return mock data until we have the full database setup
    const mockDashboardData = {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        subscription_tier: 'free',
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
