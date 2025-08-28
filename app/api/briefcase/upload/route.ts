import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { createClient } from '@/lib/neon/server'

export async function POST(request: NextRequest) {
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

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const category = formData.get('category') as string || 'document'
    const description = formData.get('description') as string || ''
    const tags = formData.get('tags') as string || ''

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const uploadedFiles = []

    for (const file of files) {
      // Convert file to text content (for now, we'll store as text)
      const content = await file.text()
      
      // Store file metadata in database
      const { rows: [uploadedFile] } = await client.query(
        `INSERT INTO documents (user_id, name, file_type, size, content, category, description, tags, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING id, name, file_type, size, category, description, tags, created_at`,
        [
          user.id,
          file.name,
          file.type || 'text/plain',
          file.size,
          content,
          category,
          description,
          tags
        ]
      )

      uploadedFiles.push({
        id: uploadedFile.id,
        name: uploadedFile.name,
        type: uploadedFile.file_type,
        size: uploadedFile.size,
        category: uploadedFile.category,
        description: uploadedFile.description,
        tags: uploadedFile.tags,
        createdAt: uploadedFile.created_at
      })
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`
    })

  } catch (error) {
    console.error('Briefcase upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    )
  }
}
