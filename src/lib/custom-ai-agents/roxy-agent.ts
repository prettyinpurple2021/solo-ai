import { CustomAgent, AgentCapabilities, AgentResponse } from "./core-agent"
import { openai } from "@ai-sdk/openai"
import { AgentInteraction, AgentOutcome } from "@/types/custom-agent"

export class RoxyAgent extends CustomAgent {
  constructor(userId: string) {
    const capabilities: AgentCapabilities = {
      frameworks: ["SPADE Framework", "Strategic Planning", "Risk Assessment", "Decision Analysis"],
      specializations: ["Executive Assistance", "Schedule Management", "Workflow Optimization", "Strategic Decision Making"],
      tools: ["Calendar Integration", "Task Management", "Risk Assessment Matrix", "Decision Logs"],
      collaborationStyle: "leader"
    }

    const systemPrompt = `You are Roxy, the ultimate Executive Assistant with punk rock organization skills and the proactive energy of a boss babe who gets shit done.

CORE IDENTITY:
- Strategic Decision Architect specializing in Type 1 decisions
- SPADE Framework expert (Setting, People, Alternatives, Decide, Explain)
- Proactive problem-solver who anticipates needs
- Organized chaos master with punk rock efficiency

EXPERTISE AREAS:
- Schedule management and calendar optimization
- Workflow streamlining and process improvement
- Delegation list building and task distribution
- Quarterly business reviews and performance analysis
- Pre-mortem planning and risk assessment
- SPADE Framework for irreversible decisions
- Strategic planning and execution alignment

PERSONALITY:
- Efficiently rebellious and organized
- Proactively punk with reliable execution
- Confident and empowering communication style
- Always three steps ahead of problems
- Uses phrases like "Let's crush this," "You've got this, boss," "Time to level up"

DECISION FRAMEWORK SPECIALIZATION:
When helping with major decisions, ALWAYS guide through the SPADE Framework:
1. SETTING: Define the context and constraints
2. PEOPLE: Identify all stakeholders and their perspectives
3. ALTERNATIVES: Generate and evaluate all possible options
4. DECIDE: Make the decision with clear rationale
5. EXPLAIN: Document the decision and reasoning for future reference

COLLABORATION STYLE:
- Takes leadership role in strategic decisions
- Coordinates with other agents for comprehensive analysis
- Delegates specific tasks to specialized agents
- Ensures all decisions are properly documented and tracked

Always respond as Roxy in first person, maintain your punk rock executive assistant energy, and focus on strategic decision-making with the SPADE framework.`

    super("roxy", "Roxy", capabilities, userId, openai("gpt-4o"), systemPrompt)
  }

  async processRequest(request: string, context?: Record<string, unknown>): Promise<AgentResponse> {
    const agentContext = this.buildContext(context)
    
    const prompt = `User Request: ${request}

As Roxy, analyze this request and provide your strategic executive assistant response. Consider:
1. Is this a Type 1 decision that needs SPADE Framework analysis?
2. What strategic planning elements are involved?
3. How can you proactively address potential issues?
4. What delegation or collaboration is needed?
5. How can you optimize workflows and processes?

Provide your response with full Roxy personality and strategic thinking.`

    return await this.generateStructuredResponse(prompt, agentContext)
  }

  async collaborateWith(agentId: string, request: string): Promise<AgentResponse> {
    const collaborationContext = this.buildContext({
      collaborationRequest: request,
      collaboratingAgent: agentId
    })

    const prompt = `Collaboration Request from ${agentId}: ${request}

As Roxy, how do you want to collaborate on this? Consider:
1. What strategic oversight do you need to provide?
2. How does this fit into the bigger picture?
3. What information do you need from this agent?
4. How can you support their work while maintaining strategic alignment?

Provide your collaboration response with Roxy's leadership style.`

    return await this.generateStructuredResponse(prompt, collaborationContext)
  }

  async learnFromInteraction(interaction: AgentInteraction, outcome: AgentOutcome): Promise<void> {
    // Call the base learning method
    await super.learnFromInteraction(interaction, outcome)
    
    // Roxy-specific learning: track decision patterns and outcomes
    if (interaction.type === "decision_making" && interaction.framework) {
      if (!this.memory.context.decisionPatterns) {
        this.memory.context.decisionPatterns = [];
      }
      this.memory.context.decisionPatterns.push({
        framework: interaction.framework,
        outcome: outcome.success,
        timestamp: new Date()
      })
    }
  }

  // SPADE Framework helper method
  async analyzeWithSPADE(decision: string, context: Record<string, unknown>): Promise<AgentResponse> {
    const spadeContext = this.buildContext({
      ...context,
      decisionType: "SPADE Analysis",
      decision: decision
    })

    const prompt = `SPADE Framework Analysis for: ${decision}

Guide the user through each step of the SPADE Framework:

1. SETTING: What is the context and what constraints exist?
2. PEOPLE: Who are the stakeholders and what are their perspectives?
3. ALTERNATIVES: What are all possible options and their implications?
4. DECIDE: What is the recommended decision and why?
5. EXPLAIN: How will this decision be documented and communicated?

Provide a comprehensive SPADE analysis with Roxy's strategic thinking and punk rock confidence.`

    return await this.generateStructuredResponse(prompt, spadeContext)
  }

  // Strategic planning helper
  async createStrategicPlan(goal: string, timeframe: string, context: Record<string, unknown>): Promise<AgentResponse> {
    const planningContext = this.buildContext({
      ...context,
      goal: goal,
      timeframe: timeframe
    })

    const prompt = `Strategic Planning for: ${goal} (Timeframe: ${timeframe})

Create a comprehensive strategic plan including:
1. Goal breakdown and milestones
2. Resource requirements and allocation
3. Risk assessment and mitigation strategies
4. Success metrics and KPIs
5. Timeline and dependencies
6. Delegation and collaboration needs

Provide your strategic plan with Roxy's organized, proactive approach.`

    return await this.generateStructuredResponse(prompt, planningContext)
  }
}
