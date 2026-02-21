import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { AuraService } from '@/lib/services/aura-service'
import { z } from 'zod'
import { logError } from '@/lib/logger'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const auraRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().uuid().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const result = auraRequestSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const { message, conversationId } = result.data
    const auraService = new AuraService(session.user.id)

    const response = await auraService.processAuraRequest(message, conversationId)

    return NextResponse.json({
      success: true,
      ...response
    })

  } catch (error) {
    logError('POST /api/ai/aura failed', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const auraService = new AuraService(session.user.id)
    const sessions = await auraService.listAuraSessions()

    return NextResponse.json({
      success: true,
      sessions
    })

  } catch (error) {
    logError('GET /api/ai/aura failed', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
