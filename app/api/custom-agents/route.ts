import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { SecurityMiddleware } from '@/lib/custom-ai-agents/security/security-middleware'
import {
  enqueueAgentJob,
  getAgentJobStatus,
  listAgentJobs,
} from '@/lib/custom-ai-agents/job-queue'
import { logApi, logError, logInfo } from '@/lib/logger'
import type { AgentJob, AgentJobStatus } from '@/lib/custom-ai-agents/job-store'

export const runtime = 'nodejs'

const securityMiddleware = new SecurityMiddleware()

const requestSchema = z.object({
  message: z.string().min(1, 'Message is required').max(5000, 'Message is too long'),
  agentId: z.string().min(1).default('roxy'),
  preferredAgent: z.string().min(1).optional(),
  context: z.record(z.string(), z.any()).optional(),
  stream: z.boolean().optional(),
})

const SSE_HEADERS = {
  'content-type': 'text/event-stream',
  'cache-control': 'no-cache, no-transform',
  connection: 'keep-alive',
}

function serializeJob(job: AgentJob) {
  return {
    id: job.id,
    userId: job.userId,
    agentId: job.agentId,
    message: job.message,
    context: job.context,
    preferredAgent: job.preferredAgent,
    status: job.status,
    result: job.result,
    error: job.error,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    attempts: job.attempts,
  }
}

function createSseStream(jobId: string, userId: string) {
  const encoder = new TextEncoder()
  let intervalHandle: ReturnType<typeof setInterval> | null = null
  let cancelled = false

  return new ReadableStream({
    async start(controller) {
      let lastStatus: AgentJobStatus | null = null
      const startedAt = Date.now()

      const pushEvent = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(
            `event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`,
          ),
        )
      }

      pushEvent('status', { status: 'queued', jobId })

      const closeStream = () => {
        if (cancelled) return
        cancelled = true
        if (intervalHandle) {
          clearInterval(intervalHandle)
          intervalHandle = null
        }
        controller.close()
      }

      const poll = async () => {
        if (cancelled) return

        const job = await getAgentJobStatus(jobId)
        if (!job) {
          pushEvent('error', { message: 'Job not found', jobId })
          closeStream()
          return
        }

        if (job.userId !== userId) {
          pushEvent('error', { message: 'Unauthorized access to job', jobId })
          closeStream()
          return
        }

        if (job.status !== lastStatus) {
          pushEvent('status', { status: job.status, jobId })
          lastStatus = job.status
        }

        if (job.status === 'completed') {
          pushEvent('result', job.result)
          pushEvent('done', { status: job.status })
          closeStream()
          return
        }

        if (job.status === 'failed') {
          pushEvent('error', job.error ?? { message: 'Job failed without error payload' })
          closeStream()
        }

        if (!cancelled && Date.now() - startedAt > 2 * 60 * 1000) {
          pushEvent('error', { message: 'Job timed out before completion', jobId })
          closeStream()
        }
      }

      intervalHandle = setInterval(() => {
        poll().catch((error) => {
          logError('SSE polling error', { jobId }, error as Error)
          pushEvent('error', { message: 'Polling failed', jobId })
          closeStream()
        })
      }, 1000)

      await poll()
    },
    cancel() {
      cancelled = true
      if (intervalHandle) {
        clearInterval(intervalHandle)
        intervalHandle = null
      }
    },
  })
}

export async function POST(request: NextRequest) {
  const start = Date.now()
  try {
    const rateLimitResult = await rateLimitByIp(request, { requests: 12, window: 60 })
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const { user } = await authenticateRequest()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parsedBody = requestSchema.safeParse(await request.clone().json())
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: 'Invalid request', issues: parsedBody.error.flatten() },
        { status: 400 },
      )
    }

    const payload = parsedBody.data

    const securityResult = await securityMiddleware.processRequest(
      request as NextRequest,
      payload.agentId,
      'invoke',
      'custom_agents',
    )

    if (!securityResult.success && securityResult.response) {
      return securityResult.response
    }

    const job = await enqueueAgentJob({
      userId: user.id,
      agentId: payload.agentId,
      message: payload.message,
      context: payload.context,
      preferredAgent: payload.preferredAgent,
    })

    if (payload.stream) {
      const stream = createSseStream(job.id, user.id)
      logApi('POST', '/api/custom-agents', 200, Date.now() - start, { streamed: true })
      return new Response(stream, {
        headers: SSE_HEADERS,
      })
    }

    logApi('POST', '/api/custom-agents', 202, Date.now() - start, { jobId: job.id })
    return NextResponse.json(
      {
        success: true,
        job: serializeJob(job),
      },
      { status: 202 },
    )
  } catch (error) {
    logError('Error processing custom agent request', error)
    return NextResponse.json(
      { error: 'Failed to process custom agent request' },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  const start = Date.now()
  try {
    const rateLimitResult = await rateLimitByIp(request, { requests: 30, window: 60 })
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const { user } = await authenticateRequest()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (jobId) {
      const job = await getAgentJobStatus(jobId)
      if (!job || job.userId !== user.id) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 })
      }

      logApi('GET', '/api/custom-agents', 200, Date.now() - start, { jobId })
      return NextResponse.json({ job: serializeJob(job) })
    }

    const jobs = await listAgentJobs(user.id)

    logInfo('Fetched custom agent jobs', { userId: user.id, count: jobs.length })
    logApi('GET', '/api/custom-agents', 200, Date.now() - start, { jobs: jobs.length })

    return NextResponse.json({
      jobs: jobs.map(serializeJob),
    })
  } catch (error) {
    logError('Error fetching custom agent data', error)
    return NextResponse.json(
      { error: 'Failed to retrieve custom agent data' },
      { status: 500 },
    )
  }
}
