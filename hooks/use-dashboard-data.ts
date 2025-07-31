import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './use-auth'

export interface DashboardData {
  user: {
    id: string
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
      accent_color: string
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

export function useDashboardData() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add cache busting to ensure fresh data
        cache: 'no-cache',
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.status}`)
      }
      
      const dashboardData = await response.json()
      setData(dashboardData)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Initial fetch
  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      fetchDashboardData()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [user, fetchDashboardData])

  // Manual refetch function
  const refetch = useCallback(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Optimistic updates for immediate UI feedback
  const updateTaskStatus = useCallback((taskId: string, newStatus: string) => {
    if (!data) return

    setData(prevData => {
      if (!prevData) return prevData

      return {
        ...prevData,
        todaysTasks: prevData.todaysTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        ),
        todaysStats: {
          ...prevData.todaysStats,
          tasks_completed: newStatus === 'completed' 
            ? prevData.todaysStats.tasks_completed + 1
            : prevData.todaysStats.tasks_completed - 1
        }
      }
    })
  }, [data])

  const updateGoalProgress = useCallback((goalId: string, newProgress: number) => {
    if (!data) return

    setData(prevData => {
      if (!prevData) return prevData

      return {
        ...prevData,
        activeGoals: prevData.activeGoals.map(goal => 
          goal.id === goalId ? { ...goal, progress_percentage: newProgress } : goal
        )
      }
    })
  }, [data])

  return {
    data,
    loading,
    error,
    refetch,
    lastUpdated,
    updateTaskStatus,
    updateGoalProgress
  }
} 