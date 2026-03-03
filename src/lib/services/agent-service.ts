
import { db } from '@/db';
import { chatConversations } from '@/shared/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function getConversations(userId: string) {
  return await db
    .select({
      id: chatConversations.id,
      title: chatConversations.title,
      agentId: chatConversations.agent_id,
      agentName: chatConversations.agent_name,
      lastMessage: chatConversations.last_message,
      lastMessageTime: chatConversations.last_message_at,
      messageCount: chatConversations.message_count,
      isArchived: chatConversations.is_archived,
      created_at: chatConversations.created_at,
      updated_at: chatConversations.updated_at,
    })
    .from(chatConversations)
    .where(
      and(
        eq(chatConversations.user_id, userId),
        eq(chatConversations.is_archived, false)
      )
    )
    .orderBy(desc(chatConversations.last_message_at))
    .limit(50);
}
