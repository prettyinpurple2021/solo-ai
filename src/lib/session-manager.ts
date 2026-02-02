/**
 * Session Manager - Manages multi-agent collaboration sessions
 * Handles session lifecycle, state persistence, and coordination
 */

import { logError, logInfo,} from '@/lib/logger'
import { z } from 'zod'
import { db } from '@/lib/db'
import { 
  collaborationSessions, 
  collaborationParticipants, 
  collaborationMessages,
  collaborationCheckpoints 
} from '@/db/schema'
import { eq, and, inArray } from 'drizzle-orm'
import type { 
  CollaborationSession, 
  AgentMessage, 
  CollaborationHub,
  AgentDefinition 
} from './collaboration-hub'
import type { MessageRouter } from './message-router'

// Session state types
export const SessionStateSchema = z.object({
  sessionId: z.string().uuid(),
  status: z.enum(['initializing', 'active', 'paused', 'completed', 'failed', 'archived']),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastActivity: z.date(),
  participantCount: z.number(),
  messageCount: z.number(),
  completedTasks: z.array(z.string()),
  pendingTasks: z.array(z.string()),
  sessionMetrics: z.object({
    averageResponseTime: z.number(),
    totalInteractions: z.number(),
    successfulHandoffs: z.number(),
    failedHandoffs: z.number()
  }),
  configuration: z.object({
    maxDuration: z.number().optional(),
    autoArchiveAfter: z.number().default(86400000), // 24 hours
    allowDynamicAgentJoining: z.boolean().default(true),
    maxParticipants: z.number().default(10),
    requiresHumanApproval: z.boolean().default(false)
  })
})

export type SessionState = z.infer<typeof SessionStateSchema>

export interface SessionCheckpoint {
  checkpointId: string
  sessionId: string
  timestamp: Date
  state: SessionState
  messageHistory: AgentMessage[]
  agentStates: Record<string, any>
  userContext: Record<string, any>
}

export interface SessionTemplate {
  id: string
  name: string
  description: string
  requiredAgents: string[]
  optionalAgents: string[]
  initialPrompt?: string
  configuration: SessionState['configuration']
  workflow?: {
    steps: Array<{
      id: string
      name: string
      assignedAgent?: string
      dependencies?: string[]
      autoExecute?: boolean
    }>
  }
}

/**
 * Session Manager Class
 * Coordinates multi-agent collaboration sessions
 */
export class SessionManager {
  private sessionTemplates: Map<string, SessionTemplate> = new Map()
  private collaborationHub: CollaborationHub
  private messageRouter: MessageRouter

  constructor(hub: CollaborationHub, router: MessageRouter) {
    this.collaborationHub = hub
    this.messageRouter = router
    this.initializeDefaultTemplates()
  }

  /**
   * Create a new collaboration session
   */
  async createSession(config: {
    userId: string
    goal: string
    requiredAgents?: string[]
    templateId?: string
    configuration?: Partial<SessionState['configuration']>
    initialContext?: Record<string, any>
  }): Promise<CollaborationSession> {
    try {
      // Load template if specified
      let template: SessionTemplate | undefined
      if (config.templateId) {
        template = this.sessionTemplates.get(config.templateId)
        if (!template) {
          throw new Error(`Session template ${config.templateId} not found`)
        }
      }

      // Determine required agents
      const requiredAgents = config.requiredAgents || template?.requiredAgents || []
      
      // Validate agents exist and are available
      const availableAgents = requiredAgents.filter(agentId => {
        const agent = this.collaborationHub.getAgent(agentId)
        return agent && agent.currentSessions.length < agent.maxConcurrentSessions
      })

      if (availableAgents.length < requiredAgents.length) {
        const unavailableAgents = requiredAgents.filter(id => !availableAgents.includes(id))
        throw new Error(`Required agents not available: ${unavailableAgents.join(', ')}`)
      }

      // Create session using collaboration hub (logic only)
      const collaborationResponse = await this.collaborationHub.initiateCollaboration({
        userId: config.userId,
        requestType: 'project',
        requiredAgents: availableAgents,
        projectName: config.goal,
        context: config.initialContext || {},
        priority: 'medium'
      })

      if (collaborationResponse.status === 'error') {
        throw new Error(collaborationResponse.message || 'Failed to create collaboration session')
      }

      const sessionValues: any = {
        id: collaborationResponse.sessionId,
        user_id: config.userId,
        name: config.goal.substring(0, 255) || 'New Session',
        goal: config.goal,
        status: 'active',
        configuration: {
          autoArchiveAfter: 86400000,
          allowDynamicAgentJoining: true,
          maxParticipants: 10,
          requiresHumanApproval: false,
          ...template?.configuration,
          ...config.configuration
        },
        metadata: {
            // Store dynamic state in metadata for now
            sessionType: 'project',
            messageCount: 0,
            participantCount: availableAgents.length,
            startTime: new Date().toISOString(),
            pendingTasks: template?.workflow?.steps.map(step => step.id) || [],
            completedTasks: []
        },
      }
      
      // Persist session to DB
      const result = await db.insert(collaborationSessions).values(sessionValues).returning()
      const sessionSession = result[0]
      const sessionId = sessionSession.id

       // Persist participants
       for (const agentId of availableAgents) {
            await db.insert(collaborationParticipants).values({
                session_id: sessionId,
                agent_id: agentId,
                role: 'member'
            })
            
            // Update in-memory agent state
            const agent = this.collaborationHub.getAgent(agentId)
            if (agent) agent.currentSessions.push(sessionId)
       }

      // Create initial checkpoint
      await this.createCheckpoint(sessionId, 'Session initialized')

      // Send initial prompt if template provides one
      if (template?.initialPrompt) {
        await this.sendSystemMessage(sessionId, template.initialPrompt, config.initialContext)
      }

      logInfo(`✅ Session ${sessionId} created with ${availableAgents.length} agents`)
      
      // Return normalized session object
      return {
        id: sessionId,
        userId: config.userId,
        participatingAgents: availableAgents,
        createdAt: sessionSession.created_at || new Date(),
        updatedAt: sessionSession.updated_at || new Date(),
        sessionStatus: sessionSession.status as any,
        sessionType: 'project',
        projectName: sessionSession.name,
        metadata: sessionSession.metadata as Record<string, any>
      }

    } catch (error) {
      logError('Error creating session:', error)
      throw error
    }
  }

  /**
   * Join an agent to an existing session
   */
  async joinSession(sessionId: string, agentId: string): Promise<boolean> {
    try {
      const session = await db.query.collaborationSessions.findFirst({
        where: eq(collaborationSessions.id, sessionId),
        with: {
            participants: true
        }
      })
      
      if (!session) {
        throw new Error(`Session ${sessionId} not found`)
      }

      if (session.status !== 'active') {
        throw new Error(`Cannot join session in ${session.status} status`)
      }

      // Check configuration
      const config = session.configuration as any
      if (!config.allowDynamicAgentJoining) {
        throw new Error('Dynamic agent joining is disabled for this session')
      }
      
      const currentParticipants = session.participants.length
      if (currentParticipants >= (config.maxParticipants || 10)) {
        throw new Error('Session has reached maximum participant limit')
      }

      // Validate agent exists and is available
      const agent = this.collaborationHub.getAgent(agentId)
      if (!agent) {
        throw new Error(`Agent ${agentId} not found`)
      }

      if (agent.currentSessions.length >= agent.maxConcurrentSessions) {
        throw new Error(`Agent ${agentId} is at maximum concurrent session limit`)
      }

      const existingParticipant = await db.query.collaborationParticipants.findFirst({
        where: and(
            eq(collaborationParticipants.session_id, sessionId),
            eq(collaborationParticipants.agent_id, agentId)
        )
      })

      if (existingParticipant) {
        return true // Agent already in session
      }

      // Add agent to session in DB
      await db.insert(collaborationParticipants).values({
        session_id: sessionId,
        agent_id: agentId,
        role: 'member'
      })
      
      // Update DB timestamp
      await db.update(collaborationSessions)
        .set({ updated_at: new Date() })
        .where(eq(collaborationSessions.id, sessionId))

      agent.currentSessions.push(sessionId)

      // Notify other agents
      await this.sendSystemMessage(
        sessionId, 
        `Agent ${agent.name} has joined the collaboration session.`,
        { newAgent: { id: agentId, name: agent.name, capabilities: agent.capabilities } }
      )

      // Create checkpoint
      await this.createCheckpoint(sessionId, `Agent ${agentId} joined`)

      logInfo(`✅ Agent ${agentId} joined session ${sessionId}`)
      
      return true

    } catch (error) {
      logError(`Error joining session: ${error}`)
      return false
    }
  }

  /**
   * Remove an agent from a session
   */
  async leaveSession(sessionId: string, agentId: string, reason?: string): Promise<boolean> {
    try {
      const session = await db.query.collaborationSessions.findFirst({
         where: eq(collaborationSessions.id, sessionId)
      })
      
      if (!session) {
        throw new Error(`Session ${sessionId} not found`)
      }

      // Remove agent from DB
      await db.delete(collaborationParticipants)
        .where(and(
            eq(collaborationParticipants.session_id, sessionId),
            eq(collaborationParticipants.agent_id, agentId)
        ))

      // Update agent's current sessions InMemory
      const agent = this.collaborationHub.getAgent(agentId)
      if (agent) {
        const sessionIndex = agent.currentSessions.indexOf(sessionId)
        if (sessionIndex !== -1) {
          agent.currentSessions.splice(sessionIndex, 1)
        }
      }

      // Notify other agents
      const agentName = agent?.name || agentId
      await this.sendSystemMessage(
        sessionId, 
        `Agent ${agentName} has left the collaboration session.${reason ? ` Reason: ${reason}` : ''}`,
        { leftAgent: { id: agentId, name: agentName, reason } }
      )

      // Create checkpoint
      await this.createCheckpoint(sessionId, `Agent ${agentId} left: ${reason || 'No reason provided'}`)

      return true

    } catch (error) {
      logError(`Error leaving session: ${error}`)
      return false
    }
  }

  /**
   * Pause a session
   */
  async pauseSession(sessionId: string, reason?: string): Promise<boolean> {
    try {
      await db.update(collaborationSessions)
        .set({ status: 'paused', updated_at: new Date() })
        .where(eq(collaborationSessions.id, sessionId))

      // Notify agents
      await this.sendSystemMessage(
        sessionId, 
        `Session has been paused.${reason ? ` Reason: ${reason}` : ''}`,
        { pauseReason: reason }
      )

      await this.createCheckpoint(sessionId, `Session paused: ${reason || 'Manual pause'}`)
      return true
    } catch (error) {
      logError(`Error pausing session: ${error}`)
      return false
    }
  }

  /**
   * Transfer session ownership
   */
  async transferSession(sessionId: string, newUserId: string, reason?: string): Promise<boolean> {
    try {
      const session = await db.query.collaborationSessions.findFirst({
        where: eq(collaborationSessions.id, sessionId)
      })
      if (!session) throw new Error("Session not found")
      
      const oldUserId = session.user_id

      await db.update(collaborationSessions)
        .set({ user_id: newUserId, updated_at: new Date() })
        .where(eq(collaborationSessions.id, sessionId))

      // Notify agents
      await this.sendSystemMessage(
        sessionId,
        `Session ownership transferred from User ${oldUserId} to User ${newUserId}.${reason ? ` Reason: ${reason}` : ''}`,
        { transfer: { oldUserId, newUserId, reason } }
      )

      await this.createCheckpoint(sessionId, `Session transferred to User ${newUserId}`)
      return true
    } catch (error) {
      logError(`Error transferring session: ${error}`)
      return false
    }
  }

  /**
   * Resume a paused session
   */
  async resumeSession(sessionId: string): Promise<boolean> {
    try {
      await db.update(collaborationSessions)
        .set({ status: 'active', updated_at: new Date() })
        .where(eq(collaborationSessions.id, sessionId))

      // Notify agents
      await this.sendSystemMessage(
        sessionId, 
        'Session has been resumed. Collaboration can continue.',
        {}
      )

      await this.createCheckpoint(sessionId, 'Session resumed')
      return true
    } catch (error) {
      logError(`Error resuming session: ${error}`)
      return false
    }
  }

  /**
   * Complete a session
   */
  async completeSession(sessionId: string, summary?: string): Promise<boolean> {
    try {
      const session = await db.query.collaborationSessions.findFirst({
        where: eq(collaborationSessions.id, sessionId),
        with: { participants: true }
      })
      if (!session) throw new Error("Session not found")

      await db.update(collaborationSessions)
        .set({ status: 'completed', updated_at: new Date() })
        .where(eq(collaborationSessions.id, sessionId))

      // Release agents
      for (const p of session.participants) {
        const agent = this.collaborationHub.getAgent(p.agent_id)
        if (agent) {
           const idx = agent.currentSessions.indexOf(sessionId)
           if (idx !== -1) agent.currentSessions.splice(idx, 1)
        }
      }

      await this.sendSystemMessage(
        sessionId, 
        `Session completed successfully.${summary ? ` Summary: ${summary}` : ''}`,
        { completionSummary: summary }
      )

      await this.createCheckpoint(sessionId, `Session completed: ${summary || 'No summary provided'}`)
      
      return true
    } catch (error) {
      logError(`Error completing session: ${error}`)
      return false
    }
  }

  /**
   * Archive a completed session
   */
  async archiveSession(sessionId: string): Promise<boolean> {
    try {
      await db.update(collaborationSessions)
        .set({ status: 'archived', updated_at: new Date() })
        .where(eq(collaborationSessions.id, sessionId))
      return true
    } catch (error) {
      logError(`Error archiving session: ${error}`)
      return false
    }
  }

  /**
   * Get session information (DB backed)
   */
  async getSession(sessionId: string): Promise<CollaborationSession | null> {
    const session = await db.query.collaborationSessions.findFirst({
        where: eq(collaborationSessions.id, sessionId),
        with: { participants: true }
    })
    
    if (!session) return null

    return {
        id: session.id,
        userId: session.user_id,
        participatingAgents: session.participants.map(p => p.agent_id),
        createdAt: session.created_at || new Date(),
        updatedAt: session.updated_at || new Date(),
        sessionStatus: session.status as any,
        sessionType: 'project',
        projectName: session.name,
        metadata: session.metadata as Record<string, any>
    }
  }

  /**
   * Get session state
   * Reconstructed from DB or metadata
   */
  getSessionState(sessionId: string): SessionState | null {
    // Note: This needs to be async in a real DB world.
    // TEMPORARY: Return null. Callers must use async version.
    return null; 
  }
  
  // Async version of getSessionState
  async getSessionStateAsync(sessionId: string): Promise<SessionState | null> {
     const session = await db.query.collaborationSessions.findFirst({
        where: eq(collaborationSessions.id, sessionId),
        with: { participants: true, messages: true }
     })
     if (!session) return null
     
     const config = session.configuration as any
     const meta = session.metadata as any
     const status = session.status as any

     return {
        sessionId: session.id,
        status: status,
        createdAt: session.created_at || new Date(),
        updatedAt: session.updated_at || new Date(),
        lastActivity: session.updated_at || new Date(),
        participantCount: session.participants.length,
        messageCount: session.messages.length,
        completedTasks: meta?.completedTasks || [],
        pendingTasks: meta?.pendingTasks || [],
        sessionMetrics: {
            averageResponseTime: 0,
            totalInteractions: session.messages.length,
            successfulHandoffs: 0,
            failedHandoffs: 0
        },
        configuration: {
            autoArchiveAfter: 86400000,
            allowDynamicAgentJoining: true,
            maxParticipants: 10,
            requiresHumanApproval: false,
            ...config
        }
     }
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): CollaborationSession[] {
    // Return empty array and prefer async methods.
    return [] 
  }
  
  async getActiveSessionsAsync(): Promise<CollaborationSession[]> {
     const sessions = await db.query.collaborationSessions.findMany({
        where: eq(collaborationSessions.status, 'active'),
        with: { participants: true }
     })
     
     return sessions.map(s => ({
        id: s.id,
        userId: s.user_id,
        participatingAgents: s.participants.map(p => p.agent_id),
        createdAt: s.created_at || new Date(),
        updatedAt: s.updated_at || new Date(),
        sessionStatus: s.status as any,
        sessionType: 'project',
        projectName: s.name,
        metadata: s.metadata as Record<string, any>
     }))
  }

  /**
   * Get sessions by user
   */
  getUserSessions(userId: string): CollaborationSession[] {
     return [] // Use async
  }
  
  async getUserSessionsAsync(userId: string): Promise<CollaborationSession[]> {
    const sessions = await db.query.collaborationSessions.findMany({
        where: eq(collaborationSessions.user_id, userId),
        with: { participants: true }
     })
     
     return sessions.map(s => ({
        id: s.id,
        userId: s.user_id,
        participatingAgents: s.participants.map(p => p.agent_id),
        createdAt: s.created_at || new Date(),
        updatedAt: s.updated_at || new Date(),
        sessionStatus: s.status as any,
        sessionType: 'project',
        projectName: s.name,
        metadata: s.metadata as Record<string, any>
     }))
  }

  /**
   * Get sessions by agent interaction
   */
  async getAgentSessionsAsync(agentId: string): Promise<CollaborationSession[]> {
    try {
        const participations = await db.query.collaborationParticipants.findMany({
            where: eq(collaborationParticipants.agent_id, agentId)
        })
        
        if (participations.length === 0) return []
        
        const sessionIds = participations.map(p => p.session_id)
        
        const sessions = await db.query.collaborationSessions.findMany({
            where: inArray(collaborationSessions.id, sessionIds),
            with: { participants: true }
        })
        
        return sessions.map(s => ({
            id: s.id,
            userId: s.user_id,
            participatingAgents: s.participants.map(p => p.agent_id),
            createdAt: s.created_at || new Date(),
            updatedAt: s.updated_at || new Date(),
            sessionStatus: s.status as any,
            sessionType: 'project',
            projectName: s.name,
            metadata: s.metadata as Record<string, any>
        }))
    } catch (error) {
        logError(`Error getting agent sessions: ${error}`)
        return []
    }
  }

  /**
   * Create a checkpoint for session state
   */
  async createCheckpoint(sessionId: string, description: string): Promise<string> {
    try {
      const state = await this.getSessionStateAsync(sessionId)
      if (!state) return ""

      const checkpointId = crypto.randomUUID()
      
      await db.insert(collaborationCheckpoints).values({
        id: checkpointId,
        session_id: sessionId,
        description,
        state: state as any,
        timestamp: new Date()
      })
      
      return checkpointId
    } catch (error) {
      logError(`Error creating checkpoint: ${error}`)
      throw error // Re-throw to inform caller? Or just log? 
      // Original handled it silently mostly, but defined throw in createSession
    }
  }

  /**
   * Restore session from checkpoint
   */
  async restoreFromCheckpoint(sessionId: string, arg_string: string): Promise<boolean> {
     // TODO: Implement restore logic
     return false
  }

  /**
   * Update session task status
   */
  async updateTaskStatus(sessionId: string, arg_string: string, status: 'completed' | 'pending'): Promise<boolean> {
      // Logic could be implemented if we parse metadata
     return false
  }

  /**
   * Send system message to session
   */
  private async sendSystemMessage(
    sessionId: string, 
    content: string, 
    context?: Record<string, any>
  ): Promise<void> {
    const systemMessage: AgentMessage = {
      id: crypto.randomUUID(),
      sessionId,
      fromAgent: 'system',
      toAgent: null, // Broadcast to all
      messageType: 'notification',
      content,
      timestamp: new Date(),
      priority: 'medium',
      metadata: context
    }

    // Persist message
    await db.insert(collaborationMessages).values({
        session_id: sessionId,
        from_agent_id: 'system',
        content,
        message_type: 'system',
        metadata: context
    })

    await this.messageRouter.broadcastMessage(systemMessage)
  }

  /**
   * Initialize default session templates
   */
  private initializeDefaultTemplates(): void {
    const templates: SessionTemplate[] = [
      {
        id: 'general-collaboration',
        name: 'General Collaboration',
        description: 'Multi-purpose collaboration session for various tasks',
        requiredAgents: ['assistant', 'researcher'],
        optionalAgents: ['analyst', 'creative'],
        configuration: {
          maxDuration: 7200000, // 2 hours
          autoArchiveAfter: 86400000, // 24 hours
          allowDynamicAgentJoining: true,
          maxParticipants: 5,
          requiresHumanApproval: false
        }
      },
      {
        id: 'research-project',
        name: 'Research Project',
        description: 'Structured research collaboration with defined workflow',
        requiredAgents: ['researcher', 'analyst'],
        optionalAgents: ['assistant'],
        initialPrompt: 'Welcome to the research collaboration session. Please begin by defining the research objectives and methodology.',
        configuration: {
          maxDuration: 14400000, // 4 hours
          autoArchiveAfter: 172800000, // 48 hours
          allowDynamicAgentJoining: true,
          maxParticipants: 4,
          requiresHumanApproval: false
        },
        workflow: {
          steps: [
            { id: 'define-objectives', name: 'Define Research Objectives', assignedAgent: 'researcher' },
            { id: 'collect-data', name: 'Collect and Analyze Data', assignedAgent: 'analyst' },
            { id: 'synthesize-findings', name: 'Synthesize Findings', dependencies: ['collect-data'] },
            { id: 'prepare-report', name: 'Prepare Final Report', dependencies: ['synthesize-findings'] }
          ]
        }
      },
      {
        id: 'creative-brainstorm',
        name: 'Creative Brainstorming',
        description: 'Creative ideation and brainstorming session',
        requiredAgents: ['creative', 'assistant'],
        optionalAgents: ['analyst'],
        initialPrompt: 'Let\'s begin a creative brainstorming session. Please share your initial ideas and build upon each other\'s contributions.',
        configuration: {
          maxDuration: 3600000, // 1 hour
          autoArchiveAfter: 86400000, // 24 hours
          allowDynamicAgentJoining: true,
          maxParticipants: 6,
          requiresHumanApproval: false
        }
      }
    ]

    templates.forEach(template => {
      this.sessionTemplates.set(template.id, template)
    })
  }
}