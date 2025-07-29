import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Fetch all active AI agents
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // AI agents are public, so no auth required for reading
    const { data: agents, error } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch AI agents' }, { status: 500 })
    }

    return NextResponse.json({ agents })
  } catch (error) {
    console.error('AI Agents GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 