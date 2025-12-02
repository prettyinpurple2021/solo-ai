import { Router } from 'express';
import { db } from '../db';
import { users, tasks, businessContext, chatHistory, competitorReports, tribeBlueprints } from '../db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, async (req: any, res: any) => {
    try {
        const userId = (req as AuthRequest).userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const numUserId = Number(userId);
        const strUserId = String(userId);

        // 1. Fetch User Data
        // Users table uses integer ID
        const user = await db.select().from(users).where(eq(users.id, numUserId)).limit(1);

        // Handle case where user might be stored by stackUserId (text) if ID lookup fails
        let userData = user[0];
        if (!userData) {
            const userByStackId = await db.select().from(users).where(eq(users.stackUserId, strUserId)).limit(1);
            userData = userByStackId[0];
        }

        if (!userData) return res.status(404).json({ error: 'User not found' });

        // 2. Fetch Today's Tasks
        // Tasks table uses text userId
        const userTasks = await db.select().from(tasks)
            .where(eq(tasks.userId, strUserId))
            .orderBy(desc(tasks.createdAt));

        // Since dueDate is missing in schema, we'll consider all 'todo'/'in_progress' tasks as active
        // and just show the most recent ones as "today's tasks"
        const todaysTasks = userTasks
            .filter(t => t.status !== 'done')
            .slice(0, 5); // Limit to 5

        const completedTasksCount = userTasks.filter(t => t.status === 'done').length;

        // 3. Fetch Active Goals (Business Context)
        // BusinessContext uses text userId
        // Schema doesn't have 'goals', so we'll return empty or mock for now
        const context = await db.select().from(businessContext).where(eq(businessContext.userId, strUserId)).limit(1);
        const activeGoals: any[] = [];

        // 4. Recent Conversations
        // ChatHistory uses text userId
        const recentChats = await db.select().from(chatHistory)
            .where(eq(chatHistory.userId, strUserId))
            .orderBy(desc(chatHistory.timestamp))
            .limit(3);

        // 5. Recent Briefcases (Tribe Blueprints as proxy)
        // TribeBlueprints uses integer userId (Wait, schema says integer for tribeBlueprints? Let's check schema again. 
        // Schema says: userId: integer('user_id')... references users.id)
        // So for TribeBlueprints we must use numUserId.
        const recentBriefcases = await db.select().from(tribeBlueprints)
            .where(eq(tribeBlueprints.userId, numUserId))
            .orderBy(desc(tribeBlueprints.generatedAt))
            .limit(3);

        // 6. Calculate Stats
        const stats = {
            tasks_completed: completedTasksCount,
            total_tasks: userTasks.length,
            focus_minutes: (userData.totalActions || 0) * 5,
            ai_interactions: recentChats.length,
            goals_achieved: 0,
            productivity_score: Math.min(100, Math.round((completedTasksCount / (userTasks.length || 1)) * 100))
        };

        // 7. Insights
        const insights = [
            {
                type: 'productivity',
                title: 'Momentum Building',
                description: `You've completed ${completedTasksCount} tasks. Keep it up!`,
                action: 'View Tasks'
            }
        ];

        res.json({
            user: {
                id: String(userData.id),
                email: userData.email || '',
                full_name: (userData.email || '').split('@')[0],
                avatar_url: null,
                subscription_tier: 'free', // Default to free as subscription table join is complex for now
                level: userData.level || 1,
                total_points: userData.xp || 0,
                current_streak: 0,
                wellness_score: 100,
                focus_minutes: stats.focus_minutes,
                onboarding_completed: true
            },
            todaysStats: stats,
            todaysTasks: todaysTasks.map(t => ({
                id: t.id,
                title: t.title,
                description: t.description,
                status: t.status,
                priority: t.priority,
                due_date: null, // No due date in schema
                goal: null
            })),
            activeGoals: activeGoals.map((g: any, i: number) => ({
                id: `goal-${i}`,
                title: g.title || 'Goal',
                description: '',
                progress_percentage: 0,
                target_date: null,
                category: 'Business',
                tasks_total: 0,
                tasks_completed: 0
            })),
            recentConversations: recentChats.map(c => ({
                id: String(c.id),
                title: null,
                last_message_at: new Date(Number(c.timestamp)).toISOString(),
                agent: {
                    name: c.agentId,
                    display_name: c.agentId.toUpperCase(),
                    accent_color: '#000000'
                }
            })),
            recentAchievements: [],
            recentBriefcases: recentBriefcases.map(b => ({
                id: b.id,
                title: 'Briefcase', // Name missing in schema
                description: 'Generated Blueprint', // Purpose missing
                status: 'active',
                goal_count: 0,
                task_count: 0,
                created_at: b.generatedAt,
                updated_at: b.generatedAt
            })),
            weeklyFocus: {
                total_minutes: 0,
                sessions_count: 0,
                average_session: 0
            },
            insights
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to load dashboard' });
    }
});

export default router;
