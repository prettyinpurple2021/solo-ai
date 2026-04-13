import { logError, logInfo,} from '@/lib/logger'
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
          return NextResponse.json({ error: 'OpenAI Worker logo generation failed', details: errorText }, { status: 500 })
        }
      } catch (aiError) {
        logError('OpenAI Worker communication failed:', aiError as any)
        return NextResponse.json({ error: 'OpenAI Worker communication failed' }, { status: 500 })
      }
    } else {
      logError('OPENAI_WORKER is not configured')
      return NextResponse.json({ error: 'AI service configuration is missing' }, { status: 500 })
    }
  } catch (error) {
    logError('Error generating logos:', error as any)
    return NextResponse.json(
      { error: 'Failed to generate logos' },
      { status: 500 }
    )
  }
}
