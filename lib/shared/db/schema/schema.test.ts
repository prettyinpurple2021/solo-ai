
jest.mock('uuid', () => ({
  v4: () => 'test-uuid'
}));

import { users, documents, searchIndex } from './index';
import { getTableConfig } from 'drizzle-orm/pg-core';

describe('Drizzle Schema Audit', () => {
  it('users table should have strictly defined fields', () => {
    const config = getTableConfig(users);
    const emailColumn = config.columns.find(c => c.name === 'email');
    const roleColumn = config.columns.find(c => c.name === 'role');
    const createdAtColumn = config.columns.find(c => c.name === 'created_at');

    expect(emailColumn?.notNull).toBe(true);
    expect(roleColumn?.notNull).toBe(true);
    // These might fail initially if they aren't notNull
    expect(createdAtColumn?.notNull).toBe(true);
  });

  it('documents table should have embedding column for RAG', () => {
    const config = getTableConfig(documents);
    const embeddingColumn = config.columns.find(c => c.name === 'embedding');
    expect(embeddingColumn).toBeDefined();
  });

  it('searchIndex table should have embedding column for RAG', () => {
    const config = getTableConfig(searchIndex);
    const embeddingColumn = config.columns.find(c => c.name === 'embedding');
    expect(embeddingColumn).toBeDefined();
  });
});
