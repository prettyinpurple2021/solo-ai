
'use server'

import { db } from '@/db';
import { templates } from '@/shared/db/schema';
import { eq, and } from 'drizzle-orm';
import { authenticateAction } from '@/lib/auth-server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const templateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  content: z.string().optional().default('{}'),
  category: z.string().optional(),
  template_slug: z.string().optional(),
  is_public: z.boolean().optional(),
});

export async function useTemplate(data: z.infer<typeof templateSchema>) {
  const { user, error } = await authenticateAction();
  if (error || !user) throw new Error("Unauthorized");

  const validated = templateSchema.parse(data);

  const [newTemplate] = await db.insert(templates).values({
    user_id: user.id,
    template_slug: validated.template_slug,
    title: validated.title,
    description: validated.description || '',
    content: validated.content,
    category: validated.category || 'general',
    is_public: validated.is_public || false,
    created_at: new Date(),
    updated_at: new Date()
  }).returning();

  revalidatePath('/dashboard/templates');
  return { success: true, template: newTemplate };
}

export async function updateTemplate(id: string, data: Partial<z.infer<typeof templateSchema>>) {
  const { user, error } = await authenticateAction();
  if (error || !user) throw new Error("Unauthorized");

  await db.update(templates)
    .set({
      ...data,
      updated_at: new Date()
    })
    .where(and(eq(templates.id, id), eq(templates.user_id, user.id)));

  revalidatePath('/dashboard/templates');
  return { success: true };
}

export async function deleteTemplate(id: string) {
  const { user, error } = await authenticateAction();
  if (error || !user) throw new Error("Unauthorized");

  await db.delete(templates)
    .where(and(eq(templates.id, id), eq(templates.user_id, user.id)));

  revalidatePath('/dashboard/templates');
  return { success: true };
}
