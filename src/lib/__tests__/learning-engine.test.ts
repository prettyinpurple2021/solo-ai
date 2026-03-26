import { jest, describe, it, expect, beforeEach, beforeAll } from '@jest/globals';

const mockFindFirst = jest.fn() as any;
const mockFindMany = jest.fn() as any;
const mockSelect = jest.fn() as any;
const mockGenerateObject = jest.fn() as any;

let LearningEngine: any;

beforeAll(async () => {
  await jest.unstable_mockModule('@/lib/database-client', () => ({
    db: {
      select: mockSelect,
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      query: {
        users: {
          findFirst: mockFindFirst,
        },
        userLearningProgress: {
          findMany: mockFindMany,
        },
        learningModules: {
          findMany: mockFindMany,
        },
        learningPaths: {
            findMany: mockFindMany,
        }
      },
    },
  }));

  await jest.unstable_mockModule('ai', () => ({
    generateObject: mockGenerateObject,
  }));

  await jest.unstable_mockModule('@ai-sdk/google', () => ({
    google: jest.fn().mockReturnValue('google-mock'),
  }));

  const mod = await import('../learning-engine');
  LearningEngine = mod.LearningEngine;
});

describe('LearningEngine - Predictive Path Generation', () => {
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    jest.clearAllMocks();
    mockFindFirst.mockReset();
    mockFindMany.mockReset();
    mockSelect.mockReset();
    mockGenerateObject.mockReset();
  });

  it('should generate a predictive path using Gemini 2.5 Pro', async () => {
    const engine = new LearningEngine(mockUserId);

    // Mock user context
    mockFindFirst.mockReturnValue(Promise.resolve({
      bio: 'SaaS founder building an AI CRM',
      level: 5,
      xp: 450
    }));

    // Mock progress (completed 0 modules)
    mockFindMany.mockReturnValue(Promise.resolve([]));

    // Mock AI response
    const mockPath = {
      path_title: 'SaaS Acceleration Path',
      description: 'A path focused on scaling your AI CRM.',
      modules: [
        {
          title: 'Product-Market Fit for AI',
          description: 'Validating your AI features.',
          reasoning: 'Critical for early-stage SaaS.',
          estimated_duration_minutes: 45
        }
      ]
    };
    
    mockGenerateObject.mockReturnValue(Promise.resolve({
      object: mockPath
    }));

    const result = await engine.generatePredictivePath();

    expect(result).toEqual(mockPath);
    expect(mockGenerateObject).toHaveBeenCalledWith(expect.objectContaining({
      model: 'google-mock',
      prompt: expect.stringContaining('SaaS founder building an AI CRM')
    }));
  });

  it('should handle AI generation failure gracefully', async () => {
    const engine = new LearningEngine(mockUserId);

    mockFindFirst.mockReturnValue(Promise.resolve({}));
    mockFindMany.mockReturnValue(Promise.resolve([]));
    mockGenerateObject.mockRejectedValue(new Error('AI error'));

    await expect(engine.generatePredictivePath()).rejects.toThrow('Failed to generate predictive learning path');
  });

  describe('analyzeSkillGaps', () => {
    it('should return fundamental gaps when no progress exists', async () => {
        const engine = new LearningEngine(mockUserId);
        
        // Mock progress (empty)
        mockFindMany.mockReturnValueOnce(Promise.resolve([]));
        // Mock all modules
        mockFindMany.mockReturnValueOnce(Promise.resolve([
            { id: '1', title: 'Module 1', module_type: 'article' },
            { id: '2', title: 'Module 2', module_type: 'article' },
            { id: '3', title: 'Module 3', module_type: 'article' }
        ]));

        const gaps = await engine.analyzeSkillGaps();
        expect(gaps[0].skill).toBe('Business Foundations');
        expect(gaps[0].gap_level).toBe('critical');
    });

    it('should use AI to analyze gaps when progress exists', async () => {
        const engine = new LearningEngine(mockUserId);
        
        // Mock progress
        mockFindMany.mockReturnValueOnce(Promise.resolve([
            { module_id: '1', status: 'completed' }
        ]));
        // Mock all modules
        mockFindMany.mockReturnValueOnce(Promise.resolve([
            { id: '1', title: 'Module 1', module_type: 'article' },
            { id: '2', title: 'Module 2', module_type: 'article' }
        ]));

        const mockGaps = {
            gaps: [
                {
                    skill: 'Advanced Strategy',
                    gap_level: 'high',
                    recommended_modules: ['Module 2'],
                    reasoning: 'Need to move beyond basics.'
                }
            ]
        };

        mockGenerateObject.mockReturnValue(Promise.resolve({
            object: mockGaps
        }));

        const gaps = await engine.analyzeSkillGaps();
        expect(gaps).toEqual(mockGaps.gaps);
        expect(mockGenerateObject).toHaveBeenCalledWith(expect.objectContaining({
            prompt: expect.stringContaining('Module 1')
        }));
    });
  });
});
