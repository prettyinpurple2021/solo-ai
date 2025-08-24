import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { MOCK_FILES } from '../../files/route'

// MIME type mappings for file extensions
const MIME_TYPES: { [key: string]: string } = {
  // Images
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', 
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',
  
  // Text files
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.json': 'application/json',
  '.js': 'text/javascript',
  '.ts': 'text/typescript',
  '.jsx': 'text/jsx',
  '.tsx': 'text/tsx',
  '.css': 'text/css',
  '.html': 'text/html',
  '.xml': 'text/xml',
  '.csv': 'text/csv',
  '.log': 'text/plain',
  '.yml': 'text/yaml',
  '.yaml': 'text/yaml',
  
  // Documents
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  
  // Audio
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.flac': 'audio/flac',
  '.aac': 'audio/aac',
  
  // Video
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.avi': 'video/x-msvideo',
  '.mov': 'video/quicktime',
  '.wmv': 'video/x-ms-wmv',
  '.flv': 'video/x-flv',
  '.mkv': 'video/x-matroska',
  
  // Archives
  '.zip': 'application/zip',
  '.rar': 'application/vnd.rar',
  '.7z': 'application/x-7z-compressed',
  '.tar': 'application/x-tar',
  '.gz': 'application/gzip',
}

// File types that support preview
const PREVIEWABLE_TYPES = {
  image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'],
  text: ['.txt', '.md', '.json', '.js', '.ts', '.jsx', '.tsx', '.css', '.html', '.xml', '.csv', '.log', '.yml', '.yaml'],
  pdf: ['.pdf'],
  audio: ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'],
  video: ['.mp4', '.webm', '.ogg', '.avi', '.mov']
}

function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase()
}

function getMimeType(filename: string): string {
  const ext = getFileExtension(filename)
  return MIME_TYPES[ext] || 'application/octet-stream'
}

function getPreviewType(filename: string): string | null {
  const ext = getFileExtension(filename)
  
  for (const [type, extensions] of Object.entries(PREVIEWABLE_TYPES)) {
    if (extensions.includes(ext)) {
      return type
    }
  }
  
  return null
}

// Generate mock file content for different types
function generateMockContent(filename: string, previewType: string): string | Buffer {
  const ext = getFileExtension(filename)
  
  switch (previewType) {
    case 'text':
      if (ext === '.json') {
        return JSON.stringify({
          "title": "Sample JSON Document",
          "description": "This is a preview of your JSON file content",
          "created": "2024-01-15T10:30:00Z",
          "data": {
            "items": ["item1", "item2", "item3"],
            "count": 3,
            "active": true
          }
        }, null, 2)
      }
      if (ext === '.md') {
        return `# Sample Markdown Document

## Overview
This is a preview of your Markdown file content.

### Features
- **Bold text** and *italic text*
- [Links](https://example.com)
- \`code snippets\`

### Code Block
\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### List
1. First item
2. Second item
3. Third item

> This is a blockquote with important information.
`
      }
      if (ext === '.css') {
        return `/* Sample CSS File */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  padding: 1rem 0;
}

.btn {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  margin-bottom: 0;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  text-align: center;
  text-decoration: none;
  vertical-align: middle;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  transition: all 0.15s ease-in-out;
}

.btn-primary {
  color: #fff;
  background-color: #007bff;
  border-color: #007bff;
}

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #004085;
}
`
      }
      if (ext === '.js' || ext === '.ts') {
        return `// Sample ${ext === '.ts' ? 'TypeScript' : 'JavaScript'} File
${ext === '.ts' ? 'interface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\n' : ''}class UserManager${ext === '.ts' ? '<T extends User>' : ''} {
  constructor() {
    this.users = [];
  }

  addUser(user${ext === '.ts' ? ': T' : ''}) {
    this.users.push(user);
    console.log(\`User \${user.name} added successfully\`);
  }

  findUser(id${ext === '.ts' ? ': number' : ''})${ext === '.ts' ? ': T | undefined' : ''} {
    return this.users.find(user => user.id === id);
  }

  getUserCount()${ext === '.ts' ? ': number' : ''} {
    return this.users.length;
  }

  async fetchUserData(userId${ext === '.ts' ? ': number' : ''})${ext === '.ts' ? ': Promise<T | null>' : ''} {
    try {
      const response = await fetch(\`/api/users/\${userId}\`);
      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      return null;
    }
  }
}

// Example usage
const userManager = new UserManager();
userManager.addUser({
  id: 1,
  name: 'John Doe',
  email: 'john@example.com'
});
`
      }
      return `This is a sample ${ext.substring(1).toUpperCase()} file content for preview.

File: ${filename}
Type: ${previewType}
Extension: ${ext}

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Key features:
• Feature 1: Sample functionality
• Feature 2: Enhanced capabilities  
• Feature 3: Advanced options
• Feature 4: Integration support

Technical specifications:
- Format: ${ext.substring(1).toUpperCase()}
- Size: Sample content
- Encoding: UTF-8
- Created: ${new Date().toISOString()}

This content is generated for preview purposes and demonstrates how the file preview system works with different file types.
`
    
    default:
      return 'File preview not available for this file type.'
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params
    const searchParams = request.nextUrl.searchParams
    const thumbnail = searchParams.get('thumbnail') === 'true'
    
    // Find file in mock data
    const file = MOCK_FILES.find(f => f.id === fileId)
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' }, 
        { status: 404 }
      )
    }

    const mimeType = getMimeType(file.name)
    const previewType = getPreviewType(file.name)
    
    // Check if file is previewable
    if (!previewType) {
      return NextResponse.json(
        { error: 'File type not supported for preview' }, 
        { status: 400 }
      )
    }

    // For thumbnail requests
    if (thumbnail) {
      // In a real implementation, you would generate actual thumbnails
      // For now, we'll return metadata about thumbnail availability
      return NextResponse.json({
        fileId: fileId,
        filename: file.name,
        mimeType: mimeType,
        previewType: previewType,
        thumbnailAvailable: previewType === 'image' || previewType === 'pdf',
        thumbnailUrl: previewType === 'image' || previewType === 'pdf' 
          ? `/api/briefcase/preview/${fileId}?thumbnail=true&size=200`
          : null
      })
    }

    // Generate mock content based on file type
    const content = generateMockContent(file.name, previewType)
    
    // For images, we'll serve a placeholder image URL
    if (previewType === 'image') {
      const imageSize = searchParams.get('size') || '800'
      const placeholderUrl = `https://picsum.photos/${imageSize}/${imageSize}?random=${fileId}`
      
      return Response.redirect(placeholderUrl)
    }

    // For other file types, serve the generated content
    const headers = new Headers()
    headers.set('Content-Type', mimeType)
    headers.set('Content-Disposition', `inline; filename="${file.name}"`)
    headers.set('Cache-Control', 'public, max-age=3600')
    
    // Add preview-specific headers
    headers.set('X-File-Preview', 'true')
    headers.set('X-Preview-Type', previewType)
    headers.set('X-Original-Size', file.size.toString())

    return new NextResponse(content, {
      status: 200,
      headers: headers
    })

  } catch (error) {
    console.error('Preview error:', error)
    return NextResponse.json(
      { error: 'Failed to generate preview' }, 
      { status: 500 }
    )
  }
}

// Handle file preview metadata requests
export async function HEAD(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params
    
    const file = MOCK_FILES.find(f => f.id === fileId)
    if (!file) {
      return new NextResponse(null, { status: 404 })
    }

    const mimeType = getMimeType(file.name)
    const previewType = getPreviewType(file.name)
    
    const headers = new Headers()
    headers.set('Content-Type', mimeType)
    headers.set('X-File-Preview', previewType ? 'true' : 'false')
    headers.set('X-Preview-Type', previewType || 'unsupported')
    headers.set('X-Original-Size', file.size.toString())
    headers.set('X-File-Name', file.name)
    
    return new NextResponse(null, {
      status: 200,
      headers: headers
    })
    
  } catch (error) {
    return new NextResponse(null, { status: 500 })
  }
}
