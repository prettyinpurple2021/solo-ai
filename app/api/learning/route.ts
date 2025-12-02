import { NextRequest, NextResponse } from 'next/server'
import { LearningEngine } from '@/lib/learning-engine'
import { logError } from '@/lib/logger'
import * as jose from 'jose'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload: decoded } = await jose.jwtVerify(token, secret)
    const userId = decoded.user_id as string

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    const learningEngine = new LearningEngine(userId)

    switch (action) {
      case 'skill-gaps':
        const skillGaps = await learningEngine.analyzeSkillGaps()
        return NextResponse.json(skillGaps)

      case 'recommendations':
        const recommendations = await learningEngine.getPersonalizedRecommendations()
        return NextResponse.json(recommendations)

      case 'progress':
        const progress = await learningEngine.getUserProgress()
        return NextResponse.json(progress)

      case 'analytics':
        const analytics = await learningEngine.getLearningAnalytics()
        return NextResponse.json(analytics)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logError('Error in learning API', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload: decoded } = await jose.jwtVerify(token, secret)
    const userId = decoded.user_id as string

    const body = await request.json()
    const { action, data } = body

    const learningEngine = new LearningEngine(userId)

    switch (action) {
      case 'track-progress':
        await learningEngine.trackProgress(data.moduleId, data.progressData)
        return NextResponse.json({ success: true })

      case 'create-assessment':
        await learningEngine.createSkillAssessment(data.skillId, data.assessmentData)
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    logError('Error in learning API POST', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
