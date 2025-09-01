import { CompetitiveIntelligenceContextService, CompetitiveIntelligenceContext } from './competitive-intelligence-context'

export interface SPADEFrameworkWithCompetitiveIntelligence {
  setting: {
    business_context: string
    competitive_landscape: string
    market_dynamics: string
    threat_assessment: string
  }
  people: {
    internal_stakeholders: string[]
    competitor_key_personnel: string[]
    market_influencers: string[]
    decision_makers: string[]
  }
  alternatives: {
    option: string
    competitive_implications: string
    market_response_likelihood: string
    competitive_advantages: string[]
    risks: string[]
  }[]
  decide: {
    chosen_alternative: string
    competitive_rationale: string
    timing_considerations: string
    competitive_response_plan: string
  }
  explain: {
    decision_summary: string
    competitive_impact: string
    success_metrics: string[]
    monitoring_plan: string
  }
}

export interface FiveWhysWithCompetitiveIntelligence {
  problem_statement: string
  competitive_context: string
  analysis: {
    why_level: number
    question: string
    answer: string
    competitive_factors: string[]
    market_implications: string
  }[]
  root_cause: string
  competitive_opportunities: string[]
  action_plan: {
    action: string
    competitive_advantage: string
    timeline: string
    success_metrics: string[]
  }[]
}

export interface CostBenefitAnalysisWithCompetitiveIntelligence {
  decision_context: string
  competitive_scenario: string
  costs: {
    category: string
    amount: number
    competitive_response_cost: number
    opportunity_cost: number
    description: string
  }[]
  benefits: {
    category: string
    amount: number
    competitive_advantage_value: number
    market_share_impact: number
    description: string
  }[]
  competitive_analysis: {
    competitor_likely_response: string
    response_timeline: string
    counter_strategy_cost: number
    market_impact: string
  }
  recommendation: {
    decision: 'proceed' | 'modify' | 'delay' | 'abandon'
    rationale: string
    competitive_timing: string
    risk_mitigation: string[]
  }
}

export class CompetitiveDecisionFrameworks {
  /**
   * Generate SPADE framework analysis with competitive intelligence
   */
  static async generateSPADEWithCompetitiveIntelligence(
    userId: string,
    decisionContext: string,
    alternatives: string[]
  ): Promise<SPADEFrameworkWithCompetitiveIntelligence> {
    const competitiveContext = await CompetitiveIntelligenceContextService.getCompetitiveContext(userId)
    
    return {
      setting: {
        business_context: decisionContext,
        competitive_landscape: this.generateCompetitiveLandscapeDescription(competitiveContext),
        market_dynamics: this.generateMarketDynamicsDescription(competitiveContext),
        threat_assessment: this.generateThreatAssessment(competitiveContext)
      },
      people: {
        internal_stakeholders: ['CEO/Founder', 'Product Team', 'Marketing Team', 'Sales Team'],
        competitor_key_personnel: this.extractCompetitorPersonnel(competitiveContext),
        market_influencers: ['Industry Analysts', 'Key Customers', 'Media', 'Investors'],
        decision_makers: ['CEO/Founder', 'Board Members', 'Key Advisors']
      },
      alternatives: alternatives.map(alt => ({
        option: alt,
        competitive_implications: this.analyzeCompetitiveImplications(alt, competitiveContext),
        market_response_likelihood: this.assessMarketResponseLikelihood(alt, competitiveContext),
        competitive_advantages: this.identifyCompetitiveAdvantages(alt, competitiveContext),
        risks: this.identifyCompetitiveRisks(alt, competitiveContext)
      })),
      decide: {
        chosen_alternative: alternatives[0] || 'To be determined',
        competitive_rationale: 'Analysis based on competitive intelligence and market positioning',
        timing_considerations: this.generateTimingConsiderations(competitiveContext),
        competitive_response_plan: this.generateCompetitiveResponsePlan(competitiveContext)
      },
      explain: {
        decision_summary: 'Decision made considering competitive landscape and market dynamics',
        competitive_impact: this.assessCompetitiveImpact(competitiveContext),
        success_metrics: this.generateCompetitiveSuccessMetrics(competitiveContext),
        monitoring_plan: this.generateCompetitiveMonitoringPlan(competitiveContext)
      }
    }
  }
  
  /**
   * Generate Five Whys analysis with competitive intelligence
   */
  static async generateFiveWhysWithCompetitiveIntelligence(
    userId: string,
    problemStatement: string
  ): Promise<FiveWhysWithCompetitiveIntelligence> {
    const competitiveContext = await CompetitiveIntelligenceContextService.getCompetitiveContext(userId)
    
    const whyQuestions = [
      'Why is this problem occurring?',
      'Why is that the case?',
      'Why does that underlying issue exist?',
      'Why hasn\'t this been addressed before?',
      'Why do these root conditions persist?'
    ]
    
    return {
      problem_statement: problemStatement,
      competitive_context: this.generateCompetitiveProblemContext(problemStatement, competitiveContext),
      analysis: whyQuestions.map((question, index) => ({
        why_level: index + 1,
        question,
        answer: `Analysis level ${index + 1} - Consider competitive factors and market dynamics`,
        competitive_factors: this.identifyCompetitiveFactors(problemStatement, competitiveContext, index + 1),
        market_implications: this.analyzeMarketImplications(problemStatement, competitiveContext, index + 1)
      })),
      root_cause: 'Root cause analysis incorporating competitive intelligence factors',
      competitive_opportunities: this.identifyOpportunitiesFromProblem(problemStatement, competitiveContext),
      action_plan: this.generateCompetitiveActionPlan(problemStatement, competitiveContext)
    }
  }
  
  /**
   * Generate cost-benefit analysis with competitive intelligence
   */
  static async generateCostBenefitWithCompetitiveIntelligence(
    userId: string,
    decisionContext: string,
    estimatedCosts: { category: string; amount: number; description: string }[],
    estimatedBenefits: { category: string; amount: number; description: string }[]
  ): Promise<CostBenefitAnalysisWithCompetitiveIntelligence> {
    const competitiveContext = await CompetitiveIntelligenceContextService.getCompetitiveContext(userId)
    
    return {
      decision_context: decisionContext,
      competitive_scenario: this.generateCompetitiveScenario(decisionContext, competitiveContext),
      costs: estimatedCosts.map(cost => ({
        ...cost,
        competitive_response_cost: cost.amount * 0.2, // Estimate 20% additional cost for competitive response
        opportunity_cost: this.calculateOpportunityCost(cost, competitiveContext)
      })),
      benefits: estimatedBenefits.map(benefit => ({
        ...benefit,
        competitive_advantage_value: this.calculateCompetitiveAdvantageValue(benefit, competitiveContext),
        market_share_impact: this.calculateMarketShareImpact(benefit, competitiveContext)
      })),
      competitive_analysis: {
        competitor_likely_response: this.predictCompetitorResponse(decisionContext, competitiveContext),
        response_timeline: this.estimateResponseTimeline(competitiveContext),
        counter_strategy_cost: this.estimateCounterStrategyCost(estimatedCosts, competitiveContext),
        market_impact: this.assessMarketImpact(decisionContext, competitiveContext)
      },
      recommendation: this.generateCompetitiveRecommendation(
        estimatedCosts, 
        estimatedBenefits, 
        competitiveContext
      )
    }
  }
  
  // Helper methods for SPADE framework
  private static generateCompetitiveLandscapeDescription(context: CompetitiveIntelligenceContext): string {
    if (context.competitors.length === 0) {
      return 'No active competitors currently monitored'
    }
    
    const highThreatCompetitors = context.competitors.filter(c => c.threat_level === 'high' || c.threat_level === 'critical')
    return `${context.competitors.length} active competitors monitored, ${highThreatCompetitors.length} pose high/critical threats. Key players: ${context.competitors.slice(0, 3).map(c => c.name).join(', ')}`
  }
  
  private static generateMarketDynamicsDescription(context: CompetitiveIntelligenceContext): string {
    if (context.market_insights.length === 0) {
      return 'Market dynamics analysis pending - insufficient competitive intelligence data'
    }
    
    return `Current market trends: ${context.market_insights.map(insight => insight.trend).join(', ')}. ${context.recent_alerts.length} recent competitive activities detected.`
  }
  
  private static generateThreatAssessment(context: CompetitiveIntelligenceContext): string {
    const criticalThreats = context.competitors.filter(c => c.threat_level === 'critical').length
    const highThreats = context.competitors.filter(c => c.threat_level === 'high').length
    const urgentAlerts = context.recent_alerts.filter(a => a.severity === 'urgent' || a.severity === 'critical').length
    
    return `Threat Level: ${criticalThreats} critical, ${highThreats} high threats. ${urgentAlerts} urgent competitive alerts requiring immediate attention.`
  }
  
  private static extractCompetitorPersonnel(context: CompetitiveIntelligenceContext): string[] {
    // In a real implementation, this would extract key personnel from competitor profiles
    return context.competitors.slice(0, 3).map(c => `${c.name} Leadership Team`)
  }
  
  private static analyzeCompetitiveImplications(alternative: string, context: CompetitiveIntelligenceContext): string {
    return `Competitive implications of "${alternative}": May trigger responses from ${context.competitors.length} monitored competitors, particularly those with high threat levels.`
  }
  
  private static assessMarketResponseLikelihood(alternative: string, context: CompetitiveIntelligenceContext): string {
    const recentActivity = context.recent_alerts.length
    return recentActivity > 5 ? 'High likelihood of competitive response' : 'Moderate likelihood of competitive response'
  }
  
  private static identifyCompetitiveAdvantages(alternative: string, context: CompetitiveIntelligenceContext): string[] {
    return [
      'First-mover advantage in market segment',
      'Differentiation from current competitor offerings',
      'Potential to exploit competitor weaknesses'
    ]
  }
  
  private static identifyCompetitiveRisks(alternative: string, context: CompetitiveIntelligenceContext): string[] {
    return [
      'Competitor retaliation and price wars',
      'Market saturation from competitor responses',
      'Resource drain from competitive battles'
    ]
  }
  
  private static generateTimingConsiderations(context: CompetitiveIntelligenceContext): string {
    const recentAlerts = context.recent_alerts.length
    return recentAlerts > 3 ? 
      'Consider timing carefully due to high competitive activity' : 
      'Market timing appears favorable with moderate competitive activity'
  }
  
  private static generateCompetitiveResponsePlan(context: CompetitiveIntelligenceContext): string {
    return `Monitor ${context.competitors.length} competitors for responses. Prepare counter-strategies for high-threat competitors. Leverage ${context.opportunities.length} identified opportunities.`
  }
  
  private static assessCompetitiveImpact(context: CompetitiveIntelligenceContext): string {
    return `Expected to impact competitive positioning against ${context.competitors.length} monitored competitors, with potential to capitalize on ${context.opportunities.length} market opportunities.`
  }
  
  private static generateCompetitiveSuccessMetrics(context: CompetitiveIntelligenceContext): string[] {
    return [
      'Market share gain vs key competitors',
      'Competitive response time and intensity',
      'Customer acquisition from competitor weaknesses',
      'Competitive advantage sustainability'
    ]
  }
  
  private static generateCompetitiveMonitoringPlan(context: CompetitiveIntelligenceContext): string {
    return `Continuous monitoring of ${context.competitors.length} competitors through automated intelligence gathering. Weekly competitive analysis reports. Real-time alerts for critical competitive moves.`
  }
  
  // Helper methods for Five Whys framework
  private static generateCompetitiveProblemContext(problem: string, context: CompetitiveIntelligenceContext): string {
    return `Problem occurs in competitive environment with ${context.competitors.length} active competitors. Recent competitive activities: ${context.recent_alerts.length} alerts, ${context.opportunities.length} opportunities identified.`
  }
  
  private static identifyCompetitiveFactors(problem: string, context: CompetitiveIntelligenceContext, level: number): string[] {
    const factors = [
      'Competitor pricing strategies',
      'Market positioning conflicts',
      'Resource allocation vs competitors',
      'Technology gaps vs competition',
      'Customer acquisition competition'
    ]
    return factors.slice(0, Math.min(3, level))
  }
  
  private static analyzeMarketImplications(problem: string, context: CompetitiveIntelligenceContext, level: number): string {
    return `Level ${level} market implications: Consider impact on competitive positioning and market share dynamics.`
  }
  
  private static identifyOpportunitiesFromProblem(problem: string, context: CompetitiveIntelligenceContext): string[] {
    return [
      'Exploit competitor weaknesses revealed by problem',
      'Differentiate solution approach from competitors',
      'Capture market share during competitor struggles'
    ]
  }
  
  private static generateCompetitiveActionPlan(problem: string, context: CompetitiveIntelligenceContext): any[] {
    return [
      {
        action: 'Analyze competitor approaches to similar problems',
        competitive_advantage: 'Learn from competitor mistakes and successes',
        timeline: '1-2 weeks',
        success_metrics: ['Competitive analysis completion', 'Differentiation strategy development']
      },
      {
        action: 'Implement solution with competitive differentiation',
        competitive_advantage: 'Unique approach vs competitor solutions',
        timeline: '4-6 weeks',
        success_metrics: ['Solution implementation', 'Competitive advantage measurement']
      }
    ]
  }
  
  // Helper methods for Cost-Benefit Analysis
  private static generateCompetitiveScenario(decision: string, context: CompetitiveIntelligenceContext): string {
    return `Decision made in competitive environment with ${context.competitors.length} active competitors. ${context.recent_alerts.length} recent competitive moves may influence outcomes.`
  }
  
  private static calculateOpportunityCost(cost: any, context: CompetitiveIntelligenceContext): number {
    // Estimate opportunity cost based on competitive pressure
    const competitivePressure = context.competitors.filter(c => c.threat_level === 'high' || c.threat_level === 'critical').length
    return cost.amount * (competitivePressure * 0.1) // 10% per high-threat competitor
  }
  
  private static calculateCompetitiveAdvantageValue(benefit: any, context: CompetitiveIntelligenceContext): number {
    // Estimate additional value from competitive advantage
    const opportunities = context.opportunities.filter(o => o.impact === 'high').length
    return benefit.amount * (opportunities * 0.15) // 15% bonus per high-impact opportunity
  }
  
  private static calculateMarketShareImpact(benefit: any, context: CompetitiveIntelligenceContext): number {
    // Estimate market share impact
    return benefit.amount * 0.05 // 5% of benefit value as market share impact
  }
  
  private static predictCompetitorResponse(decision: string, context: CompetitiveIntelligenceContext): string {
    const highThreatCompetitors = context.competitors.filter(c => c.threat_level === 'high' || c.threat_level === 'critical')
    return highThreatCompetitors.length > 0 ? 
      'Aggressive competitive response expected from high-threat competitors' :
      'Moderate competitive response anticipated'
  }
  
  private static estimateResponseTimeline(context: CompetitiveIntelligenceContext): string {
    const recentActivity = context.recent_alerts.length
    return recentActivity > 5 ? '2-4 weeks' : '4-8 weeks'
  }
  
  private static estimateCounterStrategyCost(costs: any[], context: CompetitiveIntelligenceContext): number {
    const totalCosts = costs.reduce((sum, cost) => sum + cost.amount, 0)
    const competitivePressure = context.competitors.filter(c => c.threat_level === 'high' || c.threat_level === 'critical').length
    return totalCosts * (competitivePressure * 0.2) // 20% of costs per high-threat competitor
  }
  
  private static assessMarketImpact(decision: string, context: CompetitiveIntelligenceContext): string {
    return `Expected market impact: Moderate to high, depending on competitive responses from ${context.competitors.length} monitored competitors.`
  }
  
  private static generateCompetitiveRecommendation(
    costs: any[], 
    benefits: any[], 
    context: CompetitiveIntelligenceContext
  ): any {
    const totalCosts = costs.reduce((sum, cost) => sum + cost.amount, 0)
    const totalBenefits = benefits.reduce((sum, benefit) => sum + benefit.amount, 0)
    const netBenefit = totalBenefits - totalCosts
    
    const highThreatCompetitors = context.competitors.filter(c => c.threat_level === 'high' || c.threat_level === 'critical').length
    
    if (netBenefit > 0 && highThreatCompetitors < 2) {
      return {
        decision: 'proceed' as const,
        rationale: 'Positive ROI with manageable competitive risk',
        competitive_timing: 'Proceed quickly to establish first-mover advantage',
        risk_mitigation: ['Monitor competitor responses closely', 'Prepare defensive strategies']
      }
    } else if (netBenefit > 0 && highThreatCompetitors >= 2) {
      return {
        decision: 'modify' as const,
        rationale: 'Positive ROI but high competitive risk requires strategy modification',
        competitive_timing: 'Modify approach to reduce competitive exposure',
        risk_mitigation: ['Develop stealth launch strategy', 'Build competitive moats', 'Prepare for price competition']
      }
    } else {
      return {
        decision: 'delay' as const,
        rationale: 'Negative ROI or excessive competitive risk',
        competitive_timing: 'Wait for better competitive conditions',
        risk_mitigation: ['Improve competitive positioning', 'Reduce costs', 'Find differentiation opportunities']
      }
    }
  }
}