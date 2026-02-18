
import { db } from '@/db';
import { warRoomSessions } from '@/shared/db/schema';
import { eq, desc } from 'drizzle-orm';

export interface WarRoomSession {
  id: string;
  topic: string;
  status: string;
  consensus: string | null;
  actionPlan: string[];
  dialogue: Array<{
    speaker: string;
    text: string;
    timestamp?: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export class WarRoomService {
  static async getSessions(userId: string): Promise<WarRoomSession[]> {
    const sessions = await db.select()
      .from(warRoomSessions)
      .where(eq(warRoomSessions.userId, userId))
      .orderBy(desc(warRoomSessions.updatedAt));

    return sessions.map(s => ({
      id: s.id,
      topic: s.topic,
      status: s.status,
      consensus: s.consensus,
      actionPlan: s.actionPlan as string[],
      dialogue: s.dialogue as any,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt
    }));
  }

  static async getSession(id: string, userId: string): Promise<WarRoomSession | null> {
    const [session] = await db.select()
      .from(warRoomSessions)
      .where(eq(warRoomSessions.id, id))
      .limit(1);

    if (!session || session.userId !== userId) return null;

    return {
      id: session.id,
      topic: session.topic,
      status: session.status,
      consensus: session.consensus,
      actionPlan: session.actionPlan as string[],
      dialogue: session.dialogue as any,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    };
  }
}
