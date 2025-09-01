import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'
import { eq, and, sql } from 'drizzle-orm'
import { savedIntelligenceSearches } from '../route'

// Validation schema for updates
const SavedSearchUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  searchParams: z.object({
    query: z.string().optional(),
    competitorIds: z.array(z.number()).optional(),
    sourceTypes: z.array(z.string()).optional(),
    dataTypes: z.array(z.string()).optional(),
    importance: z.array(z.string()).optional(),
    dateRange: z.object({
      start: z.string(),
      end: z.string(),
    }).optional(),
    tags: z.array(z.string()).optional(),
    agentAnalysis: z.array(z.string()).optional(),
    confidenceRange: z.object({
      min: z.number(),
      max: z.number(),
    }).optional(),
    hasAnalysis: z.boolean().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.string().optional(),
  }).optional(),
  isFavorite: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchId = parseInt(params.id)
    if (isNaN(searchId)) {
      return NextResponse.json({ error: 'Invalid search ID' }, { status: 400 })
    }

    // Get saved search
    const savedSearch = await db
      .select()
      .from(savedIntelligenceSearches)
      .where(
        and(
          eq(savedIntelligenceSearches.id, searchId),
          eq(savedIntelligenceSearches.user_id, user.id)
        )
      )
      .limit(1)

    if (savedSearch.length === 0) {
      return NextResponse.json(
        { error: 'Saved search not found or access denied' },
        { status: 404 }
      )
    }

    const search = savedSearch[0]

    // Update last used timestamp and increment use count
    await db
      .update(savedIntelligenceSearches)
      .set({
        last_used: new Date(),
        use_count: sql`${savedIntelligenceSearches.use_count} + 1`,
        updated_at: new Date(),
      })
      .where(eq(savedIntelligenceSearches.id, searchId))

    const transformedSearch = {
      id: search.id,
      name: search.name,
      description: search.description,
      searchParams: search.search_params,
      isFavorite: search.is_favorite,
      lastUsed: new Date(), // Return updated timestamp
      useCount: (search.use_count || 0) + 1, // Return incremented count
      createdAt: search.created_at,
      updatedAt: search.updated_at,
    }

    return NextResponse.json({
      savedSearch: transformedSearch,
    })
  } catch (error) {
    console.error('Error fetching saved search:', error)
    return NextResponse.json(
      { error: 'Failed to fetch saved search' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('saved-search:update', ip, 60_000, 20)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchId = parseInt(params.id)
    if (isNaN(searchId)) {
      return NextResponse.json({ error: 'Invalid search ID' }, { status: 400 })
    }

    const body = await request.json()
    const parsed = SavedSearchUpdateSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Check if saved search exists and belongs to user
    const existingSearch = await db
      .select()
      .from(savedIntelligenceSearches)
      .where(
        and(
          eq(savedIntelligenceSearches.id, searchId),
          eq(savedIntelligenceSearches.user_id, user.id)
        )
      )
      .limit(1)

    if (existingSearch.length === 0) {
      return NextResponse.json(
        { error: 'Saved search not found or access denied' },
        { status: 404 }
      )
    }

    // Check for name conflicts if name is being updated
    if (data.name && data.name !== existingSearch[0].name) {
      const nameConflict = await db
        .select()
        .from(savedIntelligenceSearches)
        .where(
          and(
            eq(savedIntelligenceSearches.user_id, user.id),
            eq(savedIntelligenceSearches.name, data.name)
          )
        )
        .limit(1)

      if (nameConflict.length > 0) {
        return NextResponse.json(
          { error: 'A saved search with this name already exists' },
          { status: 409 }
        )
      }
    }

    // Build update object
    const updateData: any = {
      updated_at: new Date(),
    }

    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.searchParams !== undefined) updateData.search_params = data.searchParams
    if (data.isFavorite !== undefined) updateData.is_favorite = data.isFavorite

    // Update saved search
    const [updatedSearch] = await db
      .update(savedIntelligenceSearches)
      .set(updateData)
      .where(eq(savedIntelligenceSearches.id, searchId))
      .returning()

    const transformedSearch = {
      id: updatedSearch.id,
      name: updatedSearch.name,
      description: updatedSearch.description,
      searchParams: updatedSearch.search_params,
      isFavorite: updatedSearch.is_favorite,
      lastUsed: updatedSearch.last_used,
      useCount: updatedSearch.use_count,
      createdAt: updatedSearch.created_at,
      updatedAt: updatedSearch.updated_at,
    }

    return NextResponse.json({
      savedSearch: transformedSearch,
    })
  } catch (error) {
    console.error('Error updating saved search:', error)
    return NextResponse.json(
      { error: 'Failed to update saved search' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('saved-search:delete', ip, 60_000, 10)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchId = parseInt(params.id)
    if (isNaN(searchId)) {
      return NextResponse.json({ error: 'Invalid search ID' }, { status: 400 })
    }

    // Check if saved search exists and belongs to user
    const existingSearch = await db
      .select()
      .from(savedIntelligenceSearches)
      .where(
        and(
          eq(savedIntelligenceSearches.id, searchId),
          eq(savedIntelligenceSearches.user_id, user.id)
        )
      )
      .limit(1)

    if (existingSearch.length === 0) {
      return NextResponse.json(
        { error: 'Saved search not found or access denied' },
        { status: 404 }
      )
    }

    // Delete saved search
    await db
      .delete(savedIntelligenceSearches)
      .where(eq(savedIntelligenceSearches.id, searchId))

    return NextResponse.json({
      message: 'Saved search deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting saved search:', error)
    return NextResponse.json(
      { error: 'Failed to delete saved search' },
      { status: 500 }
    )
  }
}