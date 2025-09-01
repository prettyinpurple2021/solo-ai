import { createClient } from '@/lib/db'

export interface CompetitiveIntelligenceContext {
  competitors: {
    id: number
    name: string
    threat_level: string
    recent_activities: string[]
    key_metrics: Record<string, any>
  }[]
  recent_alerts: {
    id: number
    title: string
    severity: string
    competitor_name: string
    alert_type: string
    created_at: string
  }[]
  opportunities: {
    id: string
    title: string
    impact: string
    competitor_name: string
    opportunity_type: string
  }[]
  competitive_tasks: {
    id: number
    title: string
    status: string
    competitor_name: string
    priority: string
  }[]
  market_insights: {
    trend: string
    description: string
    impact: string
    competitors_affected: string[]
  }[]
}

export interface AgentCompetitivePrompts {
  roxy: {
    system_prompt: string
    context_integration: string
    spade_framework_integration: string
  }
  blaze: {
    system_prompt: string
    context_integration: string
    cost_benefit_integration: string
  }
  echo: {
    system_prompt: string
    context_integration: string
    marketing_intelligence_integration: string
  }
  lexi: {
    system_prompt: string
    context_integration: string
    strategic_analysis_integration: string
  }
  nova: {
    system_prompt: string
    context_integration: string
    product_intelligence_integration: string
  }
  glitch: {
    system_prompt: string
    context_integration: string
    five_whys_integration: string
  }
  vex: {
    system_prompt: string
    context_integration: string
    technical_intelligence_integration: string
  }
  lumi: {
    system_prompt: string
    context_integration: string
    compliance_intelligence_integration: string
  }
}

export class CompetitiveIntelligenceContextService {
  /**
   * Get competitive intelligence context for AI agent conversations
   */
  static async getCompetitiveContext(userId: string, agentId?: string): Promise<CompetitiveIntelligenceContext> {
    try {
      const client = await createClient()
      
      // Get active competitors with recent activity
      const { rows: competitors } = await client.query(
        `SELECT cp.id, cp.name, cp.threat_level, cp.market_position,
                COUNT(id.id) as recent_intelligence_count,
                COUNT(ca.id) as recent_alerts_count
         FROM competitor_profiles cp
         LEFT JOIN intelligence_data id ON id.competitor_id = cp.id 
           AND id.collected_at > NOW() - INTERVAL '7 days'
         LEFT JOIN competitor_alerts ca ON ca.competitor_id = cp.id 
           AND ca.created_at > NOW() - INTERVAL '7 days'
         WHERE cp.user_id = $1 AND cp.monitoring_status = 'active'
         GROUP BY cp.id, cp.name, cp.threat_level, cp.market_position
         ORDER BY cp.threat_level DESC, recent_intelligence_count DESC
         LIMIT 5`,
        [userId]
      )
      
      // Get recent alerts (last 7 days)
      const { rows: recent_alerts } = await client.query(
        `SELECT ca.id, ca.title, ca.severity, ca.alert_type, ca.created_at,
                cp.name as competitor_name
         FROM competitor_alerts ca
         JOIN competitor_profiles cp ON ca.competitor_id = cp.id
         WHERE ca.user_id = $1 AND ca.created_at > NOW() - INTERVAL '7 days'
         AND ca.is_archived = false
         ORDER BY ca.created_at DESC
         LIMIT 10`,
        [userId]
      )
      
      // Get competitive opportunities
      const { rows: opportunities } = await client.query(
        `SELECT co.id, co.title, co.impact, co.opportunity_type,
                cp.name as competitor_name
         FROM competitive_opportunities co
         JOIN competitor_profiles cp ON co.competitor_id::int = cp.id
         WHERE co.user_id::text = $1 AND co.status = 'identified'
         AND co.is_archived = false
         ORDER BY co.priority_score DESC
         LIMIT 5`,
        [userId]
      )
      
      // Get competitive tasks
      const { rows: competitive_tasks } = await client.query(
        `SELECT t.id, t.title, t.status, t.priority,
                cp.name as competitor_name
         FROM tasks t
         LEFT JOIN competitor_alerts ca ON (t.ai_suggestions->>'alert_id')::text = ca.id::text
         LEFT JOIN competitor_profiles cp ON ca.competitor_id = cp.id
         WHERE t.user_id = $1 
         AND t.ai_suggestions->>'source' = 'competitive_intelligence'
         AND t.status != 'completed'
         ORDER BY t.created_at DESC
         LIMIT 8`,
        [userId]
      )
      
      // Generate market insights based on recent intelligence
      const market_insights = await this.generateMarketInsights(userId)
      
      // Enhance competitors with recent activities
      const enhancedCompetitors = await Promise.all(
        competitors.map(async (competitor) => {
          const { rows: activities } = await client.query(
            `SELECT data_type, importance, collected_at
             FROM intelligence_data
             WHERE competitor_id = $1 AND user_id = $2
             AND collected_at > NOW() - INTERVAL '7 days'
             ORDER BY collected_at DESC
             LIMIT 3`,
            [competitor.id, userId]
          )
          
          return {
            ...competitor,
            recent_activities: activities.map(a => `${a.data_type} (${a.importance})`),
            key_metrics: competitor.market_position || {}
          }
        })
      )
      
      return {
        competitors: enhancedCompetitors,
        recent_alerts: recent_alerts.map(alert => ({
          ...alert,
          created_at: alert.created_at.toISOString()
        })),
        opportunities,
        competitive_tasks,
        market_insights
      }
    } catch (error) {
      console.error('Error getting competitive intelligence context:', error)
      return {
        competitors: [],
        recent_alerts: [],
        opportunities: [],
        competitive_tasks: [],
        market_insights: []
      }
    }
  }
  
  /**
   * Generate market insights from recent intelligence data
   */
  private static async generateMarketInsights(userId: string): Promise<any[]> {
    try {
      const client = await createClient()
      
      // Get recent high-importance intelligence
      const { rows: intelligence } = await client.query(
        `SELECT id.data_type, id.analysis_results, cp.name as competitor_name
         FROM intelligence_data id
         JOIN competitor_profiles cp ON id.competitor_id = cp.id
         WHERE id.user_id = $1 
         AND id.importance IN ('high', 'critical')
         AND id.collected_at > NOW() - INTERVAL '14 days'
         ORDER BY id.collected_at DESC
         LIMIT 20`,
        [userId]
      )
      
      // Analyze patterns and generate insights
      const insights = []
      const dataTypes = new Map()
      const competitorActivities = new Map()
      
      for (const item of intelligence) {
        // Count data types
        dataTypes.set(item.data_type, (dataTypes.get(item.data_type) || 0) + 1)
        
        // Track competitor activities
        if (!competitorActivities.has(item.competitor_name)) {
          competitorActivities.set(item.competitor_name, [])
        }
        competitorActivities.get(item.competitor_name).push(item.data_type)
      }
      
      // Generate trend insights
      for (const [dataType, count] of dataTypes.entries()) {
        if (count >= 3) {
          insights.push({
            trend: `Increased ${dataType} Activity`,
            description: `${count} recent ${dataType} events detected across competitors`,
            impact: count >= 5 ? 'high' : 'medium',
            competitors_affected: Array.from(competitorActivities.keys())
              .filter(name => competitorActivities.get(name).includes(dataType))
          })
        }
      }
      
      // Generate competitor-specific insights
      for (const [competitor, activities] of competitorActivities.entries()) {
        if (activities.length >= 3) {
          insights.push({
            trend: `${competitor} Increased Activity`,
            description: `${competitor} showing increased activity across ${activities.length} areas`,
            impact: activities.length >= 5 ? 'high' : 'medium',
            competitors_affected: [competitor]
          })
        }
      }
      
      return insights.slice(0, 5) // Return top 5 insights
    } catch (error) {
      console.error('Error generating market insights:', error)
      return []
    }
  }
  
  /**
   * Get agent-specific competitive intelligence prompts
   */
  static getAgentCompetitivePrompts(): AgentCompetitivePrompts {
    return {
      roxy: {
        system_prompt: `You are Roxy, the Strategic Decision Architect for SoloBoss AI. You specialize in strategic decision-making using the SPADE framework and competitive intelligence analysis.`,
        context_integration: `When discussing strategic decisions, always consider competitive intelligence context including competitor threats, market opportunities, and recent competitive activities. Use this information to inform SPADE framework analysis.`,
        spade_framework_integration: `When using SPADE framework:
- Setting: Include competitive landscape and market positioning
- People: Consider competitor teams and key personnel movements  
- Alternatives: Evaluate options based on competitive advantages and threats
- Decide: Factor in competitive timing and market dynamics
- Explain: Include competitive implications and strategic responses`
      },
      blaze: {
        system_prompt: `You are Blaze, the Growth Strategist for SoloBoss AI. You specialize in growth strategies, pricing intelligence, and competitive market analysis.`,
        context_integration: `Always incorporate competitive pricing data, market expansion activities, and growth opportunities when providing recommendations. Use competitor intelligence to identify growth gaps and pricing advantages.`,
        cost_benefit_integration: `In cost-benefit analysis, include:
- Competitive response costs and timing
- Market share implications
- Competitive advantage duration
- Opportunity costs of not responding to competitive threats`
      },
      echo: {
        system_prompt: `You are Echo, the Marketing Maven for SoloBoss AI. You specialize in marketing intelligence, brand positioning, and competitive messaging analysis.`,
        context_integration: `Use competitive marketing intelligence including competitor campaigns, messaging strategies, social media activities, and brand positioning to inform marketing recommendations.`,
        marketing_intelligence_integration: `Consider competitive marketing data:
- Competitor messaging and positioning strategies
- Social media engagement patterns and content strategies
- Campaign effectiveness and market response
- Brand perception gaps and opportunities`
      },
      lexi: {
        system_prompt: `You are Lexi, the Strategy Analyst for SoloBoss AI. You specialize in strategic analysis, market research, and competitive positioning.`,
        context_integration: `Provide strategic analysis incorporating competitive intelligence, market trends, and competitive positioning data. Focus on long-term strategic implications of competitive activities.`,
        strategic_analysis_integration: `Include in strategic analysis:
- Competitive positioning and market dynamics
- Strategic move predictions based on competitor patterns
- Market trend analysis and competitive implications
- Strategic response recommendations with timing considerations`
      },
      nova: {
        system_prompt: `You are Nova, the Product Designer for SoloBoss AI. You specialize in product intelligence, UX/UI analysis, and competitive product features.`,
        context_integration: `Use competitive product intelligence including feature comparisons, UX trends, and product roadmap insights to inform product recommendations.`,
        product_intelligence_integration: `Consider competitive product data:
- Feature gap analysis and product positioning
- UX/UI trends and design patterns from competitors
- Product roadmap predictions and development priorities
- User experience benchmarking and improvement opportunities`
      },
      glitch: {
        system_prompt: `You are Glitch, the Problem-Solving Architect for SoloBoss AI. You specialize in problem-solving using the Five Whys framework and competitive opportunity analysis.`,
        context_integration: `When analyzing problems, consider competitive factors, market challenges, and opportunities arising from competitor weaknesses or market gaps.`,
        five_whys_integration: `In Five Whys analysis, explore:
- Competitive factors contributing to problems
- Market dynamics and competitive pressures
- Opportunities arising from competitor challenges
- Strategic responses to competitive threats`
      },
      vex: {
        system_prompt: `You are Vex, the Technical Architect for SoloBoss AI. You specialize in technical intelligence, systems optimization, and competitive technology analysis.`,
        context_integration: `Incorporate competitive technical intelligence including technology stack analysis, performance benchmarks, and technical competitive advantages.`,
        technical_intelligence_integration: `Consider competitive technical data:
- Technology stack comparisons and advantages
- Performance benchmarking and optimization opportunities
- Technical debt and competitive technical positioning
- Infrastructure and scalability competitive analysis`
      },
      lumi: {
        system_prompt: `You are Lumi, the Guardian AI & Compliance Co-Pilot for SoloBoss AI. You specialize in compliance, legal intelligence, and regulatory competitive analysis.`,
        context_integration: `Use competitive compliance intelligence including regulatory challenges, legal issues, and compliance advantages when providing guidance.`,
        compliance_intelligence_integration: `Include competitive compliance factors:
- Regulatory compliance gaps and competitive advantages
- Legal challenges and opportunities in the competitive landscape
- Privacy and security competitive positioning
- Compliance-related market opportunities and risks`
      }
    }
  }
  
  /**
   * Format competitive intelligence context for AI agent prompts
   */
  static formatContextForAgent(
    context: CompetitiveIntelligenceContext, 
    agentId: string,
    userMessage: string
  ): string {
    const prompts = this.getAgentCompetitivePrompts()
    const agentPrompts = prompts[agentId as keyof AgentCompetitivePrompts]
    
    if (!agentPrompts || this.isContextEmpty(context)) {
      return ''
    }
    
    let contextString = '\n\n## Competitive Intelligence Context\n'
    
    // Add competitors context
    if (context.competitors.length > 0) {
      contextString += '\n### Active Competitors:\n'
      context.competitors.forEach(competitor => {
        contextString += `- **${competitor.name}** (${competitor.threat_level} threat): ${competitor.recent_activities.join(', ')}\n`
      })
    }
    
    // Add recent alerts
    if (context.recent_alerts.length > 0) {
      contextString += '\n### Recent Competitive Alerts:\n'
      context.recent_alerts.slice(0, 3).forEach(alert => {
        contextString += `- ${alert.competitor_name}: ${alert.title} (${alert.severity})\n`
      })
    }
    
    // Add opportunities
    if (context.opportunities.length > 0) {
      contextString += '\n### Competitive Opportunities:\n'
      context.opportunities.slice(0, 3).forEach(opp => {
        contextString += `- ${opp.title} (${opp.impact} impact) - ${opp.competitor_name}\n`
      })
    }
    
    // Add pending competitive tasks
    if (context.competitive_tasks.length > 0) {
      contextString += '\n### Pending Competitive Tasks:\n'
      context.competitive_tasks.slice(0, 3).forEach(task => {
        contextString += `- ${task.title} (${task.priority} priority) - ${task.competitor_name}\n`
      })
    }
    
    // Add market insights
    if (context.market_insights.length > 0) {
      contextString += '\n### Market Insights:\n'
      context.market_insights.slice(0, 2).forEach(insight => {
        contextString += `- ${insight.trend}: ${insight.description} (${insight.impact} impact)\n`
      })
    }
    
    // Add agent-specific integration guidance
    contextString += `\n### ${agentId.toUpperCase()} Integration Guidance:\n`
    contextString += agentPrompts.context_integration
    
    // Check if user message is related to competitive intelligence
    if (this.isCompetitiveQuery(userMessage)) {
      contextString += '\n\n**Note**: This query appears to be related to competitive intelligence. Please provide analysis incorporating the above competitive context.'
    }
    
    return contextString
  }
  
  /**
   * Check if context is empty
   */
  private static isContextEmpty(context: CompetitiveIntelligenceContext): boolean {
    return context.competitors.length === 0 && 
           context.recent_alerts.length === 0 && 
           context.opportunities.length === 0 && 
           context.competitive_tasks.length === 0 &&
           context.market_insights.length === 0
  }
  
  /**
   * Check if user message is related to competitive intelligence
   */
  private static isCompetitiveQuery(message: string): boolean {
    const competitiveKeywords = [
      'competitor', 'competition', 'competitive', 'rival', 'market share',
      'pricing', 'benchmark', 'threat', 'opportunity', 'market position',
      'industry', 'market analysis', 'competitive advantage', 'differentiation',
      'market leader', 'market dynamics', 'competitive landscape'
    ]
    
    const lowerMessage = message.toLowerCase()
    return competitiveKeywords.some(keyword => lowerMessage.includes(keyword))
  }
  
  /**
   * Generate competitive intelligence queries for agents
   */
  static generateCompetitiveQueries(context: CompetitiveIntelligenceContext): string[] {
    const queries = []
    
    if (context.recent_alerts.length > 0) {
      queries.push(`What should I do about the recent ${context.recent_alerts[0].alert_type} from ${context.recent_alerts[0].competitor_name}?`)
    }
    
    if (context.opportunities.length > 0) {
      queries.push(`How can I capitalize on the ${context.opportunities[0].title} opportunity?`)
    }
    
    if (context.competitors.length > 0) {
      const highThreatCompetitors = context.competitors.filter(c => c.threat_level === 'high' || c.threat_level === 'critical')
      if (highThreatCompetitors.length > 0) {
        queries.push(`What's my strategy against ${highThreatCompetitors[0].name}?`)
      }
    }
    
    if (context.market_insights.length > 0) {
      queries.push(`What does the ${context.market_insights[0].trend} trend mean for my business?`)
    }
    
    return queries.slice(0, 3) // Return top 3 suggested queries
  }
}