import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { db } from '@/db'
import { chatConversations, chatMessages } from '@/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Helper function to get agent display name
function getAgentName(agentId: string): string {
  const agentNames: Record<string, string> = {
    'blaze': 'Blaze',
    'echo': 'Echo',
    'roxy': 'Roxy',
    'nova': 'Nova',
    'lexi': 'Lexi',
    'collaborative': 'Collaborative AI',
    'default': 'AI Assistant'
  }

  return agentNames[agentId] || agentNames['default']
}

// Validation schema for conversation data
const ConversationSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  agentId: z.string().optional(),
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    timestamp: z.string().datetime().optional()
  })).optional()
})

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, { requests: 100, window: 60 })
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Authentication
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get real conversations from database
    const conversations = await db
      .select({
        id: chatConversations.id,
        title: chatConversations.title,
        agentId: chatConversations.agent_id,
        agentName: chatConversations.agent_name,
        lastMessage: chatConversations.last_message,
        lastMessageTime: chatConversations.last_message_at,
        messageCount: chatConversations.message_count,
        isArchived: chatConversations.is_archived,
        created_at: chatConversations.created_at,
        updated_at: chatConversations.updated_at,
      })
      .from(chatConversations)
      .where(
        and(
          eq(chatConversations.user_id, user.id),
          eq(chatConversations.is_archived, false)
        )
      )
      .orderBy(desc(chatConversations.last_message_at))
      .limit(50)

    return NextResponse.json({
      success: true,
      conversations
    })

  } catch (error) {
    logError('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, { requests: 50, window: 60 })
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Authentication
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const conversationData = ConversationSchema.parse(body)

    // Create new conversation in database
    const conversationId = uuidv4()
    const agentName = getAgentName(conversationData.agentId || 'roxy')

    const [newConversation] = await db
      .insert(chatConversations)
      .values({
        id: conversationId,
        user_id: user.id,
        title: conversationData.title || 'New Conversation',
        agent_id: conversationData.agentId || 'roxy',
        agent_name: agentName,
        last_message: 'Hello! How can I help you today?',
        last_message_at: new Date(),
        message_count: 1,
        is_archived: false,
        metadata: {},
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning()

    // Add initial welcome message
    const messageId = uuidv4()
    await db
      .insert(chatMessages)
      .values({
        id: messageId,
        conversation_id: conversationId,
        user_id: user.id,
        role: 'assistant',
        content: 'Hello! How can I help you today?',
        metadata: {},
        created_at: new Date(),
      })

    return NextResponse.json({
      success: true,
      conversation: newConversation
    }, { status: 201 })

  } catch (error) {
    logError('Error creating conversation:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid conversation data', details: (error as any).errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, { requests: 50, window: 60 })
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Authentication
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    const validatedData = ConversationSchema.partial().parse(updateData)

    // Update conversation in database
    const [updatedConversation] = await db
      .update(chatConversations)
      .set({
        ...validatedData,
        updated_at: new Date(),
      })
      .where(
        and(
          eq(chatConversations.id, id),
          eq(chatConversations.user_id, user.id)
        )
      )
      .returning()

    return NextResponse.json({
      success: true,
      conversation: updatedConversation
    })

  } catch (error) {
    logError('Error updating conversation:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid conversation data', details: (error as any).errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, { requests: 50, window: 60 })
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Authentication
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get conversation ID from query params
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('id')

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    // Delete conversation from database (soft delete by archiving)
    await db
      .update(chatConversations)
      .set({
        is_archived: true,
        updated_at: new Date(),
      })
      .where(
        and(
          eq(chatConversations.id, conversationId),
          eq(chatConversations.user_id, user.id)
        )
      )

    return NextResponse.json({
      success: true,
      message: 'Conversation deleted successfully'
    })

  } catch (error) {
    logError('Error deleting conversation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}