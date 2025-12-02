import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { logInfo, logError } from '@/lib/logger'
import * as jose from 'jose'
import { getNeonConnection } from '@/lib/database-utils'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'


// // Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic'

function getSql() {
  return getNeonConnection()
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const { payload: decoded } = await jose.jwtVerify(token, secret)
    const userId = decoded.user_id

    logInfo('Fetching available skills', { userId })

    // Try to get skills from database
    let skills
    try {
      const sql = getSql()
      skills = await sql`
        SELECT id, name, category, description, difficulty_level, 
               estimated_duration, prerequisites, learning_objectives
        FROM skills
        ORDER BY category, difficulty_level
      `
    } catch (error) {
      // If skills table doesn't exist, return default skills
      logInfo('Skills table not found, returning default skills', { userId })
      skills = getDefaultSkills()
    }

    return NextResponse.json(skills)
  } catch (error) {
    logError('Error fetching skills', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getDefaultSkills() {
  return [
    {
      id: 'entrepreneurship-fundamentals',
      name: 'Entrepreneurship Fundamentals',
      category: 'Business',
      description: 'Core concepts of starting and running a business',
      difficulty_level: 'beginner',
      estimated_duration: 120,
      prerequisites: [],
      learning_objectives: [
        'Understand business models',
        'Learn market analysis',
        'Master financial planning basics'
      ]
    },
    {
      id: 'digital-marketing',
      name: 'Digital Marketing',
      category: 'Marketing',
      description: 'Modern marketing strategies for online businesses',
      difficulty_level: 'intermediate',
      estimated_duration: 180,
      prerequisites: ['entrepreneurship-fundamentals'],
      learning_objectives: [
        'Master social media marketing',
        'Understand SEO principles',
        'Learn email marketing strategies'
      ]
    },
    {
      id: 'financial-management',
      name: 'Financial Management',
      category: 'Finance',
      description: 'Managing business finances and cash flow',
      difficulty_level: 'intermediate',
      estimated_duration: 150,
      prerequisites: ['entrepreneurship-fundamentals'],
      learning_objectives: [
        'Learn budgeting and forecasting',
        'Understand financial statements',
        'Master cash flow management'
      ]
    },
    {
      id: 'leadership-skills',
      name: 'Leadership Skills',
      category: 'Management',
      description: 'Leading teams and managing people effectively',
      difficulty_level: 'advanced',
      estimated_duration: 200,
      prerequisites: ['entrepreneurship-fundamentals'],
      learning_objectives: [
        'Develop communication skills',
        'Learn team management',
        'Master conflict resolution'
      ]
    },
    {
      id: 'product-development',
      name: 'Product Development',
      category: 'Product',
      description: 'Creating and iterating on products and services',
      difficulty_level: 'intermediate',
      estimated_duration: 160,
      prerequisites: ['entrepreneurship-fundamentals'],
      learning_objectives: [
        'Learn design thinking',
        'Understand user research',
        'Master agile development'
      ]
    },
    {
      id: 'sales-techniques',
      name: 'Sales Techniques',
      category: 'Sales',
      description: 'Effective selling strategies and techniques',
      difficulty_level: 'intermediate',
      estimated_duration: 140,
      prerequisites: ['entrepreneurship-fundamentals'],
      learning_objectives: [
        'Master sales psychology',
        'Learn objection handling',
        'Understand closing techniques'
      ]
    },
    {
      id: 'customer-service',
      name: 'Customer Service Excellence',
      category: 'Customer Relations',
      description: 'Building strong customer relationships',
      difficulty_level: 'beginner',
      estimated_duration: 100,
      prerequisites: [],
      learning_objectives: [
        'Learn active listening',
        'Master problem-solving',
        'Understand customer psychology'
      ]
    },
    {
      id: 'project-management',
      name: 'Project Management',
      category: 'Management',
      description: 'Planning and executing projects successfully',
      difficulty_level: 'intermediate',
      estimated_duration: 170,
      prerequisites: ['entrepreneurship-fundamentals'],
      learning_objectives: [
        'Learn project planning',
        'Master resource allocation',
        'Understand risk management'
      ]
    },
    {
      id: 'negotiation-skills',
      name: 'Negotiation Skills',
      category: 'Communication',
      description: 'Effective negotiation strategies for business',
      difficulty_level: 'advanced',
      estimated_duration: 130,
      prerequisites: ['leadership-skills'],
      learning_objectives: [
        'Master negotiation psychology',
        'Learn win-win strategies',
        'Understand power dynamics'
      ]
    },
    {
      id: 'time-management',
      name: 'Time Management',
      category: 'Productivity',
      description: 'Maximizing productivity and efficiency',
      difficulty_level: 'beginner',
      estimated_duration: 90,
      prerequisites: [],
      learning_objectives: [
        'Learn prioritization techniques',
        'Master scheduling methods',
        'Understand productivity systems'
      ]
    }
  ]
}
