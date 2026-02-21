import { logError, logInfo } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'
import { generateObject } from 'ai'
import { openai } from '@/lib/ai-config'

export const dynamic = 'force-dynamic'

const brandDataSchema = z.object({
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
    neutral: z.string().optional(),
  }).optional(),
  typography: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
  }).optional(),
})

type BrandData = z.infer<typeof brandDataSchema>;

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
    const brandData = brandDataSchema.parse(body)

    // Generate brand guidelines with AI
    const guidelines = await generateBrandGuidelinesWithAI(brandData)

    logInfo('Brand guidelines generated successfully', { userId: authResult.user.id })
    return NextResponse.json({ 
      success: true, 
      guidelines 
    })
  } catch (error) {
    logError('Error generating brand guidelines:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid brand data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateBrandGuidelinesWithAI(brandData: BrandData) {
  try {
    const schema = z.object({
      logoUsage: z.array(z.string()),
      colorUsage: z.array(z.string()),
      typographyRules: z.array(z.string()),
      spacingRules: z.array(z.string())
    });

    const { object } = await generateObject({
      model: openai('gpt-4o'),
      system: 'You are an expert brand strategist and designer.',
      prompt: `Generate comprehensive brand guidelines for a company with the following details:
      Company: ${brandData.companyName}
      Tagline: ${brandData.tagline || 'N/A'}
      Description: ${brandData.description || 'N/A'}
      Industry: ${brandData.industry || 'N/A'}
      Target Audience: ${brandData.targetAudience || 'N/A'}
      Personality: ${brandData.brandPersonality?.join(', ') || 'N/A'}
      Colors: ${JSON.stringify(brandData.colorPalette || {})}
      Typography: ${JSON.stringify(brandData.typography || {})}
      
      Provide specific, actionable rules for logo usage, color application, typography, and spacing.`,
      schema: schema as any
    });

    return object;
  } catch (error) {
    logError('Error in AI brand guidelines generation, using fallback:', error)
    // High-quality fallback if AI fails
    return {
      logoUsage: generateLogoUsageRules(brandData),
      colorUsage: generateColorUsageRules(brandData),
      typographyRules: generateTypographyRules(brandData),
      spacingRules: generateSpacingRules(brandData)
    }
  }
}

function generateLogoUsageRules(brandData: BrandData): string[] {
  const rules: string[] = []

  rules.push('Always maintain a minimum clear space around the logo equal to the height of the "x" in the logo')
  rules.push('Never alter, distort, or recreate the logo in any way')
  rules.push('Use the logo on backgrounds with sufficient contrast for readability')

  if (brandData.brandPersonality && brandData.brandPersonality.includes('Professional')) {
    rules.push('Use the logo in a formal, corporate context with professional spacing')
    rules.push('Maintain consistent logo placement in all business communications')
  }

  rules.push('Ensure the logo is never smaller than 24px in digital applications')
  rules.push('Use high-resolution versions for print materials (minimum 300 DPI)')

  return rules
}

function generateColorUsageRules(brandData: BrandData): string[] {
  const rules: string[] = []

  if (brandData.colorPalette?.primary) {
    rules.push(`Use ${brandData.colorPalette.primary} as the primary brand color for main elements`)
  }

  rules.push('Never use colors that conflict with the established palette')
  rules.push('Ensure sufficient contrast ratios for accessibility (WCAG AA compliance)')
  rules.push('Use neutral colors for backgrounds and supporting elements')

  if (brandData.industry === 'Healthcare') {
    rules.push('Prioritize calming, trustworthy colors in healthcare communications')
  } else if (brandData.industry === 'Technology') {
    rules.push('Use modern, tech-forward colors that convey innovation')
  }

  return rules
}

function generateTypographyRules(brandData: BrandData): string[] {
  const rules: string[] = []

  if (brandData.typography?.primary) {
    rules.push(`Use ${brandData.typography.primary} as the primary font for headings and important text`)
  }

  rules.push('Maintain consistent font sizes across all brand materials')
  rules.push('Use proper line spacing (1.4-1.6x) for optimal readability')
  rules.push('Never use more than 3 different font families in a single design')

  return rules
}

function generateSpacingRules(brandData: BrandData): string[] {
  const rules: string[] = []

  rules.push('Use consistent spacing units (8px grid system) for all layouts')
  rules.push('Maintain generous white space for clean, uncluttered designs')
  rules.push('Ensure adequate spacing between text elements for readability')

  return rules
}
