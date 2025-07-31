import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/ai-agents
 * Fetches all active AI agents available to users
 * @returns JSON response with agents array or error
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // AI agents are public, so no auth required for reading
    const { data: agents, error } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Database error fetching AI agents:', error)
      return NextResponse.json({ error: 'Failed to fetch AI agents' }, { status: 500 })
    }

    return NextResponse.json({ agents })
  } catch (error) {
    console.error('AI Agents GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 