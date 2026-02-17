import { logError,} from '@/lib/logger'
import { NextRequest, NextResponse} from "next/server"
import { auth } from '@/lib/auth';
import { AgentCollaborationSystem} from "@/lib/custom-ai-agents/agent-collaboration-system"


export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { action, workflowId, stream = false } = await request.json()

    // Initialize collaboration system for the current user
    // The system will hydrate agent memory from the DB as needed
    const collaborationSystem = new AgentCollaborationSystem(userId)

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

        // Use Workflow Engine to persist the workflow
        // This is handled internally by AgentCollaborationSystem.createWorkflow logic
        // We'll simulate a primary request to trigger workflow creation
        
        // Note: For explicit workflow creation, we should ideally expose a direct method
        // on collaborationSystem or use the workflow engine directly.
        // For V1 robustness, we'll use the workflow engine directly here to ensure persistence.
        
        const { workflowEngine } = await import('@/lib/workflow-engine')
        
        interface WorkflowStepInput {
          agentId: string;
          task: string;
        }

        const nodes = steps.map((step: WorkflowStepInput, index: number) => ({
            id: `node_${index}`,
            type: 'ai_task',
            name: step.task.substring(0, 30),
            position: { x: 100, y: index * 150 + 100 },
            config: {
                task: 'custom',
                agentId: step.agentId,
                prompt: step.task,
                model: 'gpt-4'
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'idle',
            inputs: {},
            outputs: {}
        }))
        
        const edges = steps.slice(0, -1).map((_: WorkflowStepInput, index: number) => ({
            id: `edge_${index}`,
            source: `node_${index}`,
            target: `node_${index + 1}`,
            animated: true
        }))

        const newWorkflow = await workflowEngine.createWorkflow({
            name,
            description,
            version: '1.0.0',
            status: 'active',
            triggerType: 'manual',
            triggerConfig: {},
            nodes: nodes as any,
            edges,
            variables: {},
            settings: {
                timeout: 300000,
                retryAttempts: 3,
                retryDelay: 5000,
                parallelExecution: false,
                errorHandling: 'stop'
            }
        }, userId)

        return NextResponse.json({
          success: true,
          workflow: newWorkflow
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
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(request.url)
    const workflowId = searchParams.get("workflowId")

    const collaborationSystem = new AgentCollaborationSystem(userId)

    if (workflowId) {
      // Get specific workflow via engine (persisted)
      const { workflowEngine } = await import('@/lib/workflow-engine')
      const workflow = await workflowEngine.getWorkflow(workflowId)
      
      if (!workflow) {
        return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
      }
      return NextResponse.json({ workflow })
    } else {
      // Get all workflows via engine (persisted)
      const { workflowEngine } = await import('@/lib/workflow-engine')
      const workflows = await workflowEngine.getWorkflowsByUser(userId)
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
