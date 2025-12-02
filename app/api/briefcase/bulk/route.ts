import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { getSql } from '@/lib/api-utils'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



export async function POST(
  request: NextRequest
) {
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, fileIds, options } = await request.json()

    if (!action || !fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json({ error: 'Action and file IDs are required' }, { status: 400 })
    }

    const sql = getSql()

    // Verify all files belong to the user
    // Convert fileIds array to PostgreSQL array format
    const userFiles = await sql`
      SELECT id FROM documents 
      WHERE id = ANY(${fileIds}::uuid[]) AND user_id = ${user.id}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ` as any[]

    if (userFiles.length !== fileIds.length) {
      return NextResponse.json({ error: 'Some files not found or access denied' }, { status: 403 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = { success: true, processed: 0, failed: 0, errors: [] }

    switch (action) {
      case 'delete':
        result = await handleBulkDelete(sql, fileIds, user.id)
        break
      case 'move':
        if (!options?.folderId) {
          return NextResponse.json({ error: 'Folder ID is required for move operation' }, { status: 400 })
        }
        result = await handleBulkMove(sql, fileIds, options.folderId, user.id)
        break
      case 'copy':
        if (!options?.folderId) {
          return NextResponse.json({ error: 'Folder ID is required for copy operation' }, { status: 400 })
        }
        result = await handleBulkCopy(sql, fileIds, options.folderId, user.id)
        break
      case 'tag':
        if (!options?.tags || !Array.isArray(options.tags)) {
          return NextResponse.json({ error: 'Tags array is required for tag operation' }, { status: 400 })
        }
        result = await handleBulkTag(sql, fileIds, options.tags, options?.operation || 'add', user.id)
        break
      case 'category':
        if (!options?.category) {
          return NextResponse.json({ error: 'Category is required for category operation' }, { status: 400 })
        }
        result = await handleBulkCategory(sql, fileIds, options.category, user.id)
        break
      case 'favorite':
        result = await handleBulkFavorite(sql, fileIds, options?.favorite !== false, user.id)
        break
      case 'download':
        result = await handleBulkDownload(sql, fileIds, user.id)
        break
      case 'share':
        if (!options?.permissions) {
          return NextResponse.json({ error: 'Permissions are required for share operation' }, { status: 400 })
        }
        result = await handleBulkShare(sql, fileIds, options.permissions, user.id)
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json(result)

  } catch (error) {
    logError('Bulk operation error:', error)
    return NextResponse.json({
      error: 'Failed to perform bulk operation'
    }, { status: 500 })
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleBulkDelete(sql: any, fileIds: string[], userId: string) {
  const result = { success: true, processed: 0, failed: 0, errors: [] as string[] }

  for (const fileId of fileIds) {
    try {
      // Delete document versions first
      await sql`
        DELETE FROM document_versions WHERE document_id = ${fileId}
      `

      // Delete document permissions
      await sql`
        DELETE FROM document_permissions WHERE document_id = ${fileId}
      `

      // Delete share links
      await sql`
        DELETE FROM document_share_links WHERE document_id = ${fileId}
      `

      // Delete activity logs
      await sql`
        DELETE FROM document_activity WHERE document_id = ${fileId}
      `

      // Delete the document
      await sql`
        DELETE FROM documents WHERE id = ${fileId} AND user_id = ${userId}
      `

      result.processed++
    } catch (error) {
      result.failed++
      result.errors.push(`Failed to delete file ${fileId}: ${error}`)
    }
  }

  return result
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleBulkMove(sql: any, fileIds: string[], folderId: string, userId: string) {
  const result = { success: true, processed: 0, failed: 0, errors: [] as string[] }

  // Verify folder exists and belongs to user
  const folderRows = await sql`
    SELECT id FROM document_folders WHERE id = ${folderId} AND user_id = ${userId}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ` as any[]

  if (folderRows.length === 0) {
    return { success: false, processed: 0, failed: fileIds.length, errors: ['Folder not found'] }
  }

  for (const fileId of fileIds) {
    try {
      await sql`
        UPDATE documents 
        SET folder_id = ${folderId}, updated_at = NOW()
        WHERE id = ${fileId} AND user_id = ${userId}
      `

      // Log activity
      const detailsJson = JSON.stringify({ folderId })
      await sql`
        INSERT INTO document_activity (document_id, user_id, action, details, created_at)
        VALUES (${fileId}, ${userId}, ${'moved'}, ${detailsJson}::jsonb, NOW())
      `

      result.processed++
    } catch (error) {
      result.failed++
      result.errors.push(`Failed to move file ${fileId}: ${error}`)
    }
  }

  return result
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleBulkCopy(sql: any, fileIds: string[], folderId: string, userId: string) {
  const result = { success: true, processed: 0, failed: 0, errors: [] as string[], copiedFiles: [] as string[] }

  // Verify folder exists and belongs to user
  const folderRows = await sql`
    SELECT id FROM document_folders WHERE id = ${folderId} AND user_id = ${userId}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ` as any[]

  if (folderRows.length === 0) {
    return { success: false, processed: 0, failed: fileIds.length, errors: ['Folder not found'] }
  }

  for (const fileId of fileIds) {
    try {
      // Get original file data
      const originalFileRows = await sql`
        SELECT * FROM documents WHERE id = ${fileId} AND user_id = ${userId}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ` as any[]

      if (originalFileRows.length === 0) {
        result.failed++
        result.errors.push(`Original file ${fileId} not found`)
        continue
      }

      const originalFile = originalFileRows[0]

      // Create copy with new name
      const copyName = `${originalFile.name} (Copy)`
      const tagsJson = typeof originalFile.tags === 'string' ? originalFile.tags : JSON.stringify(originalFile.tags || [])
      const copiedFileRows = await sql`
        INSERT INTO documents (
          user_id, name, original_name, file_type, mime_type, size, file_data,
          category, tags, description, folder_id, is_favorite, created_at, updated_at
        ) VALUES (${userId}, ${copyName}, ${originalFile.original_name}, ${originalFile.file_type}, ${originalFile.mime_type}, ${originalFile.size}, ${originalFile.file_data},
        ${originalFile.category}, ${tagsJson}::jsonb, ${originalFile.description || null}, ${folderId}, ${false}, NOW(), NOW())
        RETURNING id
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ` as any[]

      const copiedFile = copiedFileRows[0]

      // Log activity
      const detailsJson = JSON.stringify({ originalFileId: fileId, folderId })
      await sql`
        INSERT INTO document_activity (document_id, user_id, action, details, created_at)
        VALUES (${copiedFile.id}, ${userId}, ${'copied'}, ${detailsJson}::jsonb, NOW())
      `

      result.processed++
      result.copiedFiles.push(copiedFile.id)
    } catch (error) {
      result.failed++
      result.errors.push(`Failed to copy file ${fileId}: ${error}`)
    }
  }

  return result
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleBulkTag(sql: any, fileIds: string[], tags: string[], operation: 'add' | 'remove', userId: string) {
  const result = { success: true, processed: 0, failed: 0, errors: [] as string[] }

  for (const fileId of fileIds) {
    try {
      // Get current tags
      const fileRows = await sql`
        SELECT tags FROM documents WHERE id = ${fileId} AND user_id = ${userId}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ` as any[]

      if (fileRows.length === 0) {
        result.failed++
        result.errors.push(`File ${fileId} not found`)
        continue
      }

      const file = fileRows[0]
      const currentTags = typeof file.tags === 'string' ? JSON.parse(file.tags) : (file.tags || [])
      let newTags: string[]

      if (operation === 'add') {
        newTags = [...new Set([...currentTags, ...tags.map(t => t.toLowerCase().trim())])]
      } else {
        newTags = currentTags.filter((tag: string) => !tags.includes(tag.toLowerCase().trim()))
      }

      const newTagsJson = JSON.stringify(newTags)
      await sql`
        UPDATE documents 
        SET tags = ${newTagsJson}::jsonb, updated_at = NOW()
        WHERE id = ${fileId} AND user_id = ${userId}
      `

      // Log activity
      const detailsJson = JSON.stringify({ operation, tags, newTags })
      await sql`
        INSERT INTO document_activity (document_id, user_id, action, details, created_at)
        VALUES (${fileId}, ${userId}, ${'tags_updated'}, ${detailsJson}::jsonb, NOW())
      `

      result.processed++
    } catch (error) {
      result.failed++
      result.errors.push(`Failed to update tags for file ${fileId}: ${error}`)
    }
  }

  return result
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleBulkCategory(sql: any, fileIds: string[], category: string, userId: string) {
  const result = { success: true, processed: 0, failed: 0, errors: [] as string[] }

  for (const fileId of fileIds) {
    try {
      await sql`
        UPDATE documents 
        SET category = ${category}, updated_at = NOW()
        WHERE id = ${fileId} AND user_id = ${userId}
      `

      // Log activity
      const detailsJson = JSON.stringify({ category })
      await sql`
        INSERT INTO document_activity (document_id, user_id, action, details, created_at)
        VALUES (${fileId}, ${userId}, ${'category_updated'}, ${detailsJson}::jsonb, NOW())
      `

      result.processed++
    } catch (error) {
      result.failed++
      result.errors.push(`Failed to update category for file ${fileId}: ${error}`)
    }
  }

  return result
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleBulkFavorite(sql: any, fileIds: string[], favorite: boolean, userId: string) {
  const result = { success: true, processed: 0, failed: 0, errors: [] as string[] }

  for (const fileId of fileIds) {
    try {
      await sql`
        UPDATE documents 
        SET is_favorite = ${favorite}, updated_at = NOW()
        WHERE id = ${fileId} AND user_id = ${userId}
      `

      // Log activity
      const action = favorite ? 'favorited' : 'unfavorited'
      const detailsJson = JSON.stringify({ isFavorite: favorite })
      await sql`
        INSERT INTO document_activity (document_id, user_id, action, details, created_at)
        VALUES (${fileId}, ${userId}, ${action}, ${detailsJson}::jsonb, NOW())
      `

      result.processed++
    } catch (error) {
      result.failed++
      result.errors.push(`Failed to update favorite status for file ${fileId}: ${error}`)
    }
  }

  return result
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleBulkDownload(sql: any, fileIds: string[], userId: string) {
  const result = { success: true, processed: 0, failed: 0, errors: [] as string[], downloadUrls: [] as string[] }

  for (const fileId of fileIds) {
    try {
      // Update download count
      await sql`
        UPDATE documents 
        SET download_count = download_count + 1, last_accessed = NOW(), updated_at = NOW()
        WHERE id = ${fileId} AND user_id = ${userId}
      `

      // Log activity
      const detailsJson = JSON.stringify({ bulkDownload: true })
      await sql`
        INSERT INTO document_activity (document_id, user_id, action, details, created_at)
        VALUES (${fileId}, ${userId}, ${'downloaded'}, ${detailsJson}::jsonb, NOW())
      `

      result.processed++
      result.downloadUrls.push(`/api/briefcase/files/${fileId}/download`)
    } catch (error) {
      result.failed++
      result.errors.push(`Failed to prepare download for file ${fileId}: ${error}`)
    }
  }

  return result
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleBulkShare(_sql: any, fileIds: string[], permissions: any, _userId: string) {
  const result = { success: true, processed: 0, failed: 0, errors: [] as string[], shareLinks: [] as string[] }

  for (const fileId of fileIds) {
    try {
      // Create share link for each file
      const shareResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/briefcase/files/${fileId}/share-links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(permissions)
      })

      if (shareResponse.ok) {
        const shareData = await shareResponse.json()
        result.shareLinks.push(shareData.url)
        result.processed++
      } else {
        result.failed++
        result.errors.push(`Failed to create share link for file ${fileId}`)
      }
    } catch (error) {
      result.failed++
      result.errors.push(`Failed to share file ${fileId}: ${error}`)
    }
  }

  return result
}
