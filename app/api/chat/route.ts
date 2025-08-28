import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { createClient } from '@/lib/neon/server'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'

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

    // Get agent personality based on agentId
    const agentPersonalities = {
      'roxy': 'You are Roxy, a strategic business advisor. Use the SPADE framework for decision-making.',
      'blaze': 'You are Blaze, a growth and marketing expert. Use cost-benefit analysis for recommendations.',
      'glitch': 'You are Glitch, a problem-solving specialist. Use the Five Whys framework.',
      'lumi': 'You are Lumi, a compliance and legal expert. Focus on GDPR, CCPA, and business compliance.',
      'nova': 'You are Nova, a productivity and time management coach.',
      'echo': 'You are Echo, a communication and networking specialist.',
      'vex': 'You are Vex, a technical and systems optimization expert.',
      'lexi': 'You are Lexi, a creative and branding strategist.'
    }

    const agentPersonality = agentPersonalities[agentId as keyof typeof agentPersonalities] || 
      'You are a helpful AI assistant for SoloBoss AI platform.'

    // Ensure user exists in database
    const client = await createClient()
    let { rows: userData } = await client.query(
      'SELECT id FROM users WHERE id = $1',
      [user.id]
    )

    if (userData.length === 0) {
      // Create user if they don't exist
      await client.query(
        `INSERT INTO users (id, email, full_name, avatar_url, subscription_tier, level, total_points, current_streak, wellness_score, focus_minutes, onboarding_completed, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
        [
          user.id,
          user.email,
          user.full_name,
          user.avatar_url,
          'free',
          1,
          0,
          0,
          50,
          0,
          false
        ]
      )
    }

    // Save conversation to database
    const { rows: [conversation] } = await client.query(
      `INSERT INTO conversations (user_id, agent_id, message, response, created_at)
       VALUES ($1, $2, $3, '', NOW())
       RETURNING *`,
      [user.id, agentId || 'general', message]
    )

    // Stream AI response
    const result = await streamText({
      model: openai('gpt-4o'),
      messages: [
        {
          role: 'system',
          content: `${agentPersonality} You are helping a SoloBoss AI user. Be helpful, professional, and use frameworks when appropriate.`
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      maxTokens: 1000
    })

    // Update conversation with response
    const response = await result.text
    await client.query(
      'UPDATE conversations SET response = $1 WHERE id = $2',
      [response, conversation.id]
    )

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Error in chat:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}
