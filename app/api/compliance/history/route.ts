import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('compliance_scans')
      .select(`
        *,
        compliance_issues (
          id,
          type,
          category,
          title,
          description,
          recommendation,
          gdpr_article,
          ccpa_section,
          resolved,
          resolved_at
        )
      `)
      .eq('user_id', user.id)
      .order('scan_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (url) {
      query = query.eq('url', url)
    }

    const { data: scans, error: scansError } = await query

    if (scansError) {
      console.error('Error fetching compliance scans:', scansError)
      return NextResponse.json({ error: 'Failed to fetch compliance history' }, { status: 500 })
    }

    // Get trust score history
    const { data: trustHistory, error: trustError } = await supabase
      .from('trust_score_history')
      .select('*')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: false })
      .limit(50)

    if (trustError) {
      console.error('Error fetching trust score history:', trustError)
    }

    // Get compliance summary
    const { data: summary, error: summaryError } = await supabase
      .rpc('get_compliance_summary', { p_user_id: user.id })

    if (summaryError) {
      console.error('Error fetching compliance summary:', summaryError)
    }

    return NextResponse.json({
      scans: scans || [],
      trustHistory: trustHistory || [],
      summary: summary?.[0] || {
        total_scans: 0,
        average_trust_score: 0,
        total_issues: 0,
        resolved_issues: 0,
        active_policies: 0,
        last_scan_date: null
      }
    })

  } catch (error) {
    console.error('Compliance history error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch compliance history' },
      { status: 500 }
    )
  }
} 