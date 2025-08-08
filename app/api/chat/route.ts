import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { createClient } from '@/lib/neon/server'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message, agentId } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

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

    // Save conversation to database
    const client = await createClient()
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
