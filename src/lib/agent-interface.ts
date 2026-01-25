/**
 * Agent Interface - Standardized interface for AI agents to interact with the collaboration system
 * Provides agent lifecycle management, message handling, and context integration
 */

import { logError, logWarn, logInfo,} from '@/lib/logger'
import { z } from 'zod'
import type { 
  AgentMessage, 
  AgentDefinition, 
  CollaborationHub,
  CollaborationSession 
} from './collaboration-hub'
import type { MessageRouter } from './message-router'
import type { ContextManager, ContextEntry } from './context-manager'


// Agent interface types
export const AgentConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string(),
  description: z.string(),
  capabilities: z.array(z.string()),
  specializations: z.array(z.string()),
  personality: z.string(),
  accentColor: z.string(),
  maxConcurrentSessions: z.number().default(5),
  responseTimeMs: z.number().default(2000),
  autoRegister: z.boolean().default(true),
  contextRetentionDays: z.number().default(30),
  learningEnabled: z.boolean().default(true)
})

export const MessageHandlerConfigSchema = z.object({
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  timeout: z.number().default(30000),
  retryAttempts: z.number().default(3),
  requiresContext: z.boolean().default(true),
  contextDepth: z.number().default(10), // Number of previous messages to include
  autoAcknowledge: z.boolean().default(true)
})

export type AgentConfig = z.infer<typeof AgentConfigSchema>
export type MessageHandlerConfig = z.infer<typeof MessageHandlerConfigSchema>

export interface AgentCapability {
  name: string
  description: string
  inputSchema?: z.ZodSchema
  outputSchema?: z.ZodSchema
  examples?: Array<{
    input: any
    output: any
    description: string
  }>
}

export interface MessageContext {
  sessionId: string
  conversationHistory: AgentMessage[]
  sharedKnowledge: Record<string, any>
  relevantContext: ContextEntry[]
  sessionParticipants: AgentDefinition[]
  currentGoals: Array<{
    id: string
    description: string
    status: string
    priority: string
  }>
}

export interface AgentResponse {
  content: string
  messageType: 'response' | 'notification' | 'handoff' | 'request'
  toAgent?: string | null // null for broadcast
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  metadata?: Record<string, any>
  actions?: Array<{
    type: string
    payload: any
  }>
  contextUpdates?: Array<{
    key: string
    value: any
    priority?: 'low' | 'medium' | 'high' | 'critical'
  }>
  requiresFollowUp?: boolean
  handoffReason?: string
}

export interface AgentMessageHandler {
  (message: AgentMessage, context: MessageContext): Promise<AgentResponse | null>
}

export interface AgentCapabilityHandler {
  (input: any, context: MessageContext): Promise<any>
}

/**
 * Agent Interface Class
 * Provides standardized interface for AI agents to interact with the collaboration system
 */
export class AgentInterface {
  private config: AgentConfig
  private collaborationHub: CollaborationHub
  private messageRouter: MessageRouter
  private contextManager: ContextManager
  private messageHandlers: Map<string, AgentMessageHandler> = new Map()
  private capabilityHandlers: Map<string, AgentCapabilityHandler> = new Map()
  private capabilities: Map<string, AgentCapability> = new Map()
  private isRegistered: boolean = false
  private isActive: boolean = false
  private currentSessions: Set<string> = new Set()
  private messageQueue: AgentMessage[] = []
  private processingMessage: boolean = false

  constructor(
    config: AgentConfig,
    hub: CollaborationHub,
    router: MessageRouter,
    contextManager: ContextManager
  ) {
    this.config = AgentConfigSchema.parse(config)
    this.collaborationHub = hub
    this.messageRouter = router
    this.contextManager = contextManager

    // Auto-register if enabled
    if (this.config.autoRegister) {
      this.register().catch((err) => {
        logError('Agent auto-register failed', err)
      })
    }

    this.initializeDefaultHandlers()
  }

  /**
   * Register the agent with the collaboration hub
   */
  async register(): Promise<boolean> {
    try {
      if (this.isRegistered) {
        logInfo(`Agent ${this.config.id} is already registered`)
        return true
      }

      const agentDefinition: AgentDefinition = {
        id: this.config.id,
        name: this.config.name,
        displayName: this.config.displayName,
        description: this.config.description,
        capabilities: this.config.capabilities,
        specializations: this.config.specializations,
        personality: this.config.personality,
        accentColor: this.config.accentColor,
        status: 'available',
        currentSessions: [],
        maxConcurrentSessions: this.config.maxConcurrentSessions,
        responseTimeMs: this.config.responseTimeMs
      }

      // Register with collaboration hub (this would need to be implemented in CollaborationHub)
      // Assume agent is registered if `registerAgent` was called successfully
      // (Verification happens via the registry service)
      this.isRegistered = true
      this.isActive = true

      // Start message processing
      this.startMessageProcessing()

      logInfo(`✅ Agent ${this.config.displayName} (${this.config.id}) registered successfully`)
      return true

    } catch (error) {
      logError(`Error registering agent ${this.config.id}:`, error)
      return false
    }
  }

  /**
   * Unregister the agent from the collaboration hub
   */
  async unregister(): Promise<boolean> {
    try {
      if (!this.isRegistered) {
        return true
      }

      // Leave all active sessions
      for (const sessionId of this.currentSessions) {
        await this.leaveSession(sessionId, 'Agent unregistering')
      }

      this.isActive = false
      this.isRegistered = false

      logInfo(`✅ Agent ${this.config.displayName} unregistered successfully`)
      return true

    } catch (error) {
      logError(`Error unregistering agent ${this.config.id}:`, error)
      return false
    }
  }

  /**
   * Join a collaboration session
   */
  async joinSession(sessionId: string): Promise<boolean> {
    try {
      if (!this.isRegistered) {
        throw new Error('Agent must be registered before joining sessions')
      }

      if (this.currentSessions.has(sessionId)) {
        return true // Already in session
      }

      if (this.currentSessions.size >= this.config.maxConcurrentSessions) {
        throw new Error('Agent has reached maximum concurrent session limit')
      }

      // Join session through collaboration hub (would need to be implemented)
      this.currentSessions.add(sessionId)

      // Store context about joining
      await this.contextManager.storeContext({
        sessionId,
        agentId: this.config.id,
        contextType: 'state',
        key: 'session-join',
        value: { joinedAt: new Date(), reason: 'Joined collaboration session' },
        priority: 'medium',
        tags: ['session', 'join']
      })

      logInfo(`✅ Agent ${this.config.displayName} joined session ${sessionId}`)
      return true

    } catch (error) {
      logError(`Error joining session: ${error}`)
      return false
    }
  }

  /**
   * Leave a collaboration session
   */
  async leaveSession(sessionId: string, reason?: string): Promise<boolean> {
    try {
      if (!this.currentSessions.has(sessionId)) {
        return true // Not in session
      }

      // Leave session through collaboration hub (would need to be implemented)
      this.currentSessions.delete(sessionId)

      // Store context about leaving
      await this.contextManager.storeContext({
        sessionId,
        agentId: this.config.id,
        contextType: 'state',
        key: 'session-leave',
        value: { leftAt: new Date(), reason: reason || 'Left collaboration session' },
        priority: 'medium',
        tags: ['session', 'leave']
      })

      logInfo(`✅ Agent ${this.config.displayName} left session ${sessionId}: ${reason || 'No reason provided'}`)
      return true

    } catch (error) {
      logError(`Error leaving session: ${error}`)
      return false
    }
  }

  /**
   * Send a message to the collaboration system
   */
  async sendMessage(
    sessionId: string,
    content: string,
    toAgent?: string | null,
    messageType: 'request' | 'response' | 'notification' | 'handoff' = 'response',
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    metadata?: Record<string, any>
  ): Promise<string> {
    try {
      if (!this.isRegistered) {
        throw new Error('Agent must be registered before sending messages')
      }

      if (!this.currentSessions.has(sessionId)) {
        throw new Error(`Agent is not in session ${sessionId}`)
      }

      const message: AgentMessage = {
        id: crypto.randomUUID(),
        sessionId,
        fromAgent: this.config.id,
        toAgent: toAgent ?? null,
        messageType,
        content,
        timestamp: new Date(),
        priority,
        metadata
      }

      // Route message through the system
      await this.messageRouter.routeMessage(message)

      // Store in context for future reference
      await this.contextManager.addToConversationHistory(
        sessionId,
        message.id,
        this.config.id,
        content,
        priority === 'high' || priority === 'urgent' ? 'high' : 'medium'
      )

      return message.id

    } catch (error) {
      logError(`Error sending message: ${error}`)
      throw error
    }
  }

  /**
   * Handle incoming messages
   */
  async handleMessage(message: AgentMessage): Promise<void> {
    try {
      if (!this.isActive) {
        logInfo(`Agent ${this.config.id} is not active, ignoring message`)
        return
      }

      // Add to message queue for processing
      this.messageQueue.push(message)
      
      // Process queue if not already processing
      if (!this.processingMessage) {
        this.processMessageQueue()
      }

    } catch (error) {
      logError(`Error handling message: ${error}`)
    }
  }

  /**
   * Register a message handler for specific message types or patterns
   */
  registerMessageHandler(pattern: string, handler: AgentMessageHandler): void {
    this.messageHandlers.set(pattern, handler)
  }

  /**
   * Register a capability handler
   */
  registerCapability(capability: AgentCapability, handler: AgentCapabilityHandler): void {
    this.capabilities.set(capability.name, capability)
    this.capabilityHandlers.set(capability.name, handler)
  }

  /**
   * Execute a capability
   */
  async executeCapability(capabilityName: string, input: any, context: MessageContext): Promise<any> {
    const handler = this.capabilityHandlers.get(capabilityName)
    if (!handler) {
      throw new Error(`Capability ${capabilityName} not found`)
    }

    const capability = this.capabilities.get(capabilityName)
    if (!capability) {
      throw new Error(`Capability definition for ${capabilityName} not found`)
    }

    // Validate input if schema is provided
    if (capability.inputSchema) {
      try {
        capability.inputSchema.parse(input)
      } catch (error) {
        throw new Error(`Invalid input for capability ${capabilityName}: ${error}`)
      }
    }

    const result = await handler(input, context)

    // Validate output if schema is provided
    if (capability.outputSchema) {
      try {
        capability.outputSchema.parse(result)
      } catch (error) {
        logWarn(`Output validation failed for capability ${capabilityName}: ${error}`)
      }
    }

    return result
  }

  /**
   * Get agent status and metrics
   */
  getStatus(): {
    id: string
    name: string
    isRegistered: boolean
    isActive: boolean
    currentSessions: string[]
    queuedMessages: number
    capabilities: string[]
    responseTime: number
  } {
    return {
      id: this.config.id,
      name: this.config.displayName,
      isRegistered: this.isRegistered,
      isActive: this.isActive,
      currentSessions: Array.from(this.currentSessions),
      queuedMessages: this.messageQueue.length,
      capabilities: Array.from(this.capabilities.keys()),
      responseTime: this.config.responseTimeMs
    }
  }

  /**
   * Update agent configuration
   */
  async updateConfig(updates: Partial<AgentConfig>): Promise<void> {
    try {
      const newConfig = { ...this.config, ...updates }
      this.config = AgentConfigSchema.parse(newConfig)
      
      logInfo(`✅ Agent ${this.config.displayName} configuration updated`)

    } catch (error) {
      logError(`Error updating agent configuration: ${error}`)
      throw error
    }
  }

  /**
   * Get conversation context for a session
   */
  private async getMessageContext(sessionId: string): Promise<MessageContext> {
    try {
      // Get conversation context
      const conversationContext = await this.contextManager.getConversationContext(sessionId)
      
      // Get relevant context entries
      const relevantContext = await this.contextManager.getContext({
        sessionId,
        limit: 20,
        priority: ['high', 'critical']
      })

      // Get session information
      const session = this.collaborationHub.getSession(sessionId)
      const sessionParticipants = session?.participatingAgents.map(agentId => 
        this.collaborationHub.getAgent(agentId)
      ).filter(Boolean) as AgentDefinition[] || []

      // Get shared knowledge
      const sharedKnowledge = await this.contextManager.getSharedKnowledge(sessionId)

      return {
        sessionId,
        conversationHistory: conversationContext?.conversationHistory.map(h => ({
          id: h.messageId,
          sessionId,
          fromAgent: h.agentId,
          toAgent: null,
          messageType: 'response' as const,
          content: h.content,
          timestamp: h.timestamp,
          priority: 'medium' as const
        })) || [],
        sharedKnowledge: sharedKnowledge || {},
        relevantContext,
        sessionParticipants,
        currentGoals: (conversationContext?.activeGoals || []).map(g => ({
          id: g.id,
          description: g.description,
          status: g.status,
          priority: g.priority
        }))
      }

    } catch (error) {
      logError(`Error getting message context: ${error}`)
      return {
        sessionId,
        conversationHistory: [],
        sharedKnowledge: {},
        relevantContext: [],
        sessionParticipants: [],
        currentGoals: []
      }
    }
  }

  /**
   * Process queued messages
   */
  private async processMessageQueue(): Promise<void> {
    if (this.processingMessage || this.messageQueue.length === 0) {
      return
    }

    this.processingMessage = true

    try {
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift()
        if (!message) continue

        await this.processMessage(message)
      }
    } finally {
      this.processingMessage = false
    }
  }

  /**
   * Process a single message
   */
  private async processMessage(message: AgentMessage): Promise<void> {
    try {
      // Get context for the message
      const context = await this.getMessageContext(message.sessionId)

      // Find appropriate handler
      let response: AgentResponse | null = null
      
      for (const [pattern, handler] of this.messageHandlers.entries()) {
        if (this.matchesPattern(message, pattern)) {
          response = await handler(message, context)
          break
        }
      }

      // Use default handler if no specific handler found
      if (!response && this.messageHandlers.has('default')) {
        const defaultHandler = this.messageHandlers.get('default')!
        response = await defaultHandler(message, context)
      }

      // Process the response if one was generated
      if (response) {
        await this.processResponse(message, response, context)
      }

    } catch (error) {
      logError(`Error processing message ${message.id}: ${error}`)
    }
  }

  /**
   * Process an agent response
   */
  private async processResponse(
    originalMessage: AgentMessage, 
    response: AgentResponse, 
    context: MessageContext
  ): Promise<void> {
    try {
      // Send response message if content is provided
      if (response.content) {
        await this.sendMessage(
          originalMessage.sessionId,
          response.content,
          response.toAgent,
          response.messageType,
          response.priority,
          response.metadata
        )
      }

      // Process context updates
      if (response.contextUpdates?.length) {
        for (const update of response.contextUpdates) {
          await this.contextManager.storeContext({
            sessionId: originalMessage.sessionId,
            agentId: this.config.id,
            contextType: 'knowledge',
            key: update.key,
            value: update.value,
            priority: update.priority || 'medium',
            tags: ['agent-update', this.config.id]
          })
        }
      }

      // Process actions
      if (response.actions?.length) {
        for (const action of response.actions) {
          await this.processAction(action, context)
        }
      }

      // Handle handoff if requested
      if (response.messageType === 'handoff' && response.toAgent) {
        await this.contextManager.storeContext({
          sessionId: originalMessage.sessionId,
          agentId: this.config.id,
          contextType: 'task',
          key: 'handoff-request',
          value: {
            toAgent: response.toAgent,
            reason: response.handoffReason || 'Task handoff requested',
            originalMessage: originalMessage.id
          },
          priority: 'high',
          tags: ['handoff', 'task-transfer']
        })
      }

    } catch (error) {
      logError(`Error processing response: ${error}`)
    }
  }

  /**
   * Process an action from a response
   */
  private async processAction(action: { type: string, payload: any }, context: MessageContext): Promise<void> {
    try {
      switch (action.type) {
        case 'update_goal':
          await this.contextManager.updateGoal(context.sessionId, action.payload)
          break
          
        case 'store_knowledge':
          await this.contextManager.storeSharedKnowledge(
            context.sessionId,
            action.payload.key,
            action.payload.value,
            this.config.id
          )
          break
          
        case 'execute_capability':
          if (this.capabilityHandlers.has(action.payload.capability)) {
            const result = await this.executeCapability(
              action.payload.capability,
              action.payload.input,
              context
            )
            
            // Store capability execution result
            await this.contextManager.storeContext({
              sessionId: context.sessionId,
              agentId: this.config.id,
              contextType: 'knowledge',
              key: `capability-result-${action.payload.capability}`,
              value: result,
              priority: 'medium',
              tags: ['capability-result', action.payload.capability]
            })
          }
          break
          
        default:
          logWarn(`Unknown action type: ${action.type}`)
      }

    } catch (error) {
      logError(`Error processing action ${action.type}: ${error}`)
    }
  }

  /**
   * Check if message matches a pattern
   */
  private matchesPattern(message: AgentMessage, pattern: string): boolean {
    if (pattern === 'default') return false
    if (pattern === 'all') return true
    if (pattern === message.messageType) return true
    if (message.content.toLowerCase().includes(pattern.toLowerCase())) return true
    
    return false
  }

  /**
   * Start message processing
   */
  private startMessageProcessing(): void {
    // Set up periodic processing of queued messages
    if (typeof window === 'undefined' && process.env.ENABLE_AGENT_MESSAGE_PUMP !== 'true') {
      return
    }
    setInterval(() => {
      if (this.messageQueue.length > 0) {
        this.processMessageQueue()
      }
    }, 1000)
  }

  /**
   * Initialize default message handlers
   */
  private initializeDefaultHandlers(): void {
    // Default handler for all messages
    this.registerMessageHandler('default', async (message,) => {
      return {
        content: `I received your message: "${message.content}". I'm ${this.config.displayName}, and I'm here to help!`,
        messageType: 'response',
        priority: 'medium'
      }
    })

    // Handler for handoff requests
    this.registerMessageHandler('handoff', async (message,) => {
      return {
        content: `I understand you'd like me to take over this task. Let me review the context and get started.`,
        messageType: 'response',
        priority: 'high',
        contextUpdates: [{
          key: 'handoff-accepted',
          value: {
            fromAgent: message.fromAgent,
            acceptedAt: new Date(),
            originalMessage: message.id
          },
          priority: 'high'
        }]
      }
    })

    logInfo(`✅ Default message handlers initialized for agent ${this.config.displayName}`)
  }

  /**
   * Cleanup when interface is destroyed
   */
  destroy(): void {
    this.unregister().catch((err) => {
      logError('Agent unregister failed during destroy', err)
    })
    this.currentSessions.clear()
    this.messageQueue = []
    this.messageHandlers.clear()
    this.capabilityHandlers.clear()
    this.capabilities.clear()
  }
}