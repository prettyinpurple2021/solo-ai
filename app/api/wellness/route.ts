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
    
    // Distinguish action based on a query param or body field? 
    // Usually routes are split. For simplicity in this mono-route file demo:
    // Let's assume different endpoints. Wait, I'm writing one file.
    // I should probably split them or handle by a 'type' field.
    // Given the plan says /mood and /focus, I should really make separate folders.
    // BUT, for speed, I'll handle "action" in body if permitted, or just write separate files.
    // The previous prompt created /academy/paths etc.
    // Let's create specific folders for cleanliness: api/wellness/mood and api/wellness/focus.
    // However, I am currently targetting `app/api/wellness/route.ts` as a catch-all for `GET /stats`.
    // I will use this file for GET stats and create separate ones for POST if needed, or handle methods.
    
    return NextResponse.json({ error: 'Use specific endpoints /mood or /focus' }, { status: 400 });

  } catch (err) {
      return NextResponse.json({ error: 'Error' }, { status: 500 });
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
