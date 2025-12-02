import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { logError, logInfo } from '@/lib/logger'
import { rateLimitByIp } from '@/lib/rate-limit'
import { workflowEngine, WorkflowExecution } from '@/lib/workflow-engine'

// Edge runtime enabled
export const runtime = 'edge'

// POST /api/workflows/[id]/execute - Execute workflow
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const { user, error: authError } = await authenticateRequest()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const rateLimitResult = await rateLimitByIp(request, { requests: 20, window: 3600 }) // 20 executions per hour
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const resolvedParams = await params
    const workflowId = resolvedParams.id

    // Get workflow
    const workflow = await workflowEngine.getWorkflow(workflowId)

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }

    // Check ownership
    if (workflow.metadata.createdBy !== user.id) {
      // Ideally check permissions, but for now strict ownership
      // Or maybe check if public?
      // For now, assume strict ownership or admin
      // But wait, getWorkflow doesn't check user_id.
      // I should verify user_id.
      if (workflow.metadata.createdBy !== user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    // Check if workflow is active
    if (workflow.status !== 'active') {
      return NextResponse.json(
        { error: 'Workflow is not active' },
        { status: 400 }
      )
    }

    // Check if there are running executions
    const executions = await workflowEngine.getWorkflowExecutions(workflowId)
    const runningExecutions = executions.filter(e => e.status === 'running')

    if (runningExecutions.length > 0) {
      // Optional: Allow parallel executions based on settings
      if (!workflow.settings.parallelExecution) {
        return NextResponse.json(
          { error: 'Workflow is already running' },
          { status: 400 }
        )
      }
    }

    // Get execution parameters from request body
    const body = await request.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { input } = (body || {}) as any

    // Create execution record
    const execution = await workflowEngine.createExecution(workflowId, input || {}, user.id)

    logInfo('Workflow execution started', {
      executionId: execution.id,
      workflowId,
      userId: user.id,
      workflowName: workflow.name
    })

    // Execute workflow asynchronously
    // We don't await this to return response immediately
    workflowEngine.runExecution(execution.id).catch(error => {
      logError('Background workflow execution failed', error)
    })

    return NextResponse.json({
      execution: {
        id: execution.id,
        workflowId,
        status: 'running',
        startedAt: execution.startedAt
      }
    }, { status: 202 })

  } catch (error) {
    logError('Error in POST /api/workflows/[id]/execute:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/workflows/[id]/execute - Get execution status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const { user, error: authError } = await authenticateRequest()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const workflowId = resolvedParams.id
    const { searchParams } = new URL(request.url)
    const executionId = searchParams.get('executionId')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

    let executions: WorkflowExecution[]

    if (executionId) {
      // Get specific execution
      const execution = await workflowEngine.getExecution(executionId)
      if (execution && execution.workflowId == workflowId) { // loose equality for string/number
        // Check ownership
        const workflow = await workflowEngine.getWorkflow(workflowId)
        if (workflow && workflow.metadata.createdBy === user.id) {
          executions = [execution]
        } else {
          executions = []
        }
      } else {
        executions = []
      }
    } else {
      // Get recent executions for workflow
      // workflowEngine.getWorkflowExecutions returns all.
      // I should probably add pagination to getWorkflowExecutions or slice here.
      // And verify ownership.
      const workflow = await workflowEngine.getWorkflow(workflowId)
      if (!workflow || workflow.metadata.createdBy !== user.id) {
        return NextResponse.json({ error: 'Workflow not found or unauthorized' }, { status: 404 })
      }

      const allExecutions = await workflowEngine.getWorkflowExecutions(workflowId)
      executions = allExecutions.slice(0, limit)
    }

    return NextResponse.json({
      executions: executions.map(exec => ({
        id: exec.id,
        workflowId: exec.workflowId,
        status: exec.status,
        startedAt: exec.startedAt,
        completedAt: exec.completedAt,
        duration: exec.executionTime, // mapped from duration
        input: exec.variables, // variables includes input
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        output: Object.fromEntries(exec.nodeResults as any),
        error: exec.error,
        logs: exec.logs
      }))
    })

  } catch (error) {
    logError('Error in GET /api/workflows/[id]/execute:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}