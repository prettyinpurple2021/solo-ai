import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Updated At Triggers Migration', () => {
  const projectRoot = join(__dirname, '..');
  
  it('should have the updated_at trigger migration file', () => {
    const migrationPath = join(projectRoot, 'supabase/migrations/005_add_updated_at_triggers.sql');
    expect(() => readFileSync(migrationPath, 'utf-8')).not.toThrow();
  });

  it('should contain the handle_updated_at function', () => {
    const content = readFileSync(
      join(projectRoot, 'supabase/migrations/005_add_updated_at_triggers.sql'), 
      'utf-8'
    );
    expect(content).toContain('CREATE OR REPLACE FUNCTION public.handle_updated_at()');
    expect(content).toContain('RETURNS TRIGGER');
    expect(content).toContain('NEW.updated_at = NOW()');
    expect(content).toContain('LANGUAGE plpgsql');
  });

  it('should create triggers for all three tables', () => {
    const content = readFileSync(
      join(projectRoot, 'supabase/migrations/005_add_updated_at_triggers.sql'), 
      'utf-8'
    );
    
    // Check for ai_agents trigger
    expect(content).toContain('CREATE TRIGGER on_ai_agents_update');
    expect(content).toContain('BEFORE UPDATE ON ai_agents');
    
    // Check for ai_conversations trigger
    expect(content).toContain('CREATE TRIGGER on_ai_conversations_update');
    expect(content).toContain('BEFORE UPDATE ON ai_conversations');
    
    // Check for projects trigger
    expect(content).toContain('CREATE TRIGGER on_projects_update');
    expect(content).toContain('BEFORE UPDATE ON projects');
    
    // All should execute the same function
    expect(content).toMatch(/EXECUTE PROCEDURE public\.handle_updated_at\(\);/g);
  });

  it('should properly handle existing triggers', () => {
    const content = readFileSync(
      join(projectRoot, 'supabase/migrations/005_add_updated_at_triggers.sql'), 
      'utf-8'
    );
    
    // Should drop existing triggers to avoid conflicts
    expect(content).toContain('DROP TRIGGER IF EXISTS update_ai_conversations_updated_at ON ai_conversations');
    expect(content).toContain('DROP TRIGGER IF EXISTS trigger_update_projects_updated_at ON projects');
  });
});