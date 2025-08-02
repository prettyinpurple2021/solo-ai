import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('User Management System', () => {
  const projectRoot = join(__dirname, '..');
  
  it('should not have hardcoded "Boss Builder" user data in app-sidebar.tsx', () => {
    const content = readFileSync(join(projectRoot, 'components/app-sidebar.tsx'), 'utf-8');
    expect(content).not.toContain('name: "Boss Builder"');
    expect(content).not.toContain('email: "boss@soloboss.ai"');
  });

  it('should use useAuth hook in app-sidebar.tsx', () => {
    const content = readFileSync(join(projectRoot, 'components/app-sidebar.tsx'), 'utf-8');
    expect(content).toContain('import { useAuth } from "@/hooks/use-auth"');
    expect(content).toContain('const { user } = useAuth()');
  });

  it('should use useAuth hook in nav-user.tsx for logout functionality', () => {
    const content = readFileSync(join(projectRoot, 'components/nav-user.tsx'), 'utf-8');
    expect(content).toContain('import { useAuth } from "@/hooks/use-auth"');
    expect(content).toContain('const { signOut } = useAuth()');
    expect(content).toContain('onClick={handleSignOut}');
  });

  it('should have proper fallbacks for user data', () => {
    const content = readFileSync(join(projectRoot, 'components/app-sidebar.tsx'), 'utf-8');
    expect(content).toContain('userData = {');
    expect(content).toContain('|| "SoloBoss User"');
    expect(content).toContain('|| "user@soloboss.ai"');
    expect(content).toContain('|| "/default-user.svg"');
  });

  it('should generate proper initials in nav-user.tsx', () => {
    const content = readFileSync(join(projectRoot, 'components/nav-user.tsx'), 'utf-8');
    expect(content).toContain('const initials = user.name');
    expect(content).toContain('split(" ")');
    expect(content).toContain('map((n) => n[0])');
    expect(content).toContain('join("")');
    expect(content).toContain('toUpperCase()');
  });
});