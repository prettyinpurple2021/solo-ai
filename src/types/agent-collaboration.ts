
import { AgentResponse } from "@/lib/custom-ai-agents/core-agent"

export interface CollaborationRequest {
  id: string
  fromAgent: string
  toAgent: string
  request: string
  priority: "low" | "medium" | "high" | "critical"
  context: Record<string, any>
  timestamp: Date
  status: "pending" | "in_progress" | "completed" | "failed"
  response?: AgentResponse
}

export interface AgentWorkflow {
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
