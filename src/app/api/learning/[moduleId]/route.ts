import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { auth } from '@/lib/auth';
import { learningModules } from '@/shared/db/schema/content';
import { assessments } from '@/shared/db/schema/learning';
import { eq } from 'drizzle-orm';
import { LearningEngineService } from '@/lib/services/learning-engine-service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { moduleId } = await params;

    // Fetch learning module and assessment in parallel
    const [moduleInfo, assessment] = await Promise.all([
      db.query.learningModules.findFirst({
        where: eq(learningModules.id, moduleId),
      }),
      db.query.assessments.findFirst({
        where: eq(assessments.module_id, moduleId),
      }),
    ]);

    if (!moduleInfo) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    return NextResponse.json({ module: moduleInfo, assessment: assessment ?? null });
  } catch (error) {
    console.error(`Error in GET /api/learning/[moduleId]:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
