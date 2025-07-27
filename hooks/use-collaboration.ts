"use client"

import { useAsyncState } from "./use-async-state"
import type { CollaborationTask, AgentHandoff } from "@/lib/agent-collaboration"

interface CollaborationResult {
  output: string
  handoff?: AgentHandoff
}

export function useCollaboration() {
  const { loading, error, setLoading, setError } = useAsyncState()

  const createTask = async (workflowType: string, customization?: any): Promise<CollaborationTask | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/collaboration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_task",
          workflowType,
          customization,
        }),
      })

      const data = await response.json()
      if (data.success) {
        return data.task
      } else {
        setError(data.error)
        return null
      }
    } catch (err) {
      setError("Failed to create collaboration task")
      return null
    } finally {
      setLoading(false)
    }
  }

  const executePhase = async (
    task: CollaborationTask,
    phaseId: string,
    userInput: string,
    previousOutputs: Record<string, string> = {},
  ): Promise<CollaborationResult | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/collaboration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "execute_phase",
          task,
          phaseId,
          userInput,
          previousOutputs,
        }),
      })

      const data = await response.json()
      if (data.success) {
        return { output: data.output, handoff: data.handoff }
      } else {
        setError(data.error)
        return null
      }
    } catch (err) {
      setError("Failed to execute phase")
      return null
    } finally {
      setLoading(false)
    }
  }

  const suggestCollaboration = async (query: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/collaboration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "suggest_collaboration",
          query,
        }),
      })

      const data = await response.json()
      if (data.success) {
        return data.suggestion
      } else {
        setError(data.error)
        return null
      }
    } catch (err) {
      setError("Failed to analyze collaboration needs")
      return null
    } finally {
      setLoading(false)
    }
  }

  const getWorkflows = async () => {
    try {
      const response = await fetch("/api/collaboration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_workflows" }),
      })

      const data = await response.json()
      return data.success ? data.workflows : {}
    } catch (err) {
      setError("Failed to fetch workflows")
      return {}
    }
  }

  return {
    createTask,
    executePhase,
    suggestCollaboration,
    getWorkflows,
    loading,
    error,
  }
}
