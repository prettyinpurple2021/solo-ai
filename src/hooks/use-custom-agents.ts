"use client"

import { useState, useCallback, useRef, useEffect } from "react"

export interface CustomAgentResponse {
  content: string
  confidence: number
  reasoning: string
  suggestedActions: string[]
  collaborationRequests: Array<{
    agentId: string
    request: string
    priority: string
  }>
  followUpTasks: Array<{
    type: string
    priority: string
    description: string
    expectedOutcome: string
  }>
}

export interface CollaborationResponse {
  agentId: string
  content: string
  confidence: number
  reasoning: string
}

export interface Workflow {
  id: string
  name: string
  description: string
  steps: Array<{
    agentId: string
    task: string
    dependencies: string[]
    expectedOutcome: string
  }>
  status: "pending" | "in_progress" | "completed" | "failed"
  results: Record<string, any>
}

export interface CustomAgentInsights {
  totalCollaborations: number
  successfulCollaborations: number
  agentRelationships: Record<string, any>
  workflowStats: {
    total: number
    completed: number
    failed: number
  }
}

export interface UseCustomAgentsOptions {
  onError?: (error: Error) => void
  onWorkflowCreated?: (workflow: Workflow) => void
  onWorkflowCompleted?: (workflow: Workflow) => void
}

export interface UseCustomAgentsReturn {
  // Agent interaction
  sendMessage: (message: string, agentId?: string, context?: Record<string, any>) => Promise<{
    primaryResponse: CustomAgentResponse
    collaborationResponses: CollaborationResponse[]
    workflow?: Workflow
  }>
  
  // Workflow management
  executeWorkflow: (workflowId: string) => Promise<Workflow>
  createWorkflow: (name: string, description: string, steps: any[]) => Promise<Workflow>
  
  // Data access
  getAgents: () => Promise<any[]>
  getWorkflows: () => Promise<Workflow[]>
  getInsights: () => Promise<CustomAgentInsights>
  
  // State
  isLoading: boolean
  error: string | null
  agents: any[]
  workflows: Workflow[]
  insights: CustomAgentInsights | null
}

export function useCustomAgents(options: UseCustomAgentsOptions = {}): UseCustomAgentsReturn {
  const { onError, onWorkflowCreated, onWorkflowCompleted } = options
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string (null)
  const [agents, setAgents] = useState<any[]>([])
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [insights, setInsights] = useState<CustomAgentInsights (null)
  
  const abortControllerRef = useRef<AbortController (null)

  // Send message to custom agents
  const sendMessage = useCallback(async (
    message: string,
    agentId?: string,
    context?: Record<string, any>
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      // Step 1: Submit the job
      const response = await fetch("/api/custom-agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "default-user", 
        },
        body: JSON.stringify({
          message,
          agentId,
          context,
          stream: false
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const initialResult = await response.json()
      
      // Handle immediate success (shouldn't happen with current backend, but good for robustness)
      if (initialResult.success && initialResult.primaryResponse) {
        return {
          primaryResponse: initialResult.primaryResponse as CustomAgentResponse,
          collaborationResponses: initialResult.collaborationResponses as CollaborationResponse[] || [],
          workflow: initialResult.workflow as Workflow | undefined
        }
      }

      // Handle Async Job (Standard Path)
      if (response.status === 202 && initialResult.job) {
        const jobId = initialResult.job.id
        
        // POLLING LOOP
        let attempts = 0
        const maxAttempts = 60 // 1 minute timeout (1s interval)
        const controller = abortControllerRef.current
        
        while (attempts < maxAttempts) {
            // Check for cancellation
            if (controller?.signal.aborted) {
                throw new Error("AbortError")
            }

            // Wait 1 second
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Poll status
            const pollResponse = await fetch(`/api/custom-agents?jobId=${jobId}`, {
                headers: { "x-user-id": "default-user" },
                signal: controller?.signal
            })
            
            if (!pollResponse.ok) {
                throw new Error(`Polling failed! status: ${pollResponse.status}`)
            }
            
            const pollData = await pollResponse.json()
            
            if (!pollData || !pollData.job) {
                // If job data is missing, we can't proceed. Retrying might work if it's an eventual consistency issue,
                // but usually it means a bad response. Let's retry a few times before failing? 
                // For now, let's treat it as a transient error and continue polling allowed by maxAttempts
                attempts++
                continue 
            }

            const job = pollData.job
            
            if (job.status === 'completed' && job.result) {
                // Job Done! Return result
                 // Notify about workflow creation if present in result
                if (job.result.workflow && onWorkflowCreated) {
                    onWorkflowCreated(job.result.workflow)
                }
                
                return {
                    primaryResponse: job.result.primaryResponse as CustomAgentResponse,
                    collaborationResponses: job.result.collaborationResponses as CollaborationResponse[] || [],
                    workflow: job.result.workflow as Workflow | undefined
                }
            }
            
            if (job.status === 'failed') {
                throw new Error(job.error?.message || "Agent job failed processing")
            }
            
            attempts++
        }
        
        throw new Error("Agent request timed out")
      }
      
      throw new Error(initialResult.error || "Failed to process message")

    } catch (error) {
      if (error instanceof Error && (error.message === "AbortError" || error.name === "AbortError")) {
        return {
           primaryResponse: {
            content: "Request cancelled",
            confidence: 0,
            reasoning: "Request was cancelled",
            suggestedActions: [],
            collaborationRequests: [],
            followUpTasks: []
          },
          collaborationResponses: [],
          workflow: undefined
        }
      }

      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      setError(errorMessage)
      onError?.(error instanceof Error ? error : new Error(errorMessage))
      
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [onError, onWorkflowCreated])

  // Execute workflow
  const executeWorkflow = useCallback(async (workflowId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/custom-agents/workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "default-user",
        },
        body: JSON.stringify({
          action: "execute",
          workflowId,
          stream: false
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || "Failed to execute workflow")
      }

      // Update workflows list
      await getWorkflows()

      // Notify about workflow completion
      if (onWorkflowCompleted) {
        onWorkflowCompleted(result.workflow)
      }

      return result.workflow

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      setError(errorMessage)
      onError?.(error instanceof Error ? error : new Error(errorMessage))
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [onError, onWorkflowCompleted])

  // Create workflow
  const createWorkflow = useCallback(async (name: string, description: string, steps: any[]) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/custom-agents/workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "default-user",
        },
        body: JSON.stringify({
          action: "create",
          name,
          description,
          steps
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || "Failed to create workflow")
      }

      // Update workflows list
      await getWorkflows()

      return result.workflow

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      setError(errorMessage)
      onError?.(error instanceof Error ? error : new Error(errorMessage))
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [onError])

  // Get agents
  const getAgents = useCallback(async () => {
    try {
      const response = await fetch("/api/custom-agents?action=agents", {
        headers: {
          "x-user-id": "default-user",
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setAgents(result.agents || [])
      return result.agents || []

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      setError(errorMessage)
      onError?.(error instanceof Error ? error : new Error(errorMessage))
      return []
    }
  }, [onError])

  // Get workflows
  const getWorkflows = useCallback(async () => {
    try {
      const response = await fetch("/api/custom-agents/workflow", {
        headers: {
          "x-user-id": "default-user",
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setWorkflows(result.workflows || [])
      return result.workflows || []

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      setError(errorMessage)
      onError?.(error instanceof Error ? error : new Error(errorMessage))
      return []
    }
  }, [onError])

  // Get insights
  const getInsights = useCallback(async () => {
    try {
      const response = await fetch("/api/custom-agents?action=insights", {
        headers: {
          "x-user-id": "default-user",
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setInsights(result.insights)
      return result.insights

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      setError(errorMessage)
      onError?.(error instanceof Error ? error : new Error(errorMessage))
      return null
    }
  }, [onError])

  // Load initial data
  useEffect(() => {
    getAgents()
    getWorkflows()
    getInsights()
  }, [getAgents, getWorkflows, getInsights])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    sendMessage,
    executeWorkflow,
    createWorkflow,
    getAgents,
    getWorkflows,
    getInsights,
    isLoading,
    error,
    agents,
    workflows,
    insights
  }
}
