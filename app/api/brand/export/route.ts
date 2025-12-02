import { logger, logError, logInfo } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { z } from 'zod'
import { getDb } from '@/lib/database-client'
import { documents, userBrandSettings, documentFolders } from '@/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import JSZip from 'jszip'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'


export const dynamic = 'force-dynamic'

const exportSchema = z.object({
  format: z.enum(['pdf', 'json', 'zip']),
  includeAssets: z.boolean().optional().default(true),
  includeGuidelines: z.boolean().optional().default(true),
})

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest()
    if (!authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const rateLimitResult = await rateLimitByIp(request, { requests: 5, window: 60 })
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const body = await request.json()
    const { format, includeAssets, includeGuidelines } = exportSchema.parse(body)

    // Generate brand export (production: real data, persisted as document, downloadable)
    const exportData = await generateBrandExport(authResult.user.id, format, includeAssets, includeGuidelines)

    logInfo('Brand export generated successfully', { userId: authResult.user.id, format })
    return NextResponse.json({
      success: true,
      exportData,
      downloadUrl: `/api/brand/export/download/${exportData.id}`
    })
  } catch (error) {
    logError('Error generating brand export:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid export parameters', details: (error as any).errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateBrandExport(userId: string, format: string, includeAssets: boolean, includeGuidelines: boolean) {
  try {
    const db = getDb()
    // Load brand settings
    const brandRows = await db
      .select()
      .from(userBrandSettings)
      .where(eq(userBrandSettings.user_id, userId))
      .limit(1)

    const settings = brandRows[0] || null

    // Build export payload from real data
    const payload = {
      metadata: {
        id: `brand-export-${userId}-${Date.now()}`,
        userId,
        generatedAt: new Date().toISOString(),
        format,
        includeAssets,
        includeGuidelines,
        version: '1.0.0'
      },
      brandOverview: {
        companyName: settings?.company_name || null,
        tagline: settings?.tagline || null,
        description: settings?.description || null,
        industry: settings?.industry || null
      },
      visualIdentity: {
        logoUrl: settings?.logo_url || null,
        colorPalette: settings?.color_palette || {},
        typography: settings?.typography || {}
      },
      brandPersonality: settings?.brand_personality || [],
      moodboard: settings?.moodboard || [],
      guidelines: includeGuidelines ? {
        logoPrompt: settings?.logo_prompt || null,
        guidance: [
          'Maintain logo clear space and minimum size across mediums',
          'Preserve contrast ratios for accessibility (WCAG AA+)',
          'Use primary typeface consistently for headings and CTAs'
        ]
      } : null,
      assets: includeAssets ? await loadBrandAssets(db, userId) : null
    }

    // Persist as a document for download
    if (format === 'json') {
      const json = JSON.stringify(payload, null, 2)
      const base64 = Buffer.from(json, 'utf-8').toString('base64')
      const dataUrl = `data:application/json;base64,${base64}`
      const originalName = `brand-export-${new Date().toISOString().slice(0, 10)}.json`

      const [doc] = await db
        .insert(documents)
        .values({
          id: payload.metadata.id,
          user_id: userId,
          folder_id: null,
          name: originalName,
          original_name: originalName,
          file_type: 'json',
          mime_type: 'application/json',
          size: Buffer.byteLength(json, 'utf-8'),
          file_url: dataUrl,
          category: 'brand_export',
          description: 'Exported brand configuration',
          tags: JSON.stringify(['brand', 'export']),
          metadata: JSON.stringify({ format }),
          ai_insights: JSON.stringify({}),
          is_favorite: false,
          is_public: false
        })
        .returning()

      return {
        id: doc.id,
        userId,
        format,
        includeAssets,
        includeGuidelines,
        generatedAt: payload.metadata.generatedAt,
        status: 'completed',
        fileSize: `${doc.size} bytes`,
        contents: payload
      }
    }

    if (format === 'pdf') {
      const pdfBytes = generateMinimalBrandPdf(payload)
      const base64 = Buffer.from(pdfBytes).toString('base64')
      const dataUrl = `data:application/pdf;base64,${base64}`
      const originalName = `brand-export-${new Date().toISOString().slice(0, 10)}.pdf`

      const [doc] = await db
        .insert(documents)
        .values({
          id: payload.metadata.id,
          user_id: userId,
          folder_id: null,
          name: originalName,
          original_name: originalName,
          file_type: 'pdf',
          mime_type: 'application/pdf',
          size: pdfBytes.length,
          file_url: dataUrl,
          category: 'brand_export',
          description: 'Exported brand configuration (PDF summary)',
          tags: JSON.stringify(['brand', 'export', 'pdf']),
          metadata: JSON.stringify({ format }),
          ai_insights: JSON.stringify({}),
          is_favorite: false,
          is_public: false
        })
        .returning()

      return {
        id: doc.id,
        userId,
        format,
        includeAssets,
        includeGuidelines,
        generatedAt: payload.metadata.generatedAt,
        status: 'completed',
        fileSize: `${doc.size} bytes`,
        contents: { summary: 'PDF generated' }
      }
    }

    if (format === 'zip') {
      const zip = new JSZip()
      // Add primary JSON manifest
      const manifest = JSON.stringify(payload, null, 2)
      zip.file('brand-export.json', manifest)
      // Add referenced assets (best-effort based on discovered assets)
      if (payload.assets) {
        // We only embed pointers; to embed actual binaries requires fetching each file_url which may be remote.
        // For production stability in edge, we include a catalog with URLs.
        const assetsCatalog = JSON.stringify(payload.assets, null, 2)
        zip.file('assets/catalog.json', assetsCatalog)
      }
      const zipContent = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE', compressionOptions: { level: 6 } })
      const base64 = Buffer.from(zipContent).toString('base64')
      const dataUrl = `data:application/zip;base64,${base64}`
      const originalName = `brand-export-${new Date().toISOString().slice(0, 10)}.zip`

      const [doc] = await db
        .insert(documents)
        .values({
          id: payload.metadata.id,
          user_id: userId,
          folder_id: null,
          name: originalName,
          original_name: originalName,
          file_type: 'zip',
          mime_type: 'application/zip',
          size: zipContent.length,
          file_url: dataUrl,
          category: 'brand_export',
          description: 'Exported brand configuration (ZIP bundle)',
          tags: JSON.stringify(['brand', 'export', 'zip']),
          metadata: JSON.stringify({ format }),
          ai_insights: JSON.stringify({}),
          is_favorite: false,
          is_public: false
        })
        .returning()

      return {
        id: doc.id,
        userId,
        format,
        includeAssets,
        includeGuidelines,
        generatedAt: payload.metadata.generatedAt,
        status: 'completed',
        fileSize: `${doc.size} bytes`,
        contents: { summary: 'ZIP generated with manifest and assets catalog' }
      }
    }

    throw new Error('Unsupported export format')
  } catch (error) {
    logError('Error in brand export generation:', error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest()
    if (!authResult.user) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    // Get user's export history from documents
    const db = getDb()
    const rows = await db
      .select({
        id: documents.id,
        name: documents.name,
        original_name: documents.original_name,
        size: documents.size,
        mime_type: documents.mime_type,
        file_url: documents.file_url,
        created_at: documents.created_at
      })
      .from(documents)
      .where(and(eq(documents.user_id, authResult.user.id), eq(documents.category, 'brand_export')))
      .orderBy(desc(documents.created_at))

    return NextResponse.json({
      success: true,
      exports: rows.map(row => ({
        id: row.id,
        format: row.mime_type === 'application/json' ? 'json' : 'binary',
        generatedAt: row.created_at?.toISOString?.() || new Date().toISOString(),
        fileSize: `${row.size} bytes`,
        status: 'completed',
        downloadUrl: `/api/brand/export/download/${row.id}`
      }))
    })
  } catch (error) {
    logError('Error fetching export history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function loadBrandAssets(db: ReturnType<typeof getDb>, userId: string) {
  // Attempt to find brand-related assets in user's documents
  // This is a best-effort gather; assets are optional and may be empty.
  const rows = await db
    .select({
      id: documents.id,
      name: documents.name,
      file_url: documents.file_url,
      mime_type: documents.mime_type,
      category: documents.category
    })
    .from(documents)
    .where(eq(documents.user_id, userId))
    .orderBy(desc(documents.created_at))

  const logoCandidates = rows.filter(r => (r.category || '').toLowerCase().includes('logo') || (r.name || '').toLowerCase().includes('logo'))
  const brandAssets = rows.filter(r => (r.category || '').toLowerCase().includes('brand') || (r.name || '').toLowerCase().includes('brand'))

  return {
    logos: logoCandidates.slice(0, 5).map(r => ({ id: r.id, name: r.name, url: r.file_url, mimeType: r.mime_type })),
    files: brandAssets.slice(0, 20).map(r => ({ id: r.id, name: r.name, url: r.file_url, mimeType: r.mime_type }))
  }
}

function generateMinimalBrandPdf(payload: any): Uint8Array {
  // Build a minimal one-page PDF with a text summary of key brand settings.
  // Reference: PDF 1.4 objects layout (catalog, pages, page, font, content, xref, trailer).
  const title = 'Brand Export Summary'
  const lines: string[] = []
  lines.push(`Company: ${payload.brandOverview.companyName ?? 'N/A'}`)
  lines.push(`Tagline: ${payload.brandOverview.tagline ?? 'N/A'}`)
  lines.push(`Industry: ${payload.brandOverview.industry ?? 'N/A'}`)
  const colorKeys = Object.keys(payload.visualIdentity.colorPalette ?? {})
  lines.push(`Colors: ${colorKeys.length > 0 ? colorKeys.join(', ') : 'N/A'}`)
  const generatedAt = payload.metadata.generatedAt

  // Build content stream using text operators
  const textOps: string[] = []
  textOps.push('BT')
  textOps.push('/F1 14 Tf')
  textOps.push('50 770 Td')
  textOps.push(`(${escapePdfText(title)}) Tj`)
  textOps.push('0 -24 Td')
  textOps.push('/F1 10 Tf')
  textOps.push(`(Generated: ${escapePdfText(generatedAt)}) Tj`)
  let y = -40
  for (const line of lines) {
    textOps.push(`0 ${y} Td (${escapePdfText(line)}) Tj`)
    y = -14
  }
  textOps.push('ET')
  const contentStream = textOps.join('\n')

  const objects: string[] = []
  let offset = 0
  const xref: number[] = []
  const append = (s: string) => {
    const enc = Buffer.from(s, 'binary')
    const prev = offset
    offset += enc.length
    return { enc, prev }
  }

  // PDF Header
  let chunks: Buffer[] = []
  const header = '%PDF-1.4\n%\xFF\xFF\xFF\xFF\n'
  chunks.push(Buffer.from(header, 'binary')); offset += Buffer.byteLength(header, 'binary'); xref.push(0) // placeholder

  // 1: Catalog
  xref.push(offset)
  chunks.push(Buffer.from('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n', 'binary'))
  offset = Buffer.concat(chunks).length
  // 2: Pages
  xref.push(offset)
  chunks.push(Buffer.from('2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n', 'binary'))
  offset = Buffer.concat(chunks).length
  // 3: Page
  xref.push(offset)
  chunks.push(Buffer.from('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n', 'binary'))
  offset = Buffer.concat(chunks).length
  // 4: Font
  xref.push(offset)
  chunks.push(Buffer.from('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n', 'binary'))
  offset = Buffer.concat(chunks).length
  // 5: Content stream
  const contentBytes = Buffer.from(contentStream, 'binary')
  xref.push(offset)
  chunks.push(Buffer.from(`5 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n`, 'binary'))
  chunks.push(contentBytes)
  chunks.push(Buffer.from('\nendstream\nendobj\n', 'binary'))
  offset = Buffer.concat(chunks).length

  // XRef
  const xrefStart = offset
  const xrefLines: string[] = []
  xrefLines.push('xref')
  xrefLines.push(`0 ${xref.length}`)
  // Object 0 is the free object
  xrefLines.push('0000000000 65535 f ')
  for (let i = 1; i < xref.length; i++) {
    const pos = xref[i]
    xrefLines.push(`${pos.toString().padStart(10, '0')} 00000 n `)
  }
  xrefLines.push('trailer')
  xrefLines.push(`<< /Size ${xref.length} /Root 1 0 R >>`)
  xrefLines.push('startxref')
  xrefLines.push(`${xrefStart}`)
  xrefLines.push('%%EOF')
  chunks.push(Buffer.from(xrefLines.join('\n'), 'binary'))

  const pdfBuffer = Buffer.concat(chunks)
  return new Uint8Array(pdfBuffer)
}

function escapePdfText(s: string) {
  return (s || '').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}