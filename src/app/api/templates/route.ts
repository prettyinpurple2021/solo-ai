import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { logError } from '@/lib/logger'
import { templates } from '@/shared/db/schema'
import { eq, desc, or } from 'drizzle-orm'
import { verifyAuth } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request) {
  try {
    const authResult = await verifyAuth()
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authResult.user.id

    const allTemplates = await db
      .select()
      .from(templates)
      .where(
        or(
          eq(templates.is_public, true),
          eq(templates.user_id, userId)
        )
      )
      .orderBy(desc(templates.created_at))

    return NextResponse.json(allTemplates)
  } catch (error) {
    logError('Error fetching templates:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await verifyAuth()
    if (!authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authResult.user.id
    const body = await req.json()
    const { title, description, content, category, tags, difficulty, estimated_minutes, template_slug } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const newTemplate = await db
      .insert(templates)
      .values({
        user_id: userId,
        template_slug,
        title,
        description: description || '',
        content,
        category: category || 'general',
        tags: tags || [],
        difficulty: difficulty || 'Beginner',
        estimated_minutes: estimated_minutes || 0,
        is_public: false,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning()

    return NextResponse.json(newTemplate[0])
  } catch (error) {
    logError('Error creating template:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
