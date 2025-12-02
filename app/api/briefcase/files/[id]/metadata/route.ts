import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { getSql } from '@/lib/api-utils'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



// Consolidated PATCH handler for updating document metadata
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticateRequest()
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const routeParams = await context.params
    const { id } = routeParams
    const documentId = id
    const { description, tags, category, isFavorite, metadata } = await request.json()

    const sql = getSql()

    // Verify document ownership
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const documentRows = await sql`
      SELECT id FROM documents 
      WHERE id = ${documentId} AND user_id = ${user.id}
    ` as any[]

    const document = documentRows[0]

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Build update query dynamically using unsafe for dynamic fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sqlClient = sql as any
    const setParts: string[] = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryParams: any[] = []
    let paramIndex = 1

    if (description !== undefined) {
      setParts.push(`description = $${paramIndex}`)
      queryParams.push(description)
      paramIndex++
    }

    if (tags !== undefined) {
      setParts.push(`tags = $${paramIndex}::jsonb`)
      queryParams.push(JSON.stringify(Array.isArray(tags) ? tags : []))
      paramIndex++
    }

    if (metadata !== undefined) {
      setParts.push(`metadata = $${paramIndex}::jsonb`)
      queryParams.push(typeof metadata === 'string' ? metadata : JSON.stringify(metadata))
      paramIndex++
    }

    if (category !== undefined) {
      setParts.push(`category = $${paramIndex}`)
      queryParams.push(category)
      paramIndex++
    }

    if (isFavorite !== undefined) {
      setParts.push(`is_favorite = $${paramIndex}`)
      queryParams.push(isFavorite)
      paramIndex++
    }

    if (setParts.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    setParts.push(`updated_at = NOW()`)
    queryParams.push(documentId)

    // Update document using unsafe for dynamic SQL
    const updateQuery = `
      UPDATE documents 
      SET ${setParts.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedDocumentRows = await sqlClient.unsafe(updateQuery, queryParams) as any[]
    const updatedDocument = updatedDocumentRows[0]

    // Log activity
    const detailsJson = JSON.stringify({
      updatedFields: {
        description: description !== undefined,
        tags: tags !== undefined,
        category: category !== undefined,
        isFavorite: isFavorite !== undefined
      }
    })
    await sql`
      INSERT INTO document_activity (document_id, user_id, action, details, created_at)
      VALUES (${documentId}, ${user.id}, ${'metadata_updated'}, ${detailsJson}::jsonb, NOW())
    `

    return NextResponse.json({
      success: true,
      document: {
        id: updatedDocument.id,
        description: updatedDocument.description,
        tags: typeof updatedDocument.tags === 'string' ? JSON.parse(updatedDocument.tags) : (updatedDocument.tags || []),
        category: updatedDocument.category,
        isFavorite: updatedDocument.is_favorite,
        metadata: typeof updatedDocument.metadata === 'string' ? JSON.parse(updatedDocument.metadata) : updatedDocument.metadata,
        updatedAt: updatedDocument.updated_at
      }
    })

  } catch (error) {
    logError('Update metadata error:', error)
    return NextResponse.json({
      error: 'Failed to update metadata'
    }, { status: 500 })
  }
}
