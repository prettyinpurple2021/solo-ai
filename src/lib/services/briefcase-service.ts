
import { db } from '@/db';
import { documents as documentsTable, documentFolders } from '@/shared/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function getBriefcaseFiles(userId: string) {
  return await db
    .select()
    .from(documentsTable)
    .where(eq(documentsTable.user_id, userId))
    .orderBy(desc(documentsTable.created_at));
}

export async function getBriefcaseFolders(userId: string) {
  return await db
    .select()
    .from(documentFolders)
    .where(eq(documentFolders.user_id, userId))
    .orderBy(desc(documentFolders.created_at));
}
