import { logError, logInfo } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'




export const dynamic = 'force-dynamic'

import { db } from '@/db'
import { userSettings } from '@/shared/db/schema'
import { eq, and } from 'drizzle-orm'

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
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
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
    // Category: 'template_favorites'
    // Architectural Decision: Storing favorites in user_settings JSONB to allow flexible schema without migration.
    
    // Get current settings
  try {
    const currentSettings = await db
      .select()
      .from(userSettings)
      .where(and(
        eq(userSettings.user_id, userId),
        eq(userSettings.category, 'template_favorites')
      ))
      .limit(1)

    let favorites: string[] = []
    let settingsId: string | undefined

    if (currentSettings.length > 0) {
      const settings = currentSettings[0].settings as any
      favorites = Array.isArray(settings?.favorites) ? settings.favorites : []
      settingsId = currentSettings[0].id
    }

    const isCurrentlyFavorite = favorites.includes(templateId)
    let isFavorite = false
    let message = ''

    switch (action) {
      case 'add':
        if (!isCurrentlyFavorite) {
          favorites.push(templateId)
          isFavorite = true
          message = 'Template added to favorites'
        } else {
          isFavorite = true
          message = 'Template is already in favorites'
        }
        break
      case 'remove':
        if (isCurrentlyFavorite) {
          favorites = favorites.filter(id => id !== templateId)
          isFavorite = false
          message = 'Template removed from favorites'
        } else {
          isFavorite = false
          message = 'Template was not in favorites'
        }
        break
      case 'toggle':
        if (isCurrentlyFavorite) {
            favorites = favorites.filter(id => id !== templateId)
            isFavorite = false
            message = 'Template removed from favorites'
        } else {
            favorites.push(templateId)
            isFavorite = true
            message = 'Template added to favorites'
        }
        break
    }

    // Update database
    if (settingsId) {
        await db.update(userSettings)
            .set({ settings: { favorites }, updated_at: new Date() })
            .where(eq(userSettings.id, settingsId))
    } else {
        await db.insert(userSettings).values({
            user_id: userId,
            category: 'template_favorites',
            settings: { favorites }
        })
    }

    return { isFavorite, message }
  } catch (error) {
    logError('Error in handleFavoriteAction:', error)
    throw error
  }
}

async function getUserFavoriteTemplates(userId: string) {
  try {
    // Get favorite IDs from user_settings
    const settings = await db
      .select()
      .from(userSettings)
      .where(and(
        eq(userSettings.user_id, userId),
        eq(userSettings.category, 'template_favorites')
      ))
      .limit(1)

    const favoriteIds = (settings[0]?.settings as any)?.favorites || []

    if (favoriteIds.length === 0) {
        return []
    }

    // Template Definitions (V1 Standard Templates)
    // These are static definitions for the "standard" templates available in the system.
    const STANDARD_TEMPLATES = [
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
        favoritedAt: '2024-01-12T16: 00Z',
        usageCount: 5,
        lastUsed: '2024-01-22T08:30:00Z'
      }
    ]

    // Return only the templates that the user has favorited
    return STANDARD_TEMPLATES.filter(f => favoriteIds.includes(f.id));
  } catch (error) {
    logError('Error fetching favorite templates:', error)
    throw error
  }
}
