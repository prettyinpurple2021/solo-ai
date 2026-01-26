// @ts-nocheck
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './use-auth'

export interface Opportunity {
  id: string
  user_id: string
  competitor_id: number
  intelligence_id?: number
  opportunity_type: string
  title: string
  description: string
  confidence: string
  impact: 'low' | 'medium' | 'high' | 'critical'
  effort: 'low' | 'medium' | 'high'
  timing: 'immediate' | 'short-term' | 'medium-term' | 'long-term'
  priority_score: string
  evidence: any[]
  recommendations: string[]
  status: 'identified' | 'planned' | 'in_progress' | 'completed' | 'paused' | 'cancelled'
  assigned_to?: string
  implementation_notes?: string
  roi_estimate?: string
  actual_roi?: string
  success_metrics: Record<string, any>
  tags: string[]
  is_archived: boolean
  detected_at: string
  started_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface OpportunityAction {
  id: number
  opportunity_id: string
  user_id: string
  action_type: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  estimated_effort_hours?: number
  actual_effort_hours?: number
  estimated_cost?: string
  actual_cost?: string
  expected_outcome?: string
  actual_outcome?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  due_date?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface OpportunityMetric {
  id: number
  opportunity_id: string
  user_id: string
  metric_name: string
  metric_type: string
  baseline_value?: string
  target_value?: string
  current_value?: string
  unit?: string
  measurement_date: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface OpportunityFilters {
  status?: string[]
  opportunityType?: string[]
  impact?: string[]
  competitorId?: string
  minPriorityScore?: number
  isArchived?: boolean
}

export interface OpportunityAnalytics {
  stats: {
    total: number
    completed: number
    in_progress: number
    identified: number
    avg_priority: number
    total_estimated_roi: number
    total_actual_roi: number
  }
  byType: Array<{
    opportunity_type: string
    count: number
    avg_priority: number
  }>
  topPerforming: Opportunity[]
  timeframe: string
}

export function useOpportunities() {
  const { user } = useAuth()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOpportunities = useCallback(async (
    filters: OpportunityFilters = {},
    sortField: 'priority_score' | 'detected_at' | 'impact' | 'confidence' = 'priority_score',
    sortDirection: 'asc' | 'desc' = 'desc'
  ) => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      
      if (filters.status?.length) {
        params.append('status', filters.status.join(','))
      }
      if (filters.opportunityType?.length) {
        params.append('opportunityType', filters.opportunityType.join(','))
      }
      if (filters.impact?.length) {
        params.append('impact', filters.impact.join(','))
      }
      if (filters.competitorId) {
        params.append('competitorId', filters.competitorId)
      }
      if (filters.minPriorityScore) {
        params.append('minPriorityScore', filters.minPriorityScore.toString())
      }
      if (filters.isArchived !== undefined) {
        params.append('isArchived', filters.isArchived.toString())
      }
      
      params.append('sortField', sortField)
      params.append('sortDirection', sortDirection)

      const response = await fetch(`/api/opportunities?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch opportunities')
      }

      const data = await response.json()
      setOpportunities(data.opportunities.map((item: any) => item.opportunity || item))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [user])

  const createOpportunity = useCallback(async (opportunityData: {
    competitorId: string
    opportunityType: string
    title: string
    description: string
    confidence: number
    impact: 'low' | 'medium' | 'high' | 'critical'
    effort: 'low' | 'medium' | 'high'
    timing: 'immediate' | 'short-term' | 'medium-term' | 'long-term'
    evidence?: any[]
    recommendations?: string[]
  }) => {
    if (!user) throw new Error('User not authenticated')

    const response = await fetch('/api/opportunities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(opportunityData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create opportunity')
    }

    const data = await response.json()
    
    // Refresh opportunities list
    await fetchOpportunities()
    
    return data
  }, [user, fetchOpportunities])

  const updateOpportunity = useCallback(async (
    opportunityId: string,
    updates: {
      status?: string
      progress?: number
      notes?: string
      assignedTo?: string
      actualROI?: number
      actualRevenue?: number
      actualCosts?: number
    }
  ) => {
    if (!user) throw new Error('User not authenticated')

    const response = await fetch(`/api/opportunities/${opportunityId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update opportunity')
    }

    const data = await response.json()
    
    // Update local state
    setOpportunities(prev => 
      prev.map(opp => 
        opp.id === opportunityId 
          ? { ...opp, ...data.opportunity }
          : opp
      )
    )
    
    return data
  }, [user])

  const deleteOpportunity = useCallback(async (opportunityId: string) => {
    if (!user) throw new Error('User not authenticated')

    const response = await fetch(`/api/opportunities/${opportunityId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to delete opportunity')
    }

    // Remove from local state
    setOpportunities(prev => prev.filter(opp => opp.id !== opportunityId))
  }, [user])

  const getOpportunityDetails = useCallback(async (opportunityId: string) => {
    if (!user) throw new Error('User not authenticated')

    const response = await fetch(`/api/opportunities/${opportunityId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch opportunity details')
    }

    return await response.json()
  }, [user])

  const getOpportunityAnalytics = useCallback(async (
    timeframe: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ): Promise<OpportunityAnalytics> => {
    if (!user) throw new Error('User not authenticated')

    const response = await fetch(`/api/opportunities/analytics?timeframe=${timeframe}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch opportunity analytics')
    }

    return await response.json()
  }, [user])

  // Load opportunities on mount
  useEffect(() => {
    if (user) {
      fetchOpportunities()
    }
  }, [user, fetchOpportunities])

  return {
    opportunities,
    loading,
    error,
    fetchOpportunities,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    getOpportunityDetails,
    getOpportunityAnalytics,
  }
}

export function useOpportunityActions(opportunityId: string) {
  const { user } = useAuth()
  const [actions, setActions] = useState<OpportunityAction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchActions = useCallback(async () => {
    if (!user || !opportunityId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/opportunities/${opportunityId}/actions`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch actions')
      }

      const data = await response.json()
      setActions(data.actions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [user, opportunityId])

  const createAction = useCallback(async (actionData: {
    actionType: string
    title: string
    description?: string
    priority?: 'low' | 'medium' | 'high'
    estimatedEffortHours?: number
    estimatedCost?: number
    expectedOutcome?: string
    dueDate?: string
  }) => {
    if (!user) throw new Error('User not authenticated')

    const response = await fetch(`/api/opportunities/${opportunityId}/actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(actionData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create action')
    }

    const data = await response.json()
    
    // Refresh actions list
    await fetchActions()
    
    return data
  }, [user, opportunityId, fetchActions])

  const updateAction = useCallback(async (
    actionId: number,
    updates: Partial<OpportunityAction>
  ) => {
    if (!user) throw new Error('User not authenticated')

    const response = await fetch(`/api/opportunities/${opportunityId}/actions/${actionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update action')
    }

    const data = await response.json()
    
    // Update local state
    setActions(prev => 
      prev.map(action => 
        action.id === actionId 
          ? { ...action, ...data.action }
          : action
      )
    )
    
    return data
  }, [user, opportunityId])

  const deleteAction = useCallback(async (actionId: number) => {
    if (!user) throw new Error('User not authenticated')

    const response = await fetch(`/api/opportunities/${opportunityId}/actions/${actionId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to delete action')
    }

    // Remove from local state
    setActions(prev => prev.filter(action => action.id !== actionId))
  }, [user, opportunityId])

  // Load actions on mount
  useEffect(() => {
    if (user && opportunityId) {
      fetchActions()
    }
  }, [user, opportunityId, fetchActions])

  return {
    actions,
    loading,
    error,
    fetchActions,
    createAction,
    updateAction,
    deleteAction,
  }
}

export function useOpportunityMetrics(opportunityId: string) {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<OpportunityMetric[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = useCallback(async () => {
    if (!user || !opportunityId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/opportunities/${opportunityId}/metrics`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch metrics')
      }

      const data = await response.json()
      setMetrics(data.metrics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [user, opportunityId])

  const createMetric = useCallback(async (metricData: {
    metricName: string
    metricType: 'revenue' | 'cost_savings' | 'market_share' | 'customer_acquisition' | 'efficiency' | 'brand' | 'custom'
    baselineValue?: number
    targetValue: number
    currentValue: number
    unit: string
  }) => {
    if (!user) throw new Error('User not authenticated')

    const response = await fetch(`/api/opportunities/${opportunityId}/metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metricData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create metric')
    }

    const data = await response.json()
    
    // Refresh metrics list
    await fetchMetrics()
    
    return data
  }, [user, opportunityId, fetchMetrics])

  const updateMetric = useCallback(async (
    metricName: string,
    value: number,
    notes?: string
  ) => {
    if (!user) throw new Error('User not authenticated')

    const response = await fetch(`/api/opportunities/${opportunityId}/metrics`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ metricName, value, notes }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update metric')
    }

    // Refresh metrics list
    await fetchMetrics()
  }, [user, opportunityId, fetchMetrics])

  // Load metrics on mount
  useEffect(() => {
    if (user && opportunityId) {
      fetchMetrics()
    }
  }, [user, opportunityId, fetchMetrics])

  return {
    metrics,
    loading,
    error,
    fetchMetrics,
    createMetric,
    updateMetric,
  }
}