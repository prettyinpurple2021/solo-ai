/**
 * Individual Collaboration Session API
 * Handles operations on specific collaboration sessions
 */

import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { CollaborationHub } from '@/lib/collaboration-hub'
import { MessageRouter } from '@/lib/message-router'
import { SessionManager } from '@/lib/session-manager'
import { ContextManager } from '@/lib/context-manager'
import { verifyAuth } from '@/lib/auth-server'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'


// Initialize collaboration system components (singleton pattern)
const collaborationHub = new CollaborationHub()
const messageRouter = new MessageRouter(collaborationHub)
const contextManager = new ContextManager()
const sessionManager = new SessionManager(collaborationHub, messageRouter)

// Update session schema
const UpdateSessionSchema = z.object({
  status: z.enum(['active', 'paused', 'completed']).optional(),
  configuration: z.object({
    maxDuration: z.number().optional(),
    autoArchiveAfter: z.number().optional(),
    allowDynamicAgentJoining: z.boolean().optional(),
    maxParticipants: z.number().optional(),
    requiresHumanApproval: z.boolean().optional()
  }).optional(),
  completionSummary: z.string().optional()
})


/**
 * GET /api/collaboration/sessions/[id]
 * Get details of a specific collaboration session
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const { user, error: authError } = await verifyAuth()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const sessionId = resolvedParams.id

    // Get session from collaboration hub
    const session = await sessionManager.getSession(sessionId)
    if (!session) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Collaboration session not found' },
        { status: 404 }
      )
    }

    // Verify user owns this session
    if (session.userId !== parseInt(user.id.toString())) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Access denied to this session' },
        { status: 403 }
      )
    }

    // Get session state and context
    const sessionState = await sessionManager.getSessionState(sessionId)
    const conversationContext = await contextManager.getConversationContext(sessionId)

    // Get agent details
    const agentDetails = session.participatingAgents.map(agentId => {
      const agent = collaborationHub.getAgent(agentId)
      return agent ? {
        id: agent.id,
        name: agent.name,
        displayName: agent.displayName,
        description: agent.description,
        capabilities: agent.capabilities,
        specializations: agent.specializations,
        personality: agent.personality,
        accentColor: agent.accentColor,
        status: agent.status,
        responseTimeMs: agent.responseTimeMs
      } : null
    }).filter(Boolean)

    // Get recent messages (last 50)
    const recentMessages = conversationContext?.conversationHistory.slice(-50) || []

    return NextResponse.json({
      success: true,
      data: {
        id: session.id,
        projectName: session.projectName,
        status: sessionState?.status || 'unknown',
        participatingAgents: session.participatingAgents,
        agentDetails,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        completedAt: session.completedAt,
        sessionType: session.sessionType,
        lastActivity: sessionState?.lastActivity,
        messageCount: sessionState?.messageCount || 0,
        completedTasks: sessionState?.completedTasks || [],
        pendingTasks: sessionState?.pendingTasks || [],
        configuration: sessionState?.configuration,
        sessionMetrics: sessionState?.sessionMetrics,
        recentMessages,
        currentGoals: conversationContext?.activeGoals || [],
        sharedKnowledge: conversationContext?.sharedKnowledge || {},
        metadata: session.metadata
      },
      message: 'Session details retrieved successfully'
    })

  } catch (error) {
    logError('Error retrieving collaboration session:', error)

    return NextResponse.json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve collaboration session'
    }, { status: 500 })
  }
}

/**
 * PATCH /api/collaboration/sessions/[id]
 * Update a collaboration session
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const { user, error: authError } = await verifyAuth()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const sessionId = resolvedParams.id

    // Get session from collaboration hub
    const session = await sessionManager.getSession(sessionId)
    if (!session) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Collaboration session not found' },
        { status: 404 }
      )
    }

    // Verify user owns this session
    if (session.userId !== parseInt(user.id.toString())) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Access denied to this session' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = UpdateSessionSchema.parse(body)

    // Handle status changes
    let updateResult = true
    let message = 'Session updated successfully'

    if (validatedData.status) {
      const currentState = await sessionManager.getSessionState(sessionId)
      const currentStatus = currentState?.status

      switch (validatedData.status) {
        case 'paused':
          if (currentStatus === 'active') {
            updateResult = await sessionManager.pauseSession(sessionId, 'Paused by user')
            message = 'Session paused successfully'
          }
          break

        case 'active':
          if (currentStatus === 'paused') {
            updateResult = await sessionManager.resumeSession(sessionId)
            message = 'Session resumed successfully'
          }
          break

        case 'completed':
          if (['active', 'paused'].includes(currentStatus || '')) {
            updateResult = await sessionManager.completeSession(
              sessionId,
              validatedData.completionSummary
            )
            message = 'Session completed successfully'
          }
          break
      }
    }

    if (!updateResult) {
      return NextResponse.json({
        error: 'Update Failed',
        message: 'Failed to update session status'
      }, { status: 400 })
    }

    // Get updated session state
    const updatedSessionState = await sessionManager.getSessionState(sessionId)

    return NextResponse.json({
      success: true,
      data: {
        id: session.id,
        status: updatedSessionState?.status || session.sessionStatus,
        updatedAt: new Date().toISOString(),
        configuration: updatedSessionState?.configuration,
        sessionMetrics: updatedSessionState?.sessionMetrics
      },
      message
    })

  } catch (error) {
    logError('Error updating collaboration session:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation Error',
        message: 'Invalid request data',
        details: (error as any).errors
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Internal Server Error',
      message: 'Failed to update collaboration session'
    }, { status: 500 })
  }
}

/**
 * DELETE /api/collaboration/sessions/[id]
 * Archive a collaboration session
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const { user, error: authError } = await verifyAuth()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const sessionId = resolvedParams.id

    // Get session from collaboration hub
    const session = await sessionManager.getSession(sessionId)
    if (!session) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Collaboration session not found' },
        { status: 404 }
      )
    }

    // Verify user owns this session
    if (session.userId !== parseInt(user.id.toString())) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Access denied to this session' },
        { status: 403 }
      )
    }

    // Archive the session
    const archiveResult = await sessionManager.archiveSession(sessionId)

    if (!archiveResult) {
      return NextResponse.json({
        error: 'Archive Failed',
        message: 'Failed to archive session'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Session archived successfully'
    })

  } catch (error) {
    logError('Error archiving collaboration session:', error)

    return NextResponse.json({
      error: 'Internal Server Error',
      message: 'Failed to archive collaboration session'
    }, { status: 500 })
  }
}