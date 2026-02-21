import { logError, logWarn,} from '@/lib/logger'
import { CustomAgent, AgentResponse,} from "./core-agent"
import { AuraAgent } from "./aura-agent"
import { RoxyAgent } from "./roxy-agent"
import { BlazeAgent } from "./blaze-agent"
import { EchoAgent } from "./echo-agent"
import { LumiAgent } from "./lumi-agent"
import { VexAgent } from "./vex-agent"
import { LexiAgent } from "./lexi-agent"
import { NovaAgent } from "./nova-agent"
import { GlitchAgent } from "./glitch-agent"
import { CollaborationRequest, AgentWorkflow } from "@/types/agent-collaboration"
import { AgentInteraction } from "@/types/custom-agent"


// Interfaces moved to @/types/agent-collaboration

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
    // Initialize all 9 agents
    this.agents.set("aura", new AuraAgent(this.userId))
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
    const primaryAgentId = preferredAgent || this.determinePrimaryAgent(request, context || {})
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
  private determinePrimaryAgent(request: string, context: Record<string, any>): string {
    const requestLower = request.toLowerCase()
    
    // Holistic guidance and orchestration (Aura)
    if (requestLower.includes("aura") || requestLower.includes("holistic") || requestLower.includes("roadmap") || requestLower.includes("orchestrate") || requestLower.includes("vision")) {
      return "aura"
    }

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
    
    // Default to Aura for high-level guide
    return "aura"
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

      const interaction: AgentInteraction = {
        type: 'collaboration_request',
        timestamp: new Date(),
        details: {
          request: req.request,
          priority: req.priority, 
          fromAgentId
        }
      }

      try {
        const response = await targetAgent.collaborateWith(fromAgentId, req.request)
        responses.push(response)
        
        // Update agent relationships
        targetAgent.updateRelationship(fromAgentId, interaction, { success: true })
        
      } catch (error) {
        logError(`Collaboration failed between ${fromAgentId} and ${req.agentId}:`, error)
        targetAgent.updateRelationship(fromAgentId, interaction, { success: false, error: error instanceof Error ? error.message : 'Unknown error' })
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
    // @ts-ignore - preventing type resolution depth
    const module = await import("@/lib/workflow-engine") as any
    const WorkflowEngine = module.WorkflowEngine
    const engine = new WorkflowEngine()
    
    // Map agent tasks to workflow nodes
    const nodes: any[] = []
    const edges: any[] = []
    let lastNodeId: string | null = null
    let yPos = 100

    // 1. Primary Agent Tasks
    for (const task of primaryResponse.followUpTasks) {
       const nodeId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
       nodes.push({
          id: nodeId,
          type: 'ai_task',
          name: task.expectedOutcome.substring(0, 30) + '...',
          position: { x: 100, y: yPos },
          config: {
             task: 'custom',
             agentId: task.assignedTo,
             prompt: task.expectedOutcome, // The task description becomes the prompt
             model: 'gpt-4'
          }
       })
       
       if (lastNodeId) {
          edges.push({
             id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
             source: lastNodeId,
             target: nodeId
          })
       }
       lastNodeId = nodeId
       yPos += 150
    }

    // 2. Collaboration Tasks
    for (const response of collaborationResponses) {
        for (const task of response.followUpTasks) {
             const nodeId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
             nodes.push({
                id: nodeId,
                type: 'ai_task',
                name: `[${task.assignedTo}] ${task.expectedOutcome.substring(0, 30)}...`,
                position: { x: 100, y: yPos },
                config: {
                   task: 'custom',
                   agentId: task.assignedTo,
                   prompt: task.expectedOutcome,
                   model: 'gpt-4'
                }
             })
             
             if (lastNodeId) {
                edges.push({
                   id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                   source: lastNodeId,
                   target: nodeId
                })
             }
             lastNodeId = nodeId
             yPos += 150
        }
    }

    // Persist to DB via Engine
    const dbWorkflow = await engine.createWorkflow({
       version: '1.0.0',
       name: `Collaborative Workflow - ${new Date().toISOString()}`,
       description: "Multi-agent collaborative workflow generated by AI",
       status: 'active',
       triggerType: 'manual',
       triggerConfig: {},
       nodes,
       edges,
       variables: context || {},
       settings: {
          timeout: 300000,
          retryAttempts: 3,
          retryDelay: 5000,
          parallelExecution: false, // Sequential for now
          errorHandling: 'stop'
       }
    }, this.userId)

    // Return the mapped AgentWorkflow interface (adapter)
    return {
      id: String(dbWorkflow.id),
      name: dbWorkflow.name,
      description: dbWorkflow.description || "",
      steps: [], // We abstracted steps into Nodes
      status: "pending",
      results: {}
    }
  }

  // Execute a workflow
  async executeWorkflow(workflowId: string): Promise<AgentWorkflow> {
    // @ts-ignore - preventing type resolution depth
    const module = await import("@/lib/workflow-engine") as any
    const WorkflowEngine = module.WorkflowEngine
    const engine = new WorkflowEngine()
    
    try {
       const execution = await engine.executeWorkflow(workflowId, {}, this.userId)
       
       return {
          id: workflowId,
          name: "Executing Workflow", // We'd fetch real name if needed
          description: "",
          steps: [],
          status: execution.status === 'completed' ? 'completed' : 
                  execution.status === 'failed' ? 'failed' : 'in_progress',
          results: Object.fromEntries(execution.nodeResults)
       }
    } catch (error) {
       logError("Failed to execute workflow", error)
       throw error
    }
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
    for (const [agentId, agent] of this.agents) {
      (insights.agentRelationships as any)[agentId] = agent.getMemory().relationships
    }

    return insights
  }
}
