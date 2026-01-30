import { z } from 'zod'
import { getRedisClient } from '@/lib/upstash/clients'
import { logError } from '@/lib/logger'

export type AgentJobStatus = 'queued' | 'processing' | 'completed' | 'failed'

export interface AgentJobResult {
  primaryResponse: unknown
  collaborationResponses: unknown[]
  workflow?: unknown
}

export interface AgentJobError {
  message: string
  stack?: string
  name?: string
}

export interface AgentJob {
  id: string
  userId: string
  agentId: string
  message: string
  context?: Record<string, unknown>
  preferredAgent?: string
  status: AgentJobStatus
  result?: AgentJobResult
  error?: AgentJobError
  createdAt: string
  updatedAt: string
  attempts: number
}

const jobSchema = z.object({
  id: z.string(),
  userId: z.string(),
  agentId: z.string(),
  message: z.string(),
  context: z.record(z.any()).optional(),
  preferredAgent: z.string().optional(),
  status: z.enum(['queued', 'processing', 'completed', 'failed']),
  result: z
    .object({
      primaryResponse: z.any(),
      collaborationResponses: z.array(z.any()),
      workflow: z.any().optional(),
    })
    .optional(),
  error: z
    .object({
      message: z.string(),
      stack: z.string().optional(),
      name: z.string().optional(),
    })
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  attempts: z.number().nonnegative(),
})

const JOB_TTL_SECONDS = 60 * 60 * 24 // 24 hours
const MAX_USER_JOB_HISTORY = 50

function jobKey(id: string) {
  return `agent_job:${id}`
}

function userJobsKey(userId: string) {
  return `agent_jobs:user:${userId}`
}

async function writeJob(job: AgentJob, options: { pushToHistory?: boolean } = {}) {
  const redis = getRedisClient()
  await redis.set(jobKey(job.id), JSON.stringify(job), { ex: JOB_TTL_SECONDS })
  if (options.pushToHistory) {
    await redis.lpush(userJobsKey(job.userId), job.id)
    await redis.ltrim(userJobsKey(job.userId), 0, MAX_USER_JOB_HISTORY - 1)
  }
}

export async function createAgentJob(job: AgentJob): Promise<AgentJob> {
  await writeJob(job, { pushToHistory: true })
  return job
}

export async function getAgentJob(jobId: string): Promise<AgentJob | null> {
  const redis = getRedisClient()
  const rawJob = await redis.get<string>(jobKey(jobId))
  if (!rawJob) {
    return null
  }

  try {
    const parsed = jobSchema.parse(JSON.parse(rawJob))
    return parsed as AgentJob
  } catch (error) {
    logError('Failed to parse agent job from Upstash', { jobId }, error as Error)
    return null
  }
}

export async function updateAgentJob(
  jobId: string,
  updates: Partial<Omit<AgentJob, 'id' | 'userId' | 'agentId' | 'message' | 'createdAt'>> & {
    status?: AgentJobStatus
    result?: AgentJobResult
    error?: AgentJobError
  }
): Promise<AgentJob | null> {
  const existing = await getAgentJob(jobId)
  if (!existing) {
    return null
  }

  const updated: AgentJob = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  await writeJob(updated)
  return updated
}

export async function listAgentJobsForUser(userId: string): Promise<AgentJob[]> {
  const redis = getRedisClient()
  const jobIds = await redis.lrange<string>(userJobsKey(userId), 0, MAX_USER_JOB_HISTORY - 1)
  if (!jobIds || jobIds.length === 0) {
    return []
  }

  const jobs = await Promise.all(jobIds.map((jobId) => getAgentJob(jobId)))
  return jobs.filter((job): job is AgentJob => job !== null)
}

