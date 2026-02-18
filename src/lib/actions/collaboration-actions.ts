
'use server'

import { db } from '@/db';
import { boardroomSessions } from '@/shared/db/schema';
import { eq, and } from 'drizzle-orm';
import { authenticateAction } from '@/lib/auth-server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const sessionSchema = z.object({
  goal: z.string().min(1),
  name: z.string().optional(),
  requiredAgents: z.array(z.string()).default([]),
});

export async function createSession(data: z.infer<typeof sessionSchema>) {
  const { user, error } = await authenticateAction();
  if (error || !user) throw new Error("Unauthorized");

  const validated = sessionSchema.parse(data);

  const [newSession] = await db.insert(boardroomSessions).values({
    userId: user.id,
    name: validated.name || 'New Collaboration Session',
    goal: validated.goal,
    status: 'active',
    config: { requiredAgents: validated.requiredAgents },
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning();

  revalidatePath('/dashboard/collaboration');
  return { success: true, session: newSession };
}

export async function updateSessionStatus(sessionId: string, status: 'active' | 'paused' | 'completed' | 'cancelled') {
  const { user, error } = await authenticateAction();
  if (error || !user) throw new Error("Unauthorized");

  await db.update(boardroomSessions)
    .set({ 
      status,
      updatedAt: new Date() 
    })
    .where(and(eq(boardroomSessions.id, sessionId), eq(boardroomSessions.userId, user.id)));

  revalidatePath('/dashboard/collaboration');
  return { success: true };
}
