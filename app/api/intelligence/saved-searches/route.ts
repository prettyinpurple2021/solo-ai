import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { pgTable, varchar, text, jsonb, timestamp, integer, boolean } from 'drizzle-orm/pg-core'

// Saved searches table schema (this would normally be in schema.ts)
export const savedIntelligenceSearches = pgTable('saved_intelligence_searches', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  user_id: varchar('user_id', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  search_params: jsonb('search_params').notNull(),
  is_favorite: boolean('is_favorite').default(false),
  last_used: timestamp('last_used'),
  use_count: integer('use_count').default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
})

// Validation schemas
const SavedSearchCreateSchema = z.object({
  name: z.string().min(1).max(255),
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
  }),
  isFavorite: z.boolean().default(false),
})

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

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all saved searches for the user
    const savedSearches = await db
      .select()
      .from(savedIntelligenceSearches)
      .where(eq(savedIntelligenceSearches.user_id, user.id))
      .orderBy(desc(savedIntelligenceSearches.last_used), desc(savedIntelligenceSearches.created_at))

    const transformedSearches = savedSearches.map(search => ({
      id: search.id,
      name: search.name,
      description: search.description,
      searchParams: search.search_params,
      isFavorite: search.is_favorite,
      lastUsed: search.last_used,
      useCount: search.use_count,
      createdAt: search.created_at,
      updatedAt: search.updated_at,
    }))

    return NextResponse.json({
      savedSearches: transformedSearches,
    })
  } catch (error) {
    console.error('Error fetching saved searches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch saved searches' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('saved-search:create', ip, 60_000, 10)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = SavedSearchCreateSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Check if user already has a saved search with this name
    const existingSearch = await db
      .select()
      .from(savedIntelligenceSearches)
      .where(
        and(
          eq(savedIntelligenceSearches.user_id, user.id),
          eq(savedIntelligenceSearches.name, data.name)
        )
      )
      .limit(1)

    if (existingSearch.length > 0) {
      return NextResponse.json(
        { error: 'A saved search with this name already exists' },
        { status: 409 }
      )
    }

    // Create saved search
    const [newSavedSearch] = await db
      .insert(savedIntelligenceSearches)
      .values({
        user_id: user.id,
        name: data.name,
        description: data.description || null,
        search_params: data.searchParams,
        is_favorite: data.isFavorite,
        use_count: 0,
      })
      .returning()

    const transformedSearch = {
      id: newSavedSearch.id,
      name: newSavedSearch.name,
      description: newSavedSearch.description,
      searchParams: newSavedSearch.search_params,
      isFavorite: newSavedSearch.is_favorite,
      lastUsed: newSavedSearch.last_used,
      useCount: newSavedSearch.use_count,
      createdAt: newSavedSearch.created_at,
      updatedAt: newSavedSearch.updated_at,
    }

    return NextResponse.json(
      { savedSearch: transformedSearch },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating saved search:', error)
    return NextResponse.json(
      { error: 'Failed to create saved search' },
      { status: 500 }
    )
  }
}