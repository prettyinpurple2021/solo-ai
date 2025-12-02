import { generateText } from "ai"
import { getTeamMemberConfig } from "./ai-config"

export interface CollaborationTask {
  id: string
  title: string
  description: string
  requiredAgents: string[]
  currentPhase: string
  phases: CollaborationPhase[]
  status: "planning" | "in-progress" | "review" | "completed"
  createdAt: string
  updatedAt: string
}

export interface CollaborationPhase {
  id: string
  name: string
  description: string
  assignedAgent: string
  status: "pending" | "in-progress" | "completed"
  input?: string
  output?: string
  dependencies?: string[]
}

export interface AgentHandoff {
  fromAgent: string
  toAgent: string
  context: string
  deliverables: string[]
  instructions: string
}

// Predefined collaboration workflows
export const collaborationWorkflows = {
  "product-launch": {
    title: "Complete Product Launch",
    description: "End-to-end product launch with marketing, legal, and technical coordination",
    phases: [
      { name: "Market Research", agent: "lexi", description: "Analyze market opportunity and competition" },
      { name: "Technical Planning", agent: "vex", description: "Define technical requirements and architecture" },
      { name: "Legal Review", agent: "lumi", description: "Ensure compliance and create necessary documents" },
      { name: "Marketing Strategy", agent: "echo", description: "Develop comprehensive marketing campaign" },
      { name: "Design & UX", agent: "nova", description: "Create user-friendly design and experience" },
      { name: "Sales Strategy", agent: "blaze", description: "Build sales funnel and pricing strategy" },
      { name: "Quality Assurance", agent: "glitch", description: "Test and optimize all systems" },
      { name: "Launch Coordination", agent: "roxy", description: "Coordinate timeline and manage execution" },
    ],
  },
  "business-strategy": {
    title: "Comprehensive Business Strategy",
    description: "Strategic business planning with financial, marketing, and operational analysis",
    phases: [
      {
        name: "Current State Analysis",
        agent: "lexi",
        description: "Analyze current business performance and metrics",
      },
      {
        name: "Market Opportunity",
        agent: "blaze",
        description: "Identify growth opportunities and market positioning",
      },
      { name: "Financial Planning", agent: "roxy", description: "Create financial projections and budget planning" },
      { name: "Marketing Roadmap", agent: "echo", description: "Develop marketing strategy and brand positioning" },
      { name: "Operational Efficiency", agent: "vex", description: "Optimize processes and technology stack" },
      { name: "Risk Assessment", agent: "lumi", description: "Identify legal and compliance risks" },
      { name: "Implementation Plan", agent: "roxy", description: "Create detailed execution timeline" },
    ],
  },
  "website-redesign": {
    title: "Website Redesign Project",
    description: "Complete website overhaul with design, development, and marketing integration",
    phases: [
      { name: "User Research", agent: "nova", description: "Analyze user behavior and design requirements" },
      { name: "Technical Architecture", agent: "vex", description: "Plan technical implementation and infrastructure" },
      { name: "Content Strategy", agent: "echo", description: "Develop content strategy and SEO optimization" },
      { name: "Design System", agent: "nova", description: "Create comprehensive design system and wireframes" },
      { name: "Development Planning", agent: "vex", description: "Create development roadmap and specifications" },
      { name: "Quality Testing", agent: "glitch", description: "Comprehensive testing and optimization" },
      { name: "Launch Strategy", agent: "blaze", description: "Plan launch campaign and conversion optimization" },
      { name: "Project Management", agent: "roxy", description: "Coordinate timeline and deliverables" },
    ],
  },
}

export class AgentCollaborationManager {
  async createCollaborationTask(
    workflowType: keyof typeof collaborationWorkflows,
    customization?: Partial<CollaborationTask>,
  ): Promise<CollaborationTask> {
    const workflow = collaborationWorkflows[workflowType]
    const taskId = `collab_${Date.now()}`

    const phases: CollaborationPhase[] = workflow.phases.map((phase, index) => ({
      id: `phase_${index}`,
      name: phase.name,
      description: phase.description,
      assignedAgent: phase.agent,
      status: index === 0 ? "in-progress" : "pending",
      dependencies: index > 0 ? [`phase_${index - 1}`] : undefined,
    }))

    return {
      id: taskId,
      title: customization?.title || workflow.title,
      description: customization?.description || workflow.description,
      requiredAgents: Array.from(new Set(workflow.phases.map((p) => p.agent))),
      currentPhase: phases[0].id,
      phases,
      status: "in-progress",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...customization,
    }
  }

  async executePhase(
    task: CollaborationTask,
    phaseId: string,
    userInput: string,
    previousOutputs: Record<string, string> = {},
  ): Promise<{ output: string; handoff?: AgentHandoff }> {
    const phase = task.phases.find((p) => p.id === phaseId)
    if (!phase) throw new Error("Phase not found")

    const agentConfig = getTeamMemberConfig(phase.assignedAgent)

    // Build context from previous phases
    const context = this.buildCollaborationContext(task, phaseId, previousOutputs)

    const collaborationPrompt = `
${agentConfig.systemPrompt}

COLLABORATION CONTEXT:
You are working on a multi-agent collaboration task: "${task.title}"
Current Phase: ${phase.name} - ${phase.description}

Previous work completed by other team members:
${context}

User Request: ${userInput}

COLLABORATION INSTRUCTIONS:
1. Build upon the work done by previous team members
2. Reference specific insights or deliverables from previous phases when relevant
3. Provide clear, actionable output that the next team member can build upon
4. If you need clarification or additional input from another team member, mention it
5. End your response with a brief handoff note for the next phase if applicable

Provide your analysis and recommendations for this phase of the project.
`

    const { text } = await generateText({
      // Cast to any to support both LanguageModelV1 and V2 at runtime
      model: agentConfig.model as any,
      prompt: collaborationPrompt,
      temperature: 0.7,
      maxOutputTokens: 800,
    })

    // Generate handoff if there's a next phase
    const nextPhase = this.getNextPhase(task, phaseId)
    let handoff: AgentHandoff | undefined

    if (nextPhase) {
      handoff = await this.generateHandoff(phase.assignedAgent, nextPhase.assignedAgent, text, task)
    }

    return { output: text, handoff }
  }

  private buildCollaborationContext(
    task: CollaborationTask,
    currentPhaseId: string,
    previousOutputs: Record<string, string>,
  ): string {
    const currentPhaseIndex = task.phases.findIndex((p) => p.id === currentPhaseId)
    const completedPhases = task.phases.slice(0, currentPhaseIndex)

    if (completedPhases.length === 0) {
      return "This is the first phase of the collaboration."
    }

    return completedPhases
      .map((phase) => {
        const output = previousOutputs[phase.id] || "No output available"
        return `${phase.assignedAgent.toUpperCase()} (${phase.name}): ${output}`
      })
      .join("\n\n")
  }

  private getNextPhase(task: CollaborationTask, currentPhaseId: string): CollaborationPhase | undefined {
    const currentIndex = task.phases.findIndex((p) => p.id === currentPhaseId)
    return currentIndex < task.phases.length - 1 ? task.phases[currentIndex + 1] : undefined
  }

  private async generateHandoff(
    fromAgent: string,
    toAgent: string,
    context: string,
    task: CollaborationTask,
  ): Promise<AgentHandoff> {
    const fromConfig = getTeamMemberConfig(fromAgent)
    // const toConfig = getTeamMemberConfig(toAgent) // Reserved for future use

    const handoffPrompt = `
You are ${fromAgent} completing your phase of the collaboration task "${task.title}".

Your completed work: ${context}

Generate a professional handoff to ${toAgent} that includes:
1. Key deliverables and insights from your work
2. Specific recommendations for their phase
3. Any dependencies or requirements they should be aware of
4. Questions or areas where they should focus

Keep it concise but comprehensive. Format as a professional handoff note.
`

    const { text } = await generateText({
      model: fromConfig.model as any,
      prompt: handoffPrompt,
      temperature: 0.6,
      maxOutputTokens: 300,
    })

    return {
      fromAgent,
      toAgent,
      context: text,
      deliverables: [], // Could be extracted from the text
      instructions: text,
    }
  }

  async suggestCollaboration(userQuery: string): Promise<{
    recommended: boolean
    workflow?: keyof typeof collaborationWorkflows
    agents: string[]
    reasoning: string
  }> {
    const analysisPrompt = `
Analyze this user request and determine if it would benefit from multi-agent collaboration:

User Request: "${userQuery}"

Available collaboration workflows:
- product-launch: Complete product launch coordination
- business-strategy: Comprehensive business planning
- website-redesign: Full website overhaul project

Available agents: roxy, blaze, echo, lumi, vex, lexi, nova, glitch

Respond with:
1. Whether this needs collaboration (true/false)
2. Which workflow fits best (if any)
3. Which agents should be involved
4. Brief reasoning

Format as JSON: {"recommended": boolean, "workflow": string|null, "agents": string[], "reasoning": string}
`

    const { text } = await generateText({
      model: getTeamMemberConfig("lexi").model as any,
      prompt: analysisPrompt,
      temperature: 0.3,
      maxOutputTokens: 200,
    })

    try {
      return JSON.parse(text)
    } catch {
      return {
        recommended: false,
        agents: [],
        reasoning: "Could not analyze collaboration requirements",
      }
    }
  }
}

export const collaborationManager = new AgentCollaborationManager()
