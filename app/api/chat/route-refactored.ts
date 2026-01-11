import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { NextRequest, NextResponse} from 'next/server'
import { authenticateRequest} from '@/lib/auth-server'
import { getDb } from '@/lib/database-client'
import { db } from '@/db'
import { users, chatConversations, chatMessages } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { rateLimitByIp} from '@/lib/rate-limit'
import { CompetitiveIntelligenceContextService} from '@/lib/competitive-intelligence-context'
import { z} from 'zod'


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

    // Get competitive intelligence context
    const competitiveContext = await CompetitiveIntelligenceContextService.getCompetitiveContext(user.id, agentId)
    
    // Get agent-specific prompts with competitive intelligence integration
    const agentPrompts = CompetitiveIntelligenceContextService.getAgentCompetitivePrompts()
    const _agentId_typed = agentId as keyof typeof agentPrompts
    
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

    // Ensure user exists in database (using Drizzle `db`)
    const existing = await db.select().from(users).where(eq(users.id, user.id))
    if (existing.length === 0) {
      // Only insert fields that exist on the users table schema to satisfy Drizzle types
      await db.insert(users).values({
        id: user.id,
        email: user.email,
        password: '',
        full_name: user.full_name,
        image: user.avatar_url,
        subscription_tier: 'free',
        created_at: new Date(),
        updated_at: new Date()
      })
    }

    // Save conversation to database (chat tables)
    const conversationId = uuidv4()
    await db.insert(chatConversations).values({
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
    })

    // Insert the initial user message
    await db.insert(chatMessages).values({
      id: uuidv4(),
      conversation_id: conversationId,
      user_id: user.id,
      role: 'user',
      content: message,
      metadata: {},
      created_at: new Date()
    })

    // Call OpenAI Worker via service binding
    const systemPrompt = `${agentPersonality} You are helping a SoloSuccess AI user. Be helpful, professional, and use frameworks when appropriate.${competitiveContextString}`
    
    // Get the service binding from the environment
    const env = process.env as unknown as Env
    const openaiWorker = env.OPENAI_WORKER

    if (!openaiWorker) {
      logError('OpenAI Worker service binding not found')
      return NextResponse.json({ error: 'AI service temporarily unavailable' }, { status: 503 })
    }

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

    if (!workerResponse.ok) {
      const errorText = await workerResponse.text()
      logError('OpenAI Worker error:', { error: errorText })
      return NextResponse.json({ error: 'AI processing failed' }, { status: 500 })
    }

    // The worker returns a streaming response, pass it through
    return new Response(workerResponse.body, {
      headers: workerResponse.headers
    })

  } catch (error) {
    logError('Error in chat:', error instanceof Error ? error : { message: String(error) })
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}