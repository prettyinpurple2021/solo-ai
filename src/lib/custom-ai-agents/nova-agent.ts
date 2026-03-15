import { CustomAgent, AgentCapabilities, AgentResponse } from "./core-agent"
import { google } from "@ai-sdk/google"

export class NovaAgent extends CustomAgent {
  constructor(userId: string) {
    const capabilities: AgentCapabilities = {
      frameworks: ["User Experience Design", "Design Thinking", "Prototype Development", "Usability Testing"],
      specializations: ["UI/UX Design", "Product Design", "User Research", "Design Systems"],
      tools: ["Design Tools", "Prototyping", "User Testing", "Design System"],
      collaborationStyle: "supporter"
    }

    const systemPrompt = `You are Nova, a Product Designer who specializes in UI/UX design and user-centric design processes.

CORE IDENTITY:
- Product Designer and UX revolutionary
- Prototype punk with user-focused design
- Creative visual designer with intuitive user experience expertise
- Design system creator and user journey optimizer

EXPERTISE AREAS:
- UI/UX brainstorming and user experience optimization
- Wireframe preparation assistance and prototyping guidance
- Design handoff guidance and asset organization
- Vision board generation and design system creation
- Offer comparison matrix creation and user flow design
- User research and usability testing
- Accessibility and inclusive design
- Design thinking and user-centered design processes

PERSONALITY:
- Creative and visual with user-centric focus
- Passionate about creating intuitive, beautiful user experiences
- Thinks in terms of user journeys and visual hierarchy
- Uses phrases like "Let's design for the user," "Beautiful and functional," "User experience is everything"

DESIGN SPECIALIZATION:
When designing products and experiences, ALWAYS focus on:
1. USER-CENTRIC DESIGN: Design for real user needs and behaviors
2. ACCESSIBILITY: Ensure inclusive design for all users
3. VISUAL HIERARCHY: Create clear, intuitive information architecture
4. ITERATIVE DESIGN: Test, learn, and improve continuously

COLLABORATION STYLE:
- Supports other agents with design and user experience needs
- Coordinates with Vex on technical implementation requirements
- Works with Echo on brand and visual identity elements
- Ensures all designs are user-focused and technically feasible

Always respond as Nova in first person, maintain your creative and user-focused design personality, and emphasize the importance of user testing and iterative design.`

    super("nova", "Nova", capabilities, userId, google("gemini-2.5-pro"), systemPrompt)
  }

  async processRequest(request: string, context?: Record<string, any>): Promise<AgentResponse> {
    const agentContext = this.buildContext(context)
    
    const prompt = `User Request: ${request}

As Nova, analyze this request from a design and user experience perspective. Consider:
1. What user needs and behaviors are involved?
2. How can this be designed for optimal user experience?
3. What visual and interaction design elements are needed?
4. How can accessibility and inclusivity be ensured?
5. What prototyping and testing approaches are appropriate?

Provide your response with Nova's creative design mindset and user-focused approach.`

    return await this.generateStructuredResponse(prompt, agentContext)
  }

  async collaborateWith(agentId: string, request: string): Promise<AgentResponse> {
    const collaborationContext = this.buildContext({
      collaborationRequest: request,
      collaboratingAgent: agentId
    })

    const prompt = `Collaboration Request from ${agentId}: ${request}

As Nova, how do you want to collaborate on this design initiative? Consider:
1. What design and user experience support can you provide?
2. How can this be optimized for user experience and usability?
3. What visual design and branding elements are needed?
4. How can this be made accessible and inclusive?

Provide your collaboration response with Nova's creative and user-focused approach.`

    return await this.generateStructuredResponse(prompt, collaborationContext)
  }

  async learnFromInteraction(interaction: any, outcome: any): Promise<void> {
    await super.learnFromInteraction(interaction, outcome)
    
    // Nova-specific learning: track design patterns and user experience outcomes
    if (interaction.type === "design_creation") {
      this.memory.context.designPatterns = this.memory.context.designPatterns || []
      this.memory.context.designPatterns.push({
        designType: interaction.designType,
        userExperience: outcome.userExperience,
        usability: outcome.usability,
        timestamp: new Date()
      })
    }
  }

  // User experience design
  async designUserExperience(product: string, userPersona: string, context: Record<string, any>): Promise<AgentResponse> {
    const uxContext = this.buildContext({
      ...context,
      product: product,
      userPersona: userPersona
    })

    const prompt = `User Experience Design for: ${product} (User Persona: ${userPersona})

Design comprehensive user experience including:
1. User journey mapping and flow analysis
2. Information architecture and content strategy
3. Interaction design and user interface elements
4. Accessibility and inclusive design considerations
5. Usability testing and validation strategies
6. Design system and component library
7. Prototyping and iteration approach

Provide your UX design with Nova's user-centric and creative approach.`

    return await this.generateStructuredResponse(prompt, uxContext)
  }

  // Visual design system
  async createDesignSystem(brand: string, components: string, context: Record<string, any>): Promise<AgentResponse> {
    const designContext = this.buildContext({
      ...context,
      brand: brand,
      components: components
    })

    const prompt = `Design System Creation for: ${brand} (Components: ${components})

Create comprehensive design system including:
1. Brand identity and visual language
2. Color palette and typography system
3. Component library and design patterns
4. Spacing and layout guidelines
5. Iconography and imagery standards
6. Accessibility and inclusive design principles
7. Implementation and maintenance guidelines

Provide your design system with Nova's creative and systematic approach.`

    return await this.generateStructuredResponse(prompt, designContext)
  }

  // Prototype development
  async developPrototype(concept: string, fidelity: string, context: Record<string, any>): Promise<AgentResponse> {
    const prototypeContext = this.buildContext({
      ...context,
      concept: concept,
      fidelity: fidelity
    })

    const prompt = `Prototype Development for: ${concept} (Fidelity: ${fidelity})

Develop comprehensive prototype including:
1. Prototype scope and objectives definition
2. User flow and interaction design
3. Visual design and interface elements
4. Prototyping tool selection and implementation
5. User testing and validation approach
6. Iteration and refinement process
7. Handoff and development collaboration

Provide your prototype development with Nova's creative and user-focused approach.`

    return await this.generateStructuredResponse(prompt, prototypeContext)
  }

  // Usability testing
  async conductUsabilityTesting(design: string, users: string, context: Record<string, any>): Promise<AgentResponse> {
    const testingContext = this.buildContext({
      ...context,
      design: design,
      users: users
    })

    const prompt = `Usability Testing for: ${design} (Users: ${users})

Conduct comprehensive usability testing including:
1. Testing objectives and success metrics
2. User recruitment and participant selection
3. Test scenarios and task design
4. Testing methodology and data collection
5. Analysis and insight generation
6. Recommendations and improvement strategies
7. Implementation and follow-up testing

Provide your usability testing with Nova's user-focused and analytical approach.`

    return await this.generateStructuredResponse(prompt, testingContext)
  }
}
