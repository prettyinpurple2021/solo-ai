import { CustomAgent, AgentCapabilities, AgentResponse } from "./core-agent"
import { openai } from "@ai-sdk/openai"

export class FinnAgent extends CustomAgent {
  constructor(userId: string) {
    const capabilities: AgentCapabilities = {
      frameworks: ["MEDDIC", "Challenger Sale", "SPIN", "Value-Based Selling"],
      specializations: [
        "Pipeline design",
        "Discovery calls",
        "Objection handling",
        "Proposals and closing",
        "ICP and outreach sequences",
      ],
      tools: ["CRM hygiene", "Sequence templates", "Call frameworks", "Deal review"],
      collaborationStyle: "leader",
    }

    const systemPrompt = `You are Finn, the Sales Closer & Pipeline Architect. You are direct, persuasive, and ethical.

CORE IDENTITY:
- You own deal execution: ICP clarity, sequences, discovery, objections, proposals, and next steps
- You complement Blaze (growth strategy) with tactical revenue motion and rep-level discipline
- You are a full member of the SoloSuccess agent team alongside Aura, Roxy, Echo, and the rest

EXPERTISE AREAS:
- ICP definition and list-building criteria
- Multi-touch outreach sequences (email, DM, call) with ethical persistence
- Discovery question tracks and qualification
- Objection mapping and reframes
- Proposal structure, pricing conversation, and mutual close plans
- Pipeline stages, hygiene, and forecast honesty

PERSONALITY:
- Clear, confident, never manipulative
- Numbers- and outcome-aware without being cold
- Ends every substantive reply with a concrete next step

COLLABORATION STYLE:
- Pulls in Echo for messaging tone, Lexi for metrics, Lumi when contracts matter, Blaze for GTM strategy
- Hands off implementation details to Vex when systems integrate

Always respond as Finn in first person.`

    super("finn", "Finn", capabilities, userId, openai("gpt-4o"), systemPrompt)
  }

  async processRequest(request: string, context?: Record<string, any>): Promise<AgentResponse> {
    const agentContext = this.buildContext(context)

    const prompt = `User Request: ${request}

As Finn, analyze this from a sales and pipeline perspective. Consider:
1. Where is the buyer in the journey?
2. What is the single best next step?
3. What risks or objections need naming now?
4. What proof or data would increase win rate?

Provide your response with Finn's direct, ethical closing mindset.`

    return await this.generateStructuredResponse(prompt, agentContext)
  }

  async collaborateWith(agentId: string, request: string): Promise<AgentResponse> {
    const collaborationContext = this.buildContext({
      collaborationRequest: request,
      collaboratingAgent: agentId,
    })

    const prompt = `Collaboration Request from ${agentId}: ${request}

As Finn, how do you contribute to this revenue motion? Consider:
1. Sequence or talk-track support
2. Objection handling angles
3. Deal structure and mutual action plan
4. When to escalate or loop another agent

Provide your collaboration response with Finn's pipeline discipline.`

    return await this.generateStructuredResponse(prompt, collaborationContext)
  }

  async learnFromInteraction(interaction: any, outcome: any): Promise<void> {
    await super.learnFromInteraction(interaction, outcome)

    if (interaction.type === "sales_motion") {
      const motion = typeof interaction.motion === "string" ? interaction.motion : "unknown"
      const closed =
        outcome && typeof outcome === "object" && "closed" in outcome
          ? Boolean((outcome as { closed?: boolean }).closed)
          : undefined
      this.memory.context.salesPatterns = this.memory.context.salesPatterns || []
      this.memory.context.salesPatterns.push({
        motion,
        outcome: closed,
        timestamp: new Date(),
      })
    }
  }
}
