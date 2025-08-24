import { NextRequest, NextResponse } from 'next/server'

// Sample files for demo with actual paths that can be parsed
export const MOCK_FILES = [
  {
    id: '1',
    name: 'Business Plan 2024.txt',
    file_type: 'txt',
    mime_type: 'text/plain',
    size: 2847, // Actual file size
    upload_date: '2024-01-15T10:00:00Z',
    last_modified: '2024-01-15T10:00:00Z',
    category: 'document',
    tags: ['business', 'planning', '2024', 'strategy'],
    description: 'Annual business plan and strategy document for SoloBoss AI Platform',
    is_favorite: true,
    folder_id: null,
    storage_path: require('path').join(process.cwd(), 'uploads', 'business-plan-2024.txt')
  },
  {
    id: '2',
    name: 'Marketing Strategy Q1.txt',
    file_type: 'txt',
    mime_type: 'text/plain',
    size: 2934, // Actual file size
    upload_date: '2024-01-14T09:30:00Z',
    last_modified: '2024-01-14T09:30:00Z',
    category: 'document',
    tags: ['marketing', 'strategy', 'Q1', 'campaigns'],
    description: 'Comprehensive marketing strategy for Q1 2024 including campaigns and KPIs',
    is_favorite: false,
    folder_id: null,
    storage_path: require('path').join(process.cwd(), 'uploads', 'marketing-strategy.txt')
  },
  {
    id: '3',
    name: 'Technical Architecture.txt',
    file_type: 'txt',
    mime_type: 'text/plain',
    size: 6842, // Actual file size
    upload_date: '2024-01-13T14:20:00Z',
    last_modified: '2024-01-13T14:20:00Z',
    category: 'document',
    tags: ['technical', 'architecture', 'development', 'infrastructure'],
    description: 'Complete technical architecture documentation for the platform',
    is_favorite: false,
    folder_id: null,
    storage_path: require('path').join(process.cwd(), 'uploads', 'technical-architecture.txt')
  }
]

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      files: MOCK_FILES
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
