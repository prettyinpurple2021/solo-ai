
import { NextResponse } from 'next/server';

export async function GET() {
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
      capabilities: ['UI/UX Design', 'user Research', 'Prototyping']
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
