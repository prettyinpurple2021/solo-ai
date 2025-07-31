import { useState, useCallback, useEffect } from 'react'
import { useAuth } from './use-auth'
import { TaskIntelligenceEngine, TaskIntelligenceData, TaskOptimizationResult, TaskSuggestion } from '@/lib/ai-task-intelligence'

export interface UseTaskIntelligenceOptions {
  autoOptimize?: boolean
  refreshInterval?: number // in milliseconds
  enableAI?: boolean
}

export function useTaskIntelligence(options: UseTaskIntelligenceOptions = {}) {
  const { user } = useAuth()
  const [engine] = useState(() => new TaskIntelligenceEngine())
  const [optimizationResult, setOptimizationResult] = useState<TaskOptimizationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastOptimized, setLastOptimized] = useState<Date | null>(null)

  const {
    autoOptimize = true,
    refreshInterval = 300000, // 5 minutes
    enableAI = true
  } = options

  /**
   * Optimize task list using AI intelligence
   */
  const optimizeTasks = useCallback(async (tasks: TaskIntelligenceData[]) => {
    if (!user || !enableAI) {
      setError('User not authenticated or AI disabled')
      return null
    }

    try {
      setLoading(true)
      setError(null)

      const result = await engine.optimizeTaskList(tasks)
      setOptimizationResult(result)
      setLastOptimized(new Date())
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to optimize tasks'
      setError(errorMessage)
      console.error('Task optimization error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [user, enableAI, engine])

  /**
   * Get AI suggestions for a specific task
   */
  const getTaskSuggestion = useCallback(async (
    task: TaskIntelligenceData, 
    allTasks: TaskIntelligenceData[]
  ): Promise<TaskSuggestion | null> => {
    if (!user || !enableAI) return null

    try {
      return await engine.generateTaskSuggestion(task, allTasks)
    } catch (err) {
      console.error('Error getting task suggestion:', err)
      return null
    }
  }, [user, enableAI, engine])

  /**
   * Apply AI suggestions to a task
   */
  const applyTaskSuggestion = useCallback(async (
    taskId: string,
    suggestion: TaskSuggestion
  ) => {
    try {
      // This would typically update the task in the database
      // For now, we'll just return the suggestion data
      return {
        taskId,
        applied: true,
        changes: {
          priority: suggestion.suggestedPriority,
          due_date: suggestion.suggestedDeadline,
          category: suggestion.suggestedCategory,
          tags: suggestion.suggestedTags,
          estimated_minutes: suggestion.estimatedCompletionTime
        }
      }
    } catch (err) {
      console.error('Error applying task suggestion:', err)
      return null
    }
  }, [])

  /**
   * Get optimized task order
   */
  const getOptimizedOrder = useCallback(() => {
    return optimizationResult?.optimizedOrder || []
  }, [optimizationResult])

  /**
   * Get workload analysis
   */
  const getWorkloadAnalysis = useCallback(() => {
    return optimizationResult?.workloadAnalysis || null
  }, [optimizationResult])

  /**
   * Get productivity tips
   */
  const getProductivityTips = useCallback(() => {
    return optimizationResult?.productivityTips || []
  }, [optimizationResult])

  /**
   * Get AI suggestions for all tasks
   */
  const getTaskSuggestions = useCallback(() => {
    return optimizationResult?.suggestions || []
  }, [optimizationResult])

  /**
   * Get suggestion for a specific task
   */
  const getSuggestionForTask = useCallback((taskId: string) => {
    return optimizationResult?.suggestions.find(s => s.taskId === taskId) || null
  }, [optimizationResult])

  /**
   * Update user context for better AI recommendations
   */
  const updateUserContext = useCallback((context: {
    workStyle?: 'focused' | 'collaborative' | 'flexible'
    preferredWorkHours?: { start: string; end: string }
    energyPatterns?: { morning: number; afternoon: number; evening: number }
    currentWorkload?: number
    goals?: string[]
  }) => {
    engine.updateUserContext(context)
  }, [engine])

  /**
   * Auto-optimize tasks when they change
   */
  useEffect(() => {
    if (!autoOptimize || !user) return

    const interval = setInterval(() => {
      // This would typically fetch current tasks and optimize them
      // For now, we'll just mark that auto-optimization is available
      console.log('Auto-optimization interval triggered')
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoOptimize, user, refreshInterval])

  /**
   * Get suggested schedule for the day
   */
  const getSuggestedSchedule = useCallback(() => {
    return optimizationResult?.workloadAnalysis.suggestedSchedule || {
      morning: [],
      afternoon: [],
      evening: []
    }
  }, [optimizationResult])

  /**
   * Check if workload is manageable
   */
  const isWorkloadManageable = useCallback(() => {
    const analysis = getWorkloadAnalysis()
    if (!analysis) return true
    
    return analysis.workloadScore < 80
  }, [getWorkloadAnalysis])

  /**
   * Get urgent tasks that need immediate attention
   */
  const getUrgentTasks = useCallback((tasks: TaskIntelligenceData[]) => {
    const suggestions = getTaskSuggestions()
    const urgentTaskIds = suggestions
      .filter(s => s.urgency === 'high' || s.suggestedPriority === 'urgent')
      .map(s => s.taskId)
    
    return tasks.filter(task => urgentTaskIds.includes(task.id))
  }, [getTaskSuggestions])

  /**
   * Get quick wins (easy tasks that can be completed quickly)
   */
  const getQuickWins = useCallback((tasks: TaskIntelligenceData[]) => {
    const suggestions = getTaskSuggestions()
    const quickWinIds = suggestions
      .filter(s => s.difficulty === 'easy' && (s.estimatedCompletionTime || 0) <= 30)
      .map(s => s.taskId)
    
    return tasks.filter(task => quickWinIds.includes(task.id))
  }, [getTaskSuggestions])

  /**
   * Get high-impact tasks
   */
  const getHighImpactTasks = useCallback((tasks: TaskIntelligenceData[]) => {
    const suggestions = getTaskSuggestions()
    const highImpactIds = suggestions
      .filter(s => s.impact === 'high')
      .map(s => s.taskId)
    
    return tasks.filter(task => highImpactIds.includes(task.id))
  }, [getTaskSuggestions])

  /**
   * Refresh optimization results
   */
  const refreshOptimization = useCallback(async (tasks: TaskIntelligenceData[]) => {
    return await optimizeTasks(tasks)
  }, [optimizeTasks])

  /**
   * Get optimization status
   */
  const getOptimizationStatus = useCallback(() => {
    return {
      loading,
      error,
      lastOptimized,
      hasResults: !!optimizationResult,
      isWorkloadManageable: isWorkloadManageable(),
      totalSuggestions: getTaskSuggestions().length
    }
  }, [loading, error, lastOptimized, optimizationResult, isWorkloadManageable, getTaskSuggestions])

  return {
    // Core functions
    optimizeTasks,
    getTaskSuggestion,
    applyTaskSuggestion,
    refreshOptimization,
    
    // Data access
    getOptimizedOrder,
    getWorkloadAnalysis,
    getProductivityTips,
    getTaskSuggestions,
    getSuggestionForTask,
    getSuggestedSchedule,
    
    // Filtered task lists
    getUrgentTasks,
    getQuickWins,
    getHighImpactTasks,
    
    // Status and utilities
    getOptimizationStatus,
    updateUserContext,
    isWorkloadManageable,
    
    // State
    loading,
    error,
    lastOptimized,
    optimizationResult
  }
} 