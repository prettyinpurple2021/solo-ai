import { NextResponse } from 'next/server'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

export const runtime = 'nodejs'

export async function GET() {
  try {
    // Test AI integration with a simple prompt
    const result = await streamText({
      model: openai('gpt-4o'),
      messages: [
        {
          role: 'system',
          content: 'You are Roxy, the Strategic Decision Architect from SoloBoss AI. Respond with a brief introduction of yourself and the SPADE framework.'
        },
        {
          role: 'user',
          content: 'Hi Roxy, introduce yourself!'
        }
      ],
      temperature: 0.7,
      maxTokens: 200
    })

    const response = await result.text
    
    return NextResponse.json({
      status: 'success',
      agent: 'Roxy',
      response: response,
      message: 'AI integration test successful!'
    })
  } catch (error) {
    console.error('AI test error:', error)
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'AI integration test failed'
      },
      { status: 500 }
    )
  }
}
