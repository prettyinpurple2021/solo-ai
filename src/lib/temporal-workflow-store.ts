import { Redis } from '@upstash/redis'

export type TemporalWorkflowStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'

export interface TemporalWorkflowRecord {
  workflowId: string
  endpoint: 'onboarding' | 'intelligence' | 'briefings'
  userId: string
  status: TemporalWorkflowStatus
  startTime: string
  executionTime?: string
  result?: unknown
  error?: string
}

const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

const inMemoryStore = new Map<string, TemporalWorkflowRecord>()
const TTL_SECONDS = 60 * 60 // 1 hour

function key(workflowId: string) {
  return `temporal:workflow:${workflowId}`
}

export async function saveTemporalWorkflow(record: TemporalWorkflowRecord) {
  if (redis) {
    await redis.set(key(record.workflowId), record, { ex: TTL_SECONDS })
    return
  }
  inMemoryStore.set(record.workflowId, record)
}

export async function getTemporalWorkflow(workflowId: string): Promise<TemporalWorkflowRecord | null> {
  if (redis) {
    const record = await redis.get<TemporalWorkflowRecord>(key(workflowId))
    return record || null
  }
  return inMemoryStore.get(workflowId) || null
}

