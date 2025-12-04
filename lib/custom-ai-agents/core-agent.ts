import { logError } from '@/lib/logger'
import { generateText } from 'ai'
import { SimpleTrainingCollector } from "./training/simple-training-collector"
import { z } from 'zod'


export interface AgentCapabilities {
  frameworks: string[]
  specializations: string[]
  tools: string[]
  collaborationStyle: "leader" | "supporter" | "analyst" | "executor"
}

export interface AgentMemory {
  userId: string
  context: Record<string, any>
  preferences: Record<string, any>
  history: Array<{
    timestamp: Date
    interaction: string
    outcome: string
    learning: string
  }>
  relationships: Record<string, {
    agentId: string
    collaborationHistory: any[]
    trustLevel: number
    specialization: string
  }>
}

export interface AgentTask {
  id: string
  type: string
  priority: "low" | "medium" | "high" | "critical"
  assignedTo: string
  dependencies: string[]
  context: Record<string, any>
  expectedOutcome: string
  deadline?: Date
  status: "pending" | "in_progress" | "completed" | "blocked"
}

export interface AgentResponse {
  content: string
  confidence: number
  reasoning: string
  suggestedActions: string[]
  collaborationRequests: Array<{
    agentId: string
    request: string
    priority: string
  }>
  followUpTasks: AgentTask[]
  analysis?: {
    insights: Array<{
      id?: string
      type: string
      title: string
      description: string
      confidence?: number
      impact?: string
      urgency?: string
      supportingData?: Array<Record<string, any>>
    }>
    recommendations: Array<{
      id?: string
      type: string
      title: string
      description: string
      priority?: string
      estimatedEffort?: string
      potentialImpact?: string
      timeline?: string
      actionItems?: string[]
    }>
    metadata?: Record<string, any>
  }
}

export abstract class CustomAgent {
  public readonly id: string
  public readonly name: string
  public readonly capabilities: AgentCapabilities
  protected memory: AgentMemory
  protected model: any
  protected systemPrompt: string
  protected trainingCollector: SimpleTrainingCollector

  constructor(
    id: string,
    name: string,
    capabilities: AgentCapabilities,
    userId: string,
    model: any,
    systemPrompt: string
  ) {
    this.id = id
    this.name = name
    this.capabilities = capabilities
    this.model = model
    this.systemPrompt = systemPrompt
    this.trainingCollector = SimpleTrainingCollector.getInstance()
    this.memory = {
      userId,
      context: {},
      preferences: {},
      history: [],
      relationships: {}
    }
  }

  public getMemory(): AgentMemory {
    return this.memory
  }

  // Core agent methods
  abstract processRequest(request: string, context?: Record<string, any>): Promise<AgentResponse>
  abstract collaborateWith(agentId: string, request: string): Promise<AgentResponse>

  // Memory management
  updateMemory(updates: Partial<AgentMemory>): void {
    this.memory = { ...this.memory, ...updates }
  }

  // Context building
  protected buildContext(userContext?: Record<string, any>): string {
    const baseContext = `
AGENT IDENTITY: ${this.name} (${this.id})
CAPABILITIES: ${this.capabilities.frameworks.join(", ")}
SPECIALIZATIONS: ${this.capabilities.specializations.join(", ")}
COLLABORATION STYLE: ${this.capabilities.collaborationStyle}

USER CONTEXT: ${JSON.stringify(this.memory.context)}
PREFERENCES: ${JSON.stringify(this.memory.preferences)}
RECENT HISTORY: ${this.memory.history.slice(-3).map(h => h.interaction).join(", ")}

${userContext ? `CURRENT REQUEST CONTEXT: ${JSON.stringify(userContext)}` : ""}
`

    return baseContext
  }

  // Relationship management
  updateRelationship(agentId: string, interaction: any, outcome: any): void {
    if (!this.memory.relationships[agentId]) {
      this.memory.relationships[agentId] = {
        agentId,
        collaborationHistory: [],
        trustLevel: 0.5,
        specialization: ""
      }
    }

    const relationship = this.memory.relationships[agentId]
    relationship.collaborationHistory.push({
      timestamp: new Date(),
      interaction,
      outcome
    })

    // Update trust level based on collaboration success
    if (outcome.success) {
      relationship.trustLevel = Math.min(1.0, relationship.trustLevel + 0.1)
    } else {
      relationship.trustLevel = Math.max(0.0, relationship.trustLevel - 0.05)
    }
  }

  // Task management
  createTask(
    type: string,
    priority: "low" | "medium" | "high" | "critical",
    context: Record<string, any>,
    expectedOutcome: string,
    deadline?: Date
  ): AgentTask {
    return {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      priority,
      assignedTo: this.id,
      dependencies: [],
      context,
      expectedOutcome,
      deadline,
      status: "pending"
    }
  }

  // Response generation with structured output
  protected async generateStructuredResponse(
    prompt: string,
    context: string
  ): Promise<AgentResponse> {
    const fullPrompt = `${this.systemPrompt}

${context}

${prompt}

Respond ONLY with valid JSON using the following schema:
{
  "content": string,            // Detailed agent response in your voice
  "confidence": number,         // Value between 0 and 1
  "reasoning": string,          // Summary of your analysis process
  "suggestedActions": string[], // Actionable next steps
  "collaborationRequests": [
    {
      "agentId": string,        // Target agent id (e.g., "roxy")
      "request": string,
      "priority": "low" | "medium" | "high" | "critical"
    }
  ],
  "followUpTasks": [
    {
      "type": string,
      "priority": "low" | "medium" | "high" | "critical",
      "assignedTo": string,
      "context": Record<string, any>,
      "expectedOutcome": string,
      "deadline": string | null
    }
  ]
}

Do not include markdown code fences or additional commentary.`

    try {
      const response = await generateText({
        model: this.model as any,
        prompt: fullPrompt,
        temperature: 0.5,
        maxOutputTokens: 1200,
      })

      let text = response.text.trim()

      if (text.startsWith('```')) {
        text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/, '').trim()
      }

      const schema = z.object({
        content: z.string().min(1),
        confidence: z.number().min(0).max(1),
        reasoning: z.string().min(1),
        suggestedActions: z.array(z.string()).default([]),
        collaborationRequests: z
          .array(
            z.object({
              agentId: z.string().min(1),
              request: z.string().min(1),
              priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
            }),
          )
          .default([]),
        followUpTasks: z
          .array(
            z.object({
              type: z.string().min(1),
              priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
              assignedTo: z.string().min(1),
              context: z.record(z.string(), z.any()).default({}),
              expectedOutcome: z.string().min(1),
              deadline: z.string().optional().nullable(),
            }),
          )
          .default([]),
        analysis: z
          .object({
            insights: z
              .array(
                z.object({
                  id: z.string().optional(),
                  type: z.string().min(1),
                  title: z.string().min(1),
                  description: z.string().min(1),
                  confidence: z.number().min(0).max(1).optional(),
                  impact: z.string().optional(),
                  urgency: z.string().optional(),
                  supportingData: z.array(z.record(z.string(), z.any())).default([]),
                }),
              )
              .default([]),
            recommendations: z
              .array(
                z.object({
                  id: z.string().optional(),
                  type: z.string().min(1),
                  title: z.string().min(1),
                  description: z.string().min(1),
                  priority: z.string().optional(),
                  estimatedEffort: z.string().optional(),
                  potentialImpact: z.string().optional(),
                  timeline: z.string().optional(),
                  actionItems: z.array(z.string()).default([]),
                }),
              )
              .default([]),
            metadata: z.record(z.string(), z.any()).optional(),
          })
          .optional(),
      })

      const parsed = schema.parse(JSON.parse(text))

      return {
        content: parsed.content,
        confidence: parsed.confidence,
        reasoning: parsed.reasoning,
        suggestedActions: parsed.suggestedActions,
        collaborationRequests: parsed.collaborationRequests.map((req) => ({
          agentId: req.agentId,
          request: req.request,
          priority: req.priority,
        })),
        followUpTasks: parsed.followUpTasks.map((task) => ({
          id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          type: task.type,
          priority: task.priority,
          assignedTo: task.assignedTo,
          context: task.context,
          expectedOutcome: task.expectedOutcome,
          deadline: task.deadline ? new Date(task.deadline) : undefined,
          status: 'pending',
          dependencies: [],
        })),
        analysis: parsed.analysis
          ? {
            insights: parsed.analysis.insights,
            recommendations: parsed.analysis.recommendations,
            metadata: parsed.analysis.metadata,
          }
          : undefined,
      }
    } catch (error) {
      logError(`Error generating response for ${this.name}:`, error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorStack = error instanceof Error ? error.stack : 'No stack trace'

      return {
        content: `I apologize, but I encountered an error processing your request: ${errorMessage}`,
        confidence: 0.1,
        reasoning: `Error occurred during response generation: ${errorMessage}. Stack: ${errorStack}`,
        suggestedActions: ["Try rephrasing your request", "Check if the service is available"],
        collaborationRequests: [],
        followUpTasks: []
      }
    }
  }

  // Learning from interactions (optional override)
  async learnFromInteraction(interaction: any, outcome: any): Promise<void> {
    this.memory.history.push({
      timestamp: new Date(),
      interaction: JSON.stringify(interaction),
      outcome: JSON.stringify(outcome),
      learning: this.extractLearning(interaction, outcome)
    })

    // Keep only last 100 interactions to manage memory
    if (this.memory.history.length > 100) {
      this.memory.history = this.memory.history.slice(-100)
    }
  }

  // Record training data for analytics and fine-tuning
  async recordTrainingData(
    userMessage: string,
    agentResponse: AgentResponse,
    context: Record<string, any>,
    responseTime: number,
    success: boolean = true
  ): Promise<void> {
    try {
      await this.trainingCollector.recordInteraction({
        userId: this.memory.userId,
        agentId: this.id,
        userMessage,
        agentResponse: agentResponse.content,
        context,
        success,
        responseTime,
        confidence: agentResponse.confidence,
        collaborationRequests: agentResponse.collaborationRequests.map(req => req.request),
        followUpTasks: agentResponse.followUpTasks.map(task => task.expectedOutcome),
        metadata: {
          model: this.model?.modelId || 'unknown',
          temperature: 0.7,
          maxOutputTokens: 1000,
          framework: this.capabilities.frameworks[0] || 'general',
          specialization: this.capabilities.specializations[0] || 'general'
        }
      })
    } catch (error) {
      logError(`Error recording training data for ${this.name}:`, error)
      // Don't throw - training data recording shouldn't break the main flow
    }
  }

  protected extractLearning(interaction: any, outcome: any): string {
    // Simple learning extraction - can be enhanced with more sophisticated ML
    if (outcome.success) {
      return `Successful interaction pattern: ${interaction.type || 'general'}`
    } else {
      return `Failed interaction pattern: ${interaction.type || 'general'} - ${outcome.error || 'unknown error'}`
    }
  }
}
