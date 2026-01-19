
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { customReports } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { logError } from '@/lib/logger';

const reportSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  config: z.object({}).passthrough(), // Flexible config
  schedule: z.object({}).optional(),
});

export async function GET(_req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const reports = await db
      .select()
      .from(customReports)
      .where(eq(customReports.user_id, session.user.id))
      .orderBy(desc(customReports.created_at));

    return NextResponse.json(reports);
  } catch (error) {
    logError('[REPORTS_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const validatedData = reportSchema.parse(body);

    const [report] = await db
      .insert(customReports)
      .values({
        user_id: session.user.id,
        name: validatedData.name,
        description: validatedData.description,
        config: validatedData.config,
        schedule: validatedData.schedule,
      })
      .returning();

    return NextResponse.json(report);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    console.error('[REPORTS_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
