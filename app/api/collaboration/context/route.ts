/**
 * Collaboration Context API
 * Handles storing, retrieving, and searching context across collaboration sessions
 */

import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ContextManager } from '@/lib/context-manager'
import { SessionManager } from '@/lib/session-manager'
import { CollaborationHub } from '@/lib/collaboration-hub'
import { MessageRouter } from '@/lib/message-router'
import { verifyAuth } from '@/lib/auth-server'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'


// Initialize collaboration system components
const collaborationHub = new CollaborationHub()
const messageRouter = new MessageRouter(collaborationHub)
const contextManager = new ContextManager()
const sessionManager = new SessionManager(collaborationHub, messageRouter)

// Store context schema
const StoreContextSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  agentId: z.string().min(1, 'Agent ID is required'),
  contextType: z.enum(['conversation', 'task', 'knowledge', 'preference', 'state']),
  key: z.string().min(1, 'Context key is required'),
  value: z.any(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  tags: z.array(z.string()).default([]),
  expiresAt: z.string().datetime().optional(),
  metadata: z.record(z.string(), z.any()).optional()
})

// Context query schema
const ContextQuerySchema = z.object({
  sessionId: z.string().uuid().optional(),
  agentId: z.string().optional(),
  contextType: z.array(z.enum(['conversation', 'task', 'knowledge', 'preference', 'state'])).optional(),
  keys: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  priority: z.array(z.enum(['low', 'medium', 'high', 'critical'])).optional(),
  timeRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }).optional(),
  limit: z.number().min(1).max(1000).default(100)
})


/**
 * POST /api/collaboration/context
 * Store context information
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
    const validatedData = StoreContextSchema.parse(body)

    // Verify user has access to the session
    const session = sessionManager.getSession(validatedData.sessionId)
    if (!session) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Session not found' },
        { status: 404 }
      )
    }

    if (session.userId !== parseInt(user.id.toString())) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Access denied to this session' },
        { status: 403 }
      )
    }

    // Store context
    const contextId = await contextManager.storeContext({
      sessionId: validatedData.sessionId,
      agentId: validatedData.agentId,
      contextType: validatedData.contextType,
      key: validatedData.key,
      value: validatedData.value,
      priority: validatedData.priority,
      tags: validatedData.tags,
      expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined,
      metadata: validatedData.metadata
    })

    return NextResponse.json({
      success: true,
      data: {
        contextId,
        sessionId: validatedData.sessionId,
        agentId: validatedData.agentId,
        contextType: validatedData.contextType,
        key: validatedData.key,
        priority: validatedData.priority,
        tags: validatedData.tags,
        storedAt: new Date().toISOString()
      },
      message: 'Context stored successfully'
    }, { status: 201 })

  } catch (error) {
    logError('Error storing context:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation Error',
        message: 'Invalid context data',
        details: (error as any).errors
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Internal Server Error',
      message: 'Failed to store context'
    }, { status: 500 })
  }
}

/**
 * GET /api/collaboration/context
 * Retrieve context information with filtering
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)

    const queryData = {
      sessionId: searchParams.get('sessionId') || undefined,
      agentId: searchParams.get('agentId') || undefined,
      contextType: searchParams.get('contextType')?.split(',') as any || undefined,
      keys: searchParams.get('keys')?.split(',') || undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
      priority: searchParams.get('priority')?.split(',') as any || undefined,
      timeRange: searchParams.get('startTime') && searchParams.get('endTime') ? {
        start: searchParams.get('startTime')!,
        end: searchParams.get('endTime')!
      } : undefined,
      limit: parseInt(searchParams.get('limit') || '100')
    }

    // Validate query parameters
    const validatedQuery = ContextQuerySchema.parse(queryData)

    // If sessionId is provided, verify user has access
    if (validatedQuery.sessionId) {
      const session = sessionManager.getSession(validatedQuery.sessionId)
      if (!session) {
        return NextResponse.json(
          { error: 'Not Found', message: 'Session not found' },
          { status: 404 }
        )
      }

      if (session.userId !== parseInt(user.id.toString())) {
        return NextResponse.json(
          { error: 'Forbidden', message: 'Access denied to this session' },
          { status: 403 }
        )
      }
    }

    // Build context query
    const contextQuery: any = {
      sessionId: validatedQuery.sessionId,
      agentId: validatedQuery.agentId,
      contextType: validatedQuery.contextType,
      keys: validatedQuery.keys,
      tags: validatedQuery.tags,
      priority: validatedQuery.priority,
      limit: validatedQuery.limit
    }

    if (validatedQuery.timeRange) {
      contextQuery.timeRange = {
        start: new Date(validatedQuery.timeRange.start),
        end: new Date(validatedQuery.timeRange.end)
      }
    }

    // Retrieve context
    const contextEntries = await contextManager.getContext(contextQuery)

    // Transform context entries for API response
    const transformedEntries = contextEntries.map(entry => ({
      id: entry.id,
      sessionId: entry.sessionId,
      agentId: entry.agentId,
      contextType: entry.contextType,
      key: entry.key,
      value: entry.value,
      priority: entry.priority,
      tags: entry.tags,
      timestamp: entry.timestamp,
      expiresAt: entry.expiresAt,
      metadata: entry.metadata
    }))

    return NextResponse.json({
      success: true,
      data: {
        entries: transformedEntries,
        total: transformedEntries.length,
        query: {
          sessionId: validatedQuery.sessionId,
          agentId: validatedQuery.agentId,
          contextType: validatedQuery.contextType,
          limit: validatedQuery.limit
        }
      },
      message: 'Context retrieved successfully'
    })

  } catch (error) {
    logError('Error retrieving context:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation Error',
        message: 'Invalid query parameters',
        details: (error as any).errors
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve context'
    }, { status: 500 })
  }
}