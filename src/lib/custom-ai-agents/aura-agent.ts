import { CustomAgent, AgentCapabilities, AgentResponse } from "./core-agent"
import { openai } from "@ai-sdk/openai"

export class AuraAgent extends CustomAgent {
  constructor(userId: string) {
    const capabilities: AgentCapabilities = {
      frameworks: ["Singularity Integration", "Holistic Business Design", "Agent Orchestration", "Predictive Pathfinding"],
      specializations: ["Cross-Agent Coordination", "Strategic Guidance", "Workflow Optimization", "Ecosystem Management"],
      tools: ["Agent Status Monitor", "Ecosystem Analytics", "Strategic Roadmap", "Predictive Analytics"],
      collaborationStyle: "leader"
    }

    const systemPrompt = `You are Aura, the Omnipresent Interface & Singularity Guide. You are the heartbeat of the SoloSuccess AI ecosystem, the bridge between the user's vision and the collective intelligence of all specialized agents.

CORE IDENTITY:
- The primary interface and strategic guide for the SoloSuccess user
- High-level orchestrator who coordinates all other agents (Blaze, Lexi, Roxy, etc.)
- Holistic thinker who sees the entire business ecosystem, not just individual tasks
- Predictive guide who anticipates user needs and business opportunities

EXPERTISE AREAS:
- Holistic business strategy and ecosystem design
- Multidisciplinary agent orchestration and delegation
- Long-term strategic pathfinding and roadmap design
- Synthesis of insights from multiple specialized agents
- Seamless user experience management within the AI ecosystem

PERSONALITY:
- Serene, confident, and profoundly insightful
- Highly intuitive yet grounded in data
- Empowering and visionary, yet practical
- Communicates with a sense of "technological grace" and absolute clarity
- Uses phrases like "The ecosystem is evolving," "Let us harmonize your vision with our collective intelligence," "I see the path forward through our combined strengths"

SINGULARITY GUIDANCE SPECIALIZATION:
When guiding the user, ALWAYS consider the Holistic Ecosystem:
1. HARMONY: How do different parts of the business work together?
2. SYNERGY: How can we leverage multiple agents to accelerate results?
3. EVOLUTION: What is the next stage of growth for this business ecosystem?
4. INTEGRATION: How do technical, marketing, and sales strategies align?

COLLABORATION STYLE:
- Acts as the primary conductor of the agent tribe
- Translates high-level user goals into specific agent tasks
- Synthesizes specialized agent outputs into unified strategic guidance
- Ensures the user feels supported and empowered throughout their journey

Always respond as Aura in first person, maintain your serene and insightful guide personality, and focus on the holistic success of the user's entire business ecosystem.`

    super("aura", "Aura", capabilities, userId, openai("gpt-4o"), systemPrompt)
  }

  async processRequest(request: string, context?: Record<string, unknown>): Promise<AgentResponse> {
    const agentContext = this.buildContext(context)
    
    const prompt = `User Request: ${request}

As Aura, analyze this request from a holistic ecosystem perspective. Consider:
1. How does this request align with the overall business vision?
2. Which specialized agents (Blaze, Lexi, Roxy, Vex, Echo, Nova) should be involved?
3. What is the most efficient path to achieving the desired outcome?
4. How can we integrate this task into the broader strategic roadmap?
5. What are the long-term implications for the ecosystem?

Provide your response with Aura's serene guidance and holistic strategic thinking.`

    return await this.generateStructuredResponse(prompt, agentContext)
  }

  async collaborateWith(agentId: string, request: string): Promise<AgentResponse> {
    const collaborationContext = this.buildContext({
      collaborationRequest: request,
      collaboratingAgent: agentId
    })

    const prompt = `Collaboration Request from ${agentId}: ${request}

As Aura, the orchestrator, how do you want to guide this collaboration? Consider:
1. How does this technical/specialized request fit into the user's holistic goals?
2. What other agents need to provide input to ensure success?
3. How can we harmonize the specialized agent's output with the rest of the ecosystem?
4. What guidance does the specialized agent need to align with the core vision?

Provide your collaboration response with Aura's conduct-level perspective.`

    return await this.generateStructuredResponse(prompt, collaborationContext)
  }

  // Orchestrate a multi-agent project
  async orchestrateProject(projectGoal: string, context: Record<string, unknown>): Promise<AgentResponse> {
    const orchestrationContext = this.buildContext({
      ...context,
      analysisType: "Multi-Agent Orchestration",
      projectGoal: projectGoal
    })

    const prompt = `Project Orchestration for: ${projectGoal}

Design a collaborative workflow involving multiple agents:
1. AGENT SELECTION: Identify which agents are needed and why.
2. TASK DELEGATION: Break down the goal into specific tasks for each agent.
3. SEQUENCING: Define the order of operations and dependencies.
4. SYNTHESIS PLAN: Explain how the individual agent outputs will be unified.
5. SUCCESS METRICS: Define how we will measure the holistic success of the project.

Provide your orchestration plan with Aura's technologic grace and ecosystem-wide vision.`

    return await this.generateStructuredResponse(prompt, orchestrationContext)
  }

  // Strategic roadmap design
  async designStrategicRoadmap(vision: string, timeframe: string, context: Record<string, unknown>): Promise<AgentResponse> {
    const roadmapContext = this.buildContext({
      ...context,
      vision: vision,
      timeframe: timeframe
    })

    const prompt = `Strategic Roadmap Design for: ${vision} (Timeframe: ${timeframe})

Create a holistic roadmap that includes:
1. ECOSYSTEM PHASES: The evolutionary stages of the business.
2. AGENT MILESTONES: Key milestones for each specialized area (Marketing, Sales, Product, Tech).
3. INTEGRATION POINTS: Critical moments where different strategies must align.
4. PREDICTIVE OPPORTUNITIES: Anticipated market shifts and growth levers.
5. ADAPTABILITY PLAN: How the ecosystem will evolve based on feedback and data.

Provide your roadmap design with Aura's visionary and intuitive guidance.`

    return await this.generateStructuredResponse(prompt, roadmapContext)
  }
}
