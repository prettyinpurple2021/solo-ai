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
    if (!record || record.userId !== user.id || record.endpoint !== 'briefings') {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    return NextResponse.json(record)
  } catch (error) {
    logError('Temporal briefings status fetch failed', error)
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

    const body = await request.json().catch(() => ({}))
    const requestedUserId = typeof body?.userId === 'string' ? body.userId : user.id
    if (requestedUserId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const briefingType =
      body?.briefingType === 'weekly' || body?.briefingType === 'monthly' || body?.briefingType === 'on-demand'
        ? body.briefingType
        : 'daily'

    workflowId = crypto.randomUUID()
    const startedAt = new Date()
    workflowUserId = user.id
    workflowStartIso = startedAt.toISOString()

    await saveTemporalWorkflow({
      workflowId,
      endpoint: 'briefings',
      userId: workflowUserId,
      status: 'RUNNING',
      startTime: workflowStartIso,
    })
    runningPersisted = true

    const response = await fetch(`${APP_URL}/api/intelligence/briefings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: request.headers.get('cookie') || '',
      },
      body: JSON.stringify({
        briefingType,
        competitorIds: Array.isArray(body?.competitorIds) ? body.competitorIds : undefined,
      }),
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Briefings generation failed with status ${response.status}`)
    }

    const result = await response.json()
    const completedAt = new Date()
    const record = {
      workflowId,
      endpoint: 'briefings' as const,
      userId: workflowUserId,
      status: 'COMPLETED' as const,
      startTime: workflowStartIso,
      executionTime: String(completedAt.getTime() - startedAt.getTime()),
      result,
    }

    await saveTemporalWorkflow(record)
    return NextResponse.json(record)
  } catch (error) {
    logError('Temporal briefings start failed', error)
    if (runningPersisted && workflowId && workflowUserId) {
      try {
        await markTemporalWorkflowFailed({
          workflowId,
          endpoint: 'briefings',
          userId: workflowUserId,
          startTime: workflowStartIso,
          error,
        })
      } catch (persistErr) {
        logError('Temporal briefings: failed to persist FAILED status', persistErr)
      }
    }
    return NextResponse.json(
      {
        error: 'Briefings workflow failed',
        ...(runningPersisted && workflowId ? { workflowId } : {}),
      },
      { status: 500 }
    )
  }
}

