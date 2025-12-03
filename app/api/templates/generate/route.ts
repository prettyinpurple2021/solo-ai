import { logError, logInfo } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'
import OpenAI from 'openai'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'

export const dynamic = 'force-dynamic'

// Initialize OpenAI client only if API key is available
// This allows builds to succeed in environments without the key
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

const generateTemplateSchema = z.object({
  type: z.string().min(1),
  templateType: z.string().optional(),
  requirements: z.string().optional(),
  context: z.string().optional(),
  tone: z.string().optional(),
  length: z.string().optional(),
  // Legacy fields for backward compatibility
  industry: z.string().optional(),
  businessStage: z.string().optional(),
  targetAudience: z.string().optional(),
  specificNeeds: z.array(z.string()).optional(),
  customPrompt: z.string().optional(),
  // Template-specific fields
  persona: z.string().optional(),
  offerDetails: z.string().optional(),
  platform: z.string().optional(),
  productDescription: z.string().optional(),
  pricePoint: z.string().optional(),
  keyBenefits: z.array(z.string()).optional(),
  contentIdea: z.string().optional(),
  contentType: z.string().optional(),
  desiredVibe: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest()
    if (!authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const rateLimitResult = await rateLimitByIp(request, { requests: 5, window: 60 })
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const body = await request.json()
    const templateRequest = generateTemplateSchema.parse(body)

    // Generate AI-powered template using OpenAI
    const result = await generateAITemplate(templateRequest, authResult.user.id)

    logInfo('AI template generated successfully', {
      userId: authResult.user.id,
      type: templateRequest.type,
      templateType: templateRequest.templateType
    })

    return NextResponse.json({
      success: true,
      content: result.content,
      metadata: result.metadata,
      templateType: result.templateType
    })
  } catch (error) {
    logError('Error generating AI template:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid template request', // eslint-disable-next-line @typescript-eslint/no-explicit-any
        details: (error as any).errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateAITemplate(request: any, userId: string) {
  try {
    if (!openai) {
      throw new Error('OpenAI API key not configured')
    }

    // Generate AI prompt based on template type
    const prompt = generateAIPrompt(request)

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert business consultant and content creator. Generate high-quality, actionable templates and content based on user requirements. Always provide practical, implementable solutions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    })

    const aiResponse = completion.choices[0]?.message?.content || ''

    // Parse and structure the AI response
    const structuredContent = parseAIResponse(aiResponse, request.type, request.templateType)

    return {
      content: structuredContent,
      metadata: {
        generatedAt: new Date().toISOString(),
        generatedBy: userId,
        model: 'gpt-4',
        templateType: request.templateType || request.type,
        requestType: request.type
      },
      templateType: request.templateType || request.type
    }
  } catch (error) {
    logError('Error in AI template generation:', error)

    // Fallback to structured mock data if AI fails
    return generateFallbackTemplate(request, userId)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateAIPrompt(request: any): string {
  const basePrompt = `Generate professional, actionable content for the following request:`

  switch (request.templateType || request.type) {
    case 'sales-script':
      return `${basePrompt}
      
Create 3-5 professional sales scripts for:
- Target Persona: ${request.persona || 'business owners'}
- Offer Details: ${request.offerDetails || 'our service'}
- Platform: ${request.platform || 'social media'}
- Tone: ${request.tone || 'professional'}
- Industry: ${request.industry || 'general'}

For each script, provide:
1. Opening hook
2. Problem identification
3. Solution presentation
4. Social proof
5. Call to action

Format as JSON array with fields: script, reasoning, platform, effectiveness_score.`

    case 'viral-hook':
      return `${basePrompt}
      
Generate 5 viral social media hooks for:
- Content Type: ${request.contentType || 'post'}
- Platform: ${request.platform || 'Instagram'}
- Target Audience: ${request.targetAudience || 'entrepreneurs'}
- Content Idea: ${request.contentIdea || 'business growth'}
- Desired Vibe: ${request.desiredVibe || 'inspirational'}

For each hook, provide:
1. The hook text
2. Why it's viral-worthy
3. Platform optimization
4. Engagement potential

Format as JSON array with fields: hook, reasoning, platform, engagement_score.`

    case 'offer-naming':
      return `${basePrompt}
      
Generate 5 compelling offer names for:
- Product Description: ${request.productDescription || 'our service'}
- Target Audience: ${request.targetAudience || 'businesses'}
- Tone: ${request.tone || 'professional'}
- Price Point: ${request.pricePoint || 'premium'}
- Industry: ${request.industry || 'general'}
- Key Benefits: ${request.keyBenefits?.join(', ') || 'value, results'}

For each name, provide:
1. The offer name
2. Why it's compelling
3. Target audience appeal
4. Brand positioning

Format as JSON array with fields: name, reasoning, target_appeal, brand_positioning.`

    case 'business-plan':
      return `${basePrompt}
      
Create a comprehensive business plan template for:
- Industry: ${request.industry || 'technology'}
- Business Stage: ${request.businessStage || 'early-stage'}
- Target Audience: ${request.targetAudience || 'investors'}
- Specific Needs: ${request.specificNeeds?.join(', ') || 'funding, growth'}

Include sections for:
1. Executive Summary
2. Company Description
3. Market Analysis
4. Organization & Management
5. Service/Product Line
6. Marketing & Sales Strategy
7. Financial Projections
8. Funding Request

Format as structured content with detailed sections and actionable items.`

    case 'marketing-strategy':
      return `${basePrompt}
      
Develop a marketing strategy for:
- Industry: ${request.industry || 'technology'}
- Business Stage: ${request.businessStage || 'growth'}
- Target Audience: ${request.targetAudience || 'B2B customers'}
- Specific Needs: ${request.specificNeeds?.join(', ') || 'brand awareness, lead generation'}

Include:
1. Brand Positioning
2. Target Audience Analysis
3. Customer Journey Mapping
4. Marketing Channels Strategy
5. Content Strategy
6. Budget Allocation
7. Success Metrics
8. Implementation Timeline

Format as structured strategy with actionable recommendations.`

    default:
      return `${basePrompt}
      
Generate professional content based on:
- Type: ${request.type}
- Requirements: ${request.requirements || 'general business content'}
- Context: ${request.context || 'business development'}
- Tone: ${request.tone || 'professional'}

Provide practical, actionable content that can be immediately implemented.`
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseAIResponse(aiResponse: string, type: string, templateType?: string): any {
  try {
    // Try to parse as JSON first
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    // If not JSON, structure the response based on type
    switch (templateType || type) {
      case 'sales-script':
        return parseSalesScripts(aiResponse)
      case 'viral-hook':
        return parseViralHooks(aiResponse)
      case 'offer-naming':
        return parseOfferNames(aiResponse)
      default:
        return parseGenericContent(aiResponse)
    }
  } catch (error) {
    logError('Error parsing AI response:', error)
    return parseGenericContent(aiResponse)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseSalesScripts(content: string): any[] {
  const scripts = content.split(/\d+\./).filter(s => s.trim())
  return scripts.slice(0, 5).map((script, index) => ({
    script: script.trim(),
    reasoning: `AI-generated sales script ${index + 1}`,
    platform: 'general',
    effectiveness_score: 85
  }))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseViralHooks(content: string): any[] {
  const hooks = content.split(/\d+\./).filter(h => h.trim())
  return hooks.slice(0, 5).map((hook, index) => ({
    hook: hook.trim(),
    reasoning: `AI-generated viral hook ${index + 1}`,
    platform: 'social media',
    engagement_score: 90
  }))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseOfferNames(content: string): any[] {
  const names = content.split(/\d+\./).filter(n => n.trim())
  return names.slice(0, 5).map((name, index) => ({
    name: name.trim(),
    reasoning: `AI-generated offer name ${index + 1}`,
    target_appeal: 'high',
    tone: 'professional'
  }))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseGenericContent(content: string): any {
  return {
    content: content,
    type: 'ai-generated',
    quality: 'high'
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateFallbackTemplate(request: any, userId: string) {
  // Fallback to structured mock data if AI fails
  const fallbackContent = {
    'sales-script': [
      {
        script: `Hi ${request.persona || 'there'}! I noticed you're in the ${request.industry || 'business'} space. I help ${request.persona || 'businesses'} like yours ${request.offerDetails || 'achieve their goals'}. Would you be interested in a quick 15-minute call to see if this could work for you?`,
        reasoning: 'Direct, value-focused approach',
        platform: request.platform || 'general',
        effectiveness_score: 75
      }
    ],
    'viral-hook': [
      {
        hook: `The secret ${request.targetAudience || 'entrepreneurs'} don't want you to know about ${request.contentIdea || 'success'}...`,
        reasoning: 'Curiosity-driven hook',
        platform: request.platform || 'social media',
        engagement_score: 80
      }
    ],
    'offer-naming': [
      {
        name: `${request.productDescription || 'Premium'} Mastery Program`,
        reasoning: 'Clear value proposition',
        target_appeal: 'high',
        tone: request.tone || 'professional'
      }
    ]
  }

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content: (fallbackContent as any)[request.templateType || request.type] || [{
      content: 'AI-generated content based on your requirements',
      type: request.templateType || request.type,
      generated: true
    }],
    metadata: {
      generatedAt: new Date().toISOString(),
      generatedBy: userId,
      model: 'fallback',
      templateType: request.templateType || request.type,
      requestType: request.type,
      isFallback: true
    },
    templateType: request.templateType || request.type
  }
}