import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import {
  getTemporalWorkflow,
  markTemporalWorkflowFailed,
  saveTemporalWorkflow,
} from '@/lib/temporal-workflow-store'
import { logError } from '@/lib/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workflowId = request.nextUrl.searchParams.get('workflowId')
    if (!workflowId) {
      return NextResponse.json({ error: 'workflowId is required' }, { status: 400 })
    }

    const record = await getTemporalWorkflow(workflowId)
    if (!record || record.userId !== user.id || record.endpoint !== 'intelligence') {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    return NextResponse.json(record)
  } catch (error) {
    logError('Temporal intelligence status fetch failed', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  let workflowId = ''
  let workflowUserId = ''
  let workflowStartIso = ''
  let runningPersisted = false

  try {
    const { user, error } = await authenticateRequest()
    if (error || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    workflowId = crypto.randomUUID()
    const startedAt = new Date()
    workflowUserId = user.id
    workflowStartIso = startedAt.toISOString()

    await saveTemporalWorkflow({
      workflowId,
      endpoint: 'intelligence',
      userId: workflowUserId,
      status: 'RUNNING',
      startTime: workflowStartIso,
    })
    runningPersisted = true

    const response = await fetch(`${APP_URL}/api/competitors/intelligence`, {
      method: 'GET',
      headers: { cookie: request.headers.get('cookie') || '' },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Intelligence fetch failed with status ${response.status}`)
    }

    const result = await response.json()
    const completedAt = new Date()
    const record = {
      workflowId,
      endpoint: 'intelligence' as const,
      userId: workflowUserId,
      status: 'COMPLETED' as const,
      startTime: workflowStartIso,
      executionTime: String(completedAt.getTime() - startedAt.getTime()),
      result,
    }

    await saveTemporalWorkflow(record)
    return NextResponse.json(record)
  } catch (error) {
    logError('Temporal intelligence start failed', error)
    if (runningPersisted && workflowId && workflowUserId) {
      try {
        await markTemporalWorkflowFailed({
          workflowId,
          endpoint: 'intelligence',
          userId: workflowUserId,
          startTime: workflowStartIso,
          error,
        })
      } catch (persistErr) {
        logError('Temporal intelligence: failed to persist FAILED status', persistErr)
      }
    }
    return NextResponse.json(
      {
        error: 'Intelligence workflow failed',
        ...(runningPersisted && workflowId ? { workflowId } : {}),
      },
      { status: 500 }
    )
  }
}

