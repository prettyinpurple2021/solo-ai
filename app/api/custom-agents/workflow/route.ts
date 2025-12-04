import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { NextRequest, NextResponse } from "next/server"
import { AgentCollaborationSystem } from "@/lib/custom-ai-agents/agent-collaboration-system"
import { authenticateRequest } from "@/lib/auth-server"
import { getDb } from '@/lib/database-client'
import { customWorkflows } from '@/db/schema'
import { eq, and } from 'drizzle-orm'


// Store collaboration systems per user (in production, use Redis or database)
const userCollaborationSystems = new Map<string, AgentCollaborationSystem>()


export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = user.id

    const { action, workflowId, stream = false } = await request.json()

    const collaborationSystem = userCollaborationSystems.get(userId)
    if (!collaborationSystem) {
      return NextResponse.json({ error: "No collaboration system found" }, { status: 404 })
    }

    switch (action) {
      case "execute":
        if (!workflowId) {
          return NextResponse.json({ error: "Workflow ID is required" }, { status: 400 })
        }

        if (stream) {
          // Create a streaming response for workflow execution
          const encoder = new TextEncoder()
          const stream = new ReadableStream({
            async start(controller) {
              try {
                const workflow = await collaborationSystem.executeWorkflow(workflowId)

                // Send workflow status updates
                const statusData = {
                  type: "workflow_status",
                  workflowId: workflow.id,
                  status: workflow.status,
                  steps: workflow.steps.length,
                  completedSteps: Object.keys(workflow.results).length
                }

                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(statusData)}\n\n`)
                )

                // Send step results
                for (const [agentId, result] of Object.entries(workflow.results)) {
                  const stepData = {
                    type: "step_result",
                    agentId,
                    result: result
                  }

                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify(stepData)}\n\n`)
                  )
                }

                // Send final workflow result
                const finalData = {
                  type: "workflow_complete",
                  workflowId: workflow.id,
                  status: workflow.status,
                  results: workflow.results
                }

                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(finalData)}\n\n`)
                )

              } catch (error) {
                const errorData = {
                  type: "workflow_error",
                  workflowId,
                  error: error instanceof Error ? error.message : 'Unknown error'
                }

                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`)
                )
              }

              // End stream
              controller.enqueue(encoder.encode("data: [DONE]\n\n"))
              controller.close()
            }
          })

          return new Response(stream, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              "Connection": "keep-alive",
            },
          })
        } else {
          // Execute workflow and return complete result
          const workflow = await collaborationSystem.executeWorkflow(workflowId)
          return NextResponse.json({
            success: true,
            workflow
          })
        }

      case "create":
        const { name, description, steps } = await request.json()

        if (!name || !steps || !Array.isArray(steps)) {
          return NextResponse.json({
            error: "Name and steps array are required"
          }, { status: 400 })
        }

        // Create custom workflow
        const customWorkflow = {
          id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name,
          description: description || "Custom workflow",
          steps: steps.map((step: any, _index: number) => ({
            agentId: step.agentId,
            task: step.task,
            dependencies: step.dependencies || [],
            expectedOutcome: step.expectedOutcome || step.task
          })),
          status: "pending" as const,
          results: {}
        }

        // Store workflow in database
        const db = getDb()
        await db.insert(customWorkflows).values({
          id: customWorkflow.id,
          user_id: userId,
          name: customWorkflow.name,
          description: customWorkflow.description,
          steps: customWorkflow.steps,
          status: customWorkflow.status,
          results: customWorkflow.results
        })

        // Also update in-memory system for immediate execution if needed
        const workflows = collaborationSystem.getAllWorkflows()
        workflows.set(customWorkflow.id, customWorkflow)

        return NextResponse.json({
          success: true,
          workflow: customWorkflow
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

  } catch (error) {
    logError("Error in workflow API:", error)
    return NextResponse.json(
      { error: "Failed to process workflow request" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = user.id

    const { searchParams } = new URL(request.url)
    const workflowId = searchParams.get("workflowId")

    const collaborationSystem = userCollaborationSystems.get(userId)
    if (!collaborationSystem) {
      return NextResponse.json({ error: "No collaboration system found" }, { status: 404 })
    }

    const db = getDb()

    if (workflowId) {
      // Get specific workflow from DB
      const workflowResult = await db
        .select()
        .from(customWorkflows)
        .where(
          and(
            eq(customWorkflows.id, workflowId),
            eq(customWorkflows.user_id, userId)
          )
        )
        .limit(1)

      if (workflowResult.length === 0) {
        return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
      }
      return NextResponse.json({ workflow: workflowResult[0] })
    } else {
      // Get all workflows from DB
      const workflows = await db
        .select()
        .from(customWorkflows)
        .where(eq(customWorkflows.user_id, userId))
        .orderBy(customWorkflows.created_at)

      return NextResponse.json({ workflows })
    }

  } catch (error) {
    logError("Error in workflow GET API:", error)
    return NextResponse.json(
      { error: "Failed to retrieve workflow data" },
      { status: 500 }
    )
  }
}
