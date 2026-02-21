import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/database-client'
import {
  users,
  tasks,
  goals,
  briefcases,
  chatConversations,
  userAchievements,
  achievements,
  focusSessions
} from '@/shared/db/schema'
import { eq, and, gte, count, desc, sql, lte, or } from 'drizzle-orm'

import { logError } from '@/lib/logger'
import * as jose from 'jose'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Response interface matching use-dashboard-data.ts expectations
interface DashboardData {
  user: {
    id: string | number
    email: string
    full_name: string | null
    avatar_url: string | null
    subscription_tier: string
    level: number
    total_points: number
    current_streak: number
    wellness_score: number
    focus_minutes: number
    onboarding_completed: boolean
  }
  todaysStats: {
    tasks_completed: number
    total_tasks: number
    focus_minutes: number
    ai_interactions: number
    goals_achieved: number
    productivity_score: number
  }
  todaysTasks: Array<{
    id: string
    title: string
    description: string | null
    status: string
    priority: string
    due_date: string | null
    goal: {
      id: string
      title: string
      category: string | null
    } | null
  }>
  activeGoals: Array<{
    id: string
    title: string
    description: string | null
    progress_percentage: number
    target_date: string | null
    category: string | null
    tasks_total: number
    tasks_completed: number
  }>
  recentConversations: Array<{
    id: string
    title: string | null
    last_message_at: string
    agent: {
      name: string
      display_name: string
      accent_color: string | null
    }
  }>
  recentAchievements: Array<{
    id: string
    earned_at: string
    achievement: {
      name: string
      title: string
      description: string
      icon: string
      points: number
    }
  }>
  recentBriefcases: Array<{
    id: string
    title: string
    description: string | null
    status: string
    goal_count: number
    task_count: number
    created_at: string
    updated_at: string
  }>
  weeklyFocus: {
    total_minutes: number
    sessions_count: number
    average_session: number
  }
  insights: Array<{
    type: string
    title: string
    description: string
    action: string
  }>
}

// Authentication Helper
async function authenticateRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cookieToken = request.cookies.get('auth_token')?.value
    let token: string | null = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else if (cookieToken) {
      token = cookieToken
    }

    if (token) {
      if (!process.env.JWT_SECRET) {
        logError('Dashboard API: JWT_SECRET is not set')
        return { user: null, error: 'JWT secret not configured' }
      }
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
        const { payload: decoded } = await jose.jwtVerify(token, secret)
        return {
          user: {
            id: decoded.userId as string,
            email: decoded.email as string,
            full_name: (decoded.full_name as string) || null,
            avatar_url: null,
            onboarding_completed: false
          },
          error: null
        }
      } catch (jwtError) {
        // Fallthrough to session check
      }
    }

    // Checking for session cookie
    const nextAuthSessionCookie = request.cookies.get('authjs.session-token')?.value ||
                                   request.cookies.get('__Secure-authjs.session-token')?.value

    if (nextAuthSessionCookie) {
        const sessionResponse = await fetch(`${request.nextUrl.origin}/api/auth/session`, {
          headers: {
            'Cookie': request.headers.get('cookie') || '',
          },
        })

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json()
          if (sessionData?.user?.id) {
            return {
              user: {
                 id: sessionData.user.id,
                 email: sessionData.user.email || '',
                 full_name: sessionData.user.full_name || sessionData.user.name || null,
                 avatar_url: sessionData.user.avatar_url || sessionData.user.image || null,
                 onboarding_completed: sessionData.user.onboarding_completed || false
              },
              error: null
            }
          }
        }
    }
    
    return { user: null, error: 'Unauthorized' }

  } catch (error) {
    logError('Dashboard API: Authentication error:', error instanceof Error ? error : undefined)
    return { user: null, error: 'Authentication failed' }
  }
}

export async function GET(request: NextRequest) {
  try {
     const { user: authUser, error } = await authenticateRequest(request)
     if (error || !authUser) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
     }

     const db = getDb()
     const [dbUser] = await db.select().from(users).where(eq(users.email, authUser.email)).limit(1)
     
     if (!dbUser) {
        return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
     }

     const userId = dbUser.id
     const today = new Date()
     today.setHours(0, 0, 0, 0)
     const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

     // 3. Parallel Data Fetching with Real Aggregations
     const [
        todaysTasksRaw,
        activeGoalsRaw,
        recentConversationsRaw,
        briefcasesRaw,
        recentAchievementsRaw,
        todaysFocusSessions,
        taskStats,
        weeklyFocusSessions
     ] = await Promise.all([
        // Today's Tasks
        db.select({
            id: tasks.id,
            title: tasks.title,
            description: tasks.description,
            status: tasks.status,
            priority: tasks.priority,
            due_date: tasks.due_date,
            goal_title: goals.title,
            goal_id: goals.id
        })
        .from(tasks)
        .leftJoin(goals, eq(tasks.goal_id, goals.id))
        .where(
            and(
                eq(tasks.user_id, userId),
                or(
                  lte(tasks.due_date, today),
                  eq(sql`DATE(${tasks.updated_at})`, today)
                )
            )
        )
        .limit(10),

        // Active Goals with progress metrics
        db.select({
          id: goals.id,
          title: goals.title,
          description: goals.description,
          due_date: goals.due_date,
          status: goals.status,
          total_tasks: count(tasks.id),
          completed_tasks: sql<number>`count(CASE WHEN ${tasks.status} = 'completed' THEN 1 END)`
        })
        .from(goals)
        .leftJoin(tasks, eq(tasks.goal_id, goals.id))
        .where(and(eq(goals.user_id, userId), eq(goals.status, 'active')))
        .groupBy(goals.id)
        .orderBy(desc(goals.updated_at))
        .limit(5),

        // Recent Conversations
        db.select({
            id: chatConversations.id,
            title: chatConversations.title,
            last_message_at: chatConversations.last_message_at,
            agent_id: chatConversations.agent_id,
            agent_name: chatConversations.agent_name
        })
        .from(chatConversations)
        .where(eq(chatConversations.user_id, userId))
        .limit(5)
        .orderBy(desc(chatConversations.last_message_at)),

        // Briefcases with aggregations
        db.select({
          id: briefcases.id,
          title: briefcases.title,
          description: briefcases.description,
          status: briefcases.status,
          created_at: briefcases.created_at,
          updated_at: briefcases.updated_at,
          goal_count: sql<number>`(SELECT count(*) FROM ${goals} WHERE ${goals.briefcase_id} = ${briefcases.id})`,
          task_count: sql<number>`(SELECT count(*) FROM ${tasks} WHERE ${tasks.briefcase_id} = ${briefcases.id})`
        })
        .from(briefcases)
        .where(eq(briefcases.user_id, userId))
        .orderBy(desc(briefcases.updated_at))
        .limit(6),

        // Recent Achievements
        db.select({
            id: userAchievements.id,
            earned_at: userAchievements.earned_at,
            name: achievements.name,
            title: achievements.title,
            description: achievements.description,
            icon: achievements.icon,
            points: achievements.points
        })
        .from(userAchievements)
        .leftJoin(achievements, eq(userAchievements.achievement_id, achievements.id))
        .where(eq(userAchievements.user_id, userId))
        .orderBy(desc(userAchievements.earned_at))
        .limit(5),
        
        // Today's Focus Sessions
        db.select({ duration: focusSessions.duration_minutes })
        .from(focusSessions)
        .where(and(eq(focusSessions.user_id, userId), gte(focusSessions.started_at, today))),

        // Task Stats for productivity
        db.select({ 
            status: tasks.status,
            updatedAt: tasks.updated_at,
            due_date: tasks.due_date
        })
        .from(tasks)
        .where(eq(tasks.user_id, userId)),

        // Weekly Focus Stats
        db.select({ duration: focusSessions.duration_minutes })
        .from(focusSessions)
        .where(and(eq(focusSessions.user_id, userId), gte(focusSessions.started_at, sevenDaysAgo)))
     ])

     // Calculate real stats
     const tasksCompletedToday = taskStats.filter(t => 
       t.status === 'completed' && 
       t.updatedAt && new Date(t.updatedAt).getTime() >= today.getTime()
     ).length

     const tasksDueToday = taskStats.filter(t => 
       t.due_date && new Date(t.due_date).getTime() <= today.getTime() &&
       (t.status !== 'completed' || (t.updatedAt && new Date(t.updatedAt).getTime() >= today.getTime()))
     ).length

     const productivityScore = tasksDueToday > 0 
        ? Math.round((tasksCompletedToday / tasksDueToday) * 100)
        : 0

     const responseData: DashboardData = {
        user: {
            id: dbUser.id,
            email: dbUser.email!,
            full_name: dbUser.full_name,
            avatar_url: dbUser.image, 
            subscription_tier: dbUser.subscription_tier || 'free', 
            level: dbUser.level || 1,
            total_points: dbUser.xp || 0, 
            current_streak: 0,
            wellness_score: 0, 
            focus_minutes: todaysFocusSessions.reduce((acc, curr) => acc + (curr.duration || 0), 0), 
            onboarding_completed: dbUser.onboarding_completed || false 
        },
        todaysStats: {
            tasks_completed: tasksCompletedToday,
            total_tasks: tasksDueToday,
            focus_minutes: todaysFocusSessions.reduce((acc, curr) => acc + (curr.duration || 0), 0),
            ai_interactions: recentConversationsRaw.length,
            goals_achieved: activeGoalsRaw.filter(g => Number(g.total_tasks) > 0 && Number(g.total_tasks) === Number(g.completed_tasks)).length,
            productivity_score: productivityScore
        },
        todaysTasks: todaysTasksRaw.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status || 'todo',
          priority: t.priority || 'medium',
          due_date: t.due_date ? new Date(t.due_date).toISOString() : null,
          goal: t.goal_id ? {
              id: t.goal_id,
              title: t.goal_title || 'Untitled Goal',
              category: null
          } : null
        })),
        activeGoals: activeGoalsRaw.map(g => ({
          id: g.id,
          title: g.title,
          description: g.description,
          progress_percentage: Number(g.total_tasks) > 0 ? Math.round((Number(g.completed_tasks) / Number(g.total_tasks)) * 100) : 0,
          target_date: g.due_date ? new Date(g.due_date).toISOString() : null,
          category: null,
          tasks_total: Number(g.total_tasks),
          tasks_completed: Number(g.completed_tasks)
        })),
        recentConversations: recentConversationsRaw.map(c => ({
          id: c.id,
          title: c.title,
          last_message_at: c.last_message_at ? new Date(c.last_message_at).toISOString() : new Date().toISOString(),
          agent: {
              name: c.agent_name || 'Unknown',
              display_name: c.agent_id || 'System',
              accent_color: '#0BE4EC'
          }
        })),
        recentAchievements: recentAchievementsRaw.map(r => ({
            id: r.id.toString(),
            earned_at: r.earned_at?.toISOString() || new Date().toISOString(),
            achievement: {
                name: r.name!,
                title: r.title!,
                description: r.description!,
                icon: r.icon!,
                points: r.points || 0
            }
        })),
        recentBriefcases: briefcasesRaw.map(b => ({
          id: b.id,
          title: b.title,
          description: b.description,
          status: b.status || 'active',
          goal_count: Number(b.goal_count),
          task_count: Number(b.task_count),
          created_at: b.created_at ? new Date(b.created_at).toISOString() : new Date().toISOString(),
          updated_at: b.updated_at ? new Date(b.updated_at).toISOString() : new Date().toISOString()
        })),
        weeklyFocus: {
            total_minutes: weeklyFocusSessions.reduce((acc, curr) => acc + (curr.duration || 0), 0),
            sessions_count: weeklyFocusSessions.length,
            average_session: weeklyFocusSessions.length > 0 
                ? Math.round(weeklyFocusSessions.reduce((acc, curr) => acc + (curr.duration || 0), 0) / weeklyFocusSessions.length)
                : 0
        },
        insights: todaysTasksRaw.length === 0 ? [{
          type: 'welcome',
          title: 'All caught up!',
          description: 'You have no tasks due today. Time to plan ahead?',
          action: 'Create Task'
        }] : []
     }

     return NextResponse.json(responseData)

  } catch (error) {
    logError('Dashboard API Error', error instanceof Error ? error : undefined)
    return NextResponse.json(
        { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown' }, 
        { status: 500 }
    )
  }
}
