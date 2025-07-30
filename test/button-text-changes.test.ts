import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Button Text Changes', () => {
  const projectRoot = join(__dirname, '..');
  
  it('should have "Start for free" instead of "Start Free Trial" in pricing page', () => {
    const content = readFileSync(join(projectRoot, 'app/pricing/page.tsx'), 'utf-8');
    expect(content).toContain('Start for free');
    expect(content).not.toContain('Start Free Trial');
  });

  it('should have "Start for free" instead of "Start Free Trial" in features page', () => {
    const content = readFileSync(join(projectRoot, 'app/features/page.tsx'), 'utf-8');
    expect(content).toContain('Start for free');
    expect(content).not.toContain('Start Free Trial');
  });

  it('should have "Start for free" instead of "Start Free Trial" in shared landing page', () => {
    const content = readFileSync(join(projectRoot, 'components/shared/shared-landing-page.tsx'), 'utf-8');
    expect(content).toContain('Start for free');
    expect(content).not.toContain('Start Free Trial');
  });

  it('should have "Start for free" instead of "Start Free Trial" in clean landing page', () => {
    const content = readFileSync(join(projectRoot, 'components/shared/shared-landing-page-clean.tsx'), 'utf-8');
    expect(content).toContain('Start for free');
    expect(content).not.toContain('Start Free Trial');
  });
});