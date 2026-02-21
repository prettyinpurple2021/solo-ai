import { Router, Request, Response } from 'express';
import { db } from '../db';
import { users, tasks, businessContext, chatHistory, dailyIntelligence } from '../../src/lib/shared/db/schema';
import { eq, desc, and, gte } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';
import { logError } from '../utils/logger';

const router = Router();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // 1. Fetch User Data
        const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

        let userData = user[0];
        if (!userData) {
            const userByStackId = await db.select().from(users).where(eq(users.stackUserId, userId)).limit(1);
            userData = userByStackId[0];
        }

        if (!userData) return res.status(404).json({ error: 'User not found' });

        // 2. Fetch Today's Tasks
        const userTasks = await db.select().from(tasks)
            .where(eq(tasks.user_id, userId))
            .orderBy(desc(tasks.created_at));

        const todaysTasks = userTasks
            .filter(t => t.status !== 'done')
            .slice(0, 5);

        const completedTasksCount = userTasks.filter(t => t.status === 'done').length;

        // 3. Fetch Active Goals
        const context = await db.select().from(businessContext).where(eq(businessContext.userId, userId)).limit(1);
        const activeGoals: any[] = []; // V1 Restriction

        // 4. Recent Conversations
        const recentChats = await db.select().from(chatHistory)
            .where(eq(chatHistory.userId, userId))
            .orderBy(desc(chatHistory.createdAt))
            .limit(3);

        const recentBriefcases: any[] = [];

        // 6. Calculate Stats
        const stats = {
            tasks_completed: completedTasksCount,
            total_tasks: userTasks.length,
            focus_minutes: (userData.total_actions || 0) * 5,
            ai_interactions: recentChats.length,
            goals_achieved: 0,
            productivity_score: Math.min(100, Math.round((completedTasksCount / (userTasks.length || 1)) * 100))
        };

        // 7. AI Insights (Real & Cached)
        let dailyInsight = "Welcome back! Ready to conquer the day?";
        
        try {
            // Check cache first
            const todayStr = new Date().toISOString().split('T')[0]; 
            
            try {
                const cachedInsight = await db.select().from(dailyIntelligence)
                    .where(and(
                        eq(dailyIntelligence.userId, userId),
                        gte(dailyIntelligence.date, new Date(todayStr)) // Simple check for now, or use SQL
                    ))
                    .limit(1);
                    
                if (cachedInsight[0] && cachedInsight[0].summary) {
                    dailyInsight = cachedInsight[0].summary;
                } else {
                    // Generate new insight via Gemini
                    if (process.env.GEMINI_API_KEY) {
                        const { GoogleGenerativeAI } = await import('@google/generative-ai');
                        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                        const prompt = `
                            Generate a single, short, motivating sentence (max 15 words) for a solopreneur.
                            Context:
                            - Completed tasks today: ${completedTasksCount}
                            - Remaining tasks: ${userTasks.length - completedTasksCount}
                            - Top pending task: "${userTasks[0]?.title || 'Planning'}"
                            - Goal: Productivity and focus.
                            Do not use hashtags. Be punchy and direct.
                        `;

                        const result = await model.generateContent(prompt);
                        const response = await result.response;
                        const text = response.text().trim();
                        
                        if (text) {
                            dailyInsight = text;
                            // Cache it
                            await db.insert(dailyIntelligence).values({
                                userId: userId,
                                date: new Date(),
                                summary: text, // Storing motivational message in summary
                                highlights: [],
                                riskLevel: 'low',
                            });
                        }
                    }
                }
            } catch (dbError) {
                // Fallback if table doesn't exist or API fails
                if (completedTasksCount > 5) {
                    dailyInsight = `You're on fire! ${completedTasksCount} tasks crushed. Keep the momentum!`;
                } else if (userTasks.length > 0) {
                    dailyInsight = `You have ${userTasks.length} tasks on your plate. Focus on "${userTasks[0].title}" first.`;
                }
            }
        } catch (e) {
            logError('Insight generation failed', e);
        }

        const insights = [
            {
                type: 'productivity',
                title: 'Daily Briefing',
                description: dailyInsight,
                action: 'View Tasks'
            }
        ];

        return res.json({
            user: {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                image: userData.image,
                subscription_tier: (userData as any).subscriptionTier || (userData as any).subscription_tier || 'free', // Handle both cases safely
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
                last_message_at: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
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
        logError('Dashboard error', error);
        return res.status(500).json({ error: 'Failed to load dashboard' });
    }
});

export default router;
