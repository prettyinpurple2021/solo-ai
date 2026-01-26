/**
 * Message Router - Handles routing of messages between AI agents
 * Supports point-to-point messaging, broadcasts, and priority handling
 */

import { logError, logInfo,} from '@/lib/logger'
import { z } from 'zod'
import { db } from '@/db'
import { chatMessages, collaborationMessages } from '@/db/schema'
import { eq, desc,} from 'drizzle-orm'
import { generateText } from 'ai'
import { getTeamMemberConfig } from '@/lib/ai-config'
import type { AgentMessage, AgentDefinition, CollaborationHub } from './collaboration-hub'

// Message routing types
export const MessageRouteSchema = z.object({
  messageId: z.string().uuid(),
  fromAgent: z.string(),
  toAgents: z.array(z.string()),
  routingType: z.enum(['direct', 'broadcast', 'conditional']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  timestamp: z.date(),
  deliveryStatus: z.enum(['pending', 'delivered', 'failed', 'acknowledged']),
  retryCount: z.number().default(0),
  maxRetries: z.number().default(3)
})

export type MessageRoute = z.infer<typeof MessageRouteSchema>

export interface MessageDeliveryResult {
  messageId: string
  successful: string[]
  failed: { agentId: string; error: string }[]
  totalRecipients: number
  deliveryTime: number
}

export interface RoutingRule {
  id: string
  name: string
  condition: (message: AgentMessage) => boolean
  action: 'route' | 'block' | 'transform' | 'duplicate'
  targetAgents?: string[]
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  enabled: boolean
}

/**
 * Message Router Class
 * Handles intelligent routing of messages between agents
 */
export class MessageRouter {
  private routingHistory: Map<string, MessageRoute> = new Map()
  private messageQueue: Map<string, AgentMessage[]> = new Map()
  private routingRules: Map<string, RoutingRule> = new Map()
  private collaborationHub: CollaborationHub
  private messageStats: {
    totalMessages: number
    successfulDeliveries: number
    failedDeliveries: number
    averageDeliveryTime: number
  } = {
    totalMessages: 0,
    successfulDeliveries: 0,
    failedDeliveries: 0,
    averageDeliveryTime: 0
  }

  constructor(hub: CollaborationHub) {
    this.collaborationHub = hub
    this.initializeDefaultRoutingRules()
  }

  /**
   * Route a message to its destination(s)
   */
  async routeMessage(message: AgentMessage): Promise<MessageDeliveryResult> {
    const startTime = Date.now()
    
    try {
      // Validate message
      if (!message.sessionId) {
        throw new Error('Message must have a session ID')
      }

      // Apply routing rules
      const processedMessage = await this.applyRoutingRules(message)
      if (!processedMessage) {
        return {
          messageId: message.id,
          successful: [],
          failed: [{ agentId: 'system', error: 'Message blocked by routing rules' }],
          totalRecipients: 0,
          deliveryTime: Date.now() - startTime
        }
      }

      // Determine recipients
      const recipients = await this.determineRecipients(processedMessage)
      
      if (recipients.length === 0) {
        return {
          messageId: message.id,
          successful: [],
          failed: [{ agentId: 'system', error: 'No valid recipients found' }],
          totalRecipients: 0,
          deliveryTime: Date.now() - startTime
        }
      }

      // Create routing record
      const route: MessageRoute = {
        messageId: message.id,
        fromAgent: message.fromAgent,
        toAgents: recipients,
        routingType: message.toAgent === null ? 'broadcast' : 'direct',
        priority: message.priority || 'medium',
        timestamp: new Date(),
        deliveryStatus: 'pending',
        retryCount: 0,
        maxRetries: 3
      }

      this.routingHistory.set(message.id, route)

      // Deliver message
      const deliveryResult = await this.deliverMessage(processedMessage, recipients)
      
      // Update routing status
      route.deliveryStatus = deliveryResult.failed.length === 0 ? 'delivered' : 'failed'
      this.routingHistory.set(message.id, route)

      // Update statistics
      this.updateMessageStats(deliveryResult)

      // Store message in database (will be implemented with API endpoints)
      await this.persistMessage(processedMessage, deliveryResult)

      return {
        ...deliveryResult,
        deliveryTime: Date.now() - startTime
      }

    } catch (error) {
      logError('Error routing message:', error)
      return {
        messageId: message.id,
        successful: [],
        failed: [{ agentId: 'system', error: error instanceof Error ? error.message : 'Unknown error' }],
        totalRecipients: 0,
        deliveryTime: Date.now() - startTime
      }
    }
  }

  /**
   * Broadcast a message to multiple agents
   */
  async broadcastMessage(message: AgentMessage, excludeAgents?: string[]): Promise<MessageDeliveryResult> {
    const broadcastMessage = {
      ...message,
      toAgent: null, // null indicates broadcast
      messageType: 'broadcast' as const
    }

    // Get all agents in the session except excluded ones
    const session = this.collaborationHub.getSession(message.sessionId)
    if (!session) {
      throw new Error(`Session ${message.sessionId} not found`)
    }

    const recipients = session.participatingAgents.filter(agentId => 
      agentId !== message.fromAgent && 
      !(excludeAgents?.includes(agentId))
    )

    return this.deliverMessage(broadcastMessage, recipients)
  }

  /**
   * Find the best agent for handling a specific request
   */
  async findBestAgent(
    request: {
      content: string
      context?: Record<string, any>
      requiredCapabilities?: string[]
      excludeAgents?: string[]
    }, 
    sessionId: string
  ): Promise<string> {
    const session = this.collaborationHub.getSession(sessionId)
    if (!session) {
      return null
    }

    const availableAgents = session.participatingAgents
      .filter(agentId => !(request.excludeAgents?.includes(agentId)))
      .map(agentId => this.collaborationHub.getAgent(agentId))
      .filter(Boolean) as AgentDefinition[]

    if (availableAgents.length === 0) {
      return null
    }

    // Score agents based on capabilities and specializations
    const agentScores = availableAgents.map(agent => {
      let score = 0
      
      // Score based on required capabilities
      if (request.requiredCapabilities?.length) {
        const matchingCapabilities = request.requiredCapabilities.filter(cap =>
          agent.capabilities.some(agentCap => 
            agentCap.toLowerCase().includes(cap.toLowerCase()) ||
            cap.toLowerCase().includes(agentCap.toLowerCase())
          )
        )
        score += matchingCapabilities.length * 10
      }

      // Score based on content analysis and specializations
      const contentLower = request.content.toLowerCase()
      agent.specializations.forEach(spec => {
        if (contentLower.includes(spec.toLowerCase().replace('-', ' '))) {
          score += 5
        }
      })

      // Prefer less busy agents
      score += (agent.maxConcurrentSessions - agent.currentSessions.length) * 2

      // Factor in response time (faster is better)
      score += Math.max(0, 5000 - agent.responseTimeMs) / 1000

      return { agent, score }
    })

    // Return the highest scoring agent
    const bestAgent = agentScores.reduce((best, current) => 
      current.score > best.score ? current : best
    )

    return bestAgent.score > 0 ? bestAgent.agent.id : availableAgents[0].id
  }

  /**
   * Establish a communication channel between specific agents
   */
  async establishCommunicationChannel(agents: string[], sessionId: string): Promise<string> {
    const channelId = crypto.randomUUID()
    
    // Validate agents exist in the session
    const session = this.collaborationHub.getSession(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    const validAgents = agents.filter(agentId => 
      session.participatingAgents.includes(agentId)
    )

    if (validAgents.length < 2) {
      throw new Error('At least 2 valid agents required for communication channel')
    }

    // Create a routing rule for this channel
    const channelRule: RoutingRule = {
      id: channelId,
      name: `Channel for agents: ${validAgents.join(', ')}`,
      condition: (message) => 
        message.sessionId === sessionId &&
        validAgents.includes(message.fromAgent) &&
        message.metadata?.channelId === channelId,
      action: 'route',
      targetAgents: validAgents,
      priority: 'medium',
      enabled: true
    }

    this.routingRules.set(channelId, channelRule)

    logInfo(`✅ Communication channel ${channelId} established for agents: ${validAgents.join(', ')}`)
    
    return channelId
  }

  /**
   * Get message routing history for a session
   */
  getRoutingHistory(sessionId: string): MessageRoute[] {
    return Array.from(this.routingHistory.values())
      .filter(route => {
        // We'll need to cross-reference with message data to filter by session
        // V1: Broadcast to all compatible routes (future: AI-optimized routing)
        return true
      })
  }

  /**
   * Get message routing statistics
   */
  getRoutingStats(): typeof this.messageStats & { queueSize: number } {
    const queueSize = Array.from(this.messageQueue.values())
      .reduce((total, queue) => total + queue.length, 0)

    return {
      ...this.messageStats,
      queueSize
    }
  }

  /**
   * Apply routing rules to a message
   */
  private async applyRoutingRules(message: AgentMessage): Promise<AgentMessage> {
    for (const rule of this.routingRules.values()) {
      if (!rule.enabled) continue

      try {
        if (rule.condition(message)) {
          switch (rule.action) {
            case 'block':
              logInfo(`Message ${message.id} blocked by rule: ${rule.name}`)
              return null
              
            case 'transform':
              // Apply transformations (priority, target agents, etc.)
              if (rule.priority) {
                message.priority = rule.priority
              }
              break
              
            case 'route':
              // Override target agents if specified
              if (rule.targetAgents?.length) {
                message.toAgent = rule.targetAgents[0] // Route to primary agent in chain
                message.metadata = { 
                  ...message.metadata, 
                  alternativeTargets: rule.targetAgents.slice(1) 
                }
              }
              break
              
            case 'duplicate':
              // Create duplicate messages for multiple targets
              if (rule.targetAgents?.length) {
                rule.targetAgents.forEach(agentId => {
                  if (agentId !== message.fromAgent) {
                    const duplicateMessage: AgentMessage = {
                      ...message,
                      id: crypto.randomUUID(),
                      toAgent: agentId,
                      metadata: { ...message.metadata, duplicatedFrom: message.id }
                    }
                    // Add to queue for processing
                    this.addToQueue(agentId, duplicateMessage)
                  }
                })
              }
              break
          }
        }
      } catch (error) {
        logError(`Error applying routing rule ${rule.name}:`, error)
      }
    }

    return message
  }

  /**
   * Determine recipients for a message
   */
  private async determineRecipients(message: AgentMessage): Promise<string[]> {
    if (message.toAgent === null) {
      // Broadcast - get all agents in session except sender
      const session = this.collaborationHub.getSession(message.sessionId)
      if (!session) return []
      
      return session.participatingAgents.filter(agentId => agentId !== message.fromAgent)
    } else {
      // Direct message
      return [message.toAgent]
    }
  }

  /**
   * Deliver message to recipients
   */
  private async deliverMessage(message: AgentMessage, recipients: string[]): Promise<MessageDeliveryResult> {
    const successful: string[] = []
    const failed: { agentId: string; error: string }[] = []

    for (const agentId of recipients) {
      try {
        // Validate agent exists and is available
        const agent = this.collaborationHub.getAgent(agentId)
        if (!agent) {
          failed.push({ agentId, error: 'Agent not found' })
          continue
        }

        // Add message to agent's queue
        this.addToQueue(agentId, message)
        
        // Delivery confirmed (V1: At-most-once delivery guarantee)
        // In a real implementation, this would interface with the actual AI agents
        successful.push(agentId)

      } catch (error) {
        failed.push({ 
          agentId, 
          error: error instanceof Error ? error.message : 'Unknown delivery error' 
        })
      }
    }

    return {
      messageId: message.id,
      successful,
      failed,
      totalRecipients: recipients.length,
      deliveryTime: 0 // Will be calculated by caller
    }
  }

  /**
   * Process a message for an AI agent and generate a response
   */
  private async processAgentResponse(agentId: string, message: AgentMessage): Promise<void> {
    try {
      // Don't respond to own messages, broadcasts (unless tagged), or system notifications
      if (message.fromAgent === agentId || message.messageType === 'notification') {
        return
      }

      const agentConfig = getTeamMemberConfig(agentId)
      const agent = this.collaborationHub.getAgent(agentId)
      if (!agent) return

      // Get conversation history (context)
      // Limit to last 10 messages for context window
      // Get conversation history (context)
      // Limit to last 10 messages for completion context
      const history = await db.select().from(chatMessages)
        .where(eq(chatMessages.conversation_id, message.sessionId))
        .orderBy(desc(chatMessages.created_at))
        .limit(10)

      // Format history for AI
      const contextMessages = history.reverse().map(msg => {
          const content = msg.metadata && (msg.metadata as any).fromAgent 
            ? `${(msg.metadata as any).fromAgent}: ${msg.content}`
            : `${msg.role}: ${msg.content}`;
          
          return {
            role: (msg.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant' | 'system',
            content
          }
      })

      // Prepare system prompt with specific instructions
      const systemPrompt = `${agentConfig.systemPrompt}
      
      You are participating in a group collaboration session.
      Current context: responding to ${message.fromAgent}.
      Session ID: ${message.sessionId}
      
      Respond directly to the last message if relevant to your expertise.
      If the message is not relevant to you, you can choose to stay silent or provide a brief acknowledgement.
      Keep responses concise and action-oriented.
      `

      // Generate response
      const { text } = await generateText({
        model: agentConfig.model as any,
        messages: [
          { role: 'system', content: systemPrompt },
          ...contextMessages,
          { role: 'user', content: `${message.fromAgent}: ${message.content}` }
        ],
        temperature: 0.7,
        // maxTokens: 1000
      })

      if (!text || text.trim().length === 0) return

      // Create response message
      const responseMessage: AgentMessage = {
        id: crypto.randomUUID(),
        sessionId: message.sessionId,
        fromAgent: agentId,
        toAgent: message.messageType === 'broadcast' ? null : message.fromAgent, // Reply to sender or broadcast back
        messageType: message.messageType === 'broadcast' ? 'broadcast' : 'response',
        content: text,
        timestamp: new Date(),
        priority: 'medium',
        metadata: {
          replyTo: message.id,
          processingTime: 0 // Could calculate
        }
      }

      // Route the response (recursive but safe due to fromAgent check at start)
      // We route it asynchronously to avoid infinite await chains if multiple agents talk
      // But we need to ensure it's at least started. 
      // Actually, since we are inside `deliverMessage`, calling `routeMessage` > `deliverMessage` again 
      // is fine as long as we don't await indefinitely.
      // However, `routeMessage` persists and delivers.
      
      await this.routeMessage(responseMessage)

    } catch (error) {
       logError(`Error processing agent response for ${agentId}:`, error)
    }
  }

  /**
   * Add message to agent's queue
   */
  private addToQueue(agentId: string, message: AgentMessage): void {
    if (!this.messageQueue.has(agentId)) {
      this.messageQueue.set(agentId, [])
    }
    
    const queue = this.messageQueue.get(agentId)!
    
    // Insert based on priority
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
    const messagePriority = priorityOrder[message.priority || 'medium']
    
    let insertIndex = queue.length
    for (let i = 0; i < queue.length; i++) {
      const queuedPriority = priorityOrder[queue[i].priority || 'medium']
      if (messagePriority < queuedPriority) {
        insertIndex = i
        break
      }
    }
    
    queue.splice(insertIndex, 0, message)
  }

  /**
   * Get next message from agent's queue
   */
  getNextMessage(agentId: string): AgentMessage | null {
    const queue = this.messageQueue.get(agentId)
    return queue?.shift() || null
  }

  /**
   * Update message statistics
   */
  private updateMessageStats(deliveryResult: MessageDeliveryResult): void {
    this.messageStats.totalMessages++
    this.messageStats.successfulDeliveries += deliveryResult.successful.length
    this.messageStats.failedDeliveries += deliveryResult.failed.length
    
    // Update average delivery time
    const currentAvg = this.messageStats.averageDeliveryTime
    const newAvg = (currentAvg * (this.messageStats.totalMessages - 1) + deliveryResult.deliveryTime) / this.messageStats.totalMessages
    this.messageStats.averageDeliveryTime = newAvg
  }

  /**
   * Persist message to database
   */
  private async persistMessage(message: AgentMessage, deliveryResult: MessageDeliveryResult): Promise<void> {
    try {
      const session = this.collaborationHub.getSession(message.sessionId)
      if (!session) return

      // Determine role based on fromAgent
      // If fromAgent is 'user' or matches session owner, it's 'user'
      // Otherwise it's 'assistant'
      const role = message.fromAgent === 'user' ? 'user' : 'assistant'
      
      // Persist to collaboration messages table
      await db.insert(collaborationMessages).values({
        id: message.id,
        session_id: message.sessionId,
        from_agent_id: message.fromAgent,
        content: message.content,
        message_type: message.messageType,
        metadata: {
          ...message.metadata,
          toAgent: message.toAgent,
          deliveryStatus: deliveryResult.failed.length === 0 ? 'delivered' : 'partial'
        }
      })

      logInfo(`📨 Message persisted: ${message.id} (${message.fromAgent} -> ${message.toAgent || 'broadcast'})`)
    } catch (error) {
      logError('Error persisting message:', error)
      // Don't throw, just log - routing was successful even if persistence failed
    }
  }

  /**
   * Initialize default routing rules
   */
  private initializeDefaultRoutingRules(): void {
    const defaultRules: RoutingRule[] = [
      {
        id: 'urgent-priority-boost',
        name: 'Boost urgent messages',
        condition: (msg) => msg.content.toLowerCase().includes('urgent') || msg.content.includes('!!!'),
        action: 'transform',
        priority: 'urgent',
        enabled: true
      },
      {
        id: 'handoff-routing',
        name: 'Route handoff messages',
        condition: (msg) => msg.messageType === 'handoff',
        action: 'route',
        priority: 'high',
        enabled: true
      },
      {
        id: 'broadcast-limiter',
        name: 'Limit broadcast spam',
        condition: (msg) => msg.messageType === 'broadcast' && msg.content.length < 10,
        action: 'block',
        enabled: true
      }
    ]

    defaultRules.forEach(rule => {
      this.routingRules.set(rule.id, rule)
    })

    logInfo(`✅ Message Router initialized with ${defaultRules.length} default routing rules`)
  }

  /**
   * Add or update a routing rule
   */
  addRoutingRule(rule: RoutingRule): void {
    this.routingRules.set(rule.id, rule)
  }

  /**
   * Remove a routing rule
   */
  removeRoutingRule(ruleId: string): boolean {
    return this.routingRules.delete(ruleId)
  }

  /**
   * Get all routing rules
   */
  getRoutingRules(): RoutingRule[] {
    return Array.from(this.routingRules.values())
  }
}