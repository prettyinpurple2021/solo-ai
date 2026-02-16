
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { templates } from '@/shared/db/schema';
import { logError } from '@/lib/logger';
import { desc, like, or, and, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const complexity = searchParams.get('complexity');

    let conditions: any[] = [];

    if (query) {
      conditions.push(or(
        like(templates.title, `%${query}%`),
        like(templates.description, `%${query}%`)
      ));
    }

    if (category && category !== 'all') {
      conditions.push(eq(templates.category, category));
    }

    if (complexity && complexity !== 'all') {
      conditions.push(eq(templates.difficulty, complexity));
    }

    const result = await db.select()
      .from(templates)
      .where(and(...conditions))
      .orderBy(desc(templates.created_at));

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    logError('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
