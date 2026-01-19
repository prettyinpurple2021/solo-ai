import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { NextRequest, NextResponse} from 'next/server'
import { authenticateRequest} from '@/lib/auth-server'
import { rateLimitByIp} from '@/lib/rate-limit'
import { z} from 'zod'





// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Helper function to generate logo with OpenAI DALL-E
async function generateLogoWithOpenAI(client: any, brandName: string, style: string, description: string) {
  const prompt = `Create a professional logo for "${brandName}" in ${style} style. ${description}. The logo should be simple, memorable, and suitable for business use. Use clean lines and modern design principles. The logo should work well in both color and black & white.`
  
  const response = await client.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
    style: "natural"
  })

  return {
    url: response.data[0].url
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('brand:generate-logo', ip, 30_000, 20)
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const BodySchema = z.object({
      brandName: z.string().min(1, 'Brand name is required'),
      style: z.string().optional(),
    })
    const parsed = BodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    }
    const { brandName, style } = parsed.data

    // Generate logos using OpenAI Worker
    const env = process.env as unknown as Env
    const openaiWorker = env.OPENAI_WORKER

    if (openaiWorker) {
      try {
        // Create request to OpenAI worker
        const workerRequest = new Request('https://worker/generate-logo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            brandName,
            style: style || 'modern'
          })
        })

        // Call the worker
        const workerResponse = await openaiWorker.fetch(workerRequest)

        if (workerResponse.ok) {
          const result = await workerResponse.json()
          return NextResponse.json(result, { status: 200 })
        } else {
          const errorText = await workerResponse.text()
          logError('OpenAI Worker logo generation failed:', errorText)
        }
      } catch (aiError) {
        logError('OpenAI Worker communication failed:', aiError as any)
        // Fall through to fallback
      }
    }

    // Enhanced fallback to programmatically generated SVG logos
    const generateSVGLogo = (brandName: string, style: string, colors: { bg: string; text: string; accent: string }) => {
      // Generate initials safely
      const words = brandName.trim().split(/\s+/).filter(word => word.length > 0)
      const initials = words.length > 1 
        ? words.slice(0, 2).map(word => word[0]).join('').toUpperCase()
        : brandName.slice(0, 2).toUpperCase()
      
      let svgContent = ''
      switch (style) {
        case 'modern':
          svgContent = `
            <svg width="300" height="100" viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:${colors.accent};stop-opacity:1" />
                  <stop offset="100%" style="stop-color:${colors.bg};stop-opacity:1" />
                </linearGradient>
              </defs>
              <rect width="300" height="100" fill="${colors.bg}" rx="8"/>
              <circle cx="50" cy="50" r="30" fill="url(#grad1)"/>
              <text x="50" y="57" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="20" font-weight="bold">${initials}</text>
              <text x="100" y="40" fill="${colors.text}" font-family="Arial, sans-serif" font-size="24" font-weight="bold">${brandName}</text>
              <text x="100" y="60" fill="${colors.text}" font-family="Arial, sans-serif" font-size="12" opacity="0.7">BRAND</text>
            </svg>
          `
          break
        case 'elegant':
          svgContent = `
            <svg width="300" height="100" viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg">
              <rect width="300" height="100" fill="${colors.bg}"/>
              <rect x="20" y="20" width="60" height="60" fill="none" stroke="${colors.accent}" stroke-width="2" rx="4"/>
              <text x="50" y="58" text-anchor="middle" fill="${colors.accent}" font-family="serif" font-size="24" font-weight="bold">${initials}</text>
              <text x="100" y="45" fill="${colors.text}" font-family="serif" font-size="28" font-weight="300">${brandName}</text>
              <line x1="100" y1="55" x2="280" y2="55" stroke="${colors.accent}" stroke-width="1"/>
            </svg>
          `
          break
        case 'bold':
        default:
          svgContent = `
            <svg width="300" height="100" viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg">
              <rect width="300" height="100" fill="${colors.bg}"/>
              <rect x="20" y="25" width="50" height="50" fill="${colors.accent}" rx="8"/>
              <text x="45" y="58" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18" font-weight="bold">${initials}</text>
              <text x="90" y="45" fill="${colors.text}" font-family="Arial, sans-serif" font-size="22" font-weight="900">${brandName.toUpperCase()}</text>
              <rect x="90" y="55" width="180" height="3" fill="${colors.accent}"/>
            </svg>
          `
      }
      
      return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`
    }

    // Generate multiple professional logo variations
    const colorSchemes = [
      { name: 'Professional Blue', bg: '#f8fafc', text: '#1e293b', accent: '#3b82f6' },
      { name: 'Creative Purple', bg: '#fefefe', text: '#374151', accent: '#7c3aed' },
      { name: 'Bold Red', bg: '#0f172a', text: '#ffffff', accent: '#ef4444' },
      { name: 'Nature Green', bg: '#f0fdf4', text: '#166534', accent: '#22c55e' },
      { name: 'Warm Orange', bg: '#fff7ed', text: '#9a3412', accent: '#ea580c' }
    ]
    
    const styles = ['modern', 'elegant', 'bold']
    
    const fallbackLogos = colorSchemes.slice(0, 5).map((colorScheme, index) => {
      const logoStyle = styles[index % styles.length] || 'modern'
      return {
        id: index + 1,
        url: generateSVGLogo(brandName, logoStyle, colorScheme),
        style: logoStyle,
        description: `${colorScheme.name} ${logoStyle} design`,
        colorScheme: colorScheme.name,
        generated: true,
        downloadable: true
      }
    })

    logInfo('Generated fallback SVG logos', { 
      brandName, 
      style, 
      logoCount: fallbackLogos.length,
      reason: process.env.OPENAI_API_KEY ? 'AI service temporarily unavailable' : 'OpenAI API key not configured'
    })
    
    return NextResponse.json({ 
      success: true,
      logos: fallbackLogos,
      isFallback: true,
      fallbackReason: process.env.OPENAI_API_KEY ? 'AI service temporarily unavailable' : 'OpenAI API key not configured',
      message: `Generated ${fallbackLogos.length} professional logo variations for ${brandName}`,
      metadata: {
        brandName,
        requestedStyle: style || 'modern',
        generatedAt: new Date().toISOString(),
        totalVariations: fallbackLogos.length
      }
    }, { status: 200 })
  } catch (error) {
    logError('Error generating logos:', error as any)
    return NextResponse.json(
      { error: 'Failed to generate logos' },
      { status: 500 }
    )
  }
}
