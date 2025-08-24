import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Placeholder for demo - in production this would query the database
    const mockFiles = [
      {
        id: '1',
        name: 'Business Plan 2024.pdf',
        file_type: 'pdf',
        mime_type: 'application/pdf',
        size: 1024000,
        upload_date: '2024-01-15T10:00:00Z',
        last_modified: '2024-01-15T10:00:00Z',
        category: 'document',
        tags: ['business', 'planning', '2024'],
        description: 'Annual business plan and strategy document',
        is_favorite: true,
        folder_id: null,
        storage_path: '/files/business-plan-2024.pdf'
      },
      {
        id: '2',
        name: 'Brand Logo.png',
        file_type: 'png',
        mime_type: 'image/png',
        size: 512000,
        upload_date: '2024-01-14T09:30:00Z',
        last_modified: '2024-01-14T09:30:00Z',
        category: 'image',
        tags: ['branding', 'logo', 'design'],
        description: 'Official brand logo in PNG format',
        is_favorite: false,
        folder_id: '1',
        storage_path: '/files/brand-logo.png'
      },
      {
        id: '3',
        name: 'Marketing Presentation.pptx',
        file_type: 'pptx',
        mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        size: 2048000,
        upload_date: '2024-01-13T14:20:00Z',
        last_modified: '2024-01-13T14:20:00Z',
        category: 'presentation',
        tags: ['marketing', 'presentation', 'sales'],
        description: 'Q1 marketing strategy presentation',
        is_favorite: false,
        folder_id: null,
        storage_path: '/files/marketing-presentation.pptx'
      }
    ]

    return NextResponse.json({
      success: true,
      files: mockFiles
    })
  } catch (error) {
    console.error('Error fetching files:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch files'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Placeholder for demo - in production this would create a new file record
    const newFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: body.name || 'Untitled Document',
      file_type: body.file_type || 'txt',
      mime_type: body.mime_type || 'text/plain',
      size: body.size || 0,
      upload_date: new Date().toISOString(),
      last_modified: new Date().toISOString(),
      category: body.category || 'document',
      tags: Array.isArray(body.tags) ? body.tags : [],
      description: body.description || '',
      is_favorite: false,
      folder_id: body.folder_id || null,
      storage_path: `/files/${body.name || 'untitled'}`
    }

    return NextResponse.json({
      success: true,
      file: newFile,
      message: 'File created successfully'
    })
  } catch (error) {
    console.error('Error creating file:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create file'
    }, { status: 500 })
  }
}
