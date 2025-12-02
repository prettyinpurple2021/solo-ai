import { logger, logError, logInfo } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'


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
      return NextResponse.json({ error: 'Invalid brand data', details: (error as any).errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateBrandGuidelinesWithAI(brandData: any) {
  try {
    // Mock AI-generated guidelines - in , this would use OpenAI
    const guidelines = {
      logoUsage: generateLogoUsageRules(brandData),
      colorUsage: generateColorUsageRules(brandData),
      typographyRules: generateTypographyRules(brandData),
      spacingRules: generateSpacingRules(brandData)
    }

    return guidelines
  } catch (error) {
    logError('Error in AI brand guidelines generation:', error)
    throw error
  }
}

function generateLogoUsageRules(brandData: any): string[] {
  const rules: string[] = []

  rules.push('Always maintain a minimum clear space around the logo equal to the height of the "x" in the logo')
  rules.push('Never alter, distort, or recreate the logo in any way')
  rules.push('Use the logo on backgrounds with sufficient contrast for readability')

  if (brandData.brandPersonality && brandData.brandPersonality.includes('Professional')) {
    rules.push('Use the logo in a formal, corporate context with professional spacing')
    rules.push('Maintain consistent logo placement in all business communications')
  }

  if (brandData.brandPersonality && brandData.brandPersonality.includes('Creative')) {
    rules.push('Allow creative applications while maintaining logo integrity')
    rules.push('Use the logo in artistic contexts that align with brand values')
  }

  rules.push('Ensure the logo is never smaller than 24px in digital applications')
  rules.push('Use high-resolution versions for print materials (minimum 300 DPI)')

  return rules
}

function generateColorUsageRules(brandData: any): string[] {
  const rules: string[] = []

  if (brandData.colorPalette?.primary) {
    rules.push(`Use ${brandData.colorPalette.primary} as the primary brand color for main elements`)
  }

  if (brandData.colorPalette?.secondary) {
    rules.push(`Use ${brandData.colorPalette.secondary} for secondary elements and accents`)
  }

  if (brandData.colorPalette?.accent) {
    rules.push(`Use ${brandData.colorPalette.accent} sparingly for call-to-action buttons and highlights`)
  }

  rules.push('Never use colors that conflict with the established palette')
  rules.push('Ensure sufficient contrast ratios for accessibility (WCAG AA compliance)')
  rules.push('Use neutral colors for backgrounds and supporting elements')

  if (brandData.industry === 'Healthcare') {
    rules.push('Prioritize calming, trustworthy colors in healthcare communications')
  } else if (brandData.industry === 'Technology') {
    rules.push('Use modern, tech-forward colors that convey innovation')
  } else if (brandData.industry === 'Finance') {
    rules.push('Emphasize professional, trustworthy colors in financial communications')
  }

  return rules
}

function generateTypographyRules(brandData: any): string[] {
  const rules: string[] = []

  if (brandData.typography?.primary) {
    rules.push(`Use ${brandData.typography.primary} as the primary font for headings and important text`)
  }

  if (brandData.typography?.secondary) {
    rules.push(`Use ${brandData.typography.secondary} for body text and secondary information`)
  }

  rules.push('Maintain consistent font sizes across all brand materials')
  rules.push('Use proper line spacing (1.4-1.6x) for optimal readability')
  rules.push('Never use more than 3 different font families in a single design')

  if (brandData.brandPersonality && brandData.brandPersonality.includes('Modern')) {
    rules.push('Use clean, sans-serif fonts for a modern appearance')
    rules.push('Avoid overly decorative or script fonts')
  }

  if (brandData.brandPersonality && brandData.brandPersonality.includes('Traditional')) {
    rules.push('Use classic, serif fonts for traditional appeal')
    rules.push('Maintain formal typography hierarchy')
  }

  rules.push('Ensure text is legible across all brand touchpoints')
  rules.push('Use appropriate font weights (regular, medium, bold) consistently')

  return rules
}

function generateSpacingRules(brandData: any): string[] {
  const rules: string[] = []

  rules.push('Use consistent spacing units (8px grid system) for all layouts')
  rules.push('Maintain generous white space for clean, uncluttered designs')
  rules.push('Ensure adequate spacing between text elements for readability')

  if (brandData.brandPersonality && brandData.brandPersonality.includes('Minimalist')) {
    rules.push('Use abundant white space for minimalist aesthetic')
    rules.push('Maintain large margins and padding in all layouts')
  }

  if (brandData.brandPersonality && brandData.brandPersonality.includes('Energetic')) {
    rules.push('Use dynamic spacing that creates visual movement')
    rules.push('Allow for creative spacing variations while maintaining structure')
  }

  rules.push('Ensure consistent spacing in responsive designs')
  rules.push('Use proportional spacing that scales with content')
  rules.push('Maintain visual hierarchy through strategic spacing')

  return rules
}
