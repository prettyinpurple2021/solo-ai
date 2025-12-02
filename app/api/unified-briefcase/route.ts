import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import * as jose from 'jose'
import { unifiedBriefcase } from '@/lib/unified-briefcase'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'


// JWT authentication helper
async function authenticateJWTRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null, error: 'No authorization header' }
    }

    const token = authHeader.substring(7)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload: decoded } = await jose.jwtVerify(token, secret)

    return {
      user: {
        id: decoded.user_id as string,
        email: decoded.email as string,
        full_name: (decoded.full_name as string) || null,
      },
      error: null
    }
  } catch (error) {
    logError('JWT authentication error:', error)
    return { user: null, error: 'Invalid token' }
  }
}


export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateJWTRequest(request)

    if (error || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = user.id

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || undefined
    const search = searchParams.get('search') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const result = await unifiedBriefcase.getBriefcaseItems(
      userId,
      type as string | undefined,
      limit,
      offset,
      search
    )

    return NextResponse.json({
      success: true,
      items: result.items,
      total: result.total,
      hasMore: offset + limit < result.total
    })

  } catch (error) {
    logError('Get briefcase items error:', error)

    return NextResponse.json(
      { error: 'Failed to fetch briefcase items' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateJWTRequest(request)

    if (error || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = user.id

    const body = await request.json()
    const { type, title, content, metadata } = body

    if (!type || !title) {
      return NextResponse.json(
        { error: 'Type and title are required' },
        { status: 400 }
      )
    }

    let item

    switch (type) {
      case 'chat':
        if (!content?.messages) {
          return NextResponse.json(
            { error: 'Chat content must include messages array' },
            { status: 400 }
          )
        }
        item = await unifiedBriefcase.saveChatConversation(
          userId,
          title,
          content.messages,
          metadata?.agentName
        )
        break

      case 'brand':
        if (!content) {
          return NextResponse.json(
            { error: 'Brand content is required' },
            { status: 400 }
          )
        }
        item = await unifiedBriefcase.saveBrandWork(userId, title, content)
        break

      case 'template_save':
        if (!metadata?.templateSlug || content === undefined) {
          return NextResponse.json(
            { error: 'Template save requires templateSlug and content' },
            { status: 400 }
          )
        }
        item = await unifiedBriefcase.saveTemplateProgress(
          userId,
          metadata.templateSlug,
          title,
          content,
          metadata.progress || 0
        )
        break

      default:
        return NextResponse.json(
          { error: 'Unsupported item type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      item: {
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        metadata: item.metadata
      }
    })

  } catch (error) {
    logError('Save briefcase item error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Save failed'

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, error } = await authenticateJWTRequest(request)

    if (error || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = user.id

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('id')

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    const success = await unifiedBriefcase.deleteItem(userId, itemId)

    if (!success) {
      return NextResponse.json(
        { error: 'Item not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully'
    })

  } catch (error) {
    logError('Delete briefcase item error:', error)

    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    )
  }
}