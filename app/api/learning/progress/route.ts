import { logError } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { userProgress } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { verifyAuth } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const authResult = await verifyAuth(req)
        if (!authResult.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = authResult.user.id

        const progress = await db
            .select()
            .from(userProgress)
            .where(eq(userProgress.user_id, userId))

        return NextResponse.json(progress)
    } catch (error) {
        logError('Error fetching user progress:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const authResult = await verifyAuth(req)
        if (!authResult.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = authResult.user.id
        const body = await req.json()
        const { moduleId, completionPercentage, status, data, timeSpent } = body

        if (!moduleId) {
            return NextResponse.json({ error: 'Module ID is required' }, { status: 400 })
        }

        // Check if progress exists
        const existing = await db
            .select()
            .from(userProgress)
            .where(and(eq(userProgress.user_id, userId), eq(userProgress.module_id, moduleId)))
            .limit(1)

        let result
        if (existing.length > 0) {
            // Update existing progress
            result = await db
                .update(userProgress)
                .set({
                    completion_percentage: completionPercentage ?? existing[0].completion_percentage,
                    status: status ?? existing[0].status,
                    data: data ? data : existing[0].data,
                    time_spent: timeSpent ? existing[0].time_spent + timeSpent : existing[0].time_spent,
                    last_accessed: new Date(),
                    completed_at: status === 'completed' ? new Date() : existing[0].completed_at
                })
                .where(eq(userProgress.id, existing[0].id))
                .returning()
        } else {
            // Create new progress
            result = await db
                .insert(userProgress)
                .values({
                    user_id: userId,
                    module_id: moduleId,
                    completion_percentage: completionPercentage || 0,
                    status: status || 'in_progress',
                    data: data || {},
                    time_spent: timeSpent || 0,
                    last_accessed: new Date(),
                    started_at: new Date()
                })
                .returning()
        }

        return NextResponse.json(result[0])
    } catch (error) {
        logError('Error saving user progress:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
