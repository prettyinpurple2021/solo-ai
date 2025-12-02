/**
 * Collaboration Session Messages API
 * Handles sending and retrieving messages within collaboration sessions
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

// Send message schema
const SendMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
  toAgent: z.string().nullable().optional(), // null for broadcast, specific agent ID for direct message
  messageType: z.enum(['request', 'response', 'notification', 'handoff', 'broadcast']).default('request'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  metadata: z.record(z.string(), z.any()).optional(),
  context: z.record(z.string(), z.any()).optional()
})


/**
 * POST /api/collaboration/sessions/[id]/messages
 * Send a message in a collaboration session
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

    // Get session from collaboration hub
    const session = sessionManager.getSession(sessionId)
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

    // Check session status
    const sessionState = sessionManager.getSessionState(sessionId)
    if (sessionState?.status !== 'active') {
      return NextResponse.json({
        error: 'Session Inactive',
        message: `Cannot send messages to ${sessionState?.status || 'inactive'} session`,
        sessionStatus: sessionState?.status
      }, { status: 423 }) // 423 Locked
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = SendMessageSchema.parse(body)

    // Create agent message
    const agentMessage = {
      id: crypto.randomUUID(),
      sessionId,
      fromAgent: 'user', // Messages from users are marked as 'user'
      toAgent: validatedData.toAgent || null,
      messageType: validatedData.messageType,
      content: validatedData.content,
      timestamp: new Date(),
      priority: validatedData.priority,
      context: validatedData.context,
      metadata: {
        ...validatedData.metadata,
        userId: user.id,
        userDisplayName: user.full_name || user.name || user.email
      }
    }

    // Route message through the collaboration system
    const deliveryResult = await messageRouter.routeMessage(agentMessage)

    // Add message to conversation history
    await contextManager.addToConversationHistory(
      sessionId,
      agentMessage.id,
      'user',
      validatedData.content,
      validatedData.priority === 'high' || validatedData.priority === 'urgent' ? 'high' : 'medium'
    )

    // Update session state message count
    const updatedSessionState = sessionManager.getSessionState(sessionId)
    if (updatedSessionState) {
      updatedSessionState.messageCount = (updatedSessionState.messageCount || 0) + 1
      updatedSessionState.lastActivity = new Date()
    }

    return NextResponse.json({
      success: true,
      data: {
        messageId: agentMessage.id,
        sessionId,
        content: validatedData.content,
        messageType: validatedData.messageType,
        priority: validatedData.priority,
        timestamp: agentMessage.timestamp,
        deliveryResult: {
          successful: deliveryResult.successful,
          failed: deliveryResult.failed,
          totalRecipients: deliveryResult.totalRecipients,
          deliveryTime: deliveryResult.deliveryTime
        }
      },
      message: 'Message sent successfully'
    }, { status: 201 })

  } catch (error) {
    logError('Error sending message:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation Error',
        message: 'Invalid message data',
        details: (error as z.ZodError).errors
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Internal Server Error',
      message: 'Failed to send message'
    }, { status: 500 })
  }
}

/**
 * GET /api/collaboration/sessions/[id]/messages
 * Retrieve messages from a collaboration session
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
    const session = sessionManager.getSession(sessionId)
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const priority = searchParams.get('priority')
    const messageType = searchParams.get('messageType')
    const fromAgent = searchParams.get('fromAgent')

    // Get conversation context
    const conversationContext = await contextManager.getConversationContext(sessionId)

    if (!conversationContext) {
      return NextResponse.json({
        success: true,
        data: {
          messages: [],
          pagination: {
            total: 0,
            limit,
            offset,
            hasMore: false
          }
        },
        message: 'No messages found for this session'
      })
    }

    // Filter messages based on query parameters
    let filteredMessages = [...conversationContext.conversationHistory]

    if (priority) {
      filteredMessages = filteredMessages.filter(msg =>
        msg.importance === priority || (priority === 'urgent' && msg.importance === 'high')
      )
    }

    if (fromAgent) {
      filteredMessages = filteredMessages.filter(msg => msg.agentId === fromAgent)
    }

    // Sort messages by timestamp (most recent first)
    filteredMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    // Apply pagination
    const paginatedMessages = filteredMessages.slice(offset, offset + limit)

    // Transform messages for API response
    const messages = paginatedMessages.map(msg => ({
      id: msg.messageId,
      sessionId,
      fromAgent: msg.agentId,
      content: msg.content,
      timestamp: msg.timestamp,
      importance: msg.importance,
      // Add agent details if message is from an agent
      agentDetails: msg.agentId !== 'user' ? (() => {
        const agent = collaborationHub.getAgent(msg.agentId)
        return agent ? {
          id: agent.id,
          name: agent.name,
          displayName: agent.displayName,
          accentColor: agent.accentColor
        } : null
      })() : null
    }))

    // Get session statistics
    const sessionState = sessionManager.getSessionState(sessionId)

    return NextResponse.json({
      success: true,
      data: {
        messages,
        pagination: {
          total: filteredMessages.length,
          limit,
          offset,
          hasMore: offset + limit < filteredMessages.length
        },
        sessionInfo: {
          id: sessionId,
          totalMessages: conversationContext.conversationHistory.length,
          participants: conversationContext.participants,
          lastActivity: sessionState?.lastActivity,
          status: sessionState?.status
        }
      },
      message: 'Messages retrieved successfully'
    })

  } catch (error) {
    logError('Error retrieving messages:', error)

    return NextResponse.json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve messages'
    }, { status: 500 })
  }
}