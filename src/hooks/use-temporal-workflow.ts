import { useState, useEffect, useCallback } from 'react'

interface WorkflowStatus {
  workflowId: string
  status: string
  startTime?: string
  executionTime?: string
  result?: any
}

interface UseTemporalWorkflowOptions {
  pollInterval?: number
  onComplete?: (result: any) => void
  onError?: (error: any) => void
}

export function useTemporalWorkflow(
  workflowId: string | null,
  endpoint: 'onboarding' | 'intelligence' | 'briefings' = 'onboarding',
  options: UseTemporalWorkflowOptions = {}
) {
  const [status, setStatus] = useState<WorkflowStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { pollInterval = 5000, onComplete, onError } = options

  const checkStatus = useCallback(async () => {
    if (!workflowId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/temporal/${endpoint}?workflowId=${workflowId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setStatus(data)

      // Call completion callback if workflow is completed
      if (data.status === 'COMPLETED' && data.result && onComplete) {
        onComplete(data.result)
      }

      // Call error callback if workflow failed
      if (data.status === 'FAILED' && onError) {
        onError(data)
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      if (onError) onError(err)
    } finally {
      setLoading(false)
    }
  }, [workflowId, endpoint, onComplete, onError])

  useEffect(() => {
    if (!workflowId) return

    // Initial check
    checkStatus()

    // Set up polling if workflow is still running
    const interval = setInterval(() => {
      if (status?.status && ['RUNNING', 'PENDING'].includes(status.status)) {
        checkStatus()
      }
    }, pollInterval)

    return () => clearInterval(interval)
  }, [workflowId, checkStatus, pollInterval, status?.status])

  const startWorkflow = useCallback(async (data: any) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/temporal/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  return {
    status,
    loading,
    error,
    checkStatus,
    startWorkflow,
    isCompleted: status?.status === 'COMPLETED',
    isRunning: status?.status === 'RUNNING',
    isFailed: status?.status === 'FAILED',
  }
}

// Specialized hooks for different workflow types
export function useOnboardingWorkflow(workflowId: string | null, options?: UseTemporalWorkflowOptions) {
  return useTemporalWorkflow(workflowId, 'onboarding', options)
}

export function useIntelligenceWorkflow(workflowId: string | null, options?: UseTemporalWorkflowOptions) {
  return useTemporalWorkflow(workflowId, 'intelligence', options)
}

export function useBriefingWorkflow(workflowId: string | null, options?: UseTemporalWorkflowOptions) {
  return useTemporalWorkflow(workflowId, 'briefings', options)
}

// Hook for starting onboarding workflow
export function useStartOnboarding() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startOnboarding = useCallback(async (userId: string, userData: any) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/temporal/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userData })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { startOnboarding, loading, error }
}

// Hook for starting intelligence processing
export function useStartIntelligenceProcessing() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startProcessing = useCallback(async (userId: string, competitorData: any[]) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/temporal/intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, competitorData })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { startProcessing, loading, error }
}

// Hook for starting AI agent briefings
export function useStartBriefings() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startBriefings = useCallback(async (
    userId: string, 
    agentIds: string[], 
    briefingType: 'daily' | 'weekly' | 'monthly'
  ) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/temporal/briefings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, agentIds, briefingType })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { startBriefings, loading, error }
}
