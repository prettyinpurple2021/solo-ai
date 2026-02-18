import { logError, logWarn, logInfo,} from '@/lib/logger'
import { NextRequest, NextResponse} from 'next/server'
import { authenticateRequest} from '@/lib/auth-server'

import { db } from '@/db'
import { users, chatConversations, chatMessages } from '@/shared/db/schema'
import { eq } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { rateLimitByIp} from '@/lib/rate-limit'
import { CompetitiveIntelligenceContextService} from '@/lib/competitive-intelligence-context'
import { z} from 'zod'
import { gateConversation, gateAgentAccess } from '@/lib/feature-gate-middleware'
import { incrementConversationCount, trackAgentAccess } from '@/lib/usage-tracking'
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

// Using Node.js runtime for database and complex operations
export const runtime = 'nodejs'



// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Basic rate limiting per IP for chat
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('chat', ip, 10_000, 10)
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const BodySchema = z.object({
      message: z.string().min(1),
      agentId: z.string().optional(),
    })
    const parsed = BodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    }
    const { message, agentId } = parsed.data

    // Check conversation limit (feature gating)
    const conversationGate = await gateConversation(user.id)
    if (!conversationGate.allowed) {
      return NextResponse.json(
        {
          error: conversationGate.error,
          upgradeRequired: conversationGate.upgradeRequired,
          limit: conversationGate.limit
        },
        { status: 403 }
      )
    }

    // Check agent access if specific agent requested
    if (agentId) {
      const agentGate = await gateAgentAccess(user.id, agentId)
      if (!agentGate.allowed) {
        return NextResponse.json(
          {
            error: agentGate.error,
            upgradeRequired: agentGate.upgradeRequired,
            limit: agentGate.limit
          },
          { status: 403 }
        )
      }
      
      // Track agent access
      await trackAgentAccess(user.id, agentId)
    }

    // Increment conversation count
    await incrementConversationCount(user.id)

    // Get competitive intelligence context
    const competitiveContext = await CompetitiveIntelligenceContextService.getCompetitiveContext(user.id, agentId || 'general')
    
    // Get agent-specific prompts with competitive intelligence integration
    const agentPrompts = CompetitiveIntelligenceContextService.getAgentCompetitivePrompts()
    
    // Get agent personality based on agentId
    const agentPersonalities = {
      'roxy': agentPrompts.roxy?.system_prompt || 'You are Roxy, a strategic business advisor. Use the SPADE framework for decision-making.',
      'blaze': agentPrompts.blaze?.system_prompt || 'You are Blaze, a growth and marketing expert. Use cost-benefit analysis for recommendations.',
      'glitch': agentPrompts.glitch?.system_prompt || 'You are Glitch, a problem-solving specialist. Use the Five Whys framework.',
      'lumi': agentPrompts.lumi?.system_prompt || 'You are Lumi, a compliance and legal expert. Focus on GDPR, CCPA, and business compliance.',
      'nova': agentPrompts.nova?.system_prompt || 'You are Nova, a productivity and time management coach.',
      'echo': agentPrompts.echo?.system_prompt || 'You are Echo, a communication and networking specialist.',
      'vex': agentPrompts.vex?.system_prompt || 'You are Vex, a technical and systems optimization expert.',
      'lexi': agentPrompts.lexi?.system_prompt || 'You are Lexi, a creative and branding strategist.'
    }

    const agentPersonality = agentPersonalities[agentId as keyof typeof agentPersonalities] || 
      'You are a helpful AI assistant for SoloSuccess AI platform.'
    
    // Format competitive intelligence context for the agent
    const competitiveContextString = CompetitiveIntelligenceContextService.formatContextForAgent(
      competitiveContext, 
      agentId || 'general', 
      message
    )

    // Ensure user exists and create conversation/initial message atomically
    const conversationId = uuidv4();
    await db.transaction(async (tx) => {
      // 1. Ensure user exists
      const existing = await tx.select().from(users).where(eq(users.id, user.id));
      if (existing.length === 0) {
        await tx.insert(users).values({
          id: user.id || '',
          email: user.email || '',
          password: '',
          full_name: user.full_name || '',
          image: user.avatar_url || '',
          subscription_tier: 'free',
          onboarding_completed: false,
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      // 2. Save conversation
      await tx.insert(chatConversations).values({
        id: conversationId,
        user_id: user.id,
        title: '',
        agent_id: agentId || 'general',
        agent_name: agentId || 'general',
        last_message: message,
        last_message_at: new Date(),
        message_count: 1,
        created_at: new Date(),
        updated_at: new Date()
      });

      // 3. Insert the initial user message
      await tx.insert(chatMessages).values({
        id: uuidv4(),
        conversation_id: conversationId,
        user_id: user.id,
        role: 'user',
        content: message,
        metadata: {},
        created_at: new Date()
      });
    });

    // Call OpenAI Worker via service binding
    const systemPrompt = `${agentPersonality} You are helping a SoloSuccess AI user. Be helpful, professional, and use frameworks when appropriate.${competitiveContextString}`
    
    // Get the service binding from the environment
    const env = process.env as unknown as Env
    const openaiWorker = env.OPENAI_WORKER

    // If worker binding is available, use it
    if (openaiWorker) {
      try {
        // Create request to OpenAI worker
        const workerRequest = new Request('https://worker/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            agentId,
            systemPrompt,
            user: {
              id: user.id,
              email: user.email
            }
          })
        })

        // Call the worker
        const workerResponse = await openaiWorker.fetch(workerRequest)

        if (workerResponse.ok) {
          // The worker returns a streaming response, pass it through
          return new Response(workerResponse.body, {
            headers: workerResponse.headers
          })
        } else {
          const errorText = await workerResponse.text()
          logWarn(`OpenAI Worker error: ${errorText}, falling back to direct AI SDK`)
        }
      } catch (error) {
        logWarn('OpenAI Worker failed, falling back to direct AI SDK:', error)
      }
    } else {
      logInfo('OpenAI Worker service binding not found, using direct AI SDK fallback')
    }

    // Fallback: Use AI SDK directly
    try {
      const result = await streamText({
        model: openai('gpt-4o-mini'),
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        maxTokens: 1000,
      } as any)

      // Save assistant message to database
      const assistantMessageId = uuidv4()
      let assistantContent = ''
      
      // Create a readable stream that saves the message as it streams
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder()
          
          try {
            for await (const chunk of result.textStream) {
              assistantContent += chunk
              // Stream the chunk directly as text (frontend handles it)
              controller.enqueue(encoder.encode(chunk))
            }
            
            // Save the complete assistant message
            await db.insert(chatMessages).values({
              id: assistantMessageId,
              conversation_id: conversationId,
              user_id: user.id,
              role: 'assistant',
              content: assistantContent,
              metadata: { agentId: agentId || 'general' },
              created_at: new Date()
            })
            
            // Update conversation
            await db.update(chatConversations)
              .set({
                last_message: assistantContent,
                last_message_at: new Date(),
                message_count: 2,
                updated_at: new Date()
              })
              .where(eq(chatConversations.id, conversationId))
            
            controller.close()
          } catch (error) {
            logError('Error streaming AI response:', error)
            controller.error(error)
          }
        }
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } catch (error) {
      logError('AI SDK fallback failed:', error)
      return NextResponse.json({ 
        error: 'AI service temporarily unavailable. Please try again later.' 
      }, { status: 503 })
    }
  } catch (error) {
    const errMessage =
      error instanceof Error
        ? `${error.name}: ${error.message}${error.stack ? '\n' + error.stack : ''}`
        : String(error)
    logError(errMessage)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
