/**
 * Individual Collaboration Agent API
 * Handles operations on specific AI agents
 */

import { logError,} from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { CollaborationHub } from '@/lib/collaboration-hub'
import { SessionManager } from '@/lib/session-manager'
import { MessageRouter } from '@/lib/message-router'
import { verifyAuth } from '@/lib/auth-server'
import { generateText } from 'ai'
import { getTeamMemberConfig } from '@/lib/ai-config'




// Initialize collaboration system components
const collaborationHub = new CollaborationHub()
const messageRouter = new MessageRouter(collaborationHub)
const sessionManager = new SessionManager(collaborationHub, messageRouter)

// Execute capability schema
const ExecuteCapabilitySchema = z.object({
  capability: z.string().min(1, 'Capability name is required'),
  input: z.any().optional(),
  context: z.record(z.any()).optional()
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
    // Get agent's active sessions details
    const sessions = await sessionManager.getAgentSessionsAsync(agentId)
    const agentSessions = await Promise.all(sessions.map(async session => {
      const sessionState = await sessionManager.getSessionStateAsync(session.id)
      return {
        id: session.id,
        projectName: session.projectName,
        status: sessionState?.status || 'unknown',
        createdAt: session.createdAt,
        lastActivity: sessionState?.lastActivity,
        participantCount: session.participatingAgents.length,
        sessionMetrics: sessionState?.sessionMetrics,
        completedTasks: sessionState?.completedTasks
      }
    }))

    // Calculate performance metrics
    const totalResponseTime = agentSessions.reduce((sum, session) => {
      return sum + (session.sessionMetrics?.averageResponseTime || 0)
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

    const startTime = Date.now()
    
    // Execute using real AI agent
    const executionResult = await executeAgentCapability(
      agent,
      validatedData.capability,
      validatedData.input,
      validatedData.context
    )
    
    const duration = Date.now() - startTime

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
        executionTime: duration,
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
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Internal Server Error',
      message: 'Failed to execute agent capability'
    }, { status: 500 })
  }
}

/**
 * Execute capability using the actual AI agent model
 */
async function executeAgentCapability(
  agent: any,
  capability: string,
  input: any,
  context?: any
): Promise<any> {
  const agentConfig = getTeamMemberConfig(agent.id)
  
  const prompt = `
    Execute the following capability: "${capability}"
    
    Input Data:
    ${JSON.stringify(input, null, 2)}
    
    Context:
    ${JSON.stringify(context || {}, null, 2)}
    
    Task:
    Perform the requested capability tailored to your personality and expertise.
    Provide a structured JSON response with the results.
  `

  try {
    const { text } = await generateText({
      model: agentConfig.model as any,
      messages: [
        { role: 'system', content: agentConfig.systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      maxOutputTokens: 2000
    })

    // improved JSON parsing to handle potential markdown fences
    let cleanText = text.trim()
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/, '').trim()
    }

    try {
      return JSON.parse(cleanText)
    } catch (e) {
      // If not valid JSON, return as text wrapped in structure
      return {
        result: cleanText,
        refined: true, // indicates raw text fallback
        metadata: {
          executionTime: new Date().toISOString()
        }
      }
    }
  } catch (error) {
    logError(`Error executing capability for ${agent.displayName}:`, error)
    throw new Error('Failed to generate AI response')
  }
}
