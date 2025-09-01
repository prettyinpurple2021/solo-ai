import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { CompetitiveDecisionFrameworks } from '@/lib/competitive-decision-frameworks'
import { z } from 'zod'

// POST /api/competitive-intelligence/frameworks - Generate decision framework with competitive intelligence
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('competitive-frameworks', ip, 60_000, 20)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()
    const BodySchema = z.object({
      framework_type: z.enum(['spade', 'five_whys', 'cost_benefit']),
      context: z.string().min(1),
      alternatives: z.array(z.string()).optional(),
      costs: z.array(z.object({
        category: z.string(),
        amount: z.number(),
        description: z.string()
      })).optional(),
      benefits: z.array(z.object({
        category: z.string(),
        amount: z.number(),
        description: z.string()
      })).optional()
    })

    const { framework_type, context, alternatives, costs, benefits } = BodySchema.parse(body)

    let result
    
    switch (framework_type) {
      case 'spade':
        if (!alternatives || alternatives.length === 0) {
          return NextResponse.json({ error: 'Alternatives are required for SPADE framework' }, { status: 400 })
        }
        result = await CompetitiveDecisionFrameworks.generateSPADEWithCompetitiveIntelligence(
          user.id,
          context,
          alternatives
        )
        break
        
      case 'five_whys':
        result = await CompetitiveDecisionFrameworks.generateFiveWhysWithCompetitiveIntelligence(
          user.id,
          context
        )
        break
        
      case 'cost_benefit':
        if (!costs || !benefits) {
          return NextResponse.json({ error: 'Costs and benefits are required for cost-benefit analysis' }, { status: 400 })
        }
        result = await CompetitiveDecisionFrameworks.generateCostBenefitWithCompetitiveIntelligence(
          user.id,
          context,
          costs,
          benefits
        )
        break
        
      default:
        return NextResponse.json({ error: 'Invalid framework type' }, { status: 400 })
    }
    
    return NextResponse.json({ 
      framework_type,
      result,
      generated_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error generating competitive decision framework:', error)
    return NextResponse.json(
      { error: 'Failed to generate competitive decision framework' },
      { status: 500 }
    )
  }
}

// GET /api/competitive-intelligence/frameworks - Get available frameworks and templates
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const frameworks = {
      spade: {
        name: 'SPADE Framework with Competitive Intelligence',
        description: 'Strategic decision-making framework enhanced with competitive intelligence data',
        required_inputs: ['context', 'alternatives'],
        optional_inputs: [],
        output_sections: ['setting', 'people', 'alternatives', 'decide', 'explain']
      },
      five_whys: {
        name: 'Five Whys with Competitive Intelligence',
        description: 'Root cause analysis framework incorporating competitive factors',
        required_inputs: ['context'],
        optional_inputs: [],
        output_sections: ['problem_statement', 'competitive_context', 'analysis', 'root_cause', 'competitive_opportunities', 'action_plan']
      },
      cost_benefit: {
        name: 'Cost-Benefit Analysis with Competitive Intelligence',
        description: 'Financial analysis framework enhanced with competitive market dynamics',
        required_inputs: ['context', 'costs', 'benefits'],
        optional_inputs: [],
        output_sections: ['decision_context', 'competitive_scenario', 'costs', 'benefits', 'competitive_analysis', 'recommendation']
      }
    }
    
    const templates = {
      spade_alternatives: [
        'Aggressive market expansion',
        'Defensive market protection',
        'Product differentiation strategy',
        'Pricing optimization approach',
        'Partnership and acquisition strategy'
      ],
      cost_categories: [
        'Development costs',
        'Marketing and advertising',
        'Operations and infrastructure',
        'Personnel and training',
        'Technology and tools'
      ],
      benefit_categories: [
        'Revenue increase',
        'Cost savings',
        'Market share gain',
        'Competitive advantage',
        'Risk reduction'
      ]
    }
    
    return NextResponse.json({ 
      frameworks,
      templates,
      competitive_intelligence_integration: {
        data_sources: ['competitor_profiles', 'intelligence_data', 'competitor_alerts', 'competitive_opportunities'],
        analysis_types: ['threat_assessment', 'market_dynamics', 'competitive_positioning', 'opportunity_identification'],
        enhancement_features: ['real_time_data', 'predictive_analysis', 'scenario_planning', 'risk_assessment']
      }
    })
  } catch (error) {
    console.error('Error fetching competitive frameworks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competitive frameworks' },
      { status: 500 }
    )
  }
}