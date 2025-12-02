import { logger, logError, logInfo } from '@/lib/logger'
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

const brandAnalysisSchema = z.object({
  companyName: z.string().min(1),
  tagline: z.string().optional(),
  description: z.string().optional(),
  industry: z.string().optional(),
  targetAudience: z.string().optional(),
  brandPersonality: z.array(z.string()).optional(),
  colorPalette: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    accent: z.string().optional(),
  }).optional(),
  typography: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
  }).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest()
    if (!authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const rateLimitResult = await rateLimitByIp(request, { requests: 10, window: 60 })
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const body = await request.json()
    const brandData = brandAnalysisSchema.parse(body)

    // AI-powered brand analysis
    const analysis = await analyzeBrandWithAI(brandData)

    logInfo('Brand analysis completed successfully', { userId: authResult.user.id })
    return NextResponse.json({
      success: true,
      analysis
    })
  } catch (error) {
    logError('Error in brand analysis:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid brand data', details: (error as any).errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function analyzeBrandWithAI(brandData: any) {
  try {
    if (!openai) {
      // Fallback to rule-based analysis if AI is not available
      logInfo('OpenAI API key not configured, using fallback analysis')
      return generateFallbackAnalysis(brandData)
    }

    // Create comprehensive prompt for AI brand analysis
    const prompt = `Analyze this brand data and provide a comprehensive brand analysis:

Company: ${brandData.companyName}
Tagline: ${brandData.tagline || 'Not provided'}
Description: ${brandData.description || 'Not provided'}
Industry: ${brandData.industry || 'Not specified'}
Target Audience: ${brandData.targetAudience || 'Not defined'}
Brand Personality: ${brandData.brandPersonality?.join(', ') || 'Not defined'}
Color Palette: Primary: ${brandData.colorPalette?.primary || 'Not set'}, Secondary: ${brandData.colorPalette?.secondary || 'Not set'}, Accent: ${brandData.colorPalette?.accent || 'Not set'}
Typography: Primary: ${brandData.typography?.primary || 'Not set'}, Secondary: ${brandData.typography?.secondary || 'Not set'}

Please provide a comprehensive brand analysis including:

1. **Completeness Score** (0-100): Rate how complete the brand foundation is
2. **Strengths**: List 3-5 key strengths of the current brand
3. **Improvements**: List 3-5 specific areas for improvement
4. **Recommendations**: List 3-5 actionable recommendations
5. **Competitive Analysis**: 
   - Similar brands in the market
   - Key differentiation opportunities
   - Market positioning assessment

Format your response as JSON with the following structure:
{
  "completeness": 85,
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "competitiveAnalysis": {
    "similarBrands": ["brand1", "brand2", "brand3"],
    "differentiation": ["differentiator1", "differentiator2", "differentiator3"],
    "marketPosition": "positioning statement"
  }
}`

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert brand strategist and marketing consultant. Analyze brand data and provide actionable insights for brand development. Always provide specific, implementable recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    })

    const aiResponse = completion.choices[0]?.message?.content || ''

    // Parse AI response
    try {
      const analysis = JSON.parse(aiResponse)
      return {
        completeness: analysis.completeness || calculateCompleteness(brandData),
        strengths: analysis.strengths || identifyStrengths(brandData),
        improvements: analysis.improvements || identifyImprovements(brandData, analysis.completeness || 0),
        recommendations: analysis.recommendations || generateRecommendations(brandData, analysis.completeness || 0),
        competitiveAnalysis: analysis.competitiveAnalysis || {
          similarBrands: ['Industry Leader A', 'Competitor B', 'Emerging Brand C'],
          differentiation: ['Unique value proposition', 'Strong brand personality', 'Clear target audience'],
          marketPosition: 'Innovative and professional'
        }
      }
    } catch (parseError) {
      logError('Error parsing AI response:', parseError)
      return generateFallbackAnalysis(brandData)
    }
  } catch (error) {
    logError('Error in AI brand analysis:', error)
    return generateFallbackAnalysis(brandData)
  }
}

function generateFallbackAnalysis(brandData: any) {
  const completeness = calculateCompleteness(brandData)
  const strengths = identifyStrengths(brandData)
  const improvements = identifyImprovements(brandData, completeness)
  const recommendations = generateRecommendations(brandData, completeness)

  return {
    completeness,
    strengths,
    improvements,
    recommendations,
    competitiveAnalysis: {
      similarBrands: ['Industry Leader A', 'Competitor B', 'Emerging Brand C'],
      differentiation: [
        'Unique value proposition',
        'Strong brand personality',
        'Clear target audience'
      ],
      marketPosition: 'Innovative and professional'
    }
  }
}

function calculateCompleteness(brandData: any): number {
  let score = 0
  const totalFields = 8

  if (brandData.companyName) score++
  if (brandData.tagline) score++
  if (brandData.description) score++
  if (brandData.industry) score++
  if (brandData.targetAudience) score++
  if (brandData.brandPersonality && brandData.brandPersonality.length > 0) score++
  if (brandData.colorPalette && brandData.colorPalette.primary) score++
  if (brandData.typography && brandData.typography.primary) score++

  return Math.round((score / totalFields) * 100)
}

function identifyStrengths(brandData: any): string[] {
  const strengths: string[] = []

  if (brandData.companyName && brandData.companyName.length > 2) {
    strengths.push('Clear company name defined')
  }

  if (brandData.tagline && brandData.tagline.length > 10) {
    strengths.push('Compelling tagline created')
  }

  if (brandData.description && brandData.description.length > 50) {
    strengths.push('Detailed brand description provided')
  }

  if (brandData.brandPersonality && brandData.brandPersonality.length >= 3) {
    strengths.push('Strong brand personality traits identified')
  }

  if (brandData.colorPalette && brandData.colorPalette.primary) {
    strengths.push('Color palette established')
  }

  if (brandData.targetAudience && brandData.targetAudience.length > 20) {
    strengths.push('Well-defined target audience')
  }

  if (strengths.length === 0) {
    strengths.push('Brand foundation started')
  }

  return strengths
}

function identifyImprovements(brandData: any, completeness: number): string[] {
  const improvements: string[] = []

  if (!brandData.tagline) {
    improvements.push('Add a compelling tagline that captures your brand essence')
  }

  if (!brandData.description || brandData.description.length < 50) {
    improvements.push('Expand your brand description to better communicate your value')
  }

  if (!brandData.targetAudience || brandData.targetAudience.length < 20) {
    improvements.push('Define your target audience more specifically')
  }

  if (!brandData.brandPersonality || brandData.brandPersonality.length < 3) {
    improvements.push('Select more brand personality traits for consistency')
  }

  if (!brandData.colorPalette || !brandData.colorPalette.primary) {
    improvements.push('Establish a cohesive color palette')
  }

  if (!brandData.typography || !brandData.typography.primary) {
    improvements.push('Choose typography that reflects your brand personality')
  }

  if (completeness < 50) {
    improvements.push('Complete more brand elements for a stronger foundation')
  }

  return improvements
}

function generateRecommendations(brandData: any, completeness: number): string[] {
  const recommendations: string[] = []

  if (completeness < 60) {
    recommendations.push('Focus on completing core brand elements first')
  }

  if (brandData.industry) {
    recommendations.push(`Research ${brandData.industry} industry trends for competitive advantage`)
  }

  if (brandData.brandPersonality && brandData.brandPersonality.includes('Professional')) {
    recommendations.push('Consider a more formal logo design approach')
  }

  if (brandData.brandPersonality && brandData.brandPersonality.includes('Creative')) {
    recommendations.push('Explore bold and innovative visual elements')
  }

  recommendations.push('Create brand guidelines to ensure consistency across all touchpoints')
  recommendations.push('Test your brand with your target audience for feedback')

  return recommendations
}