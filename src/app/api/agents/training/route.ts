import { logError,} from '@/lib/logger'
import { NextRequest, NextResponse} from "next/server"
import { authenticateRequest } from '@/lib/auth-server'
import { SimpleTrainingCollector} from "@/lib/custom-ai-agents/training/simple-training-collector"
import { PerformanceAnalytics} from "@/lib/custom-ai-agents/training/performance-analytics"
import { FineTuningPipeline} from "@/lib/custom-ai-agents/training/fine-tuning-pipeline"



// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const agentId = searchParams.get('agentId')
    // Get authenticated user
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = user.id

    const dataCollector = SimpleTrainingCollector.getInstance()
    const analytics = new PerformanceAnalytics()
    const pipeline = new FineTuningPipeline()

    switch (action) {
      case 'metrics':
        const metrics = await dataCollector.getTrainingMetrics(userId)
        return NextResponse.json({ success: true, metrics })

      case 'agent-performance':
        if (!agentId) {
          return NextResponse.json({ error: 'Agent ID required' }, { status: 400 })
        }
        const performance = await analytics.analyzeAgentPerformance(agentId, userId)
        return NextResponse.json({ success: true, performance })

      case 'training-report':
        const report = await analytics.generateTrainingReport(userId)
        return NextResponse.json({ success: true, report })

      case 'fine-tuning-jobs':
        const jobs = await pipeline.listFineTuningJobs(userId)
        return NextResponse.json({ success: true, jobs })

      case 'recommendations':
        if (!agentId) {
          return NextResponse.json({ error: 'Agent ID required' }, { status: 400 })
        }
        const recommendations = await pipeline.generateFineTuningRecommendations(agentId, userId)
        return NextResponse.json({ success: true, recommendations })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    logError('Training API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const { action, agentId, ...params } = body
    const userId = user.id

    const dataCollector = SimpleTrainingCollector.getInstance()
    const pipeline = new FineTuningPipeline()

    switch (action) {
      case 'record-interaction':
        const interactionId = await dataCollector.recordInteraction({
          userId,
          agentId: params.agentId,
          userMessage: params.userMessage,
          agentResponse: params.agentResponse,
          context: params.context || {},
          userRating: params.userRating,
          userFeedback: params.userFeedback,
          success: params.success,
          responseTime: params.responseTime,
          confidence: params.confidence,
          collaborationRequests: params.collaborationRequests || [],
          followUpTasks: params.followUpTasks || [],
          metadata: params.metadata || {}
        })
        return NextResponse.json({ success: true, interactionId })

      case 'update-rating':
        await dataCollector.updateInteractionRating(
          params.interactionId,
          params.rating,
          params.feedback
        )
        return NextResponse.json({ success: true })

      case 'create-fine-tuning-job':
        if (!agentId) {
          return NextResponse.json({ error: 'Agent ID required' }, { status: 400 })
        }
        const job = await pipeline.createFineTuningJob(agentId, userId, params.parameters)
        return NextResponse.json({ success: true, job })

      case 'export-data':
        const format = params.format || 'json'
        const data = await dataCollector.exportTrainingData(userId, format)
        return NextResponse.json({ success: true, data, format })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    logError('Training API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
