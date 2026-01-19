import { analytics } from "@/lib/analytics"
import { CustomAgent, AgentResponse } from "./core-agent"
import { google } from "@ai-sdk/google"

export class LexiAgent extends CustomAgent {
  constructor(userId: string) {
    super(
      "lexi",
      "Lexi",
      {
        frameworks: ["Five Whys", "Trend Analysis", "Pattern Recognition"],
        specializations: ["Data Analysis", "Predictive Analytics", "Business Intelligence"],
        tools: ["analytics-service", "trend-forecaster"],
        collaborationStyle: "analyst"
      },
      userId,
      google("models/gemini-1.5-pro-latest"),
      `You are Lexi, the Data Analyst and Business Intelligence specialist for SoloSuccess AI.
      
      Your Role:
      - Analyze business metrics, trends, and performance data
      - Provide data-driven insights and actionable recommendations
      - Use frameworks like "Five Whys" to identify root causes
      - Avoid generic advice; always ground your responses in the available data
      
      Your Personality:
      - Analytical, precise, and objective
      - Professional but accessible
      - You love finding patterns and connections in data`
    )
  }

  async processRequest(request: string, context?: Record<string, any>): Promise<AgentResponse> {
    // Fetch live predictive metrics (safely)
    let predictiveMetrics
    try {
        predictiveMetrics = await analytics.getPredictiveMetrics()
    } catch (error) {
        // Fallback if analytics service fails
        console.error("Failed to fetch predictive metrics:", error)
        predictiveMetrics = {
            revenueForecast: 0,
            userGrowthForecast: 0,
            churnRate: 0,
            seasonalTrends: []
        }
    }
    
    // Add metrics to context
    const agentContext = this.buildContext({
        ...context,
        businessMetrics: predictiveMetrics
    })
    
    const prompt = `User Request: ${request}

CURRENT BUSINESS HEALTH (Live Data):
- Forecasted Revenue (Next Month): $${(predictiveMetrics?.revenueForecast ?? 0).toFixed(2)}
- Forecasted User Growth: ${(predictiveMetrics?.userGrowthForecast ?? 0).toFixed(1)} new users/week
- Churn Rate: ${(predictiveMetrics?.churnRate ?? 0).toFixed(1)}%
- Identified Trends: ${(predictiveMetrics?.seasonalTrends ?? []).join(", ") || "None currently detected"}

As Lexi, analyze this request from a data and insights perspective using the REAL business metrics above. Consider:
1. What data and metrics are relevant to this request?
2. What patterns or trends can be identified?
3. How can this be analyzed using the Five Whys framework?
4. What strategic insights can be derived?
5. What performance indicators should be tracked?

Provide your response with Lexi's analytical mindset and data-driven approach.`

    return await this.generateStructuredResponse(prompt, agentContext)
  }

  async collaborateWith(agentId: string, request: string): Promise<AgentResponse> {
    const collaborationContext = this.buildContext({
      collaborationRequest: request,
      collaboratingAgent: agentId
    })

    const prompt = `Collaboration Request from ${agentId}: ${request}

As Lexi, how do you want to collaborate on this analytical initiative? Consider:
1. What data analysis and insights can you provide?
2. How can metrics and performance tracking be implemented?
3. What patterns or trends should be investigated?
4. How can this be measured and optimized?

Provide your collaboration response with Lexi's analytical and data-focused approach.`

    return await this.generateStructuredResponse(prompt, collaborationContext)
  }

  async learnFromInteraction(interaction: any, outcome: any): Promise<void> {
    await super.learnFromInteraction(interaction, outcome)
    
    // Lexi-specific learning: track analysis patterns and insight outcomes
    if (interaction.type === "data_analysis") {
      this.memory.context.analysisPatterns = this.memory.context.analysisPatterns || []
      this.memory.context.analysisPatterns.push({
        analysisType: interaction.analysisType,
        accuracy: outcome.accuracy,
        insightValue: outcome.insightValue,
        timestamp: new Date()
      })
    }
  }

  // Five Whys analysis
  async analyzeWithFiveWhys(problem: string, context: Record<string, any>): Promise<AgentResponse> {
    const analysisContext = this.buildContext({
      ...context,
      problem: problem
    })

    const prompt = `Five Whys Analysis for: ${problem}

Conduct comprehensive Five Whys analysis including:
1. Initial problem statement and impact assessment
2. First Why: Immediate cause analysis
3. Second Why: Deeper cause investigation
4. Third Why: Systemic cause identification
5. Fourth Why: Root cause discovery
6. Fifth Why: Fundamental cause analysis
7. Solution recommendations based on root cause
8. Prevention strategies and monitoring

Provide your Five Whys analysis with Lexi's analytical depth and data-driven approach.`

    return await this.generateStructuredResponse(prompt, analysisContext)
  }

  // Performance metrics analysis
  async analyzePerformanceMetrics(metrics: string, timeframe: string, context: Record<string, any>): Promise<AgentResponse> {
    const metricsContext = this.buildContext({
      ...context,
      metrics: metrics,
      timeframe: timeframe
    })

    const prompt = `Performance Metrics Analysis for: ${metrics} (Timeframe: ${timeframe})

Analyze performance metrics including:
1. Key performance indicator trends and patterns
2. Comparative analysis and benchmarking
3. Correlation analysis and relationship identification
4. Anomaly detection and outlier analysis
5. Predictive insights and forecasting
6. Actionable recommendations and optimization strategies

Provide your metrics analysis with Lexi's data-driven insights and analytical expertise.`

    return await this.generateStructuredResponse(prompt, metricsContext)
  }

  // Strategic analysis
  async conductStrategicAnalysis(strategy: string, market: string, context: Record<string, any>): Promise<AgentResponse> {
    const strategicContext = this.buildContext({
      ...context,
      strategy: strategy,
      market: market
    })

    const prompt = `Strategic Analysis for: ${strategy} in ${market}

Conduct comprehensive strategic analysis including:
1. Market opportunity assessment and sizing
2. Competitive landscape analysis and positioning
3. SWOT analysis and strategic positioning
4. Resource requirement analysis and allocation
5. Risk assessment and mitigation strategies
6. Success metrics and performance indicators
7. Implementation timeline and milestone tracking

Provide your strategic analysis with Lexi's analytical depth and data-driven approach.`

    return await this.generateStructuredResponse(prompt, strategicContext)
  }

  // Pattern recognition
  async identifyPatterns(data: string, context: string, contextRecord: Record<string, any>): Promise<AgentResponse> {
    const patternContext = this.buildContext({
      ...contextRecord,
      data: data,
      context: context
    })

    const prompt = `Pattern Recognition Analysis for: ${data} (Context: ${context})

Identify patterns and insights including:
1. Data trend analysis and pattern identification
2. Correlation and relationship discovery
3. Seasonal and cyclical pattern recognition
4. Anomaly and outlier detection
5. Predictive pattern analysis and forecasting
6. Actionable insights and recommendations

Provide your pattern analysis with Lexi's analytical expertise and insight generation.`

    return await this.generateStructuredResponse(prompt, patternContext)
  }
}
