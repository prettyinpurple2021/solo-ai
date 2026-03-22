/**
 * @jest-environment node
 */
import { jest, describe, it, expect, beforeAll } from '@jest/globals';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
  quiet: true,
});

// Polyfill fetch for Neon driver if needed
if (typeof fetch === 'undefined') {
  const { fetch: undiciFetch, Request, Response, Headers } = await import('undici');
  // @ts-ignore
  globalThis.fetch = undiciFetch;
  // @ts-ignore
  globalThis.Request = Request;
  // @ts-ignore
  globalThis.Response = Response;
  // @ts-ignore
  globalThis.Headers = Headers;
}

// Mock uuid to avoid ESM issues
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid'),
}));

import { getIntelligencePageData } from './competitor-service';
import { db } from '@/db';
import { users } from '@/shared/db/schema';
import { eq } from 'drizzle-orm';

describe('CompetitorService Integration', () => {
  let testUser: any;

  beforeAll(async () => {
    // Find a real user in the DB to test with, or skip if none exists
    try {
      const existingUsers = await db.select().from(users).limit(1);
      if (existingUsers.length > 0) {
        testUser = existingUsers[0];
      }
    } catch {
      // No DB or no user: test body exits early (quiet skip for CI without secrets).
    }
  });

  it('should fetch intelligence data from the real database', async () => {
    if (!testUser) {
      return;
    }

    const data = await getIntelligencePageData(testUser.id);

    expect(data).toBeDefined();
    expect(data.insights).toBeInstanceOf(Array);
    expect(data.stats).toBeDefined();
    expect(data.market_position).toBeDefined();
    expect(data.strategic_analysis).toBeDefined();
  });
});
