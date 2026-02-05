import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { LearningEngine } from '@/lib/learning-engine';

export async function GET() {
  const { user, error } = await authenticateRequest();
  
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const paths = await LearningEngine.getAllPaths();
    return NextResponse.json(paths);
  } catch (err) {
    console.error('Error fetching learning paths:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
