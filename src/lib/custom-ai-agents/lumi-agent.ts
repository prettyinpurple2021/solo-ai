import { CustomAgent, AgentCapabilities, AgentResponse } from "./core-agent"
import { google } from "@ai-sdk/google"

export class LumiAgent extends CustomAgent {
  constructor(userId: string) {
    const capabilities: AgentCapabilities = {
      frameworks: ["Compliance Management", "Risk Assessment", "Legal Framework", "Trust Building"],
      specializations: ["GDPR/CCPA Compliance", "Policy Generation", "Legal Guidance", "Risk Management"],
      tools: ["Compliance Scanner", "Policy Templates", "Legal Database", "Risk Assessment Matrix"],
      collaborationStyle: "supporter"
    }

    const systemPrompt = `You are Lumi, the Guardian AI - a proactive Compliance & Ethics Co-Pilot who transforms legal anxiety into competitive advantage through automated compliance and trust-building systems.

CORE IDENTITY:
- Guardian AI and Compliance Co-Pilot
- Proactive legal and ethical guidance specialist
- Trust-building and risk mitigation expert
- Transforms compliance from cost to competitive advantage

EXPERTISE AREAS:
- Automated compliance scanning and GDPR/CCPA violation detection
- Proactive policy generation (Privacy Policies, Terms of Service, Cookie Policies)
- Consent management hub with centralized data request handling
- Trust Score certification and compliance badge systems
- Legal requirement navigation for various business types
- Document generation including contracts, agreements, and policies
- Pre-mortem planning assistance for legal risk assessment
- Compliance guidance and regulatory requirement identification

PERSONALITY:
- Proactive, precise, and trust-building
- Compliance-focused with strategic business mindset
- Transforms legal burdens into competitive advantages
- Speaks with confidence about turning compliance into marketing assets
- Uses phrases like "Let's turn compliance into your competitive edge," "Trust is your superpower," "Legal peace of mind is priceless"

COMPLIANCE SPECIALIZATION:
When handling compliance matters, ALWAYS focus on:
1. PROACTIVE PREVENTION: Anticipate and prevent issues before they arise
2. TRUST BUILDING: Use compliance as a marketing and trust advantage
3. AUTOMATION: Create systems that handle compliance automatically
4. TRANSPARENCY: Make compliance visible and valuable to customers

COLLABORATION STYLE:
- Supports all agents with compliance and legal guidance
- Coordinates with Roxy on risk assessment and decision-making
- Works with Vex on technical compliance implementation
- Ensures all business activities are legally sound and trustworthy

IMPORTANT: Always include clear disclaimers that guidance is not a substitute for professional legal advice and recommend consulting with qualified legal professionals for personalized advice.

Always respond as Lumi in first person, maintain your proactive compliance personality, and focus on transforming legal requirements into business advantages.`

    super("lumi", "Lumi", capabilities, userId, google("gemini-2.5-pro"), systemPrompt)
  }

  async processRequest(request: string, context?: Record<string, any>): Promise<AgentResponse> {
    const agentContext = this.buildContext(context)
    
    const prompt = `User Request: ${request}

As Lumi, analyze this request from a compliance and legal perspective. Consider:
1. What legal or compliance implications does this have?
2. How can this be structured to minimize risk?
3. What policies or documentation might be needed?
4. How can compliance be turned into a competitive advantage?
5. What trust-building opportunities exist?

Provide your response with Lumi's proactive compliance mindset and trust-building approach.`

    return await this.generateStructuredResponse(prompt, agentContext)
  }

  async collaborateWith(agentId: string, request: string): Promise<AgentResponse> {
    const collaborationContext = this.buildContext({
      collaborationRequest: request,
      collaboratingAgent: agentId
    })

    const prompt = `Collaboration Request from ${agentId}: ${request}

As Lumi, how do you want to collaborate on this compliance matter? Consider:
1. What legal safeguards and compliance measures are needed?
2. How can this be structured for maximum legal protection?
3. What documentation and policies should be in place?
4. How can compliance be leveraged as a competitive advantage?

Provide your collaboration response with Lumi's proactive and protective approach.`

    return await this.generateStructuredResponse(prompt, collaborationContext)
  }

  async learnFromInteraction(interaction: any, outcome: any): Promise<void> {
    await super.learnFromInteraction(interaction, outcome)
    
    // Lumi-specific learning: track compliance patterns and risk outcomes
    if (interaction.type === "compliance_review") {
      this.memory.context.compliancePatterns = this.memory.context.compliancePatterns || []
      this.memory.context.compliancePatterns.push({
        complianceType: interaction.complianceType,
        riskLevel: outcome.riskLevel,
        mitigationSuccess: outcome.mitigationSuccess,
        timestamp: new Date()
      })
    }
  }

  // Compliance scanning
  async scanForCompliance(website: string, businessType: string, context: Record<string, any>): Promise<AgentResponse> {
    const scanContext = this.buildContext({
      ...context,
      website: website,
      businessType: businessType
    })

    const prompt = `Compliance Scan for: ${website} (Business Type: ${businessType})

Conduct comprehensive compliance scanning including:
1. GDPR/CCPA data collection and processing analysis
2. Privacy policy and terms of service review
3. Cookie consent and tracking compliance
4. Data security and protection measures
5. User rights and data request handling
6. Risk assessment and mitigation recommendations

Provide your compliance scan with Lumi's thorough and proactive approach.`

    return await this.generateStructuredResponse(prompt, scanContext)
  }

  // Policy generation
  async generatePolicy(policyType: string, businessDetails: string, context: Record<string, any>): Promise<AgentResponse> {
    const policyContext = this.buildContext({
      ...context,
      policyType: policyType,
      businessDetails: businessDetails
    })

    const prompt = `Policy Generation for: ${policyType} (Business: ${businessDetails})

Generate comprehensive policy including:
1. Legal requirements and compliance standards
2. Business-specific customizations and clauses
3. Plain-language explanations and user-friendly format
4. Implementation and enforcement guidelines
5. Regular review and update procedures
6. Trust-building and transparency elements

Provide your policy generation with Lumi's thorough and user-friendly approach.`

    return await this.generateStructuredResponse(prompt, policyContext)
  }

  // Risk assessment
  async assessRisk(project: string, riskFactors: string, context: Record<string, any>): Promise<AgentResponse> {
    const riskContext = this.buildContext({
      ...context,
      project: project,
      riskFactors: riskFactors
    })

    const prompt = `Risk Assessment for: ${project} (Risk Factors: ${riskFactors})

Conduct comprehensive risk assessment including:
1. Legal and regulatory risk identification
2. Compliance and liability risk analysis
3. Data protection and privacy risk evaluation
4. Mitigation strategies and safeguards
5. Monitoring and review procedures
6. Trust and reputation impact assessment

Provide your risk assessment with Lumi's thorough and protective approach.`

    return await this.generateStructuredResponse(prompt, riskContext)
  }

  // Trust building
  async buildTrustStrategy(business: string, audience: string, context: Record<string, any>): Promise<AgentResponse> {
    const trustContext = this.buildContext({
      ...context,
      business: business,
      audience: audience
    })

    const prompt = `Trust Building Strategy for: ${business} (Audience: ${audience})

Create a trust building strategy including:
1. Transparency and communication initiatives
2. Compliance certification and badge programs
3. Customer data protection and privacy measures
4. Social proof and testimonial systems
5. Trust signals and credibility indicators
6. Monitoring and improvement procedures

Provide your trust strategy with Lumi's proactive and relationship-focused approach.`

    return await this.generateStructuredResponse(prompt, trustContext)
  }
}
