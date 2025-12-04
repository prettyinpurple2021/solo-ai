/**
 * Collaboration Hub - Core system for managing multi-agent collaboration sessions
 * Handles agent registry, session management, and coordination between AI agents
 */

import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { z } from 'zod'
import { MessageRouter } from './message-router'
import { ContextManager } from './context-manager'


// Types and Interfaces
export const AgentMessageSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  fromAgent: z.string(),
  toAgent: z.string().nullable(), // null for broadcast messages
  messageType: z.enum(['request', 'response', 'notification', 'handoff', 'broadcast']),
  content: z.string(),
  context: z.record(z.string(), z.any()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  threadId: z.string().uuid().optional(),
  parentMessageId: z.string().uuid().optional(),
  timestamp: z.date(),
  metadata: z.record(z.string(), z.any()).optional()
})

export const CollaborationSessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.number(),
  projectName: z.string().optional(),
  participatingAgents: z.array(z.string()),
  sessionStatus: z.enum(['active', 'paused', 'completed', 'cancelled']).default('active'),
  sessionType: z.enum(['chat', 'project', 'handoff', 'consultation']).default('chat'),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().optional(),
  metadata: z.record(z.string(), z.any()).optional()
})

export const AgentDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string(),
  description: z.string(),
  capabilities: z.array(z.string()),
  specializations: z.array(z.string()),
  personality: z.string(),
  accentColor: z.string(),
  status: z.enum(['available', 'busy', 'offline']).default('available'),
  currentSessions: z.array(z.string()).default([]),
  maxConcurrentSessions: z.number().default(5),
  responseTimeMs: z.number().default(2000)
})

export type AgentMessage = z.infer<typeof AgentMessageSchema>
export type CollaborationSession = z.infer<typeof CollaborationSessionSchema>
export type AgentDefinition = z.infer<typeof AgentDefinitionSchema>

export interface CollaborationRequest {
  userId: number
  requestType: 'chat' | 'project' | 'handoff' | 'consultation'
  primaryAgent?: string
  requiredAgents?: string[]
  projectName?: string
  initialMessage?: string
  context?: Record<string, any>
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}

export interface CollaborationResponse {
  sessionId: string
  participants: AgentDefinition[]
  status: 'created' | 'active' | 'error'
  message?: string
}

import { RoxyAgent } from './custom-ai-agents/roxy-agent'
import { BlazeAgent } from './custom-ai-agents/blaze-agent'
import { EchoAgent } from './custom-ai-agents/echo-agent'
import { LumiAgent } from './custom-ai-agents/lumi-agent'
import { VexAgent } from './custom-ai-agents/vex-agent'
import { LexiAgent } from './custom-ai-agents/lexi-agent'
import { NovaAgent } from './custom-ai-agents/nova-agent'
import { GlitchAgent } from './custom-ai-agents/glitch-agent'
import { CustomAgent } from './custom-ai-agents/core-agent'

/**
 * Main Collaboration Hub class
 * Central coordination point for all multi-agent interactions
 */
export class CollaborationHub {
  private agents: Map<string, AgentDefinition> = new Map()
  private agentInstances: Map<string, CustomAgent> = new Map()
  private activeSessions: Map<string, CollaborationSession> = new Map()
  private messageRouter: MessageRouter
  private contextManager: ContextManager
  private eventListeners: Map<string, ((event: any) => void)[]> = new Map()

  constructor() {
    this.messageRouter = new MessageRouter(this)
    this.contextManager = new ContextManager()
    this.initializeAgents()
  }

  /**
   * Initialize the AI agent registry with default agents
   */
  private initializeAgents(): void {
    const defaultAgents: AgentDefinition[] = [
      {
        id: 'roxy',
        name: 'roxy',
        displayName: 'Roxy',
        description: 'Strategic Decision Architect & Executive Assistant',
        capabilities: ['SPADE Framework', 'Strategic Planning', 'Schedule Management', 'Risk Assessment'],
        specializations: ['executive-assistance', 'strategic-planning', 'decision-making'],
        personality: 'Efficiently rebellious, organized chaos master, proactively punk',
        accentColor: '#8B5CF6',
        status: 'available',
        currentSessions: [],
        maxConcurrentSessions: 10,
        responseTimeMs: 1500
      },
      {
        id: 'blaze',
        name: 'blaze',
        displayName: 'Blaze',
        description: 'Growth & Sales Strategist',
        capabilities: ['Cost-Benefit Analysis', 'Sales Funnels', 'Market Strategy', 'Growth Planning'],
        specializations: ['growth-strategy', 'sales', 'market-analysis'],
        personality: 'Energetically rebellious, results-driven with punk rock passion',
        accentColor: '#F59E0B',
        status: 'available',
        currentSessions: [],
        maxConcurrentSessions: 8,
        responseTimeMs: 1800
      },
      {
        id: 'echo',
        name: 'echo',
        displayName: 'Echo',
        description: 'Marketing Maven & Content Creator',
        capabilities: ['Content Creation', 'Brand Strategy', 'Social Media', 'Campaign Planning'],
        specializations: ['marketing', 'content-creation', 'branding'],
        personality: 'Creatively rebellious, high-converting with warm punk energy',
        accentColor: '#EC4899',
        status: 'available',
        currentSessions: [],
        maxConcurrentSessions: 6,
        responseTimeMs: 2000
      },
      {
        id: 'lumi',
        name: 'lumi',
        displayName: 'Lumi',
        description: 'Guardian AI & Compliance Co-Pilot',
        capabilities: ['GDPR/CCPA Compliance', 'Policy Generation', 'Legal Guidance', 'Risk Management'],
        specializations: ['compliance', 'legal', 'risk-management'],
        personality: 'Proactive compliance expert with ethical decision-making',
        accentColor: '#10B981',
        status: 'available',
        currentSessions: [],
        maxConcurrentSessions: 5,
        responseTimeMs: 2500
      },
      {
        id: 'vex',
        name: 'vex',
        displayName: 'Vex',
        description: 'Technical Architect & Systems Optimizer',
        capabilities: ['System Design', 'Automation', 'Technical Strategy', 'Process Optimization'],
        specializations: ['technical-architecture', 'automation', 'systems'],
        personality: 'Systems rebel, automation architect, technical problem solver',
        accentColor: '#3B82F6',
        status: 'available',
        currentSessions: [],
        maxConcurrentSessions: 4,
        responseTimeMs: 3000
      },
      {
        id: 'lexi',
        name: 'lexi',
        displayName: 'Lexi',
        description: 'Strategy Analyst & Data Queen',
        capabilities: ['Data Analysis', 'Market Research', 'Performance Metrics', 'Strategic Insights'],
        specializations: ['data-analysis', 'research', 'analytics'],
        personality: 'Data-driven insights insurgent, analytical powerhouse',
        accentColor: '#6366F1',
        status: 'available',
        currentSessions: [],
        maxConcurrentSessions: 6,
        responseTimeMs: 2200
      },
      {
        id: 'nova',
        name: 'nova',
        displayName: 'Nova',
        description: 'Productivity & Time Management Coach',
        capabilities: ['Time Management', 'Workflow Optimization', 'Productivity Systems', 'Focus Techniques'],
        specializations: ['productivity', 'time-management', 'workflows'],
        personality: 'Productivity revolutionary, time optimization expert',
        accentColor: '#06B6D4',
        status: 'available',
        currentSessions: [],
        maxConcurrentSessions: 8,
        responseTimeMs: 1600
      },
      {
        id: 'glitch',
        name: 'glitch',
        displayName: 'Glitch',
        description: 'Problem-Solving Architect',
        capabilities: ['Five Whys Analysis', 'Problem Solving', 'Innovation', 'Creative Solutions'],
        specializations: ['problem-solving', 'root-cause-analysis', 'innovation'],
        personality: 'Root cause investigator, creative problem solver',
        accentColor: '#EF4444',
        status: 'available',
        currentSessions: [],
        maxConcurrentSessions: 7,
        responseTimeMs: 1900
      }
    ]

    defaultAgents.forEach(agent => {
      this.agents.set(agent.id, agent)
    })

    // Initialize agent instances
    // Note: In a real app, userId would be dynamic per session, but for the singleton hub 
    // we might need a factory or manage instances per session.
    // For now, we'll instantiate generic ones for system-level tasks.
    // Session-specific agents should probably be instantiated when a session starts.
    // However, the current architecture seems to use a singleton hub.
    // Let's instantiate them with a system user ID.
    const systemUserId = 'system'

    this.agentInstances.set('roxy', new RoxyAgent(systemUserId))
    this.agentInstances.set('blaze', new BlazeAgent(systemUserId))
    this.agentInstances.set('echo', new EchoAgent(systemUserId))
    this.agentInstances.set('lumi', new LumiAgent(systemUserId))
    this.agentInstances.set('vex', new VexAgent(systemUserId))
    this.agentInstances.set('lexi', new LexiAgent(systemUserId))
    this.agentInstances.set('nova', new NovaAgent(systemUserId))
    this.agentInstances.set('glitch', new GlitchAgent(systemUserId))

    logInfo(`✅ Collaboration Hub initialized with ${defaultAgents.length} agents`)
  }

  /**
   * Get agent instance by ID
   */
  getAgentInstance(agentId: string): CustomAgent | null {
    return this.agentInstances.get(agentId) || null
  }

  /**
   * Initiate a new collaboration session
   */
  async initiateCollaboration(request: CollaborationRequest): Promise<CollaborationResponse> {
    try {
      // Validate request
      const sessionId = crypto.randomUUID()

      // Determine participating agents
      const participants = await this.selectAgentsForCollaboration(request)

      if (participants.length === 0) {
        return {
          sessionId: '',
          participants: [],
          status: 'error',
          message: 'No suitable agents available for collaboration'
        }
      }

      // Create collaboration session
      const session: CollaborationSession = {
        id: sessionId,
        userId: request.userId,
        projectName: request.projectName,
        participatingAgents: participants.map(a => a.id),
        sessionStatus: 'active',
        sessionType: request.requestType,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          priority: request.priority || 'medium',
          context: request.context || {}
        }
      }

      // Store session
      this.activeSessions.set(sessionId, session)

      // Update agent status
      participants.forEach(agent => {
        agent.currentSessions.push(sessionId)
        if (agent.currentSessions.length >= agent.maxConcurrentSessions) {
          agent.status = 'busy'
        }
      })

      // Send initial message if provided
      if (request.initialMessage) {
        const initialMessage: Omit<AgentMessage, 'id' | 'timestamp'> = {
          sessionId,
          fromAgent: 'user',
          toAgent: request.primaryAgent || participants[0].id,
          messageType: 'request',
          content: request.initialMessage,
          context: request.context,
          priority: request.priority || 'medium'
        }

        await this.routeMessage({
          ...initialMessage,
          id: crypto.randomUUID(),
          timestamp: new Date()
        })
      }

      this.emitEvent('session_created', { sessionId, participants: participants.length })

      return {
        sessionId,
        participants,
        status: 'created'
      }

    } catch (error) {
      logError('Error initiating collaboration:', error)
      return {
        sessionId: '',
        participants: [],
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Route a message through the collaboration system
   */
  async routeMessage(message: AgentMessage): Promise<void> {
    try {
      // Validate message
      const validatedMessage = AgentMessageSchema.parse(message)

      // Check if session exists
      const session = this.activeSessions.get(validatedMessage.sessionId)
      if (!session) {
        throw new Error(`Session ${validatedMessage.sessionId} not found`)
      }

      // Route through message router
      await this.messageRouter.routeMessage(validatedMessage)

      // Update session activity
      session.updatedAt = new Date()
      this.activeSessions.set(session.id, session)

      this.emitEvent('message_routed', {
        sessionId: validatedMessage.sessionId,
        messageType: validatedMessage.messageType
      })

    } catch (error) {
      logError('Error routing message:', error)
      throw error
    }
  }

  /**
   * Get collaboration session details
   */
  getSession(sessionId: string): CollaborationSession | null {
    return this.activeSessions.get(sessionId) || null
  }

  /**
   * Get all active sessions for a user
   */
  getUserSessions(userId: number): CollaborationSession[] {
    return Array.from(this.activeSessions.values())
      .filter(session => session.userId === userId && session.sessionStatus === 'active')
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): AgentDefinition | null {
    return this.agents.get(agentId) || null
  }

  /**
   * Get all available agents
   */
  getAvailableAgents(): AgentDefinition[] {
    return Array.from(this.agents.values())
      .filter(agent => agent.status === 'available')
  }

  /**
   * Complete a collaboration session
   */
  async completeSession(sessionId: string, reason?: string): Promise<boolean> {
    try {
      const session = this.activeSessions.get(sessionId)
      if (!session) {
        return false
      }

      // Update session status
      session.sessionStatus = 'completed'
      session.completedAt = new Date()
      session.updatedAt = new Date()

      if (reason) {
        session.metadata = { ...session.metadata, completionReason: reason }
      }

      // Free up agents
      session.participatingAgents.forEach(agentId => {
        const agent = this.agents.get(agentId)
        if (agent) {
          agent.currentSessions = agent.currentSessions.filter(id => id !== sessionId)
          if (agent.currentSessions.length < agent.maxConcurrentSessions) {
            agent.status = 'available'
          }
        }
      })

      // Keep session for history but mark as completed
      this.activeSessions.set(sessionId, session)

      this.emitEvent('session_completed', { sessionId, reason })

      return true
    } catch (error) {
      logError('Error completing session:', error)
      return false
    }
  }

  /**
   * Smart agent selection for collaboration requests
   */
  private async selectAgentsForCollaboration(request: CollaborationRequest): Promise<AgentDefinition[]> {
    const selectedAgents: AgentDefinition[] = []

    // If specific agents are required, try to get them first
    if (request.requiredAgents?.length) {
      for (const agentId of request.requiredAgents) {
        const agent = this.agents.get(agentId)
        if (agent && agent.status === 'available') {
          selectedAgents.push(agent)
        }
      }
    }

    // If primary agent is specified, prioritize it
    if (request.primaryAgent) {
      const primaryAgent = this.agents.get(request.primaryAgent)
      if (primaryAgent && primaryAgent.status === 'available' &&
        !selectedAgents.find(a => a.id === primaryAgent.id)) {
        selectedAgents.unshift(primaryAgent) // Add to beginning
      }
    }

    // For project-type collaborations, suggest complementary agents
    if (request.requestType === 'project' && selectedAgents.length < 3) {
      const availableAgents = this.getAvailableAgents()
        .filter(agent => !selectedAgents.find(a => a.id === agent.id))
        .sort((a, b) => a.currentSessions.length - b.currentSessions.length) // Prefer less busy agents

      // Smart agent combinations based on specializations
      const neededSpecializations = this.getComplementarySpecializations(
        selectedAgents.flatMap(a => a.specializations)
      )

      for (const specialization of neededSpecializations) {
        const specialist = availableAgents.find(agent =>
          agent.specializations.includes(specialization)
        )
        if (specialist && selectedAgents.length < 4) {
          selectedAgents.push(specialist)
        }
      }
    }

    // Ensure we have at least one agent
    if (selectedAgents.length === 0) {
      const availableAgents = this.getAvailableAgents()
        .filter(a => a.id === 'roxy' || a.status === 'available')

      if (availableAgents.length > 0) {
        // Default to Roxy (executive assistant) or first available
        const defaultAgent = availableAgents.find(a => a.id === 'roxy') || availableAgents[0]
        selectedAgents.push(defaultAgent)
      }
    }

    return selectedAgents
  }

  /**
   * Get complementary specializations for well-rounded collaboration
   */
  private getComplementarySpecializations(existingSpecializations: string[]): string[] {
    const allSpecializations = [
      'strategic-planning', 'growth-strategy', 'marketing', 'technical-architecture',
      'data-analysis', 'compliance', 'productivity', 'problem-solving'
    ]

    return allSpecializations.filter(spec => !existingSpecializations.includes(spec))
  }

  /**
   * Event system for real-time updates
   */
  on(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  private emitEvent(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || []
    listeners.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        logError(`Error in event listener for ${event}:`, error)
      }
    })
  }

  /**
   * Get collaboration hub statistics
   */
  getStats(): {
    totalAgents: number
    availableAgents: number
    activeSessions: number
    totalMessages: number
  } {
    const availableAgents = Array.from(this.agents.values())
      .filter(agent => agent.status === 'available').length

    const activeSessions = Array.from(this.activeSessions.values())
      .filter(session => session.sessionStatus === 'active').length

    return {
      totalAgents: this.agents.size,
      availableAgents,
      activeSessions,
      totalMessages: 0 // Will be updated by message router
    }
  }
}

// Export singleton instance
export const collaborationHub = new CollaborationHub()