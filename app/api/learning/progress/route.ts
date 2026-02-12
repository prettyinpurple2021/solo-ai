import { NextResponse } from 'next/server';
import { LearningEngine } from '@/lib/learning-engine';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { logError } from '@/lib/logger';

const progressSchema = z.object({
  moduleId: z.string(),
  status: z.enum(['in_progress', 'completed']),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const learningEngine = new LearningEngine(session.user.id);
    const progress = await learningEngine.getUserProgress();
    
    // Transform to match UI expectations if needed, but schema is pretty clean
    return NextResponse.json(progress);
  } catch (error) {
    logError('Error fetching progress', { error });
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = progressSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { moduleId, status } = validation.data;
    const learningEngine = new LearningEngine(session.user.id);
    await learningEngine.updateProgress(moduleId, status);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError('Error updating progress', { error });
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
