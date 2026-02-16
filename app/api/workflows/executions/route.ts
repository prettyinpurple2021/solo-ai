
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { logError } from '@/lib/logger'
import { workflowExecutions, workflows } from '@/shared/db/schema'
import { auth } from '@/lib/auth'
import { desc, eq, and, like } from 'drizzle-orm'

export async function GET(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const query = searchParams.get('query')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const offset = (page - 1) * limit

    // If ID is provided, fetch single execution with full details
    const id = searchParams.get('id')
    if (id) {
       const execution = await db.query.workflowExecutions.findFirst({
           where: eq(workflowExecutions.id, parseInt(id)),
           with: {
               workflow: true
           }
       })

       if (!execution) {
           return NextResponse.json({ success: false, error: 'Execution not found' }, { status: 404 })
       }

       if (execution.user_id !== session.user.id) {
           return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
       }

       // Parse logs to reconstruct steps
       // We expect logs to contain metadata with nodeId and status
       const workflowNodes = (execution.workflow.nodes as any[]) || []
       const steps = (execution.logs as any[] || []).reduce<any[]>((acc, log) => {
           if (log.metadata?.nodeId && log.metadata?.status) {
                const node = workflowNodes.find(n => n.id === log.metadata.nodeId)
                const nodeName = node?.name || (node?.data as any)?.label || `Node ${log.metadata.nodeId}`
                
                const existingStep = acc.find(s => s.nodeId === log.metadata.nodeId)
                if (existingStep) {
                    if (log.metadata.status === 'completed' || log.metadata.status === 'failed') {
                        existingStep.status = log.metadata.status
                        existingStep.completedAt = log.timestamp
                        existingStep.output = log.metadata.result || log.metadata.error
                        existingStep.name = nodeName
                    }
                } else {
                    acc.push({
                        nodeId: log.metadata.nodeId,
                        name: nodeName,
                        status: log.metadata.status,
                        startedAt: log.timestamp,
                        completedAt: log.metadata.status === 'completed' ? log.timestamp : null,
                        output: log.metadata.result
                    })
                }
           }
           return acc
       }, [])

       return NextResponse.json({
           success: true,
           data: {
               ...execution,
               workflowName: execution.workflow.name,
               steps
           }
       })
    }

    let conditions = [eq(workflowExecutions.user_id, session.user.id)]

    if (status && status !== 'all') {
      conditions.push(eq(workflowExecutions.status, status))
    }

    if (query) {
      // We need to join with workflows to search by workflow name, 
      // but strictly speaking for filtered list we might handle this differently 
      // or assume the join covers it.
    }

    // Join with workflows to get the name
    let baseQuery = db
      .select({
        execution: workflowExecutions,
        workflowName: workflows.name
      })
      .from(workflowExecutions)
      .leftJoin(workflows, eq(workflowExecutions.workflow_id, workflows.id))
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(workflowExecutions.started_at))



    // Filter by query manually if needed (search workflow name) since complex joins+search in where can be tricky with partial implementation
    // But better to use drizzle filter if possible. 
    // If I add `like(workflows.name, \`%${query}%\`)` to conditions it should work.

    if (query) {
       conditions.push(like(workflows.name, `%${query}%`))
       
       // Re-construct query with new condition
       baseQuery = db
        .select({
            execution: workflowExecutions,
            workflowName: workflows.name
        })
        .from(workflowExecutions)
        .leftJoin(workflows, eq(workflowExecutions.workflow_id, workflows.id))
        .where(and(...conditions))
        .limit(limit)
        .offset(offset)
        .orderBy(desc(workflowExecutions.started_at))
    }
    
    const finalResults = await baseQuery

    const formattedResults = finalResults.map(({ execution, workflowName }) => ({
      ...execution,
      workflowName: workflowName || 'Untitled Workflow',
      logs: Array.isArray(execution.logs) ? execution.logs : [],
      steps: [] 
    }))

    return NextResponse.json({
      success: true,
      data: formattedResults
    })

  } catch (error) {
    logError('Failed to fetch workflow executions:', error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
