import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { CustomAgent, AgentResponse, AgentTask } from "./core-agent"
import { RoxyAgent } from "./roxy-agent"
import { BlazeAgent } from "./blaze-agent"
import { EchoAgent } from "./echo-agent"
import { LumiAgent } from "./lumi-agent"
import { VexAgent } from "./vex-agent"
import { LexiAgent } from "./lexi-agent"
import { NovaAgent } from "./nova-agent"
import { GlitchAgent } from "./glitch-agent"


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

export class AgentCollaborationSystem {
  private agents: Map<string, CustomAgent>
  private collaborationQueue: CollaborationRequest[]
  private workflows: Map<string, AgentWorkflow>
  private userId: string

  constructor(userId: string) {
    this.userId = userId
    this.agents = new Map()
    this.collaborationQueue = []
    this.workflows = new Map()

    this.initializeAgents()
  }

  private initializeAgents(): void {
    // Initialize all 8 agents
    this.agents.set("roxy", new RoxyAgent(this.userId))
    this.agents.set("blaze", new BlazeAgent(this.userId))
    this.agents.set("echo", new EchoAgent(this.userId))
    this.agents.set("lumi", new LumiAgent(this.userId))
    this.agents.set("vex", new VexAgent(this.userId))
    this.agents.set("lexi", new LexiAgent(this.userId))
    this.agents.set("nova", new NovaAgent(this.userId))
    this.agents.set("glitch", new GlitchAgent(this.userId))
  }

  // Main orchestration method
  async processRequest(
    request: string,
    context?: Record<string, any>,
    preferredAgent?: string
  ): Promise<{
    primaryResponse: AgentResponse
    collaborationResponses: AgentResponse[]
    workflow?: AgentWorkflow
  }> {
    // Determine the best agent to handle the primary request
    const primaryAgentId = preferredAgent || this.determinePrimaryAgent(request, context)
    const primaryAgent = this.agents.get(primaryAgentId)

    if (!primaryAgent) {
      throw new Error(`Agent ${primaryAgentId} not found`)
    }

    // Process the primary request
    const startTime = Date.now()
    const primaryResponse = await primaryAgent.processRequest(request, context)
    const responseTime = Date.now() - startTime

    // Record training data
    await primaryAgent.recordTrainingData(request, primaryResponse, context || {}, responseTime, true)

    // Check if collaboration is needed
    const collaborationResponses: AgentResponse[] = []
    if (primaryResponse.collaborationRequests.length > 0) {
      collaborationResponses.push(...await this.handleCollaborationRequests(
        primaryResponse.collaborationRequests,
        primaryAgentId,
        context
      ))
    }

    // Check if a workflow should be created
    let workflow: AgentWorkflow | undefined
    if (this.shouldCreateWorkflow(primaryResponse, collaborationResponses)) {
      workflow = await this.createWorkflow(primaryResponse, collaborationResponses, context)
    }

    return {
      primaryResponse,
      collaborationResponses,
      workflow
    }
  }

  // Determine the best agent for a request
  private determinePrimaryAgent(request: string, context?: Record<string, any>): string {
    const requestLower = request.toLowerCase()

    // Strategic decision-making
    if (requestLower.includes("decision") || requestLower.includes("strategy") || requestLower.includes("plan")) {
      return "roxy"
    }

    // Growth and sales
    if (requestLower.includes("growth") || requestLower.includes("sales") || requestLower.includes("revenue")) {
      return "blaze"
    }

    // Marketing and content
    if (requestLower.includes("marketing") || requestLower.includes("content") || requestLower.includes("brand")) {
      return "echo"
    }

    // Legal and compliance
    if (requestLower.includes("legal") || requestLower.includes("compliance") || requestLower.includes("policy")) {
      return "lumi"
    }

    // Technical and system
    if (requestLower.includes("technical") || requestLower.includes("system") || requestLower.includes("code")) {
      return "vex"
    }

    // Data and analysis
    if (requestLower.includes("data") || requestLower.includes("analysis") || requestLower.includes("metrics")) {
      return "lexi"
    }

    // Design and UX
    if (requestLower.includes("design") || requestLower.includes("ui") || requestLower.includes("ux")) {
      return "nova"
    }

    // Problem-solving and debugging
    if (requestLower.includes("problem") || requestLower.includes("bug") || requestLower.includes("issue")) {
      return "glitch"
    }

    // Default to Roxy for general requests
    return "roxy"
  }

  // Handle collaboration requests between agents
  private async handleCollaborationRequests(
    requests: Array<{ agentId: string; request: string; priority: string }>,
    fromAgentId: string,
    context?: Record<string, any>
  ): Promise<AgentResponse[]> {
    const responses: AgentResponse[] = []

    for (const req of requests) {
      const targetAgent = this.agents.get(req.agentId)
      if (!targetAgent) {
        logWarn(`Agent ${req.agentId} not found for collaboration`)
        continue
      }

      try {
        const response = await targetAgent.collaborateWith(fromAgentId, req.request)
        responses.push(response)

        // Update agent relationships
        targetAgent.updateRelationship(fromAgentId, req, { success: true })

      } catch (error) {
        logError(`Collaboration failed between ${fromAgentId} and ${req.agentId}:`, error)
        targetAgent.updateRelationship(fromAgentId, req, { success: false, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }

    return responses
  }

  // Determine if a workflow should be created
  private shouldCreateWorkflow(
    primaryResponse: AgentResponse,
    collaborationResponses: AgentResponse[]
  ): boolean {
    // Create workflow if there are follow-up tasks or significant collaboration
    return primaryResponse.followUpTasks.length > 0 || collaborationResponses.length > 1
  }

  // Create a collaborative workflow
  private async createWorkflow(
    primaryResponse: AgentResponse,
    collaborationResponses: AgentResponse[],
    context?: Record<string, any>
  ): Promise<AgentWorkflow> {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const workflow: AgentWorkflow = {
      id: workflowId,
      name: `Collaborative Workflow - ${new Date().toISOString()}`,
      description: "Multi-agent collaborative workflow",
      steps: [],
      status: "pending",
      results: {}
    }

    // Add primary agent tasks
    for (const task of primaryResponse.followUpTasks) {
      workflow.steps.push({
        agentId: task.assignedTo,
        task: task.expectedOutcome,
        dependencies: task.dependencies,
        expectedOutcome: task.expectedOutcome
      })
    }

    // Add collaboration tasks
    for (const response of collaborationResponses) {
      for (const task of response.followUpTasks) {
        workflow.steps.push({
          agentId: task.assignedTo,
          task: task.expectedOutcome,
          dependencies: task.dependencies,
          expectedOutcome: task.expectedOutcome
        })
      }
    }

    this.workflows.set(workflowId, workflow)
    return workflow
  }

  // Execute a workflow
  async executeWorkflow(workflowId: string): Promise<AgentWorkflow> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`)
    }

    workflow.status = "in_progress"

    try {
      // Execute workflow steps in dependency order
      const completedSteps = new Set<string>()
      const pendingSteps = [...workflow.steps]

      while (pendingSteps.length > 0) {
        const readySteps = pendingSteps.filter(step =>
          step.dependencies.every(dep => completedSteps.has(dep))
        )

        if (readySteps.length === 0) {
          throw new Error("Workflow has circular dependencies or missing dependencies")
        }

        // Execute ready steps in parallel
        const stepPromises = readySteps.map(async (step) => {
          const agent = this.agents.get(step.agentId)
          if (!agent) {
            throw new Error(`Agent ${step.agentId} not found`)
          }

          const response = await agent.processRequest(step.task, {
            workflowId,
            stepId: step.agentId
          })

          workflow.results[step.agentId] = response
          completedSteps.add(step.agentId)

          // Remove completed step from pending
          const index = pendingSteps.indexOf(step)
          pendingSteps.splice(index, 1)
        })

        await Promise.all(stepPromises)
      }

      workflow.status = "completed"

    } catch (error) {
      workflow.status = "failed"
      workflow.results.error = error instanceof Error ? error.message : 'Unknown error'
    }

    return workflow
  }

  // Get agent by ID
  getAgent(agentId: string): CustomAgent | undefined {
    return this.agents.get(agentId)
  }

  // Get all agents
  getAllAgents(): Map<string, CustomAgent> {
    return this.agents
  }

  // Get workflow by ID
  getWorkflow(workflowId: string): AgentWorkflow | undefined {
    return this.workflows.get(workflowId)
  }

  // Get all workflows
  getAllWorkflows(): Map<string, AgentWorkflow> {
    return this.workflows
  }

  // Update agent memory
  updateAgentMemory(agentId: string, updates: any): void {
    const agent = this.agents.get(agentId)
    if (agent) {
      agent.updateMemory(updates)
    }
  }

  // Get collaboration insights
  getCollaborationInsights(): {
    totalCollaborations: number
    successfulCollaborations: number
    agentRelationships: Record<string, any>
    workflowStats: {
      total: number
      completed: number
      failed: number
    }
  } {
    const insights = {
      totalCollaborations: this.collaborationQueue.length,
      successfulCollaborations: this.collaborationQueue.filter(req => req.status === "completed").length,
      agentRelationships: {},
      workflowStats: {
        total: this.workflows.size,
        completed: Array.from(this.workflows.values()).filter(w => w.status === "completed").length,
        failed: Array.from(this.workflows.values()).filter(w => w.status === "failed").length
      }
    }

    // Collect agent relationship data
    for (const [agentId, agent] of Array.from(this.agents)) {
      (insights.agentRelationships as any)[agentId] = agent.getMemory().relationships
    }

    return insights
  }
}
