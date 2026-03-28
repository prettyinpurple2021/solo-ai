import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { getTemporalWorkflow, saveTemporalWorkflow } from '@/lib/temporal-workflow-store'
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
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workflowId = crypto.randomUUID()
    const startedAt = new Date()

    await saveTemporalWorkflow({
      workflowId,
      endpoint: 'intelligence',
      userId: user.id,
      status: 'RUNNING',
      startTime: startedAt.toISOString(),
    })

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
      userId: user.id,
      status: 'COMPLETED' as const,
      startTime: startedAt.toISOString(),
      executionTime: String(completedAt.getTime() - startedAt.getTime()),
      result,
    }

    await saveTemporalWorkflow(record)
    return NextResponse.json(record)
  } catch (error) {
    logError('Temporal intelligence start failed', error)
    return NextResponse.json({ error: 'Intelligence workflow failed' }, { status: 500 })
  }
}

