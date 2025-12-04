/**
 * Individual Collaboration Agent API
 * Handles operations on specific AI agents
 */

import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { CollaborationHub } from '@/lib/collaboration-hub'
import { SessionManager } from '@/lib/session-manager'
import { MessageRouter } from '@/lib/message-router'
import { verifyAuth } from '@/lib/auth-server'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'


// Initialize collaboration system components
const collaborationHub = new CollaborationHub()
const messageRouter = new MessageRouter(collaborationHub)
const sessionManager = new SessionManager(collaborationHub, messageRouter)

// Execute capability schema
const ExecuteCapabilitySchema = z.object({
  capability: z.string().min(1, 'Capability name is required'),
  input: z.any().optional(),
  context: z.record(z.string(), z.any()).optional()
})


/**
 * GET /api/collaboration/agents/[id]
 * Get details of a specific AI agent
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const { user, error: authError } = await verifyAuth()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const agentId = resolvedParams.id

    // Get agent from collaboration hub
    const agent = collaborationHub.getAgent(agentId)
    if (!agent) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Agent not found' },
        { status: 404 }
      )
    }

    // Get agent's active sessions details
    const rawAgentSessions = await sessionManager.getAgentSessions(agentId)
    const agentSessions = await Promise.all(rawAgentSessions.map(async session => {
      const sessionState = await sessionManager.getSessionState(session.id)
      return {
        id: session.id,
        projectName: session.projectName,
        status: sessionState?.status || 'unknown',
        createdAt: session.createdAt,
        lastActivity: sessionState?.lastActivity,
        participantCount: session.participatingAgents.length,
        metrics: sessionState?.sessionMetrics,
        completedTasks: sessionState?.completedTasks
      }
    }))

    // Calculate performance metrics
    const totalResponseTime = agentSessions.reduce((sum, session) => {
      return sum + (session.metrics?.averageResponseTime || 0)
    }, 0)

    const averageResponseTime = agentSessions.length > 0
      ? Math.round(totalResponseTime / agentSessions.length)
      : agent.responseTimeMs

    return NextResponse.json({
      success: true,
      data: {
        id: agent.id,
        name: agent.name,
        displayName: agent.displayName,
        description: agent.description,
        capabilities: agent.capabilities,
        specializations: agent.specializations,
        personality: agent.personality,
        accentColor: agent.accentColor,
        status: agent.status,
        responseTimeMs: agent.responseTimeMs,
        availability: {
          isAvailable: agent.status === 'available',
          currentLoad: agent.currentSessions.length,
          capacity: agent.maxConcurrentSessions,
          utilizationPercent: Math.round((agent.currentSessions.length / agent.maxConcurrentSessions) * 100)
        },
        activeSessions: agentSessions,
        performance: {
          averageResponseTime,
          totalSessions: agentSessions.length,
          completedTasks: agentSessions.reduce((sum, session) => {
            return sum + (session.completedTasks?.length || 0)
          }, 0)
        }
      },
      message: 'Agent details retrieved successfully'
    })


  } catch (error) {
    logError('Error retrieving agent details:', error)

    return NextResponse.json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve agent details'
    }, { status: 500 })
  }
}

/**
 * POST /api/collaboration/agents/[id]/capabilities
 * Execute a specific capability of the agent
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const { user, error: authError } = await verifyAuth()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const agentId = resolvedParams.id

    // Get agent from collaboration hub
    const agent = collaborationHub.getAgent(agentId)
    if (!agent) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Agent not found' },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = ExecuteCapabilitySchema.parse(body)

    // Check if agent has the requested capability
    if (!agent.capabilities.includes(validatedData.capability)) {
      return NextResponse.json({
        error: 'Capability Not Found',
        message: `Agent ${agent.displayName} does not have capability: ${validatedData.capability}`,
        availableCapabilities: agent.capabilities
      }, { status: 400 })
    }

    // Check if agent is available
    if (agent.status !== 'available') {
      return NextResponse.json({
        error: 'Agent Unavailable',
        message: `Agent ${agent.displayName} is currently ${agent.status}`,
        agentStatus: agent.status,
        currentSessions: agent.currentSessions.length,
        maxSessions: agent.maxConcurrentSessions
      }, { status: 423 }) // 423 Locked
    }

    // For now, we'll simulate capability execution
    // In a real implementation, this would interface with the actual AI agent
    const executionResult = await simulateCapabilityExecution(
      agent,
      validatedData.capability,
      validatedData.input,
      validatedData.context
    )

    return NextResponse.json({
      success: true,
      data: {
        capability: validatedData.capability,
        executedBy: {
          id: agent.id,
          name: agent.displayName
        },
        input: validatedData.input,
        result: executionResult,
        executionTime: Date.now(), // In real implementation, measure actual time
        metadata: {
          agentStatus: agent.status,
          responseTimeMs: agent.responseTimeMs
        }
      },
      message: 'Capability executed successfully'
    })

  } catch (error) {
    logError('Error executing agent capability:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation Error',
        message: 'Invalid request data',
        details: (error as any).errors
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Internal Server Error',
      message: 'Failed to execute agent capability'
    }, { status: 500 })
  }
}

/**
 * Execute capability using real AI
 */
async function simulateCapabilityExecution(
  agent: any,
  capability: string,
  input: any,
  context?: any
): Promise<any> {
  try {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      throw new Error("Missing API Key for AI generation");
    }

    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);

    // Use a standard model for capabilities
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `
      You are ${agent.displayName}.
      Your personality is: ${agent.personality}.
      Your capabilities include: ${agent.capabilities.join(', ')}.
      
      Task: Execute the capability "${capability}".
      Input: ${JSON.stringify(input)}
      Context: ${JSON.stringify(context || {})}
      
      Please provide a structured JSON response appropriate for this task. 
      Do not include markdown formatting like \`\`\`json. Just the raw JSON.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    try {
      // Attempt to parse JSON
      return JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch (e) {
      // Fallback if not valid JSON
      return {
        result: responseText,
        type: 'text_response'
      };
    }

  } catch (error) {
    logError("AI Capability Execution Failed", error);
    // Fallback to basic response if AI fails
    return {
      error: "AI execution failed",
      message: error instanceof Error ? error.message : "Unknown error",
      fallback: true
    };
  }
}