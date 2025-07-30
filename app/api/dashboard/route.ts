import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user profile with gamification data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    // Fetch today's tasks
    const today = new Date().toISOString().split('T')[0]
    const { data: todaysTasks, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        *,
        goals (
          id,
          title,
          category
        )
      `)
      .eq('user_id', user.id)
      .gte('due_date', today)
      .lt('due_date', today + 'T23:59:59.999Z')
      .order('priority', { ascending: false })
      .limit(10)

    if (tasksError) {
      console.error('Tasks fetch error:', tasksError)
    }

    // Fetch active goals
    const { data: activeGoals, error: goalsError } = await supabase
      .from('goals')
      .select(`
        *,
        tasks (
          id,
          status
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(5)

    if (goalsError) {
      console.error('Goals fetch error:', goalsError)
    }

    // Fetch recent AI conversations
    const { data: recentConversations, error: conversationsError } = await supabase
      .from('ai_conversations')
      .select(`
        *,
        ai_agents (
          name,
          display_name,
          accent_color
        )
      `)
      .eq('user_id', user.id)
      .order('last_message_at', { ascending: false })
      .limit(5)

    if (conversationsError) {
      console.error('Conversations fetch error:', conversationsError)
    }

    // Fetch today's daily stats
    const { data: todaysStats, error: statsError } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    if (statsError && statsError.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Stats fetch error:', statsError)
    }

    // Fetch recent achievements
    const { data: recentAchievements, error: achievementsError } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements (
          name,
          title,
          description,
          icon,
          points
        )
      `)
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false })
      .limit(3)

    if (achievementsError) {
      console.error('Achievements fetch error:', achievementsError)
    }

    // Fetch this week's focus sessions
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const { data: recentFocusSessions, error: focusError } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('started_at', weekAgo.toISOString())
      .order('started_at', { ascending: false })
      .limit(10)

    if (focusError) {
      console.error('Focus sessions fetch error:', focusError)
    }

    // Calculate streak (simplified - consecutive days with completed tasks)
    const { data: recentDailyStats, error: streakError } = await supabase
      .from('daily_stats')
      .select('date, tasks_completed')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(30)

    let currentStreak = 0
    if (recentDailyStats && !streakError) {
      for (const stat of recentDailyStats) {
        if (stat.tasks_completed > 0) {
          currentStreak++
        } else {
          break
        }
      }
    }

    // Calculate productivity metrics
    const totalFocusMinutes = recentFocusSessions?.reduce((sum, session) => 
      sum + (session.actual_minutes || 0), 0) || 0

    const completedTasksToday = todaysTasks?.filter(task => task.status === 'completed').length || 0

    // Calculate wellness score (simplified)
    const wellnessScore = Math.min(100, Math.max(0, 
      (profile?.wellness_score || 50) + 
      (currentStreak * 2) + 
      (Math.min(totalFocusMinutes / 60, 8) * 5) // Max 8 hours focus per week
    ))

    // Prepare dashboard data
    const dashboardData = {
      user: {
        id: user.id,
        email: user.email,
        full_name: profile?.full_name,
        avatar_url: profile?.avatar_url,
        subscription_tier: profile?.subscription_tier || 'free',
        level: profile?.level || 1,
        total_points: profile?.total_points || 0,
        current_streak: currentStreak,
        wellness_score: Math.round(wellnessScore),
        focus_minutes: profile?.focus_minutes || 0,
        onboarding_completed: profile?.onboarding_completed || false,
      },
      
      todaysStats: {
        tasks_completed: completedTasksToday,
        total_tasks: todaysTasks?.length || 0,
        focus_minutes: todaysStats?.focus_minutes || 0,
        ai_interactions: todaysStats?.ai_interactions || 0,
        goals_achieved: todaysStats?.goals_achieved || 0,
        productivity_score: todaysStats?.productivity_score || 0,
      },

      todaysTasks: todaysTasks?.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date,
        goal: task.goals ? {
          id: task.goals.id,
          title: task.goals.title,
          category: task.goals.category,
        } : null,
      })) || [],

      activeGoals: activeGoals?.map(goal => ({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        progress_percentage: goal.progress_percentage,
        target_date: goal.target_date,
        category: goal.category,
        tasks_total: goal.tasks?.length || 0,
        tasks_completed: goal.tasks?.filter((t: any) => t.status === 'completed').length || 0,
      })) || [],

      recentConversations: recentConversations?.map(conv => ({
        id: conv.id,
        title: conv.title,
        last_message_at: conv.last_message_at,
        agent: {
          name: conv.ai_agents?.name,
          display_name: conv.ai_agents?.display_name,
          accent_color: conv.ai_agents?.accent_color,
        }
      })) || [],

      recentAchievements: recentAchievements?.map(userAchiev => ({
        id: userAchiev.id,
        earned_at: userAchiev.earned_at,
        achievement: {
          name: userAchiev.achievements?.name,
          title: userAchiev.achievements?.title,
          description: userAchiev.achievements?.description,
          icon: userAchiev.achievements?.icon,
          points: userAchiev.achievements?.points,
        }
      })) || [],

      weeklyFocus: {
        total_minutes: totalFocusMinutes,
        sessions_count: recentFocusSessions?.length || 0,
        average_session: recentFocusSessions?.length ? 
          Math.round(totalFocusMinutes / recentFocusSessions.length) : 0,
      },

      insights: [
        {
          type: 'streak',
          title: `${currentStreak} Day Streak!`,
          description: currentStreak > 0 ? 
            `You've completed tasks for ${currentStreak} consecutive days.` :
            "Start your streak by completing a task today!",
          action: currentStreak === 0 ? 'Complete a task' : 'Keep it up!',
        },
        {
          type: 'focus',
          title: 'Focus Time',
          description: `You've focused for ${Math.round(totalFocusMinutes / 60 * 10) / 10} hours this week.`,
          action: totalFocusMinutes < 300 ? 'Try a 25-minute focus session' : 'Great focus habits!',
        },
        {
          type: 'ai',
          title: 'AI Collaboration',
          description: `${todaysStats?.ai_interactions || 0} AI interactions today.`,
          action: (todaysStats?.ai_interactions || 0) === 0 ? 'Chat with an AI agent' : 'Keep collaborating!',
        },
      ],
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 