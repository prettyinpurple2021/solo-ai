
import { db } from '@/db';
import { 
  boardroomSessions, 
  boardroomMessages,
  agentInstructions
} from '@/shared/db/schema';
import { eq, and, desc, sql, count } from 'drizzle-orm';

export interface CollaborationSession {
  id: string;
  name: string;
  goal: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface AgentInfo {
  id: string;
  name: string;
  specialization: string;
  status: 'available' | 'busy' | 'offline';
  capabilities: string[];
}

export class CollaborationService {
  static async getSessions(userId: string): Promise<CollaborationSession[]> {
    const sessions = await db.select({
      id: boardroomSessions.id,
      name: boardroomSessions.name,
      goal: boardroomSessions.goal,
      status: boardroomSessions.status,
      createdAt: boardroomSessions.createdAt,
      updatedAt: boardroomSessions.updatedAt,
      // Count messages for each session
      messageCount: sql<number>`(SELECT count(*) FROM boardroom_messages WHERE session_id = boardroom_sessions.id)`
    })
    .from(boardroomSessions)
    .where(eq(boardroomSessions.userId, userId))
    .orderBy(desc(boardroomSessions.updatedAt));

    return sessions.map(s => ({
      id: s.id,
      name: s.name,
      goal: s.goal,
      status: s.status as any,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      messageCount: s.messageCount
    }));
  }

  static async getAgents(): Promise<AgentInfo[]> {
    // This could be hardcoded or from DB. For now, let's use the core team.
    const agents: AgentInfo[] = [
      { id: 'roxy', name: 'Roxy', specialization: 'Strategic Operations', status: 'available', capabilities: ['SPADE', 'Strategy'] },
      { id: 'lexi', name: 'Lexi', specialization: 'Legal & Compliance', status: 'available', capabilities: ['Legal', 'Contracts'] },
      { id: 'nova', name: 'Nova', specialization: 'Product Visionary', status: 'available', capabilities: ['UX', 'Roadmap'] },
      { id: 'echo', name: 'Echo', specialization: 'Viral Marketing', status: 'available', capabilities: ['Social', 'Growth'] },
      { id: 'glitch', name: 'Glitch', specialization: 'Systems Optimization', status: 'available', capabilities: ['Efficiency', 'Logic'] },
      { id: 'blaze', name: 'Blaze', specialization: 'Revenue Growth', status: 'available', capabilities: ['Sales', 'Scaling'] },
      { id: 'vex', name: 'Vex', specialization: 'Operations Efficiency', status: 'available', capabilities: ['Process', 'Automation'] },
      { id: 'lumi', name: 'Lumi', specialization: 'Quality Assurance', status: 'available', capabilities: ['Testing', 'Standards'] },
      { id: 'finn', name: 'Finn', specialization: 'Financial Logistics', status: 'available', capabilities: ['Finance', 'Logistics'] },
      { id: 'aura', name: 'Aura', specialization: 'Wellness & Balance', status: 'available', capabilities: ['Wellness', 'Mindset'] }
    ];
    
    return agents;
  }
}
