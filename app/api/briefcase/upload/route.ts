import { NextRequest, NextResponse } from 'next/server'
import { DocumentParser } from '@/lib/documentParser'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

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

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Process each file
    const uploadedFiles = []
    
    for (const file of files) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'unknown'
      const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : []
      const fileId = crypto.randomUUID()
      const timestamp = Date.now()
      const safeFileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filePath = path.join(uploadsDir, safeFileName)
      
      try {
        // Save file to local storage
        const fileBuffer = Buffer.from(await file.arrayBuffer())
        fs.writeFileSync(filePath, fileBuffer)
        
        const uploadedFile: any = {
          id: fileId,
          name: file.name,
          file_type: fileExtension,
          mime_type: file.type || 'application/octet-stream',
          size: file.size,
          upload_date: new Date().toISOString(),
          last_modified: new Date().toISOString(),
          category: category || 'document',
          tags: tagsArray,
          description: description || '',
          is_favorite: false,
          folder_id: folderId || null,
          storage_path: filePath,
          content_indexed: false, // Will be updated after parsing
          parsing_status: 'pending',
          parsing_error: undefined as string | undefined,
          estimated_parsing_time: undefined as number | undefined,
          content_preview: undefined as string | undefined,
          word_count: undefined as number | undefined,
          page_count: undefined as number | undefined
        }
        
        // Attempt to parse document content if supported
        let contentData = null
        if (DocumentParser.isSupportedMimeType(file.type || 'application/octet-stream')) {
          try {
            // Check if file is small enough for immediate parsing
            const estimatedTime = DocumentParser.getEstimatedProcessingTime(file.size, file.type || 'application/octet-stream')
            
            if (estimatedTime < 10000) { // Less than 10 seconds - parse immediately
              const parseResult = await DocumentParser.parseDocument(fileBuffer, file.type || 'application/octet-stream', file.name)
              
              if (parseResult.success) {
                contentData = {
                  content: parseResult.content,
                  word_count: parseResult.metadata?.wordCount || 0,
                  page_count: parseResult.metadata?.pageCount,
                  author: parseResult.metadata?.author,
                  title: parseResult.metadata?.title,
                  created_date: parseResult.metadata?.createdDate,
                  modified_date: parseResult.metadata?.modifiedDate,
                  content_hash: crypto.createHash('sha256').update(parseResult.content).digest('hex'),
                  parsing_status: 'success'
                }
                uploadedFile.content_indexed = true
                uploadedFile.parsing_status = 'success'
              } else {
                uploadedFile.parsing_status = 'failed'
                uploadedFile.parsing_error = parseResult.error
              }
            } else {
              // Large file - mark for background processing
              uploadedFile.parsing_status = 'pending'
              uploadedFile.estimated_parsing_time = estimatedTime
            }
          } catch (parseError) {
            console.error(`Content parsing error for ${file.name}:`, parseError)
            uploadedFile.parsing_status = 'failed'
            uploadedFile.parsing_error = parseError instanceof Error ? parseError.message : 'Unknown parsing error'
          }
        } else {
          uploadedFile.parsing_status = 'unsupported'
        }
        
        // Add content data to response if available
        if (contentData) {
          uploadedFile.content_preview = contentData.content.substring(0, 200) + (contentData.content.length > 200 ? '...' : '')
          uploadedFile.word_count = contentData.word_count
          uploadedFile.page_count = contentData.page_count
        }
        
        uploadedFiles.push(uploadedFile)
        
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError)
        // Still add the file record but mark it as failed
        uploadedFiles.push({
          id: fileId,
          name: file.name,
          file_type: fileExtension,
          mime_type: file.type || 'application/octet-stream',
          size: file.size,
          upload_date: new Date().toISOString(),
          last_modified: new Date().toISOString(),
          category: category || 'document',
          tags: tagsArray,
          description: description || '',
          is_favorite: false,
          folder_id: folderId || null,
          storage_path: filePath,
          content_indexed: false,
          parsing_status: 'failed',
          parsing_error: fileError instanceof Error ? fileError.message : 'File processing failed'
        })
      }
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
