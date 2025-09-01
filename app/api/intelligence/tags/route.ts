import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { intelligenceData } from '@/db/schema'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'
import { eq, sql } from 'drizzle-orm'

// Validation schemas
const TagOperationSchema = z.object({
  intelligenceIds: z.array(z.number().int().positive()),
  tags: z.array(z.string().min(1).max(50)),
  operation: z.enum(['add', 'remove', 'replace']).default('add'),
})

const TagSuggestionsSchema = z.object({
  query: z.string().min(1).optional(),
  limit: z.number().int().min(1).max(50).default(20),
})

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())
    
    if (queryParams.limit) queryParams.limit = parseInt(queryParams.limit as string)

    const filters = TagSuggestionsSchema.parse(queryParams)

    // Get all unique tags from user's intelligence data
    const tagsQuery = sql`
      SELECT DISTINCT tag, COUNT(*) as usage_count
      FROM (
        SELECT jsonb_array_elements_text(tags) as tag
        FROM ${intelligenceData}
        WHERE ${intelligenceData.user_id} = ${user.id}
        AND tags IS NOT NULL
        AND jsonb_array_length(tags) > 0
      ) tags_expanded
      ${filters.query ? sql`WHERE LOWER(tag) LIKE ${`%${filters.query.toLowerCase()}%`}` : sql``}
      GROUP BY tag
      ORDER BY usage_count DESC, tag ASC
      LIMIT ${filters.limit}
    `

    const result = await db.execute(tagsQuery)
    
    const tags = result.rows.map(row => ({
      tag: row.tag as string,
      usageCount: parseInt(row.usage_count as string),
    }))

    // Also get suggested tags based on common patterns
    const suggestedTags = [
      'competitive-analysis',
      'pricing-intelligence',
      'product-launch',
      'marketing-campaign',
      'hiring-activity',
      'funding-news',
      'partnership',
      'acquisition',
      'strategic-move',
      'vulnerability',
      'opportunity',
      'threat-assessment',
      'market-expansion',
      'technology-update',
      'leadership-change',
    ].filter(tag => 
      !filters.query || tag.toLowerCase().includes(filters.query.toLowerCase())
    ).slice(0, 10)

    return NextResponse.json({
      userTags: tags,
      suggestedTags: suggestedTags.map(tag => ({ tag, usageCount: 0 })),
    })
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('intelligence:tags', ip, 60_000, 50)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = TagOperationSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { intelligenceIds, tags, operation } = parsed.data

    // Verify all intelligence entries belong to the user
    const intelligenceEntries = await db
      .select({ id: intelligenceData.id, tags: intelligenceData.tags })
      .from(intelligenceData)
      .where(
        sql`${intelligenceData.id} = ANY(${intelligenceIds}) AND ${intelligenceData.user_id} = ${user.id}`
      )

    if (intelligenceEntries.length !== intelligenceIds.length) {
      return NextResponse.json(
        { error: 'Some intelligence entries not found or access denied' },
        { status: 404 }
      )
    }

    // Process each intelligence entry
    const updatePromises = intelligenceEntries.map(async (entry) => {
      const currentTags = (entry.tags as string[]) || []
      let newTags: string[]

      switch (operation) {
        case 'add':
          // Add new tags, avoiding duplicates
          newTags = [...new Set([...currentTags, ...tags])]
          break
        case 'remove':
          // Remove specified tags
          newTags = currentTags.filter(tag => !tags.includes(tag))
          break
        case 'replace':
          // Replace all tags
          newTags = [...new Set(tags)]
          break
        default:
          newTags = currentTags
      }

      return db
        .update(intelligenceData)
        .set({
          tags: newTags,
          updated_at: new Date(),
        })
        .where(eq(intelligenceData.id, entry.id))
    })

    await Promise.all(updatePromises)

    return NextResponse.json({
      message: `Successfully ${operation}ed tags for ${intelligenceIds.length} intelligence entries`,
      operation,
      tags,
      affectedEntries: intelligenceIds.length,
    })
  } catch (error) {
    console.error('Error managing tags:', error)
    return NextResponse.json(
      { error: 'Failed to manage tags' },
      { status: 500 }
    )
  }
}