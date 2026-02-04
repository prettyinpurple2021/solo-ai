import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-server';
import { createErrorResponse } from '@/lib/api-response';

export async function GET() {
  const { user, error } = await authenticateRequest();

  if (error || !user) {
    return createErrorResponse('Unauthorized', 401);
  }

  // FEATURE GATE: Agents (Requires Solo+)
  const { canAccessFeature } = await import('@/lib/billing-logic');
  if (!await canAccessFeature(user.id, 'agents')) {
      return createErrorResponse(
          'Premium Feature: Upgrade to Solo tier or higher to access AI Agents.', 
          403, 
          { requiresUpgrade: true }
      );
  }

  const agents = [
    {
      id: 'lexi',
      name: 'Lexi',
      description: 'Business Strategy & Analytics Agent',
      capabilities: ['Market Analysis', 'Business Planning', 'Financial Forecasting']
    },
    {
      id: 'nova',
      name: 'Nova',
      description: 'Product Design & UX Agent',
      capabilities: ['UI/UX Design', 'User Research', 'Prototyping']
    },
    {
      id: 'glitch',
      name: 'Glitch',
      description: 'QA & Debugging Agent',
      capabilities: ['Code Debugging', 'Quality Assurance', 'Performance Optimization']
    },
    {
      id: 'vex',
      name: 'Vex',
      description: 'Full Stack Developer Agent',
      capabilities: ['Frontend Development', 'Backend Development', 'Database Design']
    },
    {
      id: 'echo',
      name: 'Echo',
      description: 'Marketing & Brand Agent',
      capabilities: ['Content Creation', 'Social Media Strategy', 'Brand Voice']
    }
  ];

  return NextResponse.json({ success: true, data: agents });
}
