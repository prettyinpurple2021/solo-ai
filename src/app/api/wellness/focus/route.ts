import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { WellnessEngine } from '@/lib/wellness';
import { z } from 'zod';
import { logError } from '@/lib/logger';

const focusSchema = z.object({
  durationMinutes: z.number().min(1),
  taskDescription: z.string().optional(),
});

export async function POST(request: Request) {
  const { user, error } = await authenticateRequest();
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const result = focusSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error }, { status: 400 });
    }

    const engine = new WellnessEngine(user.id);
    const { xpEarned } = await engine.logFocusSession(result.data.durationMinutes, result.data.taskDescription);

    return NextResponse.json({ success: true, xpEarned });
  } catch (err) {
    logError('Error logging focus session', { error: err });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
