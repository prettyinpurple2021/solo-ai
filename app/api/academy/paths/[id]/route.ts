import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { LearningEngine } from '@/lib/learning-engine';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await authenticateRequest();
  
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    const engine = new LearningEngine(user.id);
    const path = await engine.getPathWithProgress(id);

    if (!path) {
      return NextResponse.json({ error: 'Learning path not found' }, { status: 404 });
    }
    
    return NextResponse.json(path);
  } catch (err) {
    const { id } = await params;
    console.error(`Error fetching path ${id}:`, err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
