/**
 * Session Manager - Manages multi-agent collaboration sessions
 * Handles session lifecycle, state persistence, and coordination
 */

import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { z } from 'zod'
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
  private activeSessions: Map<string, CollaborationSession> = new Map()
  private sessionStates: Map<string, SessionState> = new Map()
  private sessionCheckpoints: Map<string, SessionCheckpoint[]> = new Map()
  private sessionTemplates: Map<string, SessionTemplate> = new Map()
  private collaborationHub: CollaborationHub
  private messageRouter: MessageRouter
  private sessionCleanupInterval: NodeJS.Timeout | null = null

  constructor(hub: CollaborationHub, router: MessageRouter) {
    this.collaborationHub = hub
    this.messageRouter = router
    this.initializeDefaultTemplates()
    // Avoid background cleanup loops unless explicitly enabled
    const enableCleanup = (typeof window === 'undefined') && (process.env.ENABLE_SESSION_CLEANUP === 'true')
    if (enableCleanup) {
      this.startSessionCleanup()
    }
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
      const sessionId = crypto.randomUUID()

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

      // Create session using collaboration hub
      const collaborationResponse = await this.collaborationHub.initiateCollaboration({
        userId: parseInt(config.userId, 10) || 0,
        requestType: 'project',
        requiredAgents: availableAgents,
        projectName: config.goal,
        context: config.initialContext || {},
        priority: 'medium'
      })

      if (collaborationResponse.status === 'error') {
        throw new Error(collaborationResponse.message || 'Failed to create collaboration session')
      }

      const session = this.collaborationHub.getSession(collaborationResponse.sessionId)
      if (!session) {
        throw new Error('Session was created but could not be retrieved')
      }

      // Create session state
      const sessionState: SessionState = {
        sessionId: session.id,
        status: 'initializing',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActivity: new Date(),
        participantCount: availableAgents.length,
        messageCount: 0,
        completedTasks: [],
        pendingTasks: template?.workflow?.steps.map(step => step.id) || [],
        sessionMetrics: {
          averageResponseTime: 0,
          totalInteractions: 0,
          successfulHandoffs: 0,
          failedHandoffs: 0
        },
        configuration: {
          autoArchiveAfter: 86400000, // 24 hours default
          allowDynamicAgentJoining: true,
          maxParticipants: 10,
          requiresHumanApproval: false,
          ...template?.configuration,
          ...config.configuration
        }
      }

      // Store session and state
      this.activeSessions.set(sessionId, session)
      this.sessionStates.set(sessionId, sessionState)
      this.sessionCheckpoints.set(sessionId, [])

      // Create initial checkpoint
      await this.createCheckpoint(sessionId, 'Session initialized')

      // Send initial prompt if template provides one
      if (template?.initialPrompt) {
        await this.sendSystemMessage(sessionId, template.initialPrompt, config.initialContext)
      }

      // Mark session as active
      sessionState.status = 'active'
      sessionState.updatedAt = new Date()
      this.sessionStates.set(sessionId, sessionState)

      logInfo(`✅ Session ${sessionId} created with ${availableAgents.length} agents`)

      return session

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
      const session = this.activeSessions.get(sessionId)
      const sessionState = this.sessionStates.get(sessionId)

      if (!session || !sessionState) {
        throw new Error(`Session ${sessionId} not found`)
      }

      if (sessionState.status !== 'active') {
        throw new Error(`Cannot join session in ${sessionState.status} status`)
      }

      // Check configuration
      if (!sessionState.configuration.allowDynamicAgentJoining) {
        throw new Error('Dynamic agent joining is disabled for this session')
      }

      if (session.participatingAgents.length >= sessionState.configuration.maxParticipants) {
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

      if (session.participatingAgents.includes(agentId)) {
        return true // Agent already in session
      }

      // Add agent to session
      session.participatingAgents.push(agentId)
      agent.currentSessions.push(sessionId)

      // Update session state
      sessionState.participantCount = session.participatingAgents.length
      sessionState.updatedAt = new Date()
      sessionState.lastActivity = new Date()

      this.sessionStates.set(sessionId, sessionState)

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
      const session = this.activeSessions.get(sessionId)
      const sessionState = this.sessionStates.get(sessionId)

      if (!session || !sessionState) {
        throw new Error(`Session ${sessionId} not found`)
      }

      const agentIndex = session.participatingAgents.indexOf(agentId)
      if (agentIndex === -1) {
        return true // Agent not in session
      }

      // Remove agent from session
      session.participatingAgents.splice(agentIndex, 1)

      // Update agent's current sessions
      const agent = this.collaborationHub.getAgent(agentId)
      if (agent) {
        const sessionIndex = agent.currentSessions.indexOf(sessionId)
        if (sessionIndex !== -1) {
          agent.currentSessions.splice(sessionIndex, 1)
        }
      }

      // Update session state
      sessionState.participantCount = session.participatingAgents.length
      sessionState.updatedAt = new Date()
      sessionState.lastActivity = new Date()

      this.sessionStates.set(sessionId, sessionState)

      // Notify other agents
      const agentName = agent?.name || agentId
      await this.sendSystemMessage(
        sessionId,
        `Agent ${agentName} has left the collaboration session.${reason ? ` Reason: ${reason}` : ''}`,
        { leftAgent: { id: agentId, name: agentName, reason } }
      )

      // Create checkpoint
      await this.createCheckpoint(sessionId, `Agent ${agentId} left: ${reason || 'No reason provided'}`)

      // Check if session should be paused/completed
      if (session.participatingAgents.length === 0) {
        await this.pauseSession(sessionId, 'No participants remaining')
      }

      logInfo(`✅ Agent ${agentId} left session ${sessionId}`)

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
      const sessionState = this.sessionStates.get(sessionId)
      if (!sessionState) {
        throw new Error(`Session ${sessionId} not found`)
      }

      if (sessionState.status !== 'active') {
        throw new Error(`Cannot pause session in ${sessionState.status} status`)
      }

      sessionState.status = 'paused'
      sessionState.updatedAt = new Date()
      this.sessionStates.set(sessionId, sessionState)

      // Notify agents
      await this.sendSystemMessage(
        sessionId,
        `Session has been paused.${reason ? ` Reason: ${reason}` : ''}`,
        { pauseReason: reason }
      )

      // Create checkpoint
      await this.createCheckpoint(sessionId, `Session paused: ${reason || 'Manual pause'}`)

      logInfo(`⏸️ Session ${sessionId} paused: ${reason || 'Manual pause'}`)

      return true

    } catch (error) {
      logError(`Error pausing session: ${error}`)
      return false
    }
  }

  /**
   * Resume a paused session
   */
  async resumeSession(sessionId: string): Promise<boolean> {
    try {
      const sessionState = this.sessionStates.get(sessionId)
      if (!sessionState) {
        throw new Error(`Session ${sessionId} not found`)
      }

      if (sessionState.status !== 'paused') {
        throw new Error(`Cannot resume session in ${sessionState.status} status`)
      }

      sessionState.status = 'active'
      sessionState.updatedAt = new Date()
      sessionState.lastActivity = new Date()
      this.sessionStates.set(sessionId, sessionState)

      // Notify agents
      await this.sendSystemMessage(
        sessionId,
        'Session has been resumed. Collaboration can continue.',
        {}
      )

      // Create checkpoint
      await this.createCheckpoint(sessionId, 'Session resumed')

      logInfo(`▶️ Session ${sessionId} resumed`)

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
      const session = this.activeSessions.get(sessionId)
      const sessionState = this.sessionStates.get(sessionId)

      if (!session || !sessionState) {
        throw new Error(`Session ${sessionId} not found`)
      }

      if (!['active', 'paused'].includes(sessionState.status)) {
        throw new Error(`Cannot complete session in ${sessionState.status} status`)
      }

      // Update session state
      sessionState.status = 'completed'
      sessionState.updatedAt = new Date()
      this.sessionStates.set(sessionId, sessionState)

      // Remove agents from session
      for (const agentId of session.participatingAgents) {
        const agent = this.collaborationHub.getAgent(agentId)
        if (agent) {
          const sessionIndex = agent.currentSessions.indexOf(sessionId)
          if (sessionIndex !== -1) {
            agent.currentSessions.splice(sessionIndex, 1)
          }
        }
      }

      // Send completion message
      await this.sendSystemMessage(
        sessionId,
        `Session completed successfully.${summary ? ` Summary: ${summary}` : ''}`,
        { completionSummary: summary }
      )

      // Create final checkpoint
      await this.createCheckpoint(sessionId, `Session completed: ${summary || 'No summary provided'}`)

      // Schedule for archival
      setTimeout(() => {
        this.archiveSession(sessionId).catch((err) => {
          logError('Failed to archive session after completion', err)
        })
      }, sessionState.configuration.autoArchiveAfter)

      logInfo(`✅ Session ${sessionId} completed`)

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
      const sessionState = this.sessionStates.get(sessionId)
      if (!sessionState) {
        return false
      }

      if (sessionState.status !== 'completed' && sessionState.status !== 'failed') {
        throw new Error(`Cannot archive session in ${sessionState.status} status`)
      }

      sessionState.status = 'archived'
      sessionState.updatedAt = new Date()
      this.sessionStates.set(sessionId, sessionState)

      // Create final checkpoint
      await this.createCheckpoint(sessionId, 'Session archived')

      // In a real implementation, move to cold storage
      logInfo(`📦 Session ${sessionId} archived`)

      return true

    } catch (error) {
      logError(`Error archiving session: ${error}`)
      return false
    }
  }

  /**
   * Get session information
   */
  getSession(sessionId: string): CollaborationSession | null {
    return this.activeSessions.get(sessionId) || null
  }

  /**
   * Get session state
   */
  getSessionState(sessionId: string): SessionState | null {
    return this.sessionStates.get(sessionId) || null
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): CollaborationSession[] {
    return Array.from(this.activeSessions.values())
  }

  /**
   * Get sessions by user
   */
  getUserSessions(userId: string): CollaborationSession[] {
    const numericUserId = parseInt(userId, 10)
    return Array.from(this.activeSessions.values())
      .filter(session => session.userId === numericUserId)
  }

  /**
   * Get sessions by agent
   */
  getAgentSessions(agentId: string): CollaborationSession[] {
    return Array.from(this.activeSessions.values())
      .filter(session => session.participatingAgents.includes(agentId))
  }

  /**
   * Create a checkpoint for session state
   */
  async createCheckpoint(sessionId: string, description: string): Promise<string> {
    try {
      const session = this.activeSessions.get(sessionId)
      const sessionState = this.sessionStates.get(sessionId)

      if (!session || !sessionState) {
        throw new Error(`Session ${sessionId} not found`)
      }

      const checkpointId = crypto.randomUUID()

      const checkpoint: SessionCheckpoint = {
        checkpointId,
        sessionId,
        timestamp: new Date(),
        state: { ...sessionState },
        messageHistory: [], // In real implementation, get from message store
        agentStates: {}, // In real implementation, get from agents
        userContext: session.metadata || {}
      }

      const checkpoints = this.sessionCheckpoints.get(sessionId) || []
      checkpoints.push(checkpoint)

      // Keep only last 10 checkpoints to manage memory
      if (checkpoints.length > 10) {
        checkpoints.splice(0, checkpoints.length - 10)
      }

      this.sessionCheckpoints.set(sessionId, checkpoints)

      logInfo(`📸 Checkpoint created for session ${sessionId}: ${description}`)

      return checkpointId

    } catch (error) {
      logError(`Error creating checkpoint: ${error}`)
      throw error
    }
  }

  /**
   * Restore session from checkpoint
   */
  async restoreFromCheckpoint(sessionId: string, checkpointId: string): Promise<boolean> {
    try {
      const checkpoints = this.sessionCheckpoints.get(sessionId)
      if (!checkpoints) {
        throw new Error(`No checkpoints found for session ${sessionId}`)
      }

      const checkpoint = checkpoints.find(cp => cp.checkpointId === checkpointId)
      if (!checkpoint) {
        throw new Error(`Checkpoint ${checkpointId} not found`)
      }

      // Restore session state
      this.sessionStates.set(sessionId, { ...checkpoint.state })

      // Notify agents about restoration
      await this.sendSystemMessage(
        sessionId,
        `Session restored from checkpoint created at ${checkpoint.timestamp.toISOString()}`,
        { restoredFromCheckpoint: checkpointId }
      )

      logInfo(`🔄 Session ${sessionId} restored from checkpoint ${checkpointId}`)

      return true

    } catch (error) {
      logError(`Error restoring from checkpoint: ${error}`)
      return false
    }
  }

  /**
   * Update session task status
   */
  async updateTaskStatus(sessionId: string, taskId: string, status: 'completed' | 'pending'): Promise<boolean> {
    try {
      const sessionState = this.sessionStates.get(sessionId)
      if (!sessionState) {
        throw new Error(`Session ${sessionId} not found`)
      }

      if (status === 'completed') {
        // Move from pending to completed
        const taskIndex = sessionState.pendingTasks.indexOf(taskId)
        if (taskIndex !== -1) {
          sessionState.pendingTasks.splice(taskIndex, 1)
        }

        if (!sessionState.completedTasks.includes(taskId)) {
          sessionState.completedTasks.push(taskId)
        }
      } else {
        // Move from completed to pending
        const taskIndex = sessionState.completedTasks.indexOf(taskId)
        if (taskIndex !== -1) {
          sessionState.completedTasks.splice(taskIndex, 1)
        }

        if (!sessionState.pendingTasks.includes(taskId)) {
          sessionState.pendingTasks.push(taskId)
        }
      }

      sessionState.updatedAt = new Date()
      this.sessionStates.set(sessionId, sessionState)

      logInfo(`📝 Task ${taskId} marked as ${status} in session ${sessionId}`)

      return true

    } catch (error) {
      logError(`Error updating task status: ${error}`)
      return false
    }
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

    logInfo(`✅ Session Manager initialized with ${templates.length} default templates`)
  }

  /**
   * Start periodic session cleanup
   */
  private startSessionCleanup(): void {
    this.sessionCleanupInterval = setInterval(() => {
      this.cleanupInactiveSessions()
    }, 300000) // Run every 5 minutes
  }

  /**
   * Clean up inactive or expired sessions
   */
  private cleanupInactiveSessions(): void {
    const now = Date.now()
    const sessionsToArchive: string[] = []

    for (const [sessionId, sessionState] of Array.from(this.sessionStates.entries())) {
      const timeSinceActivity = now - sessionState.lastActivity.getTime()
      const maxDuration = sessionState.configuration.maxDuration

      // Check if session has expired or been inactive too long
      if (
        (maxDuration && timeSinceActivity > maxDuration) ||
        (sessionState.status === 'completed' && timeSinceActivity > sessionState.configuration.autoArchiveAfter)
      ) {
        sessionsToArchive.push(sessionId)
      }
    }

    // Archive expired sessions
    sessionsToArchive.forEach(sessionId => {
      this.archiveSession(sessionId).catch((err) => {
        logError('Failed to archive expired session', { sessionId }, err as unknown as Error)
      })
    })

    if (sessionsToArchive.length > 0) {
      logInfo(`🧹 Cleaned up ${sessionsToArchive.length} inactive sessions`)
    }
  }

  /**
   * Get session templates
   */
  getSessionTemplates(): SessionTemplate[] {
    return Array.from(this.sessionTemplates.values())
  }

  /**
   * Add or update session template
   */
  addSessionTemplate(template: SessionTemplate): void {
    this.sessionTemplates.set(template.id, template)
  }

  /**
   * Remove session template
   */
  removeSessionTemplate(templateId: string): boolean {
    return this.sessionTemplates.delete(templateId)
  }

  /**
   * Cleanup when manager is destroyed
   */
  destroy(): void {
    if (this.sessionCleanupInterval) {
      clearInterval(this.sessionCleanupInterval)
      this.sessionCleanupInterval = null
    }
  }
}