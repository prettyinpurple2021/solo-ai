
'use server'

import { db } from '@/db';
import { users } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';
import { authenticateAction } from '@/lib/auth-server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateProfileSchema = z.object({
  onboarding_completed: z.boolean().optional(),
  onboarding_data: z.any().optional(),
  full_name: z.string().optional(),
});

export async function updateProfile(data: z.infer<typeof updateProfileSchema>) {
  const { user, error } = await authenticateAction();
  if (error || !user) throw new Error("Unauthorized");

  const validated = updateProfileSchema.parse(data);

  await db.update(users)
    .set({
      ...validated,
      updated_at: new Date()
    })
    .where(eq(users.id, user.id));

  revalidatePath('/dashboard');
  return { success: true };
}
