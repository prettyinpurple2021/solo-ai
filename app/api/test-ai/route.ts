import { logError, logInfo, logWarn } from '@/lib/logger'
import { NextResponse } from 'next/server'
import { AgentCollaborationSystem } from '@/lib/custom-ai-agents/agent-collaboration-system'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const envChecks = {
      nodeEnv: process.env.NODE_ENV,
      hasOpenAiKey: !!process.env.OPENAI_API_KEY,
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasEncryptionKey: !!process.env.ENCRYPTION_KEY,
      appUrlConfigured: !!process.env.NEXT_PUBLIC_APP_URL,
      timestamp: new Date().toISOString(),
    }

    if (!envChecks.hasOpenAiKey && !envChecks.hasAnthropicKey) {
      logWarn('AI test route detected missing provider keys', envChecks)
      return NextResponse.json(
        {
          status: 'error',
          error: 'Missing AI provider credentials',
          message: 'Set OPENAI_API_KEY or ANTHROPIC_API_KEY to run the AI diagnostic.',
          environmentChecks: envChecks,
        },
        { status: 500 },
      )
    }

    const system = new AgentCollaborationSystem('ai-test')
    const response = await system.processRequest(
      `Run a SoloSuccess AI system diagnostic and confirm the AI stack is operational.
Focus on:
- Connectivity to language models
- Expected capabilities that should be online
- Critical next checks the team should perform

Respond conversationally in your own voice.`,
      {
        environment: envChecks,
        testType: 'ai_diagnostic',
      },
      'roxy',
    )

    logInfo('AI diagnostic completed', { confidence: response.primaryResponse.confidence })

    return NextResponse.json({
      status: 'success',
      agent: 'roxy',
      confidence: response.primaryResponse.confidence,
      reasoning: response.primaryResponse.reasoning,
      response: response.primaryResponse.content,
      suggestedActions: response.primaryResponse.suggestedActions,
      environmentChecks: envChecks,
    })
  } catch (error) {
    logError('AI test error:', error)
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'AI service connectivity test failed',
      },
      { status: 500 },
    )
  }
}
