/**
 * Collaboration Session Control API
 * Handles session lifecycle operations: join, leave, pause, resume, transfer
 */

import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { CollaborationHub } from '@/lib/collaboration-hub'
import { MessageRouter } from '@/lib/message-router'
import { SessionManager } from '@/lib/session-manager'
import { verifyAuth } from '@/lib/auth-server'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'


// Initialize collaboration system components
const collaborationHub = new CollaborationHub()
const messageRouter = new MessageRouter(collaborationHub)
const sessionManager = new SessionManager(collaborationHub, messageRouter)

// Session control action schemas
const JoinSessionSchema = z.object({
  action: z.literal('join'),
  agentId: z.string().min(1, 'Agent ID is required'),
  capabilities: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional()
})

const LeaveSessionSchema = z.object({
  action: z.literal('leave'),
  agentId: z.string().min(1, 'Agent ID is required'),
  reason: z.string().optional(),
  transferTo: z.string().optional() // Transfer responsibilities to another agent
})

const PauseSessionSchema = z.object({
  action: z.literal('pause'),
  reason: z.string().optional(),
  duration: z.number().min(1).optional() // Auto-resume after duration (minutes)
})

const ResumeSessionSchema = z.object({
  action: z.literal('resume'),
  reason: z.string().optional()
})

const TransferSessionSchema = z.object({
  action: z.literal('transfer'),
  newOwnerId: z.number().int().positive('Invalid user ID'),
  reason: z.string().optional(),
  preserveContext: z.boolean().default(true)
})

const SessionControlSchema = z.discriminatedUnion('action', [
  JoinSessionSchema,
  LeaveSessionSchema,
  PauseSessionSchema,
  ResumeSessionSchema,
  TransferSessionSchema
])


/**
 * POST /api/collaboration/sessions/[id]/control
 * Perform session control operations
 */
export async function POST(
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

    // Validate session ID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId)) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid session ID format' },
        { status: 400 }
      )
    }

    // Get session
    const session = await sessionManager.getSession(sessionId)
    if (!session) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Session not found' },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedAction = SessionControlSchema.parse(body)

    const userId = parseInt(user.id.toString())

    // Handle different control actions
    switch (validatedAction.action) {
      case 'join':
        // Join session with agent
        const joinResult = await sessionManager.joinSession(sessionId, validatedAction.agentId)

        if (!joinResult) {
          return NextResponse.json({
            error: 'Bad Request',
            message: 'Failed to join session'
          }, { status: 400 })
        }

        // Get updated session to return participant info
        const updatedSession = await sessionManager.getSession(sessionId)

        return NextResponse.json({
          success: true,
          data: {
            sessionId,
            agentId: validatedAction.agentId,
            joinedAt: new Date().toISOString(),
            participants: updatedSession?.participatingAgents || []
          },
          message: 'Successfully joined session'
        })

      case 'leave':
        // Leave session
        const leaveResult = await sessionManager.leaveSession(
          sessionId,
          validatedAction.agentId,
          validatedAction.reason
        )

        if (!leaveResult) {
          return NextResponse.json({
            error: 'Bad Request',
            message: 'Failed to leave session'
          }, { status: 400 })
        }

        // Get updated session to return participant info
        const updatedSessionAfterLeave = await sessionManager.getSession(sessionId)

        return NextResponse.json({
          success: true,
          data: {
            sessionId,
            agentId: validatedAction.agentId,
            leftAt: new Date().toISOString(),
            reason: validatedAction.reason,
            transferredTo: validatedAction.transferTo,
            participants: updatedSessionAfterLeave?.participatingAgents || []
          },
          message: 'Successfully left session'
        })

      case 'pause':
        // Verify user owns session or has admin rights
        if (session.userId !== userId) {
          return NextResponse.json(
            { error: 'Forbidden', message: 'Only session owner can pause session' },
            { status: 403 }
          )
        }

        const pauseResult = await sessionManager.pauseSession(sessionId, validatedAction.reason)

        if (!pauseResult) {
          return NextResponse.json({
            error: 'Bad Request',
            message: 'Failed to pause session'
          }, { status: 400 })
        }

        return NextResponse.json({
          success: true,
          data: {
            sessionId,
            status: 'paused',
            pausedAt: new Date().toISOString(),
            reason: validatedAction.reason,
            autoResumeAt: validatedAction.duration ?
              new Date(Date.now() + validatedAction.duration * 60000).toISOString() : undefined
          },
          message: 'Session paused successfully'
        })

      case 'resume':
        // Verify user owns session or has admin rights
        if (session.userId !== userId) {
          return NextResponse.json(
            { error: 'Forbidden', message: 'Only session owner can resume session' },
            { status: 403 }
          )
        }

        const resumeResult = await sessionManager.resumeSession(sessionId)

        if (!resumeResult) {
          return NextResponse.json({
            error: 'Bad Request',
            message: 'Failed to resume session'
          }, { status: 400 })
        }

        return NextResponse.json({
          success: true,
          data: {
            sessionId,
            status: 'active',
            resumedAt: new Date().toISOString(),
            reason: validatedAction.reason
          },
          message: 'Session resumed successfully'
        })

      case 'transfer':
        // Verify user owns session
        if (session.userId !== userId) {
          return NextResponse.json(
            { error: 'Forbidden', message: 'Only session owner can transfer session' },
            { status: 403 }
          )
        }

        // Mock transfer implementation - in a real app, this would update the session ownership
        // For now, we'll just return success without actually transferring
        return NextResponse.json({
          success: false,
          data: null,
          message: 'Session transfer functionality not yet implemented'
        }, { status: 501 }) // Not Implemented

      default:
        return NextResponse.json({
          error: 'Bad Request',
          message: 'Invalid action'
        }, { status: 400 })
    }

  } catch (error) {
    logError('Error performing session control action:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation Error',
        message: 'Invalid control action data',
        details: (error as any).errors
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Internal Server Error',
      message: 'Failed to perform session control action'
    }, { status: 500 })
  }
}

/**
 * GET /api/collaboration/sessions/[id]/control
 * Get session control status and available actions
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
    const userId = parseInt(user.id.toString())

    // Validate session ID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId)) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid session ID format' },
        { status: 400 }
      )
    }

    // Get session
    const session = await sessionManager.getSession(sessionId)
    if (!session) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Session not found' },
        { status: 404 }
      )
    }

    // Check if user has access to session
    // For now, we'll allow access if user owns the session or is a participating agent
    if (session.userId !== userId && !session.participatingAgents.includes(userId.toString())) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Access denied to this session' },
        { status: 403 }
      )
    }

    // Determine available actions based on user role and session state
    const isOwner = session.userId === userId
    const isParticipant = session.participatingAgents.includes(userId.toString())
    const availableActions: string[] = []

    // Join action (if not already participant)
    if (!isParticipant) {
      availableActions.push('join')
    }

    // Leave action (if currently participant)
    if (isParticipant) {
      availableActions.push('leave')
    }

    // Owner-only actions
    if (isOwner) {
      if (session.sessionStatus === 'active') {
        availableActions.push('pause')
      } else if (session.sessionStatus === 'paused') {
        availableActions.push('resume')
      }

      if (session.sessionStatus !== 'cancelled') {
        availableActions.push('transfer')
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        currentStatus: session.sessionStatus,
        isOwner,
        isParticipant,
        availableActions,
        participants: session.participatingAgents.map(agentId => ({
          agentId,
          // Note: In a real implementation, you'd fetch full agent details
          status: 'active'
        })),
        controlHistory: [] // Not implemented yet
      },
      message: 'Session control status retrieved successfully'
    })

  } catch (error) {
    logError('Error getting session control status:', error)

    return NextResponse.json({
      error: 'Internal Server Error',
      message: 'Failed to get session control status'
    }, { status: 500 })
  }
}