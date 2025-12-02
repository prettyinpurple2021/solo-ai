import { logError, logWarn } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { getSql } from '@/lib/api-utils'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'


// Type for document search results from database
interface DocumentSearchResult {
  id: string
  name: string
  description: string
  tags: string[]
  category: string
  file_type: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ai_insights: any
}



export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      query = '',
      semantic = false,
      fileTypes = [],
      categories = [],
      tags = [],
      dateRange,
      sizeRange = [0, 1000],
      _authors = [],
      favorites = false,
      folders = [],
      sortBy = 'relevance',
      sortOrder = 'desc',
      includeContent = true,
      _includeComments = false,
      limit = 50,
      offset = 0
    } = await request.json()

    const sql = getSql()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sqlClient = sql as any

    // Build base query
    let whereConditions = ['d.user_id = $1']
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let params: any[] = [user.id]
    let paramIndex = 2

    // Text search
    if (query.trim()) {
      if (semantic && includeContent) {
        // For semantic search, we'll use AI to find relevant documents
        const semanticResults = await performSemanticSearch(query, user.id, sql)
        if (semanticResults.length > 0) {
          // Use parameterized queries to prevent SQL injection
          const placeholders = semanticResults.map(() => `$${paramIndex++}`).join(',')
          whereConditions.push(`d.id IN (${placeholders})`)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          params.push(...semanticResults.map((r: any) => r.id))
        } else {
          // Fallback to regular text search if semantic search fails
          whereConditions.push(`(
            d.name ILIKE $${paramIndex} OR 
            d.description ILIKE $${paramIndex} OR
            d.original_name ILIKE $${paramIndex}
          )`)
          params.push(`%${query}%`)
          paramIndex++
        }
      } else {
        // Regular text search
        if (includeContent) {
          whereConditions.push(`(
            d.name ILIKE $${paramIndex} OR 
            d.description ILIKE $${paramIndex} OR
            d.original_name ILIKE $${paramIndex}
          )`)
        } else {
          whereConditions.push(`(
            d.name ILIKE $${paramIndex} OR 
            d.original_name ILIKE $${paramIndex}
          )`)
        }
        params.push(`%${query}%`)
        paramIndex++
      }
    }

    // File types filter
    if (fileTypes.length > 0) {
      const placeholders = fileTypes.map(() => `$${paramIndex++}`).join(',')
      whereConditions.push(`d.file_type IN (${placeholders})`)
      params.push(...fileTypes)
    }

    // Categories filter
    if (categories.length > 0) {
      const placeholders = categories.map(() => `$${paramIndex++}`).join(',')
      whereConditions.push(`d.category IN (${placeholders})`)
      params.push(...categories)
    }

    // Tags filter
    if (tags.length > 0) {
      const tagConditions = tags.map((tag: string) => {
        const condition = `$${paramIndex++} = ANY(d.tags)`
        params.push(tag)
        return condition
      })
      whereConditions.push(`(${tagConditions.join(' OR ')})`)
    }

    // Date range filter
    if (dateRange?.from) {
      whereConditions.push(`d.created_at >= $${paramIndex++}`)
      params.push(dateRange.from.toISOString())
    }
    if (dateRange?.to) {
      whereConditions.push(`d.created_at <= $${paramIndex++}`)
      params.push(dateRange.to.toISOString())
    }

    // Size range filter (convert MB to bytes)
    if (sizeRange[0] > 0) {
      whereConditions.push(`d.size >= $${paramIndex++}`)
      params.push(sizeRange[0] * 1024 * 1024)
    }
    if (sizeRange[1] < 1000) {
      whereConditions.push(`d.size <= $${paramIndex++}`)
      params.push(sizeRange[1] * 1024 * 1024)
    }

    // Favorites filter
    if (favorites) {
      whereConditions.push(`d.is_favorite = true`)
    }

    // Folders filter
    if (folders.length > 0) {
      const placeholders = folders.map(() => `$${paramIndex++}`).join(',')
      whereConditions.push(`d.folder_id IN (${placeholders})`)
      params.push(...folders)
    }

    // Build sort clause
    let orderClause = ''
    switch (sortBy) {
      case 'date':
        orderClause = `ORDER BY d.created_at ${sortOrder.toUpperCase()}`
        break
      case 'name':
        orderClause = `ORDER BY d.name ${sortOrder.toUpperCase()}`
        break
      case 'size':
        orderClause = `ORDER BY d.size ${sortOrder.toUpperCase()}`
        break
      case 'relevance':
      default:
        if (semantic && query.trim()) {
          // For semantic search, maintain AI relevance order
          orderClause = `ORDER BY d.created_at DESC`
        } else {
          orderClause = `ORDER BY d.created_at DESC`
        }
        break
    }

    // Build final query
    const query_sql = `
      SELECT 
        d.id, d.name, d.original_name, d.file_type, d.mime_type, d.size, 
        d.category, d.description, d.tags, d.metadata, d.ai_insights,
        d.is_favorite, d.download_count, d.view_count, d.last_accessed,
        d.created_at, d.updated_at, d.folder_id,
        f.name as folder_name, f.color as folder_color
      FROM documents d
      LEFT JOIN document_folders f ON d.folder_id = f.id
      WHERE ${whereConditions.join(' AND ')}
      ${orderClause}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `

    params.push(limit, offset)

    // Execute search using unsafe for dynamic SQL
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const files = await sqlClient.unsafe(query_sql, params) as any[]

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM documents d
      LEFT JOIN document_folders f ON d.folder_id = f.id
      WHERE ${whereConditions.join(' AND ')}
    `
    const countParams = params.slice(0, -2) // Remove limit and offset
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const countResult = await sqlClient.unsafe(countQuery, countParams) as any[]
    const total = countResult[0]?.total || 0

    // Get search statistics
    const stats = await getSearchStats(sql, user.id, whereConditions, countParams)

    return NextResponse.json({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      files: files.map((file: any) => ({
        ...file,
        downloadUrl: `/api/briefcase/files/${file.id}/download`,
        previewUrl: `/api/briefcase/files/${file.id}/preview`,
        tags: Array.isArray(file.tags) ? file.tags : [],
        metadata: file.metadata || {},
        aiInsights: file.ai_insights || {}
      })),
      total: parseInt(total),
      stats,
      searchInfo: {
        query,
        semantic,
        filters: {
          fileTypes,
          categories,
          tags,
          dateRange,
          sizeRange,
          favorites,
          folders
        },
        sortBy,
        sortOrder
      }
    })

  } catch (error) {
    logError('Search error:', error)
    return NextResponse.json({
      error: 'Search failed'
    }, { status: 500 })
  }
}

// Perform semantic search using AI worker
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function performSemanticSearch(query: string, userId: string, sql: any) {
  try {
    // Get user's documents for semantic analysis
    const documents = await sql`
      SELECT id, name, description, tags, category, file_type, ai_insights
      FROM documents 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 100
    ` as DocumentSearchResult[]

    if (documents.length === 0) {
      return []
    }

    const context = documents.map((doc: DocumentSearchResult) => ({
      id: doc.id,
      name: doc.name,
      description: doc.description,
      tags: doc.tags,
      category: doc.category,
      fileType: doc.file_type,
      aiInsights: doc.ai_insights
    }))

    const requestBody = {
      query: query,
      documents: context,
      task: 'semantic_search'
    };

    // Get worker environment from Cloudflare
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const env = process.env as any;
    const googleAIWorker = env.GOOGLE_AI_WORKER;

    if (!googleAIWorker) {
      logWarn('Google AI worker not available, skipping semantic search');
      return [];
    }

    // Call Google AI worker
    const response = await googleAIWorker.fetch('https://worker/analyze-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Worker request failed: ${response.status}`);
    }

    const result = await response.json();

    // Parse worker response
    if (result.success && Array.isArray(result.relevantDocuments)) {
      return result.relevantDocuments
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((doc: any) => doc.id && doc.relevance_score > 0.3)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .sort((a: any, b: any) => b.relevance_score - a.relevance_score)
        .slice(0, 20)
    }

    return []
  } catch (error) {
    logError('Semantic search error:', error)
    return []
  }
}

// Get search statistics
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getSearchStats(sql: any, userId: string, whereConditions: string[], params: any[]) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sqlClient = sql as any

    // File type distribution
    const fileTypeStatsQuery = `
      SELECT file_type, COUNT(*) as count, SUM(size) as total_size
      FROM documents d
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY file_type
      ORDER BY count DESC
    `
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fileTypeStats = await sqlClient.unsafe(fileTypeStatsQuery, params) as any[]

    // Category distribution
    const categoryStatsQuery = `
      SELECT category, COUNT(*) as count
      FROM documents d
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY category
      ORDER BY count DESC
    `
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categoryStats = await sqlClient.unsafe(categoryStatsQuery, params) as any[]

    // Tag distribution
    const tagStatsQuery = `
      SELECT jsonb_array_elements_text(tags) as tag, COUNT(*) as count
      FROM documents d
      WHERE ${whereConditions.join(' AND ')} AND tags IS NOT NULL
      GROUP BY tag
      ORDER BY count DESC
      LIMIT 20
    `
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tagStats = await sqlClient.unsafe(tagStatsQuery, params) as any[]

    return {
      fileTypes: fileTypeStats,
      categories: categoryStats,
      tags: tagStats
    }
  } catch (error) {
    logError('Stats error:', error)
    return {
      fileTypes: [],
      categories: [],
      tags: []
    }
  }
}
