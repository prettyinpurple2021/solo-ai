import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { createClient } from '@/lib/neon/server'

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateRequest()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure user exists in database
    const client = await createClient()
    let { rows: userData } = await client.query(
      'SELECT id FROM users WHERE id = $1',
      [user.id]
    )

    if (userData.length === 0) {
      // Create user if they don't exist
      await client.query(
        `INSERT INTO users (id, email, full_name, avatar_url, subscription_tier, level, total_points, current_streak, wellness_score, focus_minutes, onboarding_completed, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
        [
          user.id,
          user.email,
          user.full_name,
          user.avatar_url,
          'free',
          1,
          0,
          0,
          50,
          0,
          false
        ]
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = `
      SELECT id, name, file_type, size, category, description, tags, created_at, updated_at
      FROM documents 
      WHERE user_id = $1
    `
    const params = [user.id]
    let paramIndex = 2

    if (category && category !== 'all') {
      query += ` AND category = $${paramIndex}`
      params.push(category)
      paramIndex++
    }

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR tags ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const { rows: files } = await client.query(query, params)

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM documents WHERE user_id = $1`
    const countParams = [user.id]

    if (category && category !== 'all') {
      countQuery += ` AND category = $2`
      countParams.push(category)
    }

    if (search) {
      countQuery += ` AND (name ILIKE $${countParams.length + 1} OR description ILIKE $${countParams.length + 1} OR tags ILIKE $${countParams.length + 1})`
      countParams.push(`%${search}%`)
    }

    const { rows: [{ total }] } = await client.query(countQuery, countParams)

    // Get category statistics
    const { rows: categoryStats } = await client.query(
      `SELECT category, COUNT(*) as count, SUM(size) as total_size
       FROM documents 
       WHERE user_id = $1 
       GROUP BY category`,
      [user.id]
    )

    return NextResponse.json({
      files: files.map(file => ({
        id: file.id,
        name: file.name,
        type: file.file_type,
        size: file.size,
        category: file.category,
        description: file.description,
        tags: file.tags,
        createdAt: file.created_at,
        updatedAt: file.updated_at
      })),
      pagination: {
        total: parseInt(total),
        limit,
        offset,
        hasMore: offset + limit < parseInt(total)
      },
      stats: {
        totalFiles: parseInt(total),
        categories: categoryStats.map(stat => ({
          name: stat.category,
          count: parseInt(stat.count),
          totalSize: parseInt(stat.total_size || 0)
        }))
      }
    })

  } catch (error) {
    console.error('Briefcase GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    )
  }
}
