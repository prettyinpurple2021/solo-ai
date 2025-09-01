import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { CompetitiveIntelligenceContextService } from '@/lib/competitive-intelligence-context'
import { z } from 'zod'

// GET /api/competitive-intelligence/chat-context - Get competitive intelligence context for chat
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const agentId = searchParams.get('agent_id')

    // Get competitive intelligence context
    const context = await CompetitiveIntelligenceContextService.getCompetitiveContext(user.id, agentId || undefined)
    
    // Generate suggested competitive queries
    const suggestedQueries = CompetitiveIntelligenceContextService.generateCompetitiveQueries(context)
    
    // Get agent-specific prompts
    const agentPrompts = CompetitiveIntelligenceContextService.getAgentCompetitivePrompts()
    
    return NextResponse.json({ 
      context,
      suggested_queries: suggestedQueries,
      agent_prompts: agentId ? agentPrompts[agentId as keyof typeof agentPrompts] : null,
      has_competitive_data: context.competitors.length > 0 || 
                           context.recent_alerts.length > 0 || 
                           context.opportunities.length > 0
    })
  } catch (error) {
    console.error('Error fetching competitive intelligence chat context:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competitive intelligence context' },
      { status: 500 }
    )
  }
}

// POST /api/competitive-intelligence/chat-context - Analyze message for competitive intelligence relevance
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('competitive-chat-analysis', ip, 60_000, 50)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()
    const BodySchema = z.object({
      message: z.string().min(1),
      agent_id: z.string().optional()
    })

    const { message, agent_id } = BodySchema.parse(body)

    // Get competitive intelligence context
    const context = await CompetitiveIntelligenceContextService.getCompetitiveContext(user.id, agent_id)
    
    // Format context for the specific agent and message
    const formattedContext = CompetitiveIntelligenceContextService.formatContextForAgent(
      context, 
      agent_id || 'general', 
      message
    )
    
    // Analyze if the message is competitive intelligence related
    const isCompetitiveQuery = this.isCompetitiveIntelligenceQuery(message)
    
    // Get relevant competitive data based on message content
    const relevantData = this.extractRelevantCompetitiveData(message, context)
    
    return NextResponse.json({
      is_competitive_query: isCompetitiveQuery,
      formatted_context: formattedContext,
      relevant_data: relevantData,
      context_summary: this.generateContextSummary(context)
    })
  } catch (error) {
    console.error('Error analyzing competitive intelligence context:', error)
    return NextResponse.json(
      { error: 'Failed to analyze competitive intelligence context' },
      { status: 500 }
    )
  }
}

/**
 * Check if message is related to competitive intelligence
 */
function isCompetitiveIntelligenceQuery(message: string): boolean {
  const competitiveKeywords = [
    'competitor', 'competition', 'competitive', 'rival', 'market share',
    'pricing', 'benchmark', 'threat', 'opportunity', 'market position',
    'industry', 'market analysis', 'competitive advantage', 'differentiation',
    'market leader', 'market dynamics', 'competitive landscape', 'versus',
    'compare', 'against', 'better than', 'outperform', 'beat'
  ]
  
  const lowerMessage = message.toLowerCase()
  return competitiveKeywords.some(keyword => lowerMessage.includes(keyword))
}

/**
 * Extract relevant competitive data based on message content
 */
function extractRelevantCompetitiveData(message: string, context: any): any {
  const lowerMessage = message.toLowerCase()
  const relevantData: any = {
    competitors: [],
    alerts: [],
    opportunities: [],
    tasks: []
  }
  
  // Find mentioned competitors
  for (const competitor of context.competitors) {
    if (lowerMessage.includes(competitor.name.toLowerCase())) {
      relevantData.competitors.push(competitor)
    }
  }
  
  // Find relevant alerts based on keywords
  if (lowerMessage.includes('alert') || lowerMessage.includes('news') || lowerMessage.includes('update')) {
    relevantData.alerts = context.recent_alerts.slice(0, 3)
  }
  
  // Find relevant opportunities based on keywords
  if (lowerMessage.includes('opportunity') || lowerMessage.includes('gap') || lowerMessage.includes('advantage')) {
    relevantData.opportunities = context.opportunities.slice(0, 3)
  }
  
  // Find relevant tasks based on keywords
  if (lowerMessage.includes('task') || lowerMessage.includes('todo') || lowerMessage.includes('action')) {
    relevantData.tasks = context.competitive_tasks.slice(0, 3)
  }
  
  return relevantData
}

/**
 * Generate a summary of competitive intelligence context
 */
function generateContextSummary(context: any): string {
  const parts = []
  
  if (context.competitors.length > 0) {
    const highThreatCount = context.competitors.filter((c: any) => c.threat_level === 'high' || c.threat_level === 'critical').length
    parts.push(`${context.competitors.length} active competitors (${highThreatCount} high threat)`)
  }
  
  if (context.recent_alerts.length > 0) {
    const urgentAlerts = context.recent_alerts.filter((a: any) => a.severity === 'urgent' || a.severity === 'critical').length
    parts.push(`${context.recent_alerts.length} recent alerts (${urgentAlerts} urgent)`)
  }
  
  if (context.opportunities.length > 0) {
    const highImpactOpps = context.opportunities.filter((o: any) => o.impact === 'high').length
    parts.push(`${context.opportunities.length} opportunities (${highImpactOpps} high impact)`)
  }
  
  if (context.competitive_tasks.length > 0) {
    const highPriorityTasks = context.competitive_tasks.filter((t: any) => t.priority === 'high' || t.priority === 'critical').length
    parts.push(`${context.competitive_tasks.length} competitive tasks (${highPriorityTasks} high priority)`)
  }
  
  return parts.length > 0 ? parts.join(', ') : 'No competitive intelligence data available'
}