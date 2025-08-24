import { NextRequest, NextResponse } from 'next/server';
import { DocumentParser } from '@/lib/documentParser';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const fileId = formData.get('fileId') as string;
    const filePath = formData.get('filePath') as string;
    const mimeType = formData.get('mimeType') as string;
    const fileName = formData.get('fileName') as string;
    
    if (!fileId || !filePath || !mimeType || !fileName) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Check if the file type is supported
    if (!DocumentParser.isSupportedMimeType(mimeType)) {
      return NextResponse.json({
        success: false,
        error: `Unsupported file type: ${mimeType}`,
        content: '',
        metadata: null
      });
    }

    // Read the file from storage
    const absoluteFilePath = path.resolve(filePath);
    
    if (!fs.existsSync(absoluteFilePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(absoluteFilePath);
    
    // Get estimated processing time
    const estimatedTime = DocumentParser.getEstimatedProcessingTime(fileBuffer.length, mimeType);
    
    // If file is very large, we might want to process it asynchronously
    if (estimatedTime > 25000) { // More than 25 seconds
      return NextResponse.json({
        success: false,
        error: 'File too large for synchronous processing',
        content: '',
        metadata: null,
        estimatedTime
      });
    }

    // Parse the document
    const parseResult = await DocumentParser.parseDocument(fileBuffer, mimeType, fileName);
    
    return NextResponse.json({
      success: parseResult.success,
      content: parseResult.content,
      metadata: parseResult.metadata,
      error: parseResult.error,
      estimatedTime
    });

  } catch (error) {
    console.error('Content parsing API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error during content parsing',
        content: '',
        metadata: null
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check if a file type is supported
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mimeType = searchParams.get('mimeType');
  
  if (!mimeType) {
    return NextResponse.json(
      { error: 'Missing mimeType parameter' },
      { status: 400 }
    );
  }

  const isSupported = DocumentParser.isSupportedMimeType(mimeType);
  const estimatedTime = isSupported ? DocumentParser.getEstimatedProcessingTime(1024 * 1024, mimeType) : 0; // 1MB estimate
  
  return NextResponse.json({
    supported: isSupported,
    estimatedTimePerMB: estimatedTime
  });
}
