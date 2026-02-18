
'use server'

import { db } from '@/db';
import { tasks, goals } from '@/shared/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { authenticateAction } from '@/lib/auth-server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  due_date: z.string().optional(),
  goal_id: z.string().optional(),
  estimated_minutes: z.number().optional(),
});

export async function updateTask(id: string, data: Partial<z.infer<typeof taskSchema>>) {
  const { user, error } = await authenticateAction();
  if (error || !user) throw new Error("Unauthorized");

  await db.update(tasks)
    .set({
      ...data,
      due_date: data.due_date ? new Date(data.due_date) : undefined,
      updated_at: new Date()
    })
    .where(and(eq(tasks.id, id), eq(tasks.user_id, user.id)));

  revalidatePath('/dashboard/slaylist');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function createTask(data: z.infer<typeof taskSchema>) {
  const { user, error } = await authenticateAction();
  if (error || !user) throw new Error("Unauthorized");

  const validated = taskSchema.parse(data);

  const [newTask] = await db.insert(tasks).values({
    ...validated,
    user_id: user.id,
    due_date: validated.due_date ? new Date(validated.due_date) : undefined,
    created_at: new Date(),
    updated_at: new Date()
  }).returning();

  revalidatePath('/dashboard/slaylist');
  return { success: true, task: newTask };
}
