import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { LearningEngine } from '@/lib/learning-engine';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { user, error } = await authenticateRequest();
  
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const engine = new LearningEngine(user.id);
    const path = await engine.getPathWithProgress(params.id);

    if (!path) {
      return NextResponse.json({ error: 'Learning path not found' }, { status: 404 });
    }
    
    return NextResponse.json(path);
  } catch (err) {
    console.error(`Error fetching path ${params.id}:`, err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
