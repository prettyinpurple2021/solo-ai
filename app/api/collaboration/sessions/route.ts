/**
 * Collaboration Sessions API
 * Handles creating, listing, and managing multi-agent collaboration sessions
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


// Initialize collaboration system components
const collaborationHub = new CollaborationHub()
const messageRouter = new MessageRouter(collaborationHub)
const contextManager = new ContextManager()
const sessionManager = new SessionManager(collaborationHub, messageRouter)

// Request/Response schemas
const CreateSessionSchema = z.object({
  goal: z.string().min(1, 'Goal is required'),
  requiredAgents: z.array(z.string()).optional(),
  templateId: z.string().optional(),
  configuration: z.object({
    maxDuration: z.number().optional(),
    autoArchiveAfter: z.number().optional(),
    allowDynamicAgentJoining: z.boolean().optional(),
    maxParticipants: z.number().optional(),
    requiresHumanApproval: z.boolean().optional()
  }).optional(),
  initialContext: z.record(z.string(), z.any()).optional()
})

const SessionResponseSchema = z.object({
  id: z.string(),
  goal: z.string(),
  status: z.string(),
  participatingAgents: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
  configuration: z.object({
    maxDuration: z.number().optional(),
    autoArchiveAfter: z.number(),
    allowDynamicAgentJoining: z.boolean(),
    maxParticipants: z.number(),
    requiresHumanApproval: z.boolean()
  })
})


/**
 * POST /api/collaboration/sessions
 * Create a new collaboration session
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { user, error: authError } = await verifyAuth()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = CreateSessionSchema.parse(body)

    // Create collaboration session
    const session = await sessionManager.createSession({
      userId: user.id.toString(),
      goal: validatedData.goal,
      requiredAgents: validatedData.requiredAgents,
      templateId: validatedData.templateId,
      configuration: validatedData.configuration,
      initialContext: validatedData.initialContext
    })

    // Get session state for additional details
    const sessionState = await sessionManager.getSessionState(session.id)

    return NextResponse.json({
      success: true,
      data: {
        id: session.id,
        goal: validatedData.goal,
        status: sessionState?.status || 'active',
        participatingAgents: session.participatingAgents,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        configuration: sessionState?.configuration || {
          autoArchiveAfter: 86400000,
          allowDynamicAgentJoining: true,
          maxParticipants: 10,
          requiresHumanApproval: false
        },
        sessionType: session.sessionType,
        projectName: session.projectName,
        metadata: session.metadata
      },
      message: 'Collaboration session created successfully'
    }, { status: 201 })

  } catch (error) {
    logError('Error creating collaboration session:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation Error',
        message: 'Invalid request data',
        details: (error as any).errors
      }, { status: 400 })
    }

    if (error instanceof Error) {
      return NextResponse.json({
        error: 'Creation Failed',
        message: error.message
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Internal Server Error',
      message: 'Failed to create collaboration session'
    }, { status: 500 })
  }
}

/**
 * GET /api/collaboration/sessions
 * List user's collaboration sessions
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const { user, error: authError } = await verifyAuth()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get user's sessions
    const userSessions = await sessionManager.getUserSessions(user.id.toString())

    // Filter by status if provided
    let filteredSessions = userSessions
    if (status) {
      filteredSessions = await Promise.all(userSessions.map(async session => {
        const sessionState = await sessionManager.getSessionState(session.id)
        return sessionState?.status === status ? session : null
      })).then(results => results.filter((s): s is typeof userSessions[0] => s !== null))
    }

    // Apply pagination
    const paginatedSessions = filteredSessions.slice(offset, offset + limit)

    // Enhance sessions with state information
    const enhancedSessions = await Promise.all(paginatedSessions.map(async session => {
      const sessionState = await sessionManager.getSessionState(session.id)
      const agents = session.participatingAgents.map(agentId =>
        collaborationHub.getAgent(agentId)
      ).filter(Boolean)

      return {
        id: session.id,
        projectName: session.projectName,
        status: sessionState?.status || 'unknown',
        participatingAgents: session.participatingAgents,
        agentDetails: agents,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        completedAt: session.completedAt,
        sessionType: session.sessionType,
        lastActivity: sessionState?.lastActivity,
        messageCount: sessionState?.messageCount || 0,
        completedTasks: sessionState?.completedTasks?.length || 0,
        pendingTasks: sessionState?.pendingTasks?.length || 0,
        configuration: sessionState?.configuration
      }
    }))

    return NextResponse.json({
      success: true,
      data: {
        sessions: enhancedSessions,
        pagination: {
          total: filteredSessions.length,
          limit,
          offset,
          hasMore: offset + limit < filteredSessions.length
        }
      },
      message: 'Sessions retrieved successfully'
    })

  } catch (error) {
    logError('Error retrieving collaboration sessions:', error)

    return NextResponse.json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve collaboration sessions'
    }, { status: 500 })
  }
}