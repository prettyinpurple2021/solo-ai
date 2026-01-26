// @ts-nocheck
import { logError } from '@/lib/logger'
import { useState, useEffect, useCallback } from 'react'
import { Skill, LearningModule, UserProgress, LearningRecommendation } from '@/lib/learning-engine'

interface SkillGap {
  skill: Skill
  gap_score: number
  priority: 'high' | 'medium' | 'low'
  recommended_modules: LearningModule[]
}

interface LearningAnalytics {
  total_modules_completed: number
  total_time_spent: number
  average_quiz_score: number
  skills_improved: number
  current_streak: number
  learning_velocity: number
  top_categories: Array<{ category: string; time_spent: number; modules_completed: number }>
}

interface UseLearningReturn {
  // Data
  skillGaps: SkillGap[]
  recommendations: LearningRecommendation[]
  progress: UserProgress[]
  analytics: LearningAnalytics | null
  availableSkills: Skill[]
  availableModules: LearningModule[]
  
  // Loading states
  loading: boolean
  skillGapsLoading: boolean
  recommendationsLoading: boolean
  progressLoading: boolean
  analyticsLoading: boolean
  
  // Error states
  error: string | null
  
  // Actions
  refreshSkillGaps: () => Promise<void>
  refreshRecommendations: () => Promise<void>
  refreshProgress: () => Promise<void>
  refreshAnalytics: () => Promise<void>
  trackModuleProgress: (moduleId: string, progressData: {
    completion_percentage: number
    time_spent: number
    quiz_scores?: { quiz_id: string; score: number }[]
    exercises_completed?: string[]
  }) => Promise<void>
  createSkillAssessment: (skillId: string, assessmentData: {
    current_level: number
    confidence_score: number
    assessment_method: 'quiz' | 'self_evaluation' | 'performance' | 'peer_review'
  }) => Promise<void>
  loadAllData: () => Promise<void>
}

export function useLearning(): UseLearningReturn {
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([])
  const [recommendations, setRecommendations] = useState<LearningRecommendation[]>([])
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null)
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([])
  const [availableModules, setAvailableModules] = useState<LearningModule[]>([])
  
  const [loading, setLoading] = useState(false)
  const [skillGapsLoading, setSkillGapsLoading] = useState(false)
  const [recommendationsLoading, setRecommendationsLoading] = useState(false)
  const [progressLoading, setProgressLoading] = useState(false)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  
  const [error, setError] = useState<string | null>(null)

  const fetchSkillGaps = useCallback(async () => {
    try {
      setSkillGapsLoading(true)
      setError(null)
      
      const response = await fetch('/api/learning?action=skill-gaps')
      if (!response.ok) {
        throw new Error('Failed to fetch skill gaps')
      }
      
      const data = await response.json()
      setSkillGaps(data.skill_gaps || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch skill gaps')
      logError('Error fetching skill gaps:', err)
    } finally {
      setSkillGapsLoading(false)
    }
  }, [])

  const fetchRecommendations = useCallback(async () => {
    try {
      setRecommendationsLoading(true)
      setError(null)
      
      const response = await fetch('/api/learning?action=recommendations')
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }
      
      const data = await response.json()
      setRecommendations(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations')
      logError('Error fetching recommendations:', err)
    } finally {
      setRecommendationsLoading(false)
    }
  }, [])

  const fetchProgress = useCallback(async () => {
    try {
      setProgressLoading(true)
      setError(null)
      
      const response = await fetch('/api/learning?action=progress')
      if (!response.ok) {
        throw new Error('Failed to fetch progress')
      }
      
      const data = await response.json()
      setProgress(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch progress')
      logError('Error fetching progress:', err)
    } finally {
      setProgressLoading(false)
    }
  }, [])

  const fetchAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true)
      setError(null)
      
      const response = await fetch('/api/learning?action=analytics')
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      
      const data = await response.json()
      setAnalytics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
      logError('Error fetching analytics:', err)
    } finally {
      setAnalyticsLoading(false)
    }
  }, [])

  const fetchAvailableSkills = useCallback(async () => {
    try {
      const response = await fetch('/api/learning/skills')
      if (!response.ok) {
        throw new Error('Failed to fetch available skills')
      }
      
      const data = await response.json()
      setAvailableSkills(data || [])
    } catch (err) {
      logError('Error fetching available skills:', err)
    }
  }, [])

  const fetchAvailableModules = useCallback(async () => {
    try {
      const response = await fetch('/api/learning/modules')
      if (!response.ok) {
        throw new Error('Failed to fetch available modules')
      }
      
      const data = await response.json()
      setAvailableModules(data || [])
    } catch (err) {
      logError('Error fetching available modules:', err)
    }
  }, [])

  const trackModuleProgress = useCallback(async (moduleId: string, progressData: {
    completion_percentage: number
    time_spent: number
    quiz_scores?: { quiz_id: string; score: number }[]
    exercises_completed?: string[]
  }) => {
    try {
      setError(null)
      
      const response = await fetch('/api/learning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'track-progress',
          data: {
            moduleId,
            progressData
          }
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to track progress')
      }
      
      // Refresh progress data after tracking
      await fetchProgress()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to track progress')
      logError('Error tracking progress:', err)
    }
  }, [fetchProgress])

  const createSkillAssessment = useCallback(async (skillId: string, assessmentData: {
    current_level: number
    confidence_score: number
    assessment_method: 'quiz' | 'self_evaluation' | 'performance' | 'peer_review'
  }) => {
    try {
      setError(null)
      
      const response = await fetch('/api/learning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create-assessment',
          data: {
            skillId,
            assessmentData
          }
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to create assessment')
      }
      
      // Refresh skill gaps and recommendations after assessment
      await Promise.all([fetchSkillGaps(), fetchRecommendations()])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create assessment')
      logError('Error creating assessment:', err)
    }
  }, [fetchSkillGaps, fetchRecommendations])

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      await Promise.all([
        fetchSkillGaps(),
        fetchRecommendations(),
        fetchProgress(),
        fetchAnalytics(),
        fetchAvailableSkills(),
        fetchAvailableModules()
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load learning data')
      logError('Error loading learning data:', err)
    } finally {
      setLoading(false)
    }
  }, [
    fetchSkillGaps,
    fetchRecommendations,
    fetchProgress,
    fetchAnalytics,
    fetchAvailableSkills,
    fetchAvailableModules
  ])

  // Auto-load data on mount
  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  return {
    // Data
    skillGaps,
    recommendations,
    progress,
    analytics,
    availableSkills,
    availableModules,
    
    // Loading states
    loading,
    skillGapsLoading,
    recommendationsLoading,
    progressLoading,
    analyticsLoading,
    
    // Error states
    error,
    
    // Actions
    refreshSkillGaps: fetchSkillGaps,
    refreshRecommendations: fetchRecommendations,
    refreshProgress: fetchProgress,
    refreshAnalytics: fetchAnalytics,
    trackModuleProgress,
    createSkillAssessment,
    loadAllData
  }
}
