
import { db } from '@/db';
import { templates as templatesTable } from '@/shared/db/schema';
import { eq, desc, or } from 'drizzle-orm';

export async function getTemplates(userId: string) {
  return await db
    .select()
    .from(templatesTable)
    .where(
      or(
        eq(templatesTable.is_public, true),
        eq(templatesTable.user_id, userId)
      )
    )
    .orderBy(desc(templatesTable.created_at));
}

export async function createTemplate(userId: string, data: any) {
  const { title, description, content, category, tags, difficulty, estimated_minutes, template_slug } = data;

  const [newTemplate] = await db
    .insert(templatesTable)
    .values({
      user_id: userId,
      template_slug,
      title,
      description: description || '',
      content,
      category: category || 'general',
      tags: tags || [],
      difficulty: difficulty || 'Beginner',
      estimated_minutes: estimated_minutes || 0,
      is_public: false,
      created_at: new Date(),
      updated_at: new Date()
    })
    .returning();

  return newTemplate;
}
