
import { getDb } from '@/lib/database-client';
import {
  users,
  tasks,
  goals,
  briefcases,
  chatConversations,
  userAchievements,
  achievements,
  focusSessions
} from '@/shared/db/schema';
import { eq, and, gte, desc } from 'drizzle-orm';
import { DashboardData } from '@/hooks/use-dashboard-data';
import { AgentActionService } from './agent-action-service';

export async function getDashboardData(userEmail: string): Promise<DashboardData | null> {
  const db = getDb();
  
  // 1. Get User from DB
  const [dbUser] = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);
  if (!dbUser) return null;

  const userId = dbUser.id;

  // 2. Parallel Data Fetching
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    todaysTasksRaw,
    activeGoalsRaw,
    recentConversationsRaw,
    briefcasesRaw,
    recentAchievementsRaw,
    todaysFocusSessions,
    goalsTotal,
    taskStats,
    weeklyFocusSessions,
    agentActionsRaw
  ] = await Promise.all([
    // Today's Tasks
    db.select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      due_date: tasks.due_date,
      task_category: tasks.category,
      goal_title: goals.title,
      goal_id: goals.id,
    })
    .from(tasks)
    .leftJoin(goals, eq(tasks.goal_id, goals.id))
    .where(eq(tasks.user_id, userId.toString()))
    .limit(10),

    // Active Goals
    db.select().from(goals)
      .where(and(eq(goals.user_id, userId), eq(goals.status, 'active')))
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
    .where(eq(chatConversations.user_id, userId.toString()))
    .limit(5)
    .orderBy(desc(chatConversations.last_message_at)),

    // Briefcases
    db.select().from(briefcases)
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

    // Goals Stats
    db.select({ 
      id: goals.id, 
      status: goals.status 
    }).from(goals).where(eq(goals.user_id, userId)),

    // Task Stats
    db.select({ 
      id: tasks.id, 
      status: tasks.status,
      updatedAt: tasks.updated_at
    }).from(tasks).where(eq(tasks.user_id, userId.toString())),

    // Weekly Focus Stats
    db.select({ duration: focusSessions.duration_minutes })
    .from(focusSessions)
    .where(and(eq(focusSessions.user_id, userId), gte(focusSessions.started_at, sevenDaysAgo))),

    // Agent Actions
    AgentActionService.getActions(userId, 10)
  ]);

  // 3. Processing Data
  const tasksCompletedToday = taskStats.filter(t => t.status === 'completed' && t.updatedAt && new Date(t.updatedAt).getTime() >= today.getTime()).length;
  const totalTasksCount = taskStats.length;
  const focusMinutesToday = todaysFocusSessions.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const goalsAchievedToday = goalsTotal.filter(g => g.status === 'completed').length; // Fallback logic

  const productivityScore = totalTasksCount > 0 
    ? Math.round((tasksCompletedToday / (totalTasksCount + 1)) * 100)
    : 0;

  const formattedTodaysTasks = todaysTasksRaw.map(t => ({
    id: String(t.id),
    title: t.title,
    description: t.description || null,
    status: t.status || 'todo',
    priority: t.priority || 'medium',
    due_date: t.due_date ? new Date(t.due_date).toISOString() : null,
    goal: t.goal_id ? {
      id: String(t.goal_id),
      title: t.goal_title || 'Untitled Goal',
      category: t.task_category || null
    } : null
  }));

  const formattedActiveGoals = activeGoalsRaw.map(g => ({
    id: String(g.id),
    title: g.title,
    description: g.description || null,
    progress_percentage: 0,
    target_date: g.due_date ? new Date(g.due_date).toISOString() : null,
    category: null, 
    tasks_total: 0, 
    tasks_completed: 0
  }));

  const formattedConversations = recentConversationsRaw.map(c => ({
    id: String(c.id),
    title: c.title || null,
    last_message_at: c.last_message_at ? new Date(c.last_message_at).toISOString() : new Date().toISOString(),
    agent: {
      name: c.agent_name || 'Assistant',
      display_name: c.agent_id || 'AI',
      accent_color: '#0BE4EC'
    }
  }));

  const formattedBriefcases = briefcasesRaw.map(b => ({
    id: String(b.id),
    title: b.title,
    description: b.description || '',
    status: b.status || 'active',
    goal_count: 0, 
    task_count: 0, 
    created_at: b.created_at ? new Date(b.created_at).toISOString() : new Date().toISOString(),
    updated_at: b.updated_at ? new Date(b.updated_at).toISOString() : new Date().toISOString()
  }));

  const insights: Array<{type: string, title: string, description: string, action: string}> = [];
  if (formattedTodaysTasks.length === 0 && formattedBriefcases.length === 0) {
    insights.push({
      type: 'welcome',
      title: 'Welcome to SoloSuccess AI!',
      description: 'Start by creating your first briefcase to get organized.',
      action: 'Create Briefcase'
    });
  }

  return {
    user: {
      id: String(dbUser.id),
      email: dbUser.email!,
      full_name: dbUser.full_name,
      avatar_url: dbUser.image, 
      subscription_tier: dbUser.subscription_tier || 'launch', 
      level: dbUser.level || 1,
      total_points: dbUser.xp || 0, 
      current_streak: 0,
      wellness_score: 0, 
      focus_minutes: 0, 
      onboarding_completed: dbUser.onboarding_completed || false 
    },
    todaysStats: {
      tasks_completed: tasksCompletedToday,
      total_tasks: totalTasksCount,
      focus_minutes: focusMinutesToday,
      ai_interactions: recentConversationsRaw.length,
      goals_achieved: goalsAchievedToday,
      productivity_score: productivityScore
    },
    todaysTasks: formattedTodaysTasks,
    activeGoals: formattedActiveGoals,
    recentConversations: formattedConversations,
    recentAchievements: recentAchievementsRaw.map(r => ({
      id: String(r.id),
      earned_at: r.earned_at ? new Date(r.earned_at).toISOString() : new Date().toISOString(),
      achievement: {
        name: r.name!,
        title: r.title!,
        description: r.description!,
        icon: r.icon!,
        points: r.points || 0
      }
    })),
    recentBriefcases: formattedBriefcases,
    agentActions: agentActionsRaw.map(a => ({
      id: String(a.id),
      actionType: a.actionType,
      status: a.status,
      agentId: a.agentId,
      createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
      error: a.error
    })),
    weeklyFocus: {
      total_minutes: weeklyFocusSessions.reduce((acc, curr) => acc + (curr.duration || 0), 0),
      sessions_count: weeklyFocusSessions.length,
      average_session: weeklyFocusSessions.length > 0 
        ? Math.round(weeklyFocusSessions.reduce((acc, curr) => acc + (curr.duration || 0), 0) / weeklyFocusSessions.length)
        : 0
    },
    insights
  };
}
