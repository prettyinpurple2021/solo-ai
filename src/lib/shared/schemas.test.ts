import { z } from 'zod';
import { 
  DominatorAgentOutputSchema, 
  BoardroomEventSchema, 
  ServerResponseSchema 
} from '@/shared/schemas';

describe('Shared Schemas', () => {
  describe('DominatorAgentOutputSchema', () => {
    it('should validate valid agent output', () => {
      const validData = {
        agentId: 'roxy',
        content: 'Strategy recommendation...',
        timestamp: new Date().toISOString(),
        metadata: {
          tokensUsed: 150,
          model: 'gpt-4o'
        }
      };
      expect(DominatorAgentOutputSchema.parse(validData)).toEqual(validData);
    });

    it('should fail on invalid agent output', () => {
      const invalidData = {
        agentId: 123, // Should be string
        content: ''
      };
      expect(() => DominatorAgentOutputSchema.parse(invalidData)).toThrow();
    });
  });

  describe('BoardroomEventSchema', () => {
    it('should validate valid boardroom events', () => {
      const validEvent = {
        type: 'agent_collaboration',
        payload: {
          agentMessage: 'I need help with the marketing plan',
          collaboratingAgentId: 'echo'
        },
        timestamp: new Date().toISOString()
      };
      expect(BoardroomEventSchema.parse(validEvent)).toEqual(validEvent);
    });
  });

  describe('ServerResponseSchema', () => {
    it('should validate success response', () => {
      const successResponse = {
        success: true,
        data: { id: 1 },
      };
      expect(ServerResponseSchema.parse(successResponse)).toEqual(successResponse);
    });

    it('should validate error response', () => {
      const errorResponse = {
        success: false,
        error: 'Unauthorized access',
      };
      expect(ServerResponseSchema.parse(errorResponse)).toEqual(errorResponse);
    });
  });
});
