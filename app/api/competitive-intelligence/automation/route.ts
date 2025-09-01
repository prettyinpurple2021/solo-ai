import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { rateLimitByIp } from '@/lib/rate-limit'
import { CompetitiveIntelligenceAutomation } from '@/lib/competitive-intelligence-automation'
import { z } from 'zod'

// POST /api/competitive-intelligence/automation - Trigger automation for alert
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { allowed } = rateLimitByIp('competitive-automation:trigger', ip, 60_000, 100)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()
    const BodySchema = z.object({
      action: z.enum(['process_alert', 'create_benchmarking_goals']),
      alert_id: z.number().optional(),
      competitor_id: z.number().optional()
    })

    const { action, alert_id, competitor_id } = BodySchema.parse(body)

    if (action === 'process_alert') {
      if (!alert_id) {
        return NextResponse.json({ error: 'alert_id is required for process_alert action' }, { status: 400 })
      }
      
      await CompetitiveIntelligenceAutomation.processAlert(alert_id, user.id)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Alert automation processed successfully',
        alert_id 
      })
    }
    
    if (action === 'create_benchmarking_goals') {
      if (!competitor_id) {
        return NextResponse.json({ error: 'competitor_id is required for create_benchmarking_goals action' }, { status: 400 })
      }
      
      const createdGoals = await CompetitiveIntelligenceAutomation.createBenchmarkingGoals(
        competitor_id, 
        user.id
      )
      
      return NextResponse.json({ 
        success: true, 
        message: 'Benchmarking goals created successfully',
        created_goals: createdGoals.length,
        goal_ids: createdGoals
      })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing competitive intelligence automation:', error)
    return NextResponse.json(
      { error: 'Failed to process automation' },
      { status: 500 }
    )
  }
}