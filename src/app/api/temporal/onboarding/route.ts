import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { runOnboardingWorkflow } from '@/lib/onboarding/workflow'
import { getTemporalWorkflow, saveTemporalWorkflow } from '@/lib/temporal-workflow-store'
import { logError } from '@/lib/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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
    if (!record || record.userId !== user.id || record.endpoint !== 'onboarding') {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    return NextResponse.json(record)
  } catch (error) {
    logError('Temporal onboarding status fetch failed', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const workflowId = crypto.randomUUID()
    const startedAt = new Date()

    await saveTemporalWorkflow({
      workflowId,
      endpoint: 'onboarding',
      userId: user.id,
      status: 'RUNNING',
      startTime: startedAt.toISOString(),
    })

    const result = await runOnboardingWorkflow(workflowId, user.id)
    const completedAt = new Date()

    const record = {
      workflowId,
      endpoint: 'onboarding' as const,
      userId: user.id,
      status: 'COMPLETED' as const,
      startTime: startedAt.toISOString(),
      executionTime: String(completedAt.getTime() - startedAt.getTime()),
      result,
    }

    await saveTemporalWorkflow(record)
    return NextResponse.json(record)
  } catch (error) {
    logError('Temporal onboarding start failed', error)
    return NextResponse.json({ error: 'Onboarding workflow failed' }, { status: 500 })
  }
}

