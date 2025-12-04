
import { NextResponse } from 'next/server'
import { db } from '@/lib/database-client'
import { workflowExecutions } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { logError, logInfo } from '@/lib/logger'

export async function GET() {
    try {
        const executions = await db.select().from(workflowExecutions).orderBy(desc(workflowExecutions.started_at))

        const formattedExecutions = executions.map(exec => ({
            id: exec.id.toString(),
            workflowId: exec.workflow_id.toString(),
            status: exec.status || 'unknown',
            startedAt: exec.started_at || new Date(),
            completedAt: exec.completed_at,
            duration: exec.duration || 0,
            steps: (exec.logs as any[])?.map((log: any) => ({
                id: log.id || 'unknown',
                name: log.stepName || 'Unknown Step',
                status: log.status || 'completed',
                startedAt: log.timestamp ? new Date(log.timestamp) : new Date(),
                completedAt: log.timestamp ? new Date(log.timestamp) : new Date()
            })) || [],
            variables: exec.variables as any,
            error: exec.error as any,
            logs: (exec.logs as any[]) || [],
            metadata: {}, // Default
            workflowName: 'Untitled Workflow', // Placeholder until join
            executionTime: exec.duration || 0,
            nodeResults: exec.output as any,
            progress: 100, // Default
            currentStep: null
        }))

        return NextResponse.json(formattedExecutions)
    } catch (error) {
        logError('Failed to fetch workflow executions:', error)
        return NextResponse.json({ error: 'Failed to fetch executions' }, { status: 500 })
    }
}
