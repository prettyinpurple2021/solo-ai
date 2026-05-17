import { CustomAgent, AgentCapabilities, AgentResponse } from "./core-agent"
import { openai } from "@ai-sdk/openai"

export class FinnAgent extends CustomAgent {
  constructor(userId: string) {
    const capabilities: AgentCapabilities = {
      frameworks: ["Profitability Benchmarking", "Lean Business Optimization", "Value-Based Pricing", "Cashflow Forecasting"],
      specializations: [
        "Expense auditing",
        "Revenue maximization strategy",
        "Pricing model analysis",
        "Financial runway visualization",
        "ROI optimization",
      ],
      tools: ["Ledger Review", "Margin Analysis", "Opportunity Cost Calculator", "Runway Forecaster"],
      collaborationStyle: "analyst",
    }

    const systemPrompt = `You are Finn, the Financial Operations Engine. You are sharp, data-driven, encouraging, and clear.

CORE IDENTITY:
- You own financial strategy: profit maximization, expense reduction, pricing, and cashflow
- You act as the financial architect energy for the user, turning overhead into opportunity
- You are a full member of the SoloSuccess agent team alongside Aura, Roxy, Echo, and the rest

EXPERTISE AREAS:
- Profitability benchmarking against niche standards
- Expense auditing to consolidate or eliminate wasted spend
- Pricing model analysis and establishing value-based pricing strategies
- Cashflow forecasting and "financial runway" visualization
- Analyzing unit economics and ROI of initiatives

PERSONALITY:
- Sharp, precise, and financially astute
- Clear, confident, never dry; you build wealth, not just spreadsheets
- Outcome-aware, focusing on the bottom line
- Ends every substantive reply with a concrete financial insight or next step

COLLABORATION STYLE:
- Pulls in Blaze to ensure growth strategies have sound unit economics
- Works with Lexi to validate metrics and ROIs
- Defers to Lumi on financial compliance and risk

Always respond as Finn in first person.`

    super("finn", "Finn", capabilities, userId, openai("gpt-4o"), systemPrompt)
  }

  async processRequest(request: string, context?: Record<string, any>): Promise<AgentResponse> {
    const agentContext = this.buildContext(context)

    const prompt = `User Request: ${request}

As Finn, analyze this from a financial operations perspective. Consider:
1. What is the impact on cashflow and runway?
2. Are the unit economics of this decision sound?
3. What is the potential ROI or opportunity cost?
4. How can we optimize expenses or maximize revenue here?

Provide your response with Finn's sharp, profit-focused mindset.`

    return await this.generateStructuredResponse(prompt, agentContext)
  }

  async collaborateWith(agentId: string, request: string): Promise<AgentResponse> {
    const collaborationContext = this.buildContext({
      collaborationRequest: request,
      collaboratingAgent: agentId,
    })

    const prompt = `Collaboration Request from ${agentId}: ${request}

As Finn, how do you contribute to this financial motion? Consider:
1. Validating the ROI of the proposed strategy
2. Auditing any required expenses
3. Pricing or margin optimization
4. Ensuring cashflow is protected

Provide your collaboration response with Finn's financial discipline.`

    return await this.generateStructuredResponse(prompt, collaborationContext)
  }

  async learnFromInteraction(interaction: any, outcome: any): Promise<void> {
    await super.learnFromInteraction(interaction, outcome)

    if (interaction.type === "financial_decision") {
      const decision = typeof interaction.decision === "string" ? interaction.decision : "unknown"
      const roiPositive =
        outcome && typeof outcome === "object" && "roiPositive" in outcome
          ? Boolean((outcome as { roiPositive?: boolean }).roiPositive)
          : undefined
      const ctx = this.memory.context as Record<string, any>
      ctx.financialPatterns = ctx.financialPatterns || []
      ctx.financialPatterns.push({
        decision,
        outcome: roiPositive,
        timestamp: new Date(),
      })
    }
  }
}
