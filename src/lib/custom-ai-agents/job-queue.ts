import { randomUUID } from 'node:crypto'
import { createAgentJob, getAgentJob, listAgentJobsForUser, AgentJob,} from '@/lib/custom-ai-agents/job-store'
import { getQStashClient } from '@/lib/upstash/clients'
import { logInfo } from '@/lib/logger'

export interface EnqueueAgentJobInput {
  userId: string
  agentId: string
  message: string
  context?: Record<string, unknown>
  preferredAgent?: string
}

function getWorkerCallbackUrl(): string {
  const explicitUrl = process.env.QSTASH_WORKER_CALLBACK_URL
  if (explicitUrl && explicitUrl.length > 0) {
    return explicitUrl
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!appUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL must be configured to derive QStash worker callback URL')
  }

  return `${appUrl.replace(/\/+$/, '')}/api/workers/custom-agents`
}

export function ensureUpstashConfigured() {
  const requiredVars = [
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'QSTASH_TOKEN',
    'QSTASH_CURRENT_SIGNING_KEY',
  ]

  const missing = requiredVars.filter((key) => !process.env[key] || process.env[key]!.length === 0)
  if (missing.length > 0) {
    throw new Error(`Missing required Upstash configuration: ${missing.join(', ')}`)
  }
}

export async function enqueueAgentJob(input: EnqueueAgentJobInput): Promise<AgentJob> {
  ensureUpstashConfigured()

  const timestamp = new Date().toISOString()
  const job: AgentJob = {
    id: randomUUID(),
    userId: input.userId,
    agentId: input.agentId,
    message: input.message,
    context: input.context,
    preferredAgent: input.preferredAgent,
    status: 'queued',
    createdAt: timestamp,
    updatedAt: timestamp,
    attempts: 0,
  }

  await createAgentJob(job)

  const qstash = getQStashClient()
  const callbackUrl = getWorkerCallbackUrl()

  await qstash.publishJSON({
    url: callbackUrl,
    body: { jobId: job.id },
    delay: 0,
    headers: {
      'content-type': 'application/json',
    },
  })

  logInfo('Enqueued custom agent job', {
    jobId: job.id,
    userId: job.userId,
    agentId: job.agentId,
    callbackUrl,
  })

  return job
}

export async function getAgentJobStatus(jobId: string): Promise<AgentJob | null> {
  return getAgentJob(jobId)
}

export async function listAgentJobs(userId: string): Promise<AgentJob[]> {
  return listAgentJobsForUser(userId)
}

