import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { WellnessEngine } from '@/lib/wellness';
import { z } from 'zod';

const moodSchema = z.object({
  energyLevel: z.number().min(1).max(5),
  moodLabel: z.string().optional(),
  note: z.string().optional(),
});

const focusSchema = z.object({
  durationMinutes: z.number().min(1),
  taskDescription: z.string().optional(),
});

export async function POST(request: Request) {
  const { user, error } = await authenticateRequest();
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    
    // For now, this route serves primarily as a health check or potentially a status endpoint.
    // Specific actions like /mood and /focus have their own execution paths.
    return NextResponse.json({ error: 'Use specific endpoints /mood or /focus' }, { status: 400 });

  } catch (err) {
      console.error('Error in POST /api/wellness:', err);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
    const { user, error } = await authenticateRequest();
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const engine = new WellnessEngine(user.id);
        const stats = await engine.getStats();
        return NextResponse.json(stats);
    } catch (err) {
        console.error('Error fetching wellness stats:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
