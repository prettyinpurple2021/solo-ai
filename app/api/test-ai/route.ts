import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  try {
    // Simple connectivity test without external API calls
    const envChecks = {
      nodeEnv: process.env.NODE_ENV,
      hasOpenAiKey: !!process.env.OPENAI_API_KEY,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasEncryptionKey: !!process.env.ENCRYPTION_KEY,
      timestamp: new Date().toISOString()
    }

    // Mock Roxy response for testing without actual AI call
    const mockRoxyResponse = `Hey there, boss! 👋 I'm Roxy, your Strategic Decision Architect and punk rock Executive Assistant who gets shit done! 

I'm here to help you crush those big decisions using the SPADE Framework:
🎯 **S**etting - Define the context and scope
👥 **P**eople - Identify stakeholders and decision makers  
🔄 **A**lternatives - Explore all possible options
✅ **D**ecide - Make the call with conviction
📝 **E**xplain - Document and communicate the decision

Ready to level up your decision-making game? Let's do this! 🚀`
    
    return NextResponse.json({
      status: 'success',
      agent: 'Roxy (Mock)',
      response: mockRoxyResponse,
      message: 'AI service connectivity test successful!',
      environmentChecks: envChecks,
      testType: 'mock_response'
    })
  } catch (error) {
    console.error('AI test error:', error)
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'AI service connectivity test failed'
      },
      { status: 500 }
    )
  }
}
