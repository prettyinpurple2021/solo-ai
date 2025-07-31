import type { NextRequest } from "next/server"
import { collaborationManager, collaborationWorkflows } from "@/lib/agent-collaboration"

/**
 * POST /api/collaboration
 * Handles AI agent collaboration workflows and task management
 * @param req NextRequest containing action and data
 * @returns JSON response with collaboration results or error
 */
export async function POST(req: NextRequest) {
  try {
    const { action, ...data } = await req.json()

    switch (action) {
      case "create_task": {
        const task = await collaborationManager.createCollaborationTask(data.workflowType, data.customization)
        return Response.json({ success: true, task })
      }

      case "execute_phase": {
        const result = await collaborationManager.executePhase(
          data.task,
          data.phaseId,
          data.userInput,
          data.previousOutputs,
        )
        return Response.json({ success: true, ...result })
      }

      case "suggest_collaboration": {
        const suggestion = await collaborationManager.suggestCollaboration(data.query)
        return Response.json({ success: true, suggestion })
      }

      case "get_workflows": {
        return Response.json({ success: true, workflows: collaborationWorkflows })
      }

      default:
        return Response.json({ success: false, error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Collaboration API error:", error)
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
