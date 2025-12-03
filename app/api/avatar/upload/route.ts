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
        id: decoded.userId as string,
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

    const formData = await request.formData()
    const file = formData.get('avatar') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be under 5MB' },
        { status: 400 }
      )
    }

    // Upload avatar to briefcase system
    const avatarItem = await unifiedBriefcase.uploadAvatar(userId, file)

    return NextResponse.json({
      success: true,
      avatar: {
        id: avatarItem.id,
        url: avatarItem.blobUrl,
        filename: avatarItem.metadata.originalName,
        size: avatarItem.fileSize,
        mimeType: avatarItem.mimeType,
        uploadedAt: avatarItem.createdAt
      }
    })

  } catch (error) {
    logError('Avatar upload error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Upload failed'

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
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

    // Get current user avatar
    const avatar = await unifiedBriefcase.getUserAvatar(userId)

    if (!avatar) {
      return NextResponse.json({ avatar: null })
    }

    return NextResponse.json({
      avatar: {
        id: avatar.id,
        url: avatar.blobUrl,
        filename: avatar.metadata.originalName,
        size: avatar.fileSize,
        mimeType: avatar.mimeType,
        uploadedAt: avatar.createdAt
      }
    })

  } catch (error) {
    logError('Get avatar error:', error)

    return NextResponse.json(
      { error: 'Failed to fetch avatar' },
      { status: 500 }
    )
  }
}