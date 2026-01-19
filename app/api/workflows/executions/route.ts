
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { logError } from '@/lib/logger'
import { workflowExecutions, workflows } from '@/db/schema'
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
      // Ensure logs, variables etc are parsed if they are strings (JSONB should be handled by drizzle but just in case)
      logs: Array.isArray(execution.logs) ? execution.logs : [],
      steps: [] // We don't store steps separately in the schema shown yet? 
      // Wait, the schema `workflowExecutions` has `logs`, `input`, `output`, `variables`, `error`. 
      // But mock data had `steps`. 
      // Real schema doesn't seem to have a `steps` column or relation in `workflowExecutions` table definition I saw?
      // Ah, schema line 1252: `logs: jsonb('logs').default('[]'),`
      // Logic for "steps" might be derived from logs or stored in `output` or part of a separate table if one existed.
      // The schema I saw didn't have `workflow_execution_steps`.
      // I'll return what I have. The frontend expects `steps` array. 
      // I might need to synthesize steps from logs or generic "running" state if actual step tracking isn't fully DB-backed yet.
      // For now, I will return empty steps or map logs to steps if possible.
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
