import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Request schema validation
const logoRequestSchema = z.object({
  brandName: z.string().min(1, 'Brand name is required'),
  industry: z.string().optional(),
  style: z.string().optional(),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
  }).optional(),
  typography: z.object({
    heading: z.string(),
    body: z.string(),
  }).optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json()
    const { brandName, industry, style, colors, typography } = logoRequestSchema.parse(body)

    // Initialize Supabase client for authentication (skip in development)
    const isDevelopment = process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_SUPABASE_URL
    let user = null
    
    if (!isDevelopment) {
      const supabase = await createClient()
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError || !authUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      user = authUser
    }

    // Check if OpenAI API key is available
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not configured, using fallback generation')
      
      // Generate enhanced fallback logos
      const prompts = [
        `Minimalist design for "${brandName}" in ${colors?.primary || '#8E24AA'}`,
        `Bold and impactful for "${brandName}" using ${typography?.heading || 'Inter'} font`,
        `Elegant and sophisticated for "${brandName}" brand`,
        `Creative and innovative for "${brandName}" company`
      ]
      
      const fallbackLogos = prompts.map((prompt, index) => ({
        url: generateFallbackLogo(brandName, colors, typography, index + 1),
        prompt: prompt,
        index: index + 1,
        isFallback: true
      }))

      return NextResponse.json({
        logos: fallbackLogos,
        brandName,
        totalGenerated: fallbackLogos.length,
        isFallback: true,
        fallbackReason: 'OPENAI_API_KEY not configured - using enhanced preview mode'
      })
    }

    // Prepare logo generation prompts
    const basePrompt = `Create a professional logo for "${brandName}"`
    const industryText = industry ? ` in the ${industry} industry` : ''
    const styleText = style ? ` with a ${style} aesthetic` : ''
    const colorText = colors ? ` using colors ${colors.primary}, ${colors.secondary}, and ${colors.accent}` : ''
    
    const prompts = [
      `${basePrompt}${industryText}${styleText}${colorText}. Minimalist design, clean lines, modern look.`,
      `${basePrompt}${industryText}${styleText}${colorText}. Bold and impactful, strong typography, confident aesthetic.`,
      `${basePrompt}${industryText}${styleText}${colorText}. Elegant and sophisticated, premium feel, luxury branding.`,
      `${basePrompt}${industryText}${styleText}${colorText}. Creative and innovative, unique symbol, memorable design.`
    ]

    try {
      // Generate logos using OpenAI DALL-E
      const logoPromises = prompts.map(async (prompt, index) => {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: prompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
            style: 'vivid'
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error(`DALL-E API error for prompt ${index + 1}:`, errorData)
          throw new Error(`Failed to generate logo ${index + 1}: ${response.status}`)
        }

        const data = await response.json()
        return {
          url: data.data[0]?.url,
          prompt: prompt,
          index: index + 1
        }
      })

      // Wait for all logo generations to complete
      const logos = await Promise.all(logoPromises)

      // Filter out any failed generations
      const successfulLogos = logos.filter(logo => logo.url)

      if (successfulLogos.length === 0) {
        throw new Error('All logo generations failed')
      }

      // Update daily stats (skip in development mode)
      if (!isDevelopment && user) {
        const supabase = await createClient()
        try {
          await supabase.rpc('update_daily_stats', {
            p_user_id: user.id,
            p_stat_type: 'ai_interactions',
            p_increment: successfulLogos.length
          })
        } catch (error) {
          console.error('Failed to update daily stats:', error)
          // Don't fail the request if stats update fails
        }
      }

      return NextResponse.json({
        logos: successfulLogos,
        brandName,
        totalGenerated: successfulLogos.length
      })

    } catch (apiError) {
      console.error('Logo generation API error:', apiError)
      
      // Fallback to enhanced placeholder generation if DALL-E fails
      console.log('Falling back to enhanced placeholder generation')
      
      const fallbackLogos = prompts.map((prompt, index) => ({
        url: generateFallbackLogo(brandName, colors, typography, index + 1),
        prompt: prompt,
        index: index + 1,
        isFallback: true
      }))

      return NextResponse.json({
        logos: fallbackLogos,
        brandName,
        totalGenerated: fallbackLogos.length,
        isFallback: true,
        fallbackReason: 'AI service temporarily unavailable'
      })
    }

  } catch (error) {
    console.error('Generate logo API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Enhanced fallback logo generation function
function generateFallbackLogo(
  brandName: string, 
  colors?: { primary: string; secondary: string; accent: string },
  typography?: { heading: string; body: string },
  styleIndex: number = 1
): string {
  const primaryColor = colors?.primary || '#8E24AA'
  const secondaryColor = colors?.secondary || '#E1BEE7'
  const accentColor = colors?.accent || '#FF4081'
  const headingFont = typography?.heading || 'Inter'

  const symbols = ['👑', '⭐', '💎', '🎯']
  const symbol = symbols[(styleIndex - 1) % symbols.length]

  const svg = `
    <svg width="300" height="150" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad${styleIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${accentColor};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="300" height="150" fill="${secondaryColor}" rx="15"/>
      <circle cx="60" cy="75" r="25" fill="url(#grad${styleIndex})"/>
      <text x="65" y="85" font-family="${headingFont}, sans-serif" font-size="18" 
            text-anchor="middle" fill="white">${symbol}</text>
      <text x="110" y="70" font-family="${headingFont}, sans-serif" font-size="22" 
            font-weight="bold" fill="${primaryColor}">${brandName}</text>
      <text x="110" y="90" font-family="${headingFont}, sans-serif" font-size="10" 
            fill="${primaryColor}" opacity="0.7">Style ${styleIndex} • Enhanced Preview</text>
    </svg>
  `

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}