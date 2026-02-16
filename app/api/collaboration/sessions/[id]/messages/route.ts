
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { logError } from '@/lib/logger'
import { db } from '@/lib/db'
import { collaborationMessages,} from '@/shared/db/schema'
import { eq, asc } from 'drizzle-orm'
import { collaborationHub } from '@/lib/collaboration-hub'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Next.js 15 unwraps params
) {
  const { id: sessionId } = await params
  
  try {
     const { user, error: authError } = await verifyAuth()
     if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
     }

     const messages = await db.query.collaborationMessages.findMany({
        where: eq(collaborationMessages.session_id, sessionId),
        orderBy: [asc(collaborationMessages.created_at)],
        with: {
           // We might want to join with users if we store user ID in from_agent_id for users
           // But currently schema has `from_agent_id` as string.
           // If it's a user, we might need a separate lookup or just display the ID/Name stored.
        }
     })

     // Transform for frontend
     const formattedMessages = await Promise.all(messages.map(async (m) => { 
        let senderName = m.from_agent_id
        const isUser = m.from_agent_id === user.id // Assuming current user
        // Or if it matches ANY user ID. 
        // For now, if from_agent_id is not in agent registry, assume user or system.
        
        const agent = collaborationHub.getAgent(m.from_agent_id)
        if (agent) {
             senderName = agent.displayName
        } else if (m.from_agent_id === 'system') {
             senderName = 'System'
        } else if (m.from_agent_id === 'user' || m.from_agent_id === user.id) {
             senderName = 'You' // Or fetch user name if needed
        }

        return {
            id: m.id,
            content: m.content,
            fromAgent: m.from_agent_id, // "user", "system", or agentId
            senderName,
            messageType: m.message_type,
            timestamp: m.created_at,
            metadata: m.metadata
        }
     }))

     return NextResponse.json({
        success: true,
        data: { messages: formattedMessages }
     })

  } catch (error) {
     logError('Error fetching messages:', error)
     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id: sessionId } = await params

    try {
        const { user, error: authError } = await verifyAuth()
        if (authError || !user) {
           return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { content, messageType = 'request', metadata } = body

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 })
        }

        // Use CollaborationHub to route message
        // This validates session, routes to agents, and likely persists it if we update router
        // BUT MessageRouter in current codebase might just be in-memory or log.
        // Wait, SessionManager persists messages?
        // CollaborationHub calls `messageRouter.routeMessage`.
        // I need to ensure `CollaborationHub` or `MessageRouter` persists the message to DB.
        
        // Let's persist MANUALLY here first to ensure it's in DB, then route for side effects.
        // Or better, `routeMessage` should handle it.
        // If I look at `CollaborationHub.routeMessage` (Step 1774), it calls `messageRouter.routeMessage`.
        // I haven't checked `MessageRouter`. 
        // Safer to generic insert here + route.

        const newMessage = {
            sessionId,
            fromAgent: 'user', // representing the user
            toAgent: null, // Broadcast
            messageType: messageType as any,
            content,
            priority: 'medium' as const,
            metadata: { ...metadata, userId: user.id, userName: user.name },
            id: crypto.randomUUID(),
            timestamp: new Date()
        }

        // 1. Persist to DB
        await db.insert(collaborationMessages).values({
            id: newMessage.id,
            session_id: sessionId,
            from_agent_id: 'user', // Use 'user' literal or user.id? Frontend checks for 'user'.
            content: content,
            message_type: messageType,
            metadata: newMessage.metadata
        })

        // 2. Trigger Agents via Hub
        // We fire and forget or await? Await better to catch errors.
        await collaborationHub.routeMessage(newMessage)

        return NextResponse.json({
            success: true,
            data: { 
                message: {
                    ...newMessage,
                    senderName: user.name || 'You',
                    fromAgent: 'user'
                }
            }
        })

    } catch (error) {
       logError('Error sending message:', error)
       return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
