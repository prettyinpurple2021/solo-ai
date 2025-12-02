import { logger, logError, logInfo } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'


export const dynamic = 'force-dynamic'

const favoriteActionSchema = z.object({
  templateId: z.string().min(1),
  action: z.enum(['add', 'remove', 'toggle'])
})

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest()
    if (!authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const rateLimitResult = await rateLimitByIp(request, { requests: 20, window: 60 })
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const body = await request.json()
    const { templateId, action } = favoriteActionSchema.parse(body)

    // Handle favorite action
    const result = await handleFavoriteAction(authResult.user.id, templateId, action)

    logInfo('Template favorite action completed', {
      userId: authResult.user.id,
      templateId,
      action,
      isFavorite: result.isFavorite
    })

    return NextResponse.json({
      success: true,
      isFavorite: result.isFavorite,
      message: result.message
    })
  } catch (error) {
    logError('Error handling template favorite:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: (error as any).errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest()
    if (!authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const rateLimitResult = await rateLimitByIp(request, { requests: 30, window: 60 })
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    // Get user's favorite templates
    const favorites = await getUserFavoriteTemplates(authResult.user.id)

    logInfo('User favorite templates fetched', { userId: authResult.user.id, count: favorites.length })
    return NextResponse.json({
      success: true,
      favorites
    })
  } catch (error) {
    logError('Error fetching favorite templates:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleFavoriteAction(userId: string, templateId: string, action: string) {
  try {
    // Mock favorite management - in production, this would interact with the database
    const currentFavorites = await getUserFavoriteTemplates(userId)
    const isCurrentlyFavorite = currentFavorites.some(fav => fav.id === templateId)

    let isFavorite = false
    let message = ''

    switch (action) {
      case 'add':
        if (!isCurrentlyFavorite) {
          isFavorite = true
          message = 'Template added to favorites'
        } else {
          isFavorite = true
          message = 'Template is already in favorites'
        }
        break
      case 'remove':
        if (isCurrentlyFavorite) {
          isFavorite = false
          message = 'Template removed from favorites'
        } else {
          isFavorite = false
          message = 'Template was not in favorites'
        }
        break
      case 'toggle':
        isFavorite = !isCurrentlyFavorite
        message = isFavorite ? 'Template added to favorites' : 'Template removed from favorites'
        break
    }

    // In production, this would update the database
    // For now, we'll simulate the action

    return { isFavorite, message }
  } catch (error) {
    logError('Error in handleFavoriteAction:', error)
    throw error
  }
}

async function getUserFavoriteTemplates(userId: string) {
  try {
    // Mock favorite templates - in production, this would query the database
    const favorites = [
      {
        id: 'decision-dashboard',
        title: 'Decision Dashboard',
        description: 'AI-guided template to weigh pros/cons, impact, and confidence level of a tough decision',
        category: 'Founder Systems & Self-Mgmt',
        isFavorite: true,
        favoritedAt: '2024-01-15T10:30:00Z',
        usageCount: 3,
        lastUsed: '2024-01-20T14:15:00Z'
      },
      {
        id: 'dm-sales-script-generator',
        title: 'DM Sales Script Generator',
        description: 'For founders using IG/TikTok DMs for selling — input persona + offer, get tailored, non-cringe DM scripts',
        category: 'Lead Gen & Sales',
        isFavorite: true,
        favoritedAt: '2024-01-10T09:20:00Z',
        usageCount: 2,
        lastUsed: '2024-01-18T11:45:00Z'
      },
      {
        id: 'viral-hook-generator',
        title: 'Viral Hook Generator',
        description: 'Input content idea + vibe. Get high-engagement hook options in text or video format',
        category: 'Content & Collab',
        isFavorite: true,
        favoritedAt: '2024-01-12T16:00:00Z',
        usageCount: 5,
        lastUsed: '2024-01-22T08:30:00Z'
      }
    ]

    return favorites
  } catch (error) {
    logError('Error fetching favorite templates:', error)
    throw error
  }
}
