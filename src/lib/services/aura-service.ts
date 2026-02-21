import { db } from "@/db"
import { chatConversations, chatMessages } from "@/shared/db/schema"
import { eq, desc, and } from "drizzle-orm"
import { AgentCollaborationSystem } from "@/lib/custom-ai-agents/agent-collaboration-system"
import { logError, logInfo } from "@/lib/logger"
import { v4 as uuidv4 } from 'uuid'

export class AuraService {
  private collaborationSystem: AgentCollaborationSystem
  private userId: string

  constructor(userId: string) {
    this.userId = userId
    this.collaborationSystem = new AgentCollaborationSystem(userId)
  }

  /**
   * Process a user request through Aura and persist the interaction
   */
  async processAuraRequest(message: string, conversationId?: string) {
    try {
      // 1. Get or create conversation
      let activeConversationId = conversationId
      
      if (!activeConversationId) {
        const [newConv] = await db.insert(chatConversations).values({
          id: uuidv4(),
          user_id: this.userId,
          title: message.substring(0, 50),
          agent_id: 'aura',
          agent_name: 'Aura',
          is_archived: false,
          metadata: { type: 'aura_session' }
        }).returning()
        activeConversationId = newConv.id
      }

      // 2. Persist user message
      await db.insert(chatMessages).values({
        id: uuidv4(),
        conversation_id: activeConversationId,
        user_id: this.userId,
        role: 'user',
        content: message,
        metadata: {}
      })

      // 3. Process through Collaboration System (Primary: Aura)
      const result = await this.collaborationSystem.processRequest(message, {
        conversationId: activeConversationId,
        source: 'aura_interface'
      }, 'aura')

      // 4. Persist Aura's response
      const [auraMsg] = await db.insert(chatMessages).values({
        id: uuidv4(),
        conversation_id: activeConversationId,
        user_id: this.userId,
        role: 'assistant',
        content: result.primaryResponse.content,
        metadata: {
          confidence: result.primaryResponse.confidence,
          reasoning: result.primaryResponse.reasoning,
          suggestedActions: result.primaryResponse.suggestedActions,
          collaborationCount: result.collaborationResponses.length,
          workflowCreated: !!result.workflow
        }
      }).returning()

      // 5. Update conversation timestamp
      await db.update(chatConversations)
        .set({ updated_at: new Date(), last_message_at: new Date() })
        .where(eq(chatConversations.id, activeConversationId))

      return {
        conversationId: activeConversationId,
        response: result.primaryResponse,
        messageId: auraMsg.id,
        workflow: result.workflow
      }

    } catch (error) {
      logError('AuraService.processAuraRequest failed', error)
      throw error
    }
  }

  /**
   * Get Aura conversation history
   */
  async getConversationHistory(conversationId: string, limit: number = 50) {
    return await db.select()
      .from(chatMessages)
      .where(eq(chatMessages.conversation_id, conversationId))
      .orderBy(desc(chatMessages.created_at))
      .limit(limit)
  }

  /**
   * List user's Aura sessions
   */
  async listAuraSessions() {
    return await db.select()
      .from(chatConversations)
      .where(and(
        eq(chatConversations.user_id, this.userId),
        eq(chatConversations.agent_id, 'aura')
      ))
      .orderBy(desc(chatConversations.updated_at))
  }
}
