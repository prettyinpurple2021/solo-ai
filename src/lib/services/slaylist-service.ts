
import { db } from '@/db';
import { goals as goalsTable, tasks as tasksTable } from '@/shared/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function getGoals(userId: string) {
  return await db
    .select()
    .from(goalsTable)
    .where(eq(goalsTable.user_id, userId))
    .orderBy(desc(goalsTable.created_at));
}

export async function getTasks(userId: string) {
  return await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.user_id, userId))
    .orderBy(desc(tasksTable.created_at));
}
