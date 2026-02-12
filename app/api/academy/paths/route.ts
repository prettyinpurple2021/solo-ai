import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { LearningEngine } from '@/lib/learning-engine';
import { logError } from '@/lib/logger';

export async function GET() {
  const { user, error } = await authenticateRequest();
  
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const paths = await LearningEngine.getAllPaths();
    return NextResponse.json(paths);
  } catch (err) {
    logError('Error fetching learning paths', { error: err });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
