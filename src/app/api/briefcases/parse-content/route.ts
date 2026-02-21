import { logError,} from '@/lib/logger'
import '@/lib/server-polyfills'
import { NextRequest, NextResponse} from 'next/server';
import { DocumentParser} from '@/lib/documentParser';
import { authenticateRequest} from '@/lib/auth-server'
import { getSql } from '@/lib/api-utils'

// Node.js runtime required for PDF parsing (pdf-parse requires Node.js)
export const runtime = 'nodejs'



export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const fileId = formData.get('fileId') as string;
    // Optional legacy fields (ignored for security):
    const providedMimeType = formData.get('mimeType') as string | null;
    const providedFileName = formData.get('fileName') as string | null;
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'Missing required parameter: fileId' },
        { status: 400 }
      );
    }

    // Authenticate user and verify ownership
    const { user, error: authError } = await authenticateRequest()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Load file securely from DB (Neon) instead of filesystem
    const sql = getSql()
    const documentRows = await sql`
      SELECT id, user_id, mime_type, original_name, name, file_data
      FROM documents
      WHERE id = ${fileId} AND user_id = ${user.id}
    ` as any[]

    if (documentRows.length === 0) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }
    
    const document = documentRows[0]

    const mimeType: string = document.mime_type || providedMimeType || 'application/octet-stream'
    const fileName: string = document.original_name || document.name || providedFileName || 'file'

    // Check if the file type is supported
    if (!DocumentParser.isSupportedMimeType(mimeType)) {
      return NextResponse.json({
        success: false,
        error: `Unsupported file type: ${mimeType}`,
        content: '',
        metadata: null
      });
    }

    // Convert stored file data to Buffer (supports base64 string or binary)
    const rawData = document.file_data as unknown
    let fileBuffer: Buffer
    if (typeof rawData === 'string') {
      fileBuffer = Buffer.from(rawData, 'base64')
    } else if (Buffer.isBuffer(rawData)) {
      fileBuffer = rawData
    } else if (rawData instanceof Uint8Array) {
      fileBuffer = Buffer.from(rawData)
    } else if (rawData instanceof ArrayBuffer) {
      fileBuffer = Buffer.from(new Uint8Array(rawData))
    } else {
      return NextResponse.json({
        success: false,
        error: 'Unsupported file data format',
        content: '',
        metadata: null
      }, { status: 400 })
    }
    
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
    logError('Content parsing API error:', error);
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
