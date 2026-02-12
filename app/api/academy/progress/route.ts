import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { LearningEngine } from '@/lib/learning-engine';
import { z } from 'zod';
import { logError } from '@/lib/logger';

const progressSchema = z.object({
  moduleId: z.string(),
  completed: z.boolean(),
});

export async function POST(request: Request) {
  const { user, error } = await authenticateRequest();
  
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = progressSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request body', details: result.error }, { status: 400 });
    }

    const { moduleId, completed } = result.data;
    const engine = new LearningEngine(user.id);
    
    await engine.trackProgress(moduleId, { completed });

    return NextResponse.json({ success: true, message: 'Progress updated' });
  } catch (err) {
    logError('Error updating progress', { error: err });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
