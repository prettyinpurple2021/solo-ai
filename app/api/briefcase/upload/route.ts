import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const category = formData.get('category') as string
    const description = formData.get('description') as string
    const tags = formData.get('tags') as string
    const folderId = formData.get('folder_id') as string

    if (!files || files.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No files provided'
      }, { status: 400 })
    }

    // Validate file sizes (5MB limit per file)
    const maxFileSize = 5 * 1024 * 1024 // 5MB
    for (const file of files) {
      if (file.size > maxFileSize) {
        return NextResponse.json({
          success: false,
          error: `File ${file.name} exceeds 5MB limit`
        }, { status: 400 })
      }
    }

    // Process each file
    const uploadedFiles = []
    
    for (const file of files) {
      // In production, you would:
      // 1. Upload file to cloud storage (AWS S3, Google Cloud, etc.)
      // 2. Save file metadata to database
      // 3. Generate thumbnails for images
      // 4. Scan for viruses
      
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'unknown'
      const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : []
      
      const uploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        file_type: fileExtension,
        mime_type: file.type,
        size: file.size,
        upload_date: new Date().toISOString(),
        last_modified: new Date().toISOString(),
        category: category || 'document',
        tags: tagsArray,
        description: description || '',
        is_favorite: false,
        folder_id: folderId || null,
        storage_path: `/uploads/${Date.now()}-${file.name}`
      }
      
      uploadedFiles.push(uploadedFile)
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({
      success: false,
      error: 'File upload failed. Please try again.'
    }, { status: 500 })
  }
}

// Handle file size limits and types
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
}
