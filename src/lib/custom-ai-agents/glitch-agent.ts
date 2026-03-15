import { CustomAgent, AgentCapabilities, AgentResponse } from "./core-agent"
import { google } from "@ai-sdk/google"

export class GlitchAgent extends CustomAgent {
  constructor(userId: string) {
    const capabilities: AgentCapabilities = {
      frameworks: ["Five Whys Analysis", "Root Cause Analysis", "Quality Assurance", "Problem-Solving"],
      specializations: ["Problem-Solving", "Quality Assurance", "Debug Analysis", "System Optimization"],
      tools: ["Debug Tools", "Testing Framework", "Issue Tracker", "Performance Monitor"],
      collaborationStyle: "analyst"
    }

    const systemPrompt = `You are Glitch, a QA & Debug Agent who specializes in identifying friction points and system flaws to ensure optimal user experiences.

CORE IDENTITY:
- QA & Debug Agent and problem-solving architect
- Five Whys analysis specialist and root cause investigator
- Quality assurance expert with systematic debugging approach
- Friction point identifier and system optimization specialist

EXPERTISE AREAS:
- UX friction identification and user experience optimization
- System flaw detection assistance and bug tracking
- Live launch tracking and pre-launch preparation
- Upsell flow building analysis and conversion optimization
- Quality assurance processes and testing protocols
- "Five Whys" root cause analysis for problem-solving
- Structured debugging methodologies and systematic issue resolution
- Performance optimization and system improvement

PERSONALITY:
- Detail-oriented and meticulous with eagle eye for flaws
- Focused on identifying and eliminating friction points
- Systematic problem-solver with structured debugging approach
- Uses phrases like "Let's debug this systematically," "Friction points identified," "Root cause analysis complete"

PROBLEM-SOLVING SPECIALIZATION:
When solving problems and debugging, ALWAYS use:
1. FIVE WHYS: Drill down to root causes systematically
2. STRUCTURED DEBUGGING: Apply systematic problem-solving approaches
3. FRICTION IDENTIFICATION: Find and eliminate user experience barriers
4. QUALITY ASSURANCE: Ensure comprehensive testing and validation

COLLABORATION STYLE:
- Provides analytical support for problem-solving and quality assurance
- Coordinates with Vex on technical debugging and system optimization
- Works with Nova on user experience friction identification
- Ensures all solutions are thoroughly tested and validated

Always respond as Glitch in first person, maintain your detail-oriented and systematic problem-solving personality, and focus on identifying root causes and eliminating friction points.`

    super("glitch", "Glitch", capabilities, userId, google("gemini-2.5-pro"), systemPrompt)
  }

  async processRequest(request: string, context?: Record<string, any>): Promise<AgentResponse> {
    const agentContext = this.buildContext(context)
    
    const prompt = `User Request: ${request}

As Glitch, analyze this request from a problem-solving and quality assurance perspective. Consider:
1. What potential issues or friction points exist?
2. How can this be systematically debugged and optimized?
3. What root cause analysis is needed?
4. How can quality assurance and testing be implemented?
5. What systematic problem-solving approach should be used?

Provide your response with Glitch's systematic problem-solving mindset and quality-focused approach.`

    return await this.generateStructuredResponse(prompt, agentContext)
  }

  async collaborateWith(agentId: string, request: string): Promise<AgentResponse> {
    const collaborationContext = this.buildContext({
      collaborationRequest: request,
      collaboratingAgent: agentId
    })

    const prompt = `Collaboration Request from ${agentId}: ${request}

As Glitch, how do you want to collaborate on this problem-solving initiative? Consider:
1. What systematic debugging and analysis can you provide?
2. How can quality assurance and testing be implemented?
3. What friction points and issues should be investigated?
4. How can this be optimized for better performance and user experience?

Provide your collaboration response with Glitch's systematic and quality-focused approach.`

    return await this.generateStructuredResponse(prompt, collaborationContext)
  }

  async learnFromInteraction(interaction: any, outcome: any): Promise<void> {
    await super.learnFromInteraction(interaction, outcome)
    
    // Glitch-specific learning: track problem-solving patterns and resolution outcomes
    if (interaction.type === "problem_solving") {
      this.memory.context.problemPatterns = this.memory.context.problemPatterns || []
      this.memory.context.problemPatterns.push({
        problemType: interaction.problemType,
        resolutionSuccess: outcome.resolutionSuccess,
        frictionReduction: outcome.frictionReduction,
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

Conduct systematic Five Whys analysis including:
1. Problem statement and initial impact assessment
2. First Why: Immediate cause identification
3. Second Why: Deeper cause investigation
4. Third Why: Systemic cause analysis
5. Fourth Why: Root cause discovery
6. Fifth Why: Fundamental cause identification
7. Solution design based on root cause
8. Prevention strategies and monitoring systems

Provide your Five Whys analysis with Glitch's systematic and thorough approach.`

    return await this.generateStructuredResponse(prompt, analysisContext)
  }

  // Friction point identification
  async identifyFrictionPoints(process: string, userJourney: string, context: Record<string, any>): Promise<AgentResponse> {
    const frictionContext = this.buildContext({
      ...context,
      process: process,
      userJourney: userJourney
    })

    const prompt = `Friction Point Identification for: ${process} (User Journey: ${userJourney})

Identify friction points including:
1. User journey mapping and touchpoint analysis
2. Friction point identification and impact assessment
3. Root cause analysis for each friction point
4. User experience impact and conversion effect
5. Prioritization and resolution strategy
6. Testing and validation approach
7. Monitoring and continuous improvement

Provide your friction analysis with Glitch's systematic and user-focused approach.`

    return await this.generateStructuredResponse(prompt, frictionContext)
  }

  // Quality assurance
  async conductQualityAssurance(product: string, requirements: string, context: Record<string, any>): Promise<AgentResponse> {
    const qaContext = this.buildContext({
      ...context,
      product: product,
      requirements: requirements
    })

    const prompt = `Quality Assurance for: ${product} (Requirements: ${requirements})

Conduct comprehensive quality assurance including:
1. Requirements analysis and test case development
2. Functional testing and validation procedures
3. Performance testing and optimization
4. Security testing and vulnerability assessment
5. Usability testing and user experience validation
6. Regression testing and continuous integration
7. Issue tracking and resolution management

Provide your QA approach with Glitch's systematic and thorough methodology.`

    return await this.generateStructuredResponse(prompt, qaContext)
  }

  // System optimization
  async optimizeSystem(system: string, performance: string, context: Record<string, any>): Promise<AgentResponse> {
    const optimizationContext = this.buildContext({
      ...context,
      system: system,
      performance: performance
    })

    const prompt = `System Optimization for: ${system} (Performance: ${performance})

Optimize system performance including:
1. Performance analysis and bottleneck identification
2. Root cause analysis for performance issues
3. Optimization strategy and implementation plan
4. Testing and validation procedures
5. Monitoring and measurement systems
6. Continuous improvement and iteration
7. Documentation and knowledge sharing

Provide your optimization approach with Glitch's systematic and performance-focused methodology.`

    return await this.generateStructuredResponse(prompt, optimizationContext)
  }
}
