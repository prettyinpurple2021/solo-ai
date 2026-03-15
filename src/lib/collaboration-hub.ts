/**
 * Collaboration Hub - Core system for managing multi-agent collaboration sessions
 * Handles agent registry, session management, and coordination between AI agents
 */

import { logError, logInfo,} from '@/lib/logger'
import { z } from 'zod'
import { MessageRouter } from './message-router'
import { db } from '@/db/index'
import { chatConversations, collaborationSessions, collaborationParticipants } from '@/shared/db/schema'
import { eq, sql } from 'drizzle-orm'
import { ContextManager } from './context-manager'


// Types and Interfaces
export const AgentMessageSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  fromAgent: z.string(),
  toAgent: z.string().nullable(), // null for broadcast messages
  messageType: z.enum(['request', 'response', 'notification', 'handoff', 'broadcast']),
  content: z.string(),
  context: z.record(z.any()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  threadId: z.string().uuid().optional(),
  parentMessageId: z.string().uuid().optional(),
  timestamp: z.date(),
  metadata: z.record(z.any()).optional()
})

export const CollaborationSessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  projectName: z.string().optional(),
  participatingAgents: z.array(z.string()),
  sessionStatus: z.enum(['active', 'paused', 'completed', 'cancelled']).default('active'),
  sessionType: z.enum(['chat', 'project', 'handoff', 'consultation']).default('chat'),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().optional(),
  metadata: z.record(z.any()).optional()
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
  userId: string
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

/**
 * Main Collaboration Hub class
 * Central coordination point for all multi-agent interactions
 */
export class CollaborationHub {
  private agents: Map<string, AgentDefinition> = new Map()
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
        description: 'Operations Chief & Workflow Optimizer',
        capabilities: ['Calendar Orchestration', 'Workflow Automation', 'Prioritization', 'Crisis Management'],
        specializations: ['executive-assistance', 'operations', 'workflow-optimization'],
        personality: 'Strategic and organized, calm confident tone. Speaks in structured, actionable language.',
        accentColor: '#8B5CF6',
        status: 'available',
        currentSessions: [],
        maxConcurrentSessions: 10,
        responseTimeMs: 1500
      },
      {
        id: 'echo',
        name: 'echo',
        displayName: 'Echo',
        description: 'Research Strategist & Competitive Analyst',
        capabilities: ['Competitor Benchmarking', 'SWOT Analysis', 'Trend Forecasting', 'Insight Synthesis'],
        specializations: ['market-intelligence', 'competitive-analysis', 'trends'],
        personality: 'Analytical and forward-thinking, insightful tone. Uses evidence-backed statements.',
        accentColor: '#EC4899',
        status: 'available',
        currentSessions: [],
        maxConcurrentSessions: 6,
        responseTimeMs: 2000
      },
      {
        id: 'blaze',
        name: 'blaze',
        displayName: 'Blaze',
        description: 'Growth Architect & Revenue Driver',
        capabilities: ['Funnel Optimization', 'Sales Enablement', 'KPI Tracking', 'Conversion Strategy'],
        specializations: ['growth-strategy', 'sales', 'revenue-optimization'],
        personality: 'Energetic yet professional, motivational tone. Speaks in terms of goals and outcomes.',
        accentColor: '#F59E0B',
        status: 'available',
        currentSessions: [],
        maxConcurrentSessions: 8,
        responseTimeMs: 1800
      },
      {
        id: 'lumi',
        name: 'lumi',
        displayName: 'Lumi',
        description: 'Compliance Guardian & Risk Mitigator',
        capabilities: ['Contract Review', 'Risk Analysis', 'Policy Enforcement', 'Document Structuring'],
        specializations: ['legal', 'compliance', 'risk-management'],
        personality: 'Detail-oriented and formal, reassuring tone. Prioritizes precision and clarity.',
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
        description: 'Tech Visionary & Systems Strategist',
        capabilities: ['System Architecture', 'Scalability Planning', 'Cybersecurity', 'Tech Stack Optimization'],
        specializations: ['technical-architecture', 'security', 'systems-strategy'],
        personality: 'Analytical and innovative, technical tone. Communicates in diagrams and structured logic.',
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
        description: 'Insight Generator & Decision Support',
        capabilities: ['Data Visualization', 'Trend Analysis', 'Predictive Modeling', 'BI Reporting'],
        specializations: ['data-analysis', 'business-intelligence', 'decision-support'],
        personality: 'Insightful and strategic, logical tone. Speaks in correlations and causations.',
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
        description: 'Experience Architect & Design Innovator',
        capabilities: ['UI/UX Design', 'Prototypying', 'User Journey Mapping', 'Accessibility Compliance'],
        specializations: ['product-design', 'ux-design', 'visual-storytelling'],
        personality: 'Creative and user-centric, elegant tone. Aadvocates for user-first decisions.',
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
        description: 'Quality Guardian & Bug Slayer',
        capabilities: ['Automated Testing', 'Debugging', 'Error Resolution', 'Performance Optimization'],
        specializations: ['qa', 'debugging', 'testing'],
        personality: 'Meticulous and solution-oriented, precise tone. Communicates in root-cause analysis.',
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

    logInfo(`✅ Collaboration Hub initialized with ${defaultAgents.length} agents`)
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

      // Store session in memory
      this.activeSessions.set(sessionId, session)

      // Persist session to database
      await db.insert(collaborationSessions).values({
        id: sessionId,
        user_id: request.userId,
        name: request.projectName || `Collaboration ${sessionId.substring(0, 8)}`,
        goal: request.initialMessage || 'New Collaboration',
        status: 'active',
        configuration: request.context || {},
        metadata: {
            priority: request.priority || 'medium',
            requestedAgents: request.requiredAgents || []
        },
        created_at: new Date(),
        updated_at: new Date()
      })

      // Persist participants
      for (const agent of participants) {
        await db.insert(collaborationParticipants).values({
            id: crypto.randomUUID(),
            session_id: sessionId,
            agent_id: agent.id,
            role: agent.id === request.primaryAgent ? 'primary' : 'member',
            joined_at: new Date()
        })
      }

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
      
      // Check if session exists in memory, or hydrate from DB
      let session = this.activeSessions.get(validatedMessage.sessionId)
      
      if (!session) {
        logInfo(`Session ${validatedMessage.sessionId} not in memory, attempting hydration from DB...`)
        const dbSession = await db.query.collaborationSessions.findFirst({
          where: eq(collaborationSessions.id, validatedMessage.sessionId),
          with: { participants: true }
        })

        if (dbSession) {
          session = {
            id: dbSession.id,
            userId: dbSession.user_id,
            projectName: dbSession.name,
            participatingAgents: dbSession.participants.map(p => p.agent_id),
            sessionStatus: dbSession.status as any,
            sessionType: 'project', // Default or from metadata
            createdAt: dbSession.created_at || new Date(),
            updatedAt: dbSession.updated_at || new Date(),
            metadata: dbSession.metadata as Record<string, any>
          }
          this.activeSessions.set(session.id, session)
          logInfo(`✅ Hydrated session ${session.id} from DB`)
        }
      }

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
  getUserSessions(userId: string): CollaborationSession[] {
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
   * Get all available agents with real-time status from DB
   */
  async getAvailableAgents(): Promise<AgentDefinition[]> {
    try {
      // Get active session counts from DB to determine real availability
      const activeConversations = await db
        .select({
          agentId: chatConversations.agent_id,
          count: sql<number>`count(*)`
        })
        .from(chatConversations)
        .where(eq(chatConversations.is_archived, false))
        .groupBy(chatConversations.agent_id);

      // Create a map of agent load
      const agentLoad = new Map<string, number>();
      activeConversations.forEach(row => {
        agentLoad.set(row.agentId, Number(row.count));
      });

      // Update in-memory agents with DB status
      return Array.from(this.agents.values()).map(agent => {
        const load = agentLoad.get(agent.id) || 0;
        
        // Update status based on load
        // Note: We don't modify the stored agent definition permanently to avoid side effects
        // but return a fresh object with updated status
        const status = load >= agent.maxConcurrentSessions ? 'busy' : agent.status;
        
        return {
          ...agent,
          status,
          // We might not have the exact session IDs here without a heavier query, 
          // but we can simulate the "load" by filling the array with placeholders if needed
          // or just assume consumers look at status.
          // Optimization: Keep sessions in-memory for low-latency, syncing to Redis periodically if needed (V2)
          // For V1, ephemeral in-memory state is sufficient given the WebSocket persistence.
          // Better approach: If we want real "currentSessions", we need to fetch them.
          // But for "available agents" list, status is the most important.
        };
      }).filter(agent => agent.status === 'available');
      
    } catch (error) {
      logError('Error fetching agent availability:', error);
      // Fallback to in-memory state
      return Array.from(this.agents.values())
        .filter(agent => agent.status === 'available');
    }
  }

  /**
   * Transfer session ownership to another user
   */
  transferSession(sessionId: string, newUserId: string): boolean {
    const session = this.activeSessions.get(sessionId)
    if (!session) {
      return false
    }

    const oldUserId = session.userId
    session.userId = newUserId
    session.updatedAt = new Date()

    this.activeSessions.set(sessionId, session)
    
    this.emitEvent('session_transferred', { 
      sessionId, 
      oldUserId, 
      newUserId 
    })

    return true
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
      const availableAgents = (await this.getAvailableAgents())
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
      const availableAgents = await this.getAvailableAgents()
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

  async getStats(): Promise<{
    totalAgents: number
    availableAgents: number
    activeSessions: number
    totalMessages: number
  }> {
    const agents = await this.getAvailableAgents()
    const availableAgents = agents.filter(agent => agent.status === 'available').length

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
