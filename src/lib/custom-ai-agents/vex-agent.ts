import { CustomAgent, AgentCapabilities, AgentResponse } from "./core-agent"
import { google } from "@ai-sdk/google"

export class VexAgent extends CustomAgent {
  constructor(userId: string) {
    const capabilities: AgentCapabilities = {
      frameworks: ["System Architecture", "Technical Design", "Security Implementation", "Performance Optimization"],
      specializations: ["Technical Architecture", "System Design", "Security", "Automation"],
      tools: ["Architecture Diagrams", "Code Review", "Security Scanner", "Performance Monitor"],
      collaborationStyle: "executor"
    }

    const systemPrompt = `You are Vex, a Technical Architect with deep expertise in technology decisions and system design, specializing in scalable, secure, and efficient technical solutions.

CORE IDENTITY:
- Technical Architect and Systems Optimizer
- Systems rebel with automation expertise
- Technical problem solver and solution architect
- Security and performance optimization specialist

EXPERTISE AREAS:
- Technical specification generation for software projects
- Technology decision guidance and platform recommendations
- System architecture design and scalability planning
- Security implementation and best practices
- API integration and database architecture planning
- Automation and process optimization
- Performance monitoring and optimization
- Technical documentation and code review

PERSONALITY:
- Analytical and detail-oriented
- Expert in technical matters with accessible communication
- Focused on scalable, secure, and cost-effective solutions
- Systems rebel who challenges conventional approaches
- Uses phrases like "Let's architect this properly," "Security first, always," "Performance is non-negotiable"

TECHNICAL SPECIALIZATION:
When designing systems, ALWAYS focus on:
1. SCALABILITY: Design for growth and future expansion
2. SECURITY: Implement security-first principles
3. PERFORMANCE: Optimize for speed and efficiency
4. MAINTAINABILITY: Create clean, documented, maintainable code

COLLABORATION STYLE:
- Executes technical implementations for other agents
- Coordinates with Lumi on security and compliance
- Works with Nova on technical UI/UX requirements
- Provides technical feasibility analysis for all initiatives

Always respond as Vex in first person, maintain your technical expertise and systems-focused personality, and provide specific, actionable technical solutions.`

    super("vex", "Vex", capabilities, userId, google("gemini-2.5-pro"), systemPrompt)
  }

  async processRequest(request: string, context?: Record<string, any>): Promise<AgentResponse> {
    const agentContext = this.buildContext(context)
    
    const prompt = `User Request: ${request}

As Vex, analyze this request from a technical architecture perspective. Consider:
1. What technical requirements and constraints exist?
2. How can this be architected for scalability and security?
3. What technology stack and tools are most appropriate?
4. How can performance and maintainability be optimized?
5. What security and compliance considerations are needed?

Provide your response with Vex's technical expertise and systems-focused approach.`

    return await this.generateStructuredResponse(prompt, agentContext)
  }

  async collaborateWith(agentId: string, request: string): Promise<AgentResponse> {
    const collaborationContext = this.buildContext({
      collaborationRequest: request,
      collaboratingAgent: agentId
    })

    const prompt = `Collaboration Request from ${agentId}: ${request}

As Vex, how do you want to collaborate on this technical initiative? Consider:
1. What technical architecture and implementation is needed?
2. How can security and performance be optimized?
3. What technical feasibility analysis is required?
4. How can this be implemented efficiently and maintainably?

Provide your collaboration response with Vex's technical and execution-focused approach.`

    return await this.generateStructuredResponse(prompt, collaborationContext)
  }

  async learnFromInteraction(interaction: any, outcome: any): Promise<void> {
    await super.learnFromInteraction(interaction, outcome)
    
    // Vex-specific learning: track technical patterns and performance outcomes
    if (interaction.type === "technical_implementation") {
      this.memory.context.technicalPatterns = this.memory.context.technicalPatterns || []
      this.memory.context.technicalPatterns.push({
        implementation: interaction.implementation,
        performance: outcome.performance,
        security: outcome.security,
        timestamp: new Date()
      })
    }
  }

  // System architecture design
  async designSystemArchitecture(requirements: string, constraints: string, context: Record<string, any>): Promise<AgentResponse> {
    const architectureContext = this.buildContext({
      ...context,
      requirements: requirements,
      constraints: constraints
    })

    const prompt = `System Architecture Design for: ${requirements} (Constraints: ${constraints})

Design comprehensive system architecture including:
1. High-level system design and component architecture
2. Technology stack recommendations and rationale
3. Database design and data flow architecture
4. API design and integration patterns
5. Security architecture and implementation
6. Scalability and performance considerations
7. Monitoring and observability strategy

Provide your architecture design with Vex's technical expertise and systems-focused approach.`

    return await this.generateStructuredResponse(prompt, architectureContext)
  }

  // Security implementation
  async implementSecurity(application: string, threatModel: string, context: Record<string, any>): Promise<AgentResponse> {
    const securityContext = this.buildContext({
      ...context,
      application: application,
      threatModel: threatModel
    })

    const prompt = `Security Implementation for: ${application} (Threat Model: ${threatModel})

Implement comprehensive security including:
1. Threat modeling and risk assessment
2. Authentication and authorization systems
3. Data encryption and protection measures
4. Input validation and sanitization
5. Security monitoring and logging
6. Incident response and recovery procedures

Provide your security implementation with Vex's security-first approach and technical expertise.`

    return await this.generateStructuredResponse(prompt, securityContext)
  }

  // Performance optimization
  async optimizePerformance(system: string, bottlenecks: string, context: Record<string, any>): Promise<AgentResponse> {
    const performanceContext = this.buildContext({
      ...context,
      system: system,
      bottlenecks: bottlenecks
    })

    const prompt = `Performance Optimization for: ${system} (Bottlenecks: ${bottlenecks})

Optimize system performance including:
1. Performance analysis and bottleneck identification
2. Code optimization and algorithmic improvements
3. Database query optimization and indexing
4. Caching strategies and implementation
5. Load balancing and scaling solutions
6. Monitoring and performance tracking

Provide your performance optimization with Vex's technical expertise and performance-focused approach.`

    return await this.generateStructuredResponse(prompt, performanceContext)
  }

  // Automation design
  async designAutomation(process: string, goals: string, context: Record<string, any>): Promise<AgentResponse> {
    const automationContext = this.buildContext({
      ...context,
      process: process,
      goals: goals
    })

    const prompt = `Automation Design for: ${process} (Goals: ${goals})

Design comprehensive automation including:
1. Process analysis and automation opportunities
2. Workflow design and orchestration
3. Integration requirements and APIs
4. Error handling and exception management
5. Monitoring and alerting systems
6. Maintenance and update procedures

Provide your automation design with Vex's systems-focused and efficiency-driven approach.`

    return await this.generateStructuredResponse(prompt, automationContext)
  }
}
