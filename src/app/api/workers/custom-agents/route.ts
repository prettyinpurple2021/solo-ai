import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getQStashReceiver } from '@/lib/upstash/clients'
import { processAgentJob } from '@/lib/custom-ai-agents/worker'
import { logApi, logError } from '@/lib/logger'

export const runtime = 'nodejs'

const payloadSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
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

    const job = await processAgentJob(parsed.data.jobId)

    logApi('POST', '/api/workers/custom-agents', 200, Date.now() - start, {
      jobId: job.id,
      status: job.status,
    })

    return NextResponse.json({ success: true, jobId: job.id, status: job.status })
  } catch (error) {
    logError('Custom agent worker failed', error)
    return NextResponse.json({ error: 'Worker execution failed' }, { status: 500 })
  }
}

