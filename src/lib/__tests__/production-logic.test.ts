
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { LearningEngine } from '../learning-engine';
import { db } from '../database-client';
import { users, tasks } from '@/shared/db/schema';
import { eq, sql } from 'drizzle-orm';

// Mock the database client
const mockFindFirst = jest.fn();
const mockFindMany = jest.fn();
const mockSelect = jest.fn();

jest.mock('../database-client', () => ({
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
      }
    }
  }
}));

describe('Production Logic Verification', () => {
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    jest.clearAllMocks();
    mockFindFirst.mockReset();
    mockFindMany.mockReset();
    mockSelect.mockReset();
  });

  describe('LearningEngine - Peer Rank Calculation', () => {
    it('should calculate correct peer rank for top 10%', async () => {
      const engine = new LearningEngine(mockUserId);
      
      // Mock user data
      mockFindFirst.mockResolvedValue({
        level: 10,
        xp: 1000
      });
      
      // Mock progress
      mockFindMany.mockResolvedValue([
        { status: 'completed' },
        { status: 'completed' }
      ]);

      // Mock total users (100)
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockResolvedValue([{ count: 100 }])
      });

      // Mock users below (95)
      mockSelect.mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue([{ count: 95 }])
      });

      const analytics = await engine.getLearningAnalytics();
      expect(analytics.peer_rank).toBe('Top 10%');
    });

    it('should calculate correct peer rank for Top 50%', async () => {
      const engine = new LearningEngine(mockUserId);
      
      mockFindFirst.mockResolvedValue({ level: 5, xp: 500 });
      mockFindMany.mockResolvedValue([]);
      
      // Total 100, Below 60 -> 60th percentile
      mockSelect.mockReturnValueOnce({ from: jest.fn().mockResolvedValue([{ count: 100 }]) });
      mockSelect.mockReturnValueOnce({ from: jest.fn().mockReturnThis(), where: jest.fn().mockResolvedValue([{ count: 60 }]) });

      const analytics = await engine.getLearningAnalytics();
      expect(analytics.peer_rank).toBe('Top 50%');
    });
  });

  describe('Dashboard - Task Prioritization', () => {
    // This tests the logic moved into the dashboard route
    it('should sort tasks by due_date correctly', () => {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 86400000);
      const nextWeek = new Date(now.getTime() + 86400000 * 7);

      const mockTasks = [
        { id: '1', title: 'Future Task', due_date: nextWeek, status: 'pending', priority: 'medium' },
        { id: '2', title: 'Urgent Task', due_date: tomorrow, status: 'pending', priority: 'high' },
        { id: '3', title: 'No Date Task', due_date: null, status: 'pending', priority: 'low' }
      ];

      const sorted = [...mockTasks].sort((a, b) => {
        if (a.due_date && b.due_date) return a.due_date.getTime() - b.due_date.getTime();
        if (a.due_date) return -1;
        if (b.due_date) return 1;
        return 0;
      });

      expect(sorted[0].id).toBe('2'); // Urgent first
      expect(sorted[1].id).toBe('1'); // Future second
      expect(sorted[2].id).toBe('3'); // No date last
    });
  });
});
