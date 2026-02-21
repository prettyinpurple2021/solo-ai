import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getQStashReceiver } from '@/lib/upstash/clients'
import { runOnboardingWorkflow } from '@/lib/onboarding/workflow'
import { logApi, logError } from '@/lib/logger'

export const runtime = 'nodejs'

const payloadSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  userId: z.string().min(1, 'User ID is required'),
})

export async function POST(request: NextRequest) {
  const start = Date.now()

  try {
    const signature = request.headers.get('Upstash-Signature')
    if (!signature) {
      return NextResponse.json({ error: 'Missing Upstash signature' }, { status: 401 })
    }

    const rawBody = await request.text()
    const receiver = getQStashReceiver()
    const isValid = await receiver.verify({
      body: rawBody,
      signature,
      url: request.url,
    })

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid QStash signature' }, { status: 401 })
    }

    const parsed = payloadSchema.safeParse(JSON.parse(rawBody))
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.flatten() }, { status: 400 })
    }

    const result = await runOnboardingWorkflow(parsed.data.jobId, parsed.data.userId)

    logApi('POST', '/api/workers/onboarding', 200, Date.now() - start, {
      jobId: result.jobId,
      userId: result.userId,
      emailSent: result.emailSent,
    })

    return NextResponse.json({ success: true, result })
  } catch (error) {
    logError('Onboarding worker execution failed', error)
    return NextResponse.json({ error: 'Onboarding workflow failed' }, { status: 500 })
  }
}

