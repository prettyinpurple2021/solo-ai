import 'dotenv/config'
import { db } from '@/db'
import { userProgress, userAchievements, users, achievements } from '@/db/schema'
import { eq, and, desc, gte, sql, count } from 'drizzle-orm'

async function main() {
    console.log('🧪 Starting Learning Analytics Verification...')

    try {
        // 1. Pick a random user or use a specific one if known
        const user = await db.query.users.findFirst()

        if (!user) {
            console.log('⚠️ No users found in database. Cannot verify analytics.')
            return
        }

        const userId = user.id
        console.log(`👤 Testing for user: ${userId}`)

        // 2. Test Certifications Query
        console.log('📊 Testing Certifications Query...')
        const certificationsCountResult = await db
            .select({ count: count() })
            .from(userAchievements)
            .innerJoin(achievements, eq(userAchievements.achievement_id, achievements.id))
            .where(
                and(
                    eq(userAchievements.user_id, userId),
                    eq(achievements.category, 'certification')
                )
            )
        console.log(`✅ Certifications count: ${certificationsCountResult[0]?.count}`)

        // 3. Test Peer Rank Query
        console.log('📊 Testing Peer Rank Query...')
        // First get user's completed count
        const completedProgress = await db
            .select()
            .from(userProgress)
            .where(and(eq(userProgress.user_id, userId), eq(userProgress.status, 'completed')))

        const totalModulesCompleted = completedProgress.length
        console.log(`   User completed modules: ${totalModulesCompleted}`)

        // Subquery to get module counts for all users
        const userModuleCounts = db
            .select({
                userId: userProgress.user_id,
                completedCount: count(userProgress.module_id).as('completed_count')
            })
            .from(userProgress)
            .where(eq(userProgress.status, 'completed'))
            .groupBy(userProgress.user_id)
            .as('user_module_counts')

        // Count users with more completed modules
        const betterUsersResult = await db
            .select({ count: count() })
            .from(userModuleCounts)
            .where(sql`${userModuleCounts.completedCount} > ${totalModulesCompleted}`)

        const betterUsersCount = betterUsersResult[0]?.count || 0
        const peerRank = betterUsersCount + 1
        console.log(`✅ Peer Rank: ${peerRank}`)

        // 4. Test Weekly Goal Query
        console.log('📊 Testing Weekly Goal Query...')
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        const learningVelocity = completedProgress.filter(p =>
            p.completed_at && new Date(p.completed_at) >= oneWeekAgo
        ).length
        console.log(`✅ Learning Velocity (last 7 days): ${learningVelocity}`)

        console.log('🎉 All queries executed successfully!')
    } catch (error) {
        console.error('❌ Verification Failed:', error)
        process.exit(1)
    }
}

main()
