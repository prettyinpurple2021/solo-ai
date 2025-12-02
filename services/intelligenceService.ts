// Daily Intelligence Service
import { geminiService } from './geminiService';
import { storageService } from './storageService';

export interface PriorityAction {
    title: string;
    reasoning: string;
    urgency: 'critical' | 'high' | 'medium';
    estimatedTime: string;
    relatedTo: string; // task ID, contact ID, etc.
}

export interface Alert {
    type: 'financial' | 'deadline' | 'competitive' | 'opportunity';
    message: string;
    action?: string;
}

export interface Insight {
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
}

export interface DailyIntelligence {
    date: string;
    priorityActions: PriorityAction[];
    alerts: Alert[];
    insights: Insight[];
    motivationalMessage: string;
}

class IntelligenceService {
    private cacheKey = 'daily_intelligence';
    private cacheDate = 'intelligence_date';

    /**
     * Get daily intelligence (cached if same day)
     */
    async getDailyIntelligence(): Promise<DailyIntelligence> {
        const today = new Date().toISOString().split('T')[0];
        const cachedDate = localStorage.getItem(this.cacheDate);

        // Return cached if same day
        if (cachedDate === today) {
            const cached = localStorage.getItem(this.cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        }

        // Generate new intelligence
        return await this.generateIntelligence();
    }

    /**
     * Force regenerate intelligence
     */
    async regenerate(): Promise<DailyIntelligence> {
        return await this.generateIntelligence();
    }

    /**
     * Generate daily intelligence using AI
     */
    private async generateIntelligence(): Promise<DailyIntelligence> {
        try {
            // Gather user data
            const tasks = await storageService.getTasks();
            const context = await storageService.getContext();
            const contacts = await storageService.getContacts();

            const today = new Date().toISOString().split('T')[0];

            // Analyze tasks
            const overdueTasks = tasks.filter(t =>
                t.status !== 'done' &&
                t.createdAt &&
                new Date(t.createdAt) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            );

            const dueSoon = tasks.filter(t =>
                t.status !== 'done' &&
                t.priority === 'high'
            );

            // Analyze Network (Stale Contacts)
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const staleContacts = contacts.filter(c =>
                c.lastContact && new Date(c.lastContact) < thirtyDaysAgo
            );

            const staleAlerts = staleContacts.slice(0, 3).map(c => ({
                type: 'opportunity',
                message: `Reconnect with ${c.name} (${c.company}). Last contact: ${new Date(c.lastContact!).toLocaleDateString()}.`,
                action: 'Draft Email'
            }));

            // Build prompt for Gemini
            const prompt = `You are an AI strategic advisor. Analyze this solo founder's current state and provide daily intelligence.

**Current State:**
- Business: ${context?.companyName || 'Unknown'}
- Industry: ${context?.industry || 'Unknown'}
- Total Active Tasks: ${tasks.filter(t => t.status !== 'done').length}
- Overdue Tasks: ${overdueTasks.length}
- High Priority Tasks: ${dueSoon.length}
- Stale Contacts: ${staleContacts.length} (e.g. ${staleContacts.slice(0, 2).map(c => c.name).join(', ')})

**Instructions:**
Generate a JSON response with:
1. **priorityActions** (array, 3 items max): The 3 most important things to focus on TODAY
   - Each item: { title, reasoning, urgency: "critical"|"high"|"medium", estimatedTime, relatedTo }
2. **alerts** (array): Critical warnings or time-sensitive items
   - Each item: { type: "financial"|"deadline"|"competitive"|"opportunity", message, action? }
3. **insights** (array, 2-3 items): Strategic observations or patterns
   - Each item: { title, description, impact: "high"|"medium"|"low" }
4. **motivationalMessage** (string): Short, energizing message for the day

Be specific, actionable, and honest. If there are no critical alerts, provide growth opportunities instead.

Respond ONLY with valid JSON.`;

            const response = await geminiService.generateContent(prompt, {
                temperature: 0.7,
                maxOutputTokens: 2000
            });

            // Parse AI response
            const intelligence: DailyIntelligence = JSON.parse(response);
            intelligence.date = today;

            // Inject Stale Contact Alerts if AI missed them
            if (staleAlerts.length > 0) {
                // Deduplicate based on message content to avoid double adding if AI already included them
                const existingMessages = new Set(intelligence.alerts.map(a => a.message));
                staleAlerts.forEach(alert => {
                    if (!existingMessages.has(alert.message)) {
                        intelligence.alerts.push(alert as any);
                    }
                });
            }

            // Cache for today
            localStorage.setItem(this.cacheKey, JSON.stringify(intelligence));
            localStorage.setItem(this.cacheDate, today);

            return intelligence;
        } catch (error) {
            console.error('Intelligence generation error:', error);

            // Return fallback intelligence
            return this.getFallbackIntelligence();
        }
    }

    /**
     * Fallback intelligence if AI fails
     */
    private getFallbackIntelligence(): DailyIntelligence {
        const today = new Date().toISOString().split('T')[0];

        return {
            date: today,
            priorityActions: [
                {
                    title: 'Review Your Task Board',
                    reasoning: 'Start your day with a clear picture of what needs to be done',
                    urgency: 'medium',
                    estimatedTime: '15 min',
                    relatedTo: 'roadmap'
                }
            ],
            alerts: [],
            insights: [
                {
                    title: 'Build Momentum',
                    description: 'Small wins compound. Focus on completing one task before starting another.',
                    impact: 'medium'
                }
            ],
            motivationalMessage: 'Every small step forward is progress. Keep building! 🚀'
        };
    }

    /**
     * Mark priority action as complete
     */
    async completePriorityAction(actionTitle: string): Promise<void> {
        const intelligence = await this.getDailyIntelligence();
        const updatedActions = intelligence.priorityActions.filter(a => a.title !== actionTitle);

        intelligence.priorityActions = updatedActions;
        localStorage.setItem(this.cacheKey, JSON.stringify(intelligence));
    }
}

export const intelligenceService = new IntelligenceService();
