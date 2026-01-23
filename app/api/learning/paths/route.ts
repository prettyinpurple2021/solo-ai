import { NextResponse } from 'next/server';
import { LearningEngine } from '@/lib/learning-engine';

export async function GET() {
  try {
    // This endpoint is public or protected? 
    // Assuming public access to view available paths is fine, 
    // or we can enforce auth if needed. For now, open.
    const paths = await LearningEngine.getAllPaths();
    return NextResponse.json(paths);
  } catch (error) {
    console.error('Error fetching learning paths:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning paths' },
      { status: 500 }
    );
  }
}
