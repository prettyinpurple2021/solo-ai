import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { auth } from '@/lib/auth';
import { learningModules } from '@/shared/db/schema/content';
import { assessments } from '@/shared/db/schema/learning';
import { eq } from 'drizzle-orm';
import { LearningEngineService } from '@/lib/services/learning-engine-service';

export async function GET(
  req: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { moduleId } = params;

    // Fetch learning module
    const moduleInfo = await db.query.learningModules.findFirst({
      where: eq(learningModules.id, moduleId),
    });

    if (!moduleInfo) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    // Fetch assessment if exists
    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.module_id, moduleId),
    });

    // Automatically mark the module as in_progress when accessed
    await LearningEngineService.updateModuleProgress(session.user.id, moduleId, 'in_progress');

    return NextResponse.json({ module: moduleInfo, assessment });
  } catch (error) {
    console.error(`Error in GET /api/learning/${params.moduleId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
