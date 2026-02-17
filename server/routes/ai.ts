
import { Router, Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { db } from '../db';
import { businessContext, tasks, competitorReports, boardReports, pivotAnalyses, warRoomSessions, dailyIntelligence, userBrandSettings, users } from '../../lib/shared/db/schema';
import { eq, desc, and, gte } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';
import { SYSTEM_INSTRUCTIONS, AGENTS, AgentId } from '../constants';
import { logError } from '../utils/logger';
import { requireSubscription, checkUsage, TIER_LEVELS } from '../middleware/subscription';
import { UsageTracker } from '../utils/usage-tracker';
import { DominatorAgentOutputSchema } from '../../lib/shared/schemas';

const router = Router();

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Helper: Get Business Context
const getContext = async (userId: string) => {
    const brandSettings = await db.select().from(userBrandSettings).where(eq(userBrandSettings.user_id, userId)).limit(1);
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!brandSettings.length) return "";

    const bs = brandSettings[0];
    const u = user.length > 0 ? user[0] : { name: "Founder" };
    
    let dnaContext = "";
    // Access brand_personality from userBrandSettings which corresponds to brand DNA
    const brandPersonality = bs.brand_personality as any; // Assuming it holds tone/style info
    
    // Adapt to the expected structure or just log what we have
    // The previous code expected metadata.brandDna.tone, etc.
    // We'll construct a simplified version based on available data or just safely check.
    
    if (brandPersonality) {
         // Assuming brand_personality might be an array or object. If specific structure isn't known, generic dump:
         dnaContext = `
        === BRAND DNA ===
        Personality: ${JSON.stringify(brandPersonality)}
        Target Audience: ${bs.target_audience || 'General'}
        Industry: ${bs.industry || 'General'}
        `;
    }

    return `
    CONTEXT_AWARENESS_LAYER:
    You are working for: "${bs.company_name || 'Solo Company'}"
    Founder: "${u.name || 'Founder'}"
    Industry: "${bs.industry || 'General'}"
    Description: "${bs.description || ''}"
    
    ${dnaContext}

    Tailor ALL responses to this specific business context and BRAND DNA.
    `;
};

// Helper: Get Deep Mind Context
const getDeepMindContext = async (userId: string) => {
    // Tasks
    const userTasks = await db.select().from(tasks)
        .where(and(eq(tasks.user_id, userId)))
        .orderBy(desc(tasks.created_at))
        .limit(10);

    let tasksContext = "NO ACTIVE TASKS.";
    if (userTasks.length > 0) {
        const activeTasks = userTasks.filter(t => t.status !== 'done');
        if (activeTasks.length > 0) {
            tasksContext = activeTasks.map(t =>
                `- [${(t.priority || 'MEDIUM').toUpperCase()}] ${t.title} (Status: ${t.status})`
            ).join('\n');
        }
    }

    // Intel
    const reports = await db.select().from(competitorReports)
        .where(eq(competitorReports.userId, userId))
        .orderBy(desc(competitorReports.generatedAt))
        .limit(5);

    let intelContext = "NO INTELLIGENCE REPORTS.";
    if (reports.length > 0) {
        intelContext = reports.map(r =>
            `- ${r.competitorName}: Threat Level ${r.threatLevel}.`
        ).join('\n');
    }

    // Strategic Memory (Board Reports)
    const lastQbr = await db.select().from(boardReports)
        .where(eq(boardReports.userId, userId))
        .orderBy(desc(boardReports.generatedAt))
        .limit(1);

    let strategyContext = "NO PAST STRATEGIC REVIEWS.";
    if (lastQbr.length > 0) {
        const qbr = lastQbr[0];
        strategyContext = `LAST QBR SCORE: CEO: ${qbr.ceoScore}/100. CONSENSUS: "${qbr.consensus}".`;
    }

    // Market Gaps (The Pivot)
    const pivot = await db.select().from(pivotAnalyses)
        .where(eq(pivotAnalyses.userId, userId))
        .orderBy(desc(pivotAnalyses.generatedAt))
        .limit(1);

    let marketContext = "";
    if (pivot.length > 0) {
        const p = pivot[0];
        const gaps = p.gaps as any[];
        if (gaps && gaps.length > 0) {
            marketContext = `MARKET OPPORTUNITIES: ${gaps.map(g => g.name).join(', ')}.`;
        }
    }

    return `
    === DEEP MIND / SYSTEM DATA LAYER ===
    The following is REAL-TIME data from the user's dashboard. Use this to answer questions intelligently.
    
    [ACTIVE TACTICAL OPS / TASKS]
    ${tasksContext}

    [GATHERED INTELLIGENCE / COMPETITORS]
    ${intelContext}

    [STRATEGIC MEMORY]
    ${strategyContext}
    ${marketContext}
    =====================================
    `;
};

// Middleware to check API Key
const requireAi = (req: any, res: any, next: any) => {
    if (!ai) return res.status(500).json({ error: 'Server AI configuration missing' });
    next();
};

// --- ENDPOINTS ---

// Generic Chat / Agent Response
router.post('/chat', authMiddleware, requireAi, checkUsage('conversations', 1), async (req: Request, res: Response) => {
    try {
        const { agentId, history, message } = req.body;
        const userId = req.userId!;

        // --- TIER ENFORCEMENT ---
        // Cast to unknown then keyof typeof TIER_LEVELS to safely index
        const userTier = await UsageTracker.getUserTier(userId);
        const tierLevel = TIER_LEVELS[userTier as keyof typeof TIER_LEVELS] || 0;

        // Define Agent Tiers (Must match frontend logic)
        const FREE_AGENTS = ['aura'];
        const ACCELERATOR_AGENTS = ['blaze', 'glitch', 'vex'];
        const DOMINATOR_AGENTS = ['roxy', 'lexi', 'nova', 'echo', 'lumi', 'finn'];

        let requiredTierLevel = 0; // Free
        if (DOMINATOR_AGENTS.includes(agentId)) {
            requiredTierLevel = TIER_LEVELS['dominator'];
        } else if (ACCELERATOR_AGENTS.includes(agentId)) {
            requiredTierLevel = TIER_LEVELS['accelerator'];
        } else if (!FREE_AGENTS.includes(agentId)) {
            // Default to highest security if unknown agent
            requiredTierLevel = TIER_LEVELS['dominator'];
        }

        if (tierLevel < requiredTierLevel) {
             return res.status(403).json({ 
                error: 'Upgrade required to access this agent.',
                requiredLevel: requiredTierLevel,
                currentLevel: tierLevel
            });
        }
        // ------------------------

        const context = await getContext(userId);
        const deepMind = await getDeepMindContext(userId);

        const systemInstruction = SYSTEM_INSTRUCTIONS[agentId as keyof typeof SYSTEM_INSTRUCTIONS] || "You are a helpful AI assistant.";

        const fullSystemInstruction = `
            ${systemInstruction}
            ${context}
            ${deepMind}
            
            INSTRUCTIONS:
            - You have full visibility into the user's "Tasks" and "Competitor Intel" listed above.
            - If the user asks "What should I do?", reference the high-priority tasks.
            - If the user asks about strategy, reference the competitor vulnerabilities.
        `;

        const chat = ai!.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: fullSystemInstruction,
                temperature: 0.8,
            },
            history: history.map((h: any) => ({
                role: h.role,
                parts: [{ text: h.text }]
            }))
        });

        const result = await chat.sendMessage({ message });

        // Increment usage stats
        await UsageTracker.incrementUsage(userId, 'conversations', 1);
        
        // Standardize output using the shared schema
        const output = {
            agentId,
            content: result.text || "No response.",
            timestamp: new Date().toISOString()
        };

        const validatedOutput = DominatorAgentOutputSchema.parse(output);
        
        // Maintain backward compatibility for frontend that expects { text: string }
        return res.json({ 
            ...validatedOutput,
            text: validatedOutput.content 
        });

    } catch (error) {
        logError("AI Chat Error", error);
        return res.status(500).json({ error: 'Generation failed' });
    }
});

// Competitor Report
router.post('/competitor-report', (authMiddleware as any), requireAi, requireSubscription('dominator'), async (req: Request, res: Response) => {
    try {
        const { competitorName, agentId } = req.body;
        const userId = req.userId!;
        const context = await getContext(userId);
        const agent = AGENTS[agentId as keyof typeof AGENTS];
        const persona = SYSTEM_INSTRUCTIONS[agentId as keyof typeof SYSTEM_INSTRUCTIONS];

        const prompt = `
          ${context}
          Generate a classified intelligence dossier for the competitor: "${competitorName}".
          You are acting as ${agent?.name || 'AI'}, the ${agent?.title || 'Assistant'}.
          Your core persona: ${persona}
          MISSION: Analyze this competitor specifically through your unique lens.
          OUTPUT REQUIREMENTS:
          1. Determine a threat level (LOW, MEDIUM, HIGH, CRITICAL).
          2. Provide a mission brief.
          3. List key intel points, vulnerabilities, and strengths.
          4. SCORE them (0-100) on: Innovation, Market Presence, UX, Pricing, Velocity.
        `;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        competitorName: { type: Type.STRING },
                        threatLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
                        missionBrief: { type: Type.STRING },
                        intel: { type: Type.ARRAY, items: { type: Type.STRING } },
                        vulnerabilities: { type: Type.ARRAY, items: { type: Type.STRING } },
                        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                        metrics: {
                            type: Type.OBJECT,
                            properties: {
                                innovation: { type: Type.NUMBER },
                                marketPresence: { type: Type.NUMBER },
                                ux: { type: Type.NUMBER },
                                pricing: { type: Type.NUMBER },
                                velocity: { type: Type.NUMBER }
                            },
                            required: ['innovation', 'marketPresence', 'ux', 'pricing', 'velocity']
                        }
                    },
                    required: ['competitorName', 'threatLevel', 'missionBrief', 'intel', 'vulnerabilities', 'strengths', 'metrics']
                }
            }
        });

        const reportData = JSON.parse(response.text || '{}');

        // Save to DB (this was missing in original route, it just returned JSON)
        // But wait, the original code didn't save to DB here?
        // Ah, the client calls POST /api/reports to save it.
        // Let's check the client code or just index it here if we save it.
        // The original code just returns JSON. The client probably saves it.
        // Let's check server/index.ts POST /api/reports again.

        res.json(reportData);
    } catch (error) {
        logError("Competitor Report Error", error);
        res.status(500).json({ error: 'Generation failed' });
    }
});

// War Room
router.post('/war-room', (authMiddleware as any), requireAi, requireSubscription('dominator'), async (req: Request, res: Response) => {
    try {
        const { topic, previousSessionId } = req.body;
        const userId = req.userId!;
        const context = await getContext(userId);
        const deepMind = await getDeepMindContext(userId);

        let historyContext = "";
        if (previousSessionId) {
            const prevSession = await db.select().from(warRoomSessions)
                .where(and(eq(warRoomSessions.id, previousSessionId), eq(warRoomSessions.userId, userId)))
                .limit(1);

            if (prevSession.length > 0) {
                const session = prevSession[0];
                historyContext = `
                CONTEXT FROM PREVIOUS SESSION:
                Topic: "${session.topic}"
                Consensus: "${session.consensus}"
                Action Plan: ${(session.actionPlan as string[])?.join(', ')}
                
                (Use this history to maintain continuity if the new topic is related.)
                `;
            }
        }

        const agentList = Object.values(AGENTS).map(a => `${a.name} (${a.title})`).join(', ');
        const prompt = `
            ${context}
            ${deepMind}
            ${historyContext}
            === THE WAR ROOM ===
            TOPIC: "${topic}"
            
            PARTICIPANTS: ${agentList}
            
            MISSION: Conduct a strategic debate between at least 4 relevant specialists from the team above. 
            Ensure they clash on priorities (e.g., Aggressive Growth vs. Legal Risk vs. Technical Feasibility).
            
            Return JSON with dialogue, consensus, and actionable item plan.
        `;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        dialogue: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { speaker: { type: Type.STRING }, text: { type: Type.STRING } } } },
                        consensus: { type: Type.STRING },
                        actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });

        const data = JSON.parse(response.text || '{}');

        // Persist the session
        await db.insert(warRoomSessions).values({
            userId,
            topic,
            consensus: data.consensus,
            actionPlan: data.actionPlan,
            dialogue: data.dialogue
        });

        return res.json(data);
    } catch (error) {
        logError("War Room Error", error);
        return res.status(500).json({ error: 'Generation failed' });
    }
});

// Daily Briefing
router.post('/briefing', (authMiddleware as any), requireAi, async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        // Use a date object for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already exists for today (created after midnight)
        const existing = await db.select().from(dailyIntelligence)
            .where(and(
                eq(dailyIntelligence.userId, userId),
                gte(dailyIntelligence.date, today)
            ))
            .limit(1);

        if (existing.length > 0) {
            return res.json({
                ...existing[0],
                focusPoints: existing[0].priorityActions, // Map back to frontend expected format if needed
                threatAlerts: existing[0].alerts,
            });
        }

        const context = await getContext(userId);
        const deepMind = await getDeepMindContext(userId);
        const prompt = `${context}\n${deepMind}\nGenerate Daily Briefing. Return JSON with summary, focusPoints, threatAlerts, motivationalQuote.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        date: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        focusPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                        threatAlerts: { type: Type.ARRAY, items: { type: Type.STRING } },
                        motivationalQuote: { type: Type.STRING }
                    }
                }
            }
        });

        const data = JSON.parse(response.text || '{}');

        // Save to DB
        await db.insert(dailyIntelligence).values({
            userId: userId,
            date: new Date(),
            summary: data.summary || "Daily Briefing", // Ensure required field
            priorityActions: data.focusPoints || [],
            alerts: data.threatAlerts || [],
            highlights: [], 
            motivationalMessage: data.motivationalQuote,
            riskLevel: 'low'
        });

        return res.json({ ...data, date: new Date().toLocaleDateString() });
    } catch (error) {
        logError("Briefing error", error);
        return res.status(500).json({ error: 'Generation failed' });
    }
});

// Tactical Plan
router.post('/tactical-plan', (authMiddleware as any), requireAi, async (req: Request, res: Response) => {
    try {
        const { goal } = req.body;
        const userId = req.userId!;
        const context = await getContext(userId);
        const prompt = `
            ${context}
            === MISSION: TACTICAL ROADMAP GENERATION ===
            Break the following goal into a sequence of highly actionable, professional tasks.
            
            GOAL: "${goal}"
            
            ASSIGNABLE AGENTS (Team SoloSuccess):
            - Roxy: Business Coach / Strategy
            - Finn: Profit & Cashflow Specialist
            - Aura: Wellness Guardian / High Performance
            - Echo: Marketing Guru
            - Lexi: Legal Eagle
            - Nova: Product Visionary
            - Lumi: Compliance & QA
            - Blaze: Sales & Growth
            - Glitch: Systems & Tech expert
            - Vex: Operations Manager
            
            Return a JSON array of tasks that efficiently utilize these specialists.
        `;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            assignee: { type: Type.STRING },
                            priority: { type: Type.STRING },
                            estimatedTime: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        return res.json(JSON.parse(response.text || '[]'));
    } catch (error) {
        logError("Tactical Plan Error", error);
        return res.status(500).json({ error: 'Generation failed' });
    }
});

// --- MARKETING & STRATEGY ---

// Incinerator
router.post('/incinerator', (authMiddleware as any), requireAi, requireSubscription('accelerator'), async (req: Request, res: Response) => {
    try {
        const { content, mode, brutality } = req.body;
        const userId = req.userId!;
        const context = await getContext(userId);
        const deepMind = await getDeepMindContext(userId);
        const prompt = `${context}\n${deepMind}\nIncinerator Mode. Content: "${content}". Mode: ${mode}. Brutality: ${brutality}. 
        INSTRUCTION: Use the "Market Opportunities" and "Competitor Intel" from the system data to validate or destroy this idea. 
        If the idea ignores a known market gap or competitor threat, be extra brutal.
        Return JSON with roastSummary, survivalScore, feedback, rewrittenContent.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { roastSummary: { type: Type.STRING }, survivalScore: { type: Type.NUMBER }, feedback: { type: Type.ARRAY, items: { type: Type.STRING } }, rewrittenContent: { type: Type.STRING } } } }
        });
        return res.json(JSON.parse(response.text || '{}'));
    } catch (error) { 
        logError("Incinerator Error", error);
        return res.status(500).json({ error: 'Generation failed' }); 
    }
});

// Pitch Deck
router.post('/pitch-deck', (authMiddleware as any), requireAi, async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const context = await getContext(userId);
        const prompt = `${context}\nGenerate 10-slide pitch deck. Return JSON with title, slides (title, keyPoint, content, visualIdea).`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, slides: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, keyPoint: { type: Type.STRING }, content: { type: Type.ARRAY, items: { type: Type.STRING } }, visualIdea: { type: Type.STRING } } } } } } }
        });
        return res.json({ ...JSON.parse(response.text || '{}'), generatedAt: new Date().toISOString() });
    } catch (error) { 
        logError("Pitch Deck Ai Error", error);
        return res.status(500).json({ error: 'Generation failed' }); 
    }
});

// Blue Oceans
router.post('/blue-oceans', (authMiddleware as any), requireAi, async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const context = await getContext(userId);
        const prompt = `${context}\nFind 3 Blue Ocean market gaps. Return JSON.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { currentIndustry: { type: Type.STRING }, gaps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING }, competitionScore: { type: Type.NUMBER }, profitabilityScore: { type: Type.NUMBER }, soloFitScore: { type: Type.NUMBER }, whyItWorks: { type: Type.STRING }, firstStep: { type: Type.STRING } } } } } } }
        });
        return res.json(JSON.parse(response.text || '{}'));
    } catch (error) { 
        logError("Blue Oceans Error", error);
        return res.status(500).json({ error: 'Generation failed' }); 
    }
});

// Tribe Blueprint
router.post('/tribe-blueprint', (authMiddleware as any), requireAi, async (req: Request, res: Response) => {
    try {
        const { audience, enemy } = req.body;
        const userId = req.userId!;
        const context = await getContext(userId);
        const prompt = `${context}\nGenerate Tribe Blueprint. Audience: ${audience}. Enemy: ${enemy}. Return JSON.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { manifesto: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, enemy: { type: Type.STRING }, belief: { type: Type.STRING }, tagline: { type: Type.STRING } } }, rituals: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, frequency: { type: Type.STRING }, description: { type: Type.STRING }, action: { type: Type.STRING } } } }, engagementLoops: { type: Type.ARRAY, items: { type: Type.STRING } } } } }
        });
        return res.json({ ...JSON.parse(response.text || '{}'), generatedAt: new Date().toISOString() });
    } catch (error) {
        logError("Tribe Blueprint Error", error);
        return res.status(500).json({ error: 'Generation failed' });
    }
});

// Amplified Content
router.post('/amplified-content', (authMiddleware as any), requireAi, async (req: Request, res: Response) => {
    try {
        const { source } = req.body;
        const userId = req.userId!;
        const context = await getContext(userId);
        const prompt = `${context}\nAmplify content: "${source}". Return JSON with sourceTitle, twitterThread, linkedinPost, tiktokScript, newsletterSection.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { sourceTitle: { type: Type.STRING }, twitterThread: { type: Type.ARRAY, items: { type: Type.STRING } }, linkedinPost: { type: Type.STRING }, tiktokScript: { type: Type.STRING }, newsletterSection: { type: Type.STRING } } } }
        });
        return res.json({ ...JSON.parse(response.text || '{}'), generatedAt: new Date().toISOString() });
    } catch (error) {
        logError("Amplified Content Error", error);
        return res.status(500).json({ error: 'Generation failed' });
    }
});

// Social Strategy
router.post('/social-strategy', (authMiddleware as any), requireAi, async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const context = await getContext(userId);
        const prompt = `${context}\nMISSION: SOCIAL STRATEGY (The Amplifier). Act as Echo (CMO). Analyze Brand DNA. Generate strategy. Return JSON.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { pillars: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } } } }, cadence: { type: Type.STRING }, personaTactics: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { persona: { type: Type.STRING }, tactic: { type: Type.STRING } } } }, sampleHooks: { type: Type.ARRAY, items: { type: Type.STRING } } } } }
        });
        return res.json({ ...JSON.parse(response.text || '{}'), generatedAt: new Date().toISOString() });
    } catch (error) {
        logError("Social Strategy Error", error);
        return res.status(500).json({ error: 'Generation failed' });
    }
});

// Launch Strategy
router.post('/launch-strategy', (authMiddleware as any), requireAi, async (req: Request, res: Response) => {
    try {
        const { product, date } = req.body;
        const userId = req.userId!;
        const context = await getContext(userId);
        const prompt = `${context}\nLaunch Strategy for "${product}" on ${date}. Return JSON with phases (name, events(day, title, description, owner, channel)).`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { productName: { type: Type.STRING }, launchDate: { type: Type.STRING }, phases: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, events: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { day: { type: Type.STRING }, title: { type: Type.STRING }, description: { type: Type.STRING }, owner: { type: Type.STRING }, channel: { type: Type.STRING } } } } } } } } } }
        });
        return res.json({ ...JSON.parse(response.text || '{}'), generatedAt: new Date().toISOString() });
    } catch (error) {
        logError("Launch Strategy Error", error);
        return res.status(500).json({ error: 'Generation failed' });
    }
});

// --- OPS & HR ---

// Job Description
router.post('/job-description', (authMiddleware as any), requireAi, async (req: Request, res: Response) => {
    try {
        const { roleTitle, employmentType } = req.body;
        const userId = req.userId!;
        const context = await getContext(userId);
        const prompt = `${context}\nMISSION: HIRE TALENT (The Scout). ROLE: "${roleTitle}". TYPE: "${employmentType}". Act as Roxy. Create Job Description. Return JSON with roleTitle, hook, responsibilities, requirements, perks.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { roleTitle: { type: Type.STRING }, hook: { type: Type.STRING }, responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } }, requirements: { type: Type.ARRAY, items: { type: Type.STRING } }, perks: { type: Type.ARRAY, items: { type: Type.STRING } } } } }
        });
        return res.json({ ...JSON.parse(response.text || '{}'), generatedAt: new Date().toISOString() });
    } catch (error) {
        logError("Job Description AI Error", error);
        return res.status(500).json({ error: 'Generation failed' });
    }
});

// Interview Guide
router.post('/interview-guide', (authMiddleware as any), requireAi, async (req: Request, res: Response) => {
    try {
        const { roleTitle, keyFocus } = req.body;
        const userId = req.userId!;
        const context = await getContext(userId);
        const prompt = `${context}\nMISSION: VET TALENT. ROLE: "${roleTitle}". FOCUS: "${keyFocus}". Act as Roxy & Glitch. Create Interview Guide. Return JSON with roleTitle, questions(question, whatToLookFor, redFlag).`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { roleTitle: { type: Type.STRING }, questions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, whatToLookFor: { type: Type.STRING }, redFlag: { type: Type.STRING } } } } } } }
        });
        return res.json({ ...JSON.parse(response.text || '{}'), generatedAt: new Date().toISOString() });
    } catch (error) {
        logError("Interview Guide AI Error", error);
        return res.status(500).json({ error: 'Generation failed' });
    }
});

// SOP
router.post('/sop', (authMiddleware as any), requireAi, async (req: Request, res: Response) => {
    try {
        const { taskName } = req.body;
        const userId = req.userId!;
        const context = await getContext(userId);
        const prompt = `${context}\nMISSION: DELEGATION SYSTEM (SOP). TASK: "${taskName}". Act as Roxy. Create SOP. Return JSON with taskName, goal, steps(step, action, details), definitionOfDone.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { taskName: { type: Type.STRING }, goal: { type: Type.STRING }, steps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { step: { type: Type.NUMBER }, action: { type: Type.STRING }, details: { type: Type.STRING } } } }, definitionOfDone: { type: Type.ARRAY, items: { type: Type.STRING } } } } }
        });
        return res.json({ ...JSON.parse(response.text || '{}'), generatedAt: new Date().toISOString() });
    } catch (error) {
        logError("SOP AI Error", error);
        return res.status(500).json({ error: 'Generation failed' });
    }
});

// Board Report
router.post('/board-report', (authMiddleware as any), requireAi, async (req: Request, res: Response) => {
    try {
        const { financials, tasks, reports, contacts } = req.body;
        const userId = req.userId!;
        const context = await getContext(userId);
        const dataSummary = `FINANCIALS: Cash ${financials.currentCash}, Burn ${financials.monthlyBurn}, Revenue ${financials.monthlyRevenue}. OPS: ${tasks.length} total tasks. INTEL: ${reports.length} competitors. NETWORK: ${contacts.length} contacts.`;
        const prompt = `${context}\nGenerate Board Meeting Report based on data: ${dataSummary}. Return JSON with ceoScore, executiveSummary, consensus, grades(agentId, department, grade, score, summary, keyIssue).`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { ceoScore: { type: Type.NUMBER }, executiveSummary: { type: Type.STRING }, consensus: { type: Type.STRING }, grades: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { agentId: { type: Type.STRING }, department: { type: Type.STRING }, grade: { type: Type.STRING }, score: { type: Type.NUMBER }, summary: { type: Type.STRING }, keyIssue: { type: Type.STRING } } } } } } }
        });
        return res.json({ ...JSON.parse(response.text || '{}'), date: new Date().toISOString() });
    } catch (error) {
        logError("Board Report AI Error", error);
        return res.status(500).json({ error: 'Generation failed' });
    }
});

// Financial Audit
router.post('/financial-audit', (authMiddleware as any), requireAi, async (req: Request, res: Response) => {
    try {
        const { financials } = req.body;
        const prompt = `Audit these financials: ${JSON.stringify(financials)}. Return JSON with runwayScore, verdict, strategicMoves, riskFactors.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { runwayScore: { type: Type.NUMBER }, verdict: { type: Type.STRING }, strategicMoves: { type: Type.ARRAY, items: { type: Type.STRING } }, riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } } } } }
        });
        return res.json(JSON.parse(response.text || '{}'));
    } catch (error) {
        logError("Financial Audit Error", error);
        return res.status(500).json({ error: 'Generation failed' });
    }
});

// Tech Audit
router.post('/tech-audit', (authMiddleware as any), requireAi, async (req: Request, res: Response) => {
    try {
        const { stack } = req.body;
        const prompt = `Audit tech stack: ${stack}. Return JSON with score, verdict, pros, cons, recommendations.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, verdict: { type: Type.STRING }, pros: { type: Type.ARRAY, items: { type: Type.STRING } }, cons: { type: Type.ARRAY, items: { type: Type.STRING } }, recommendations: { type: Type.ARRAY, items: { type: Type.STRING } } } } }
        });
        return res.json(JSON.parse(response.text || '{}'));
    } catch (error) {
        logError("Tech Audit Error", error);
        return res.status(500).json({ error: 'Generation failed' });
    }
});

// --- LEGAL & SALES ---

// Cold Email
router.post('/cold-email', (authMiddleware as any), requireAi, async (req: Request, res: Response) => {
    try {
        const { contact } = req.body;
        const userId = req.userId!;
        const context = await getContext(userId);
        const prompt = `${context}\nDraft cold email for ${contact.name}, ${contact.role} at ${contact.company}. Notes: ${contact.notes}.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "text/plain" }
        });
        return res.json({ text: response.text || "" });
    } catch (error) {
        logError("Cold Email Error", error);
        return res.status(500).json({ error: 'Generation failed' });
    }
});

// Negotiation Prep
router.post('/negotiation-prep', (authMiddleware as any), requireAi, async (req: Request, res: Response) => {
    try {
        const { contact } = req.body;
        const userId = req.userId!;
        const context = await getContext(userId);
        const prompt = `${context}\nNegotiation prep for ${contact.name}. Return JSON with strategy, leveragePoints, psychologicalProfile, openingLine.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { strategy: { type: Type.STRING }, leveragePoints: { type: Type.ARRAY, items: { type: Type.STRING } }, psychologicalProfile: { type: Type.STRING }, openingLine: { type: Type.STRING } } } }
        });
        return res.json(JSON.parse(response.text || '{}'));
    } catch (error) {
        logError("Negotiation Prep Error", error);
        return res.status(500).json({ error: 'Generation failed' });
    }
});

// Draft Legal Doc
router.post('/legal-doc', (authMiddleware as any), requireAi, requireSubscription('dominator'), async (req: Request, res: Response) => {
    try {
        const { type, details } = req.body;
        const userId = req.userId!;
        const context = await getContext(userId);
        const persona = SYSTEM_INSTRUCTIONS[AgentId.LUMI];
        const prompt = `${context}\n${persona}\nDraft ${type}. Details: ${details}. Include strict standard legal disclaimer that this is AI generated.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "text/plain" }
        });
        return res.json({ text: response.text || "" });
    } catch (error) {
        logError("Legal Doc Error", error);
        return res.status(500).json({ error: 'Generation failed' });
    }
});

// Analyze Contract
router.post('/contract-analysis', (authMiddleware as any), requireAi, requireSubscription('dominator'), async (req: Request, res: Response) => {
    try {
        const { text } = req.body;
        const userId = req.userId!;
        const context = await getContext(userId);
        const persona = SYSTEM_INSTRUCTIONS[AgentId.LUMI];
        const prompt = `${context}\n${persona}\nAnalyze contract: ${text.substring(0, 20000)}. Return JSON with safetyScore, verdict, criticalRisks, suggestions.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { safetyScore: { type: Type.NUMBER }, verdict: { type: Type.STRING }, criticalRisks: { type: Type.ARRAY, items: { type: Type.STRING } }, suggestions: { type: Type.ARRAY, items: { type: Type.STRING } } } } }
        });
        return res.json(JSON.parse(response.text || '{}'));
    } catch (error) {
        logError("Contract Analysis Error", error);
        return res.status(500).json({ error: 'Generation failed' });
    }
});

// --- MENTAL & ROLEPLAY ---

// Stoic Coaching
router.post('/stoic-coaching', (authMiddleware as any), requireAi, async (req: Request, res: Response) => {
    try {
        const { mood, stressLevel, primaryBlocker } = req.body;
        const prompt = `Stoic coaching for: Mood ${mood}, Stress ${stressLevel}, Blocker ${primaryBlocker}. Return JSON with reframing, stoicQuote, actionableStep, breathingExercise.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { reframing: { type: Type.STRING }, stoicQuote: { type: Type.STRING }, actionableStep: { type: Type.STRING }, breathingExercise: { type: Type.BOOLEAN } } } }
        });
        return res.json(JSON.parse(response.text || '{}'));
    } catch (error) {
        logError("Stoic Coaching Error", error);
        return res.status(500).json({ error: 'Generation failed' });
    }
});

// Roleplay Reply
router.post('/roleplay-reply', (authMiddleware as any), requireAi, async (req: Request, res: Response) => {
    try {
        const { scenario, history, userInput } = req.body;
        const prompt = `Roleplay: ${scenario.title}. Role: ${scenario.opponentRole}. History: ${JSON.stringify(history)}. User: ${userInput}. Respond in character.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "text/plain" }
        });
        return res.json({ text: response.text || "..." });
    } catch (error) {
        logError("Roleplay Reply Error", error);
        return res.status(500).json({ error: 'Generation failed' });
    }
});

// Roleplay Feedback
router.post('/roleplay-feedback', (authMiddleware as any), requireAi, async (req: Request, res: Response) => {
    try {
        const { scenario, history } = req.body;
        const prompt = `Evaluate roleplay session. Scenario: ${scenario.title}. History: ${JSON.stringify(history)}. Return JSON with score, strengths, weaknesses, proTip.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, strengths: { type: Type.ARRAY, items: { type: Type.STRING } }, weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }, proTip: { type: Type.STRING } } } }
        });
        return res.json(JSON.parse(response.text || '{}'));
    } catch (error) {
        logError("Roleplay Feedback error", error);
        return res.status(500).json({ error: 'Generation failed' });
    }
});

// --- MISC ---

// Brand Image
router.post('/brand-image', (authMiddleware as any), requireAi, async (req: Request, res: Response) => {
    try {
        const { promptUser, styleDesc } = req.body;
        const userId = req.userId!;
        const context = await getContext(userId);
        const prompt = `${context}\nImage Gen: ${promptUser}. Style: ${styleDesc}.`;

        const response = await ai!.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt,
            config: { numberOfImages: 1, aspectRatio: '16:9', outputMimeType: 'image/jpeg' }
        });
        const b64 = response.generatedImages?.[0]?.image?.imageBytes;
        return res.json({ image: b64 ? `data:image/jpeg;base64,${b64}` : null });
    } catch (error) {
        logError("Brand Image Error", error);
        return res.status(500).json({ error: 'Generation failed' });
    }
});

// Code Solution
router.post('/code-solution', (authMiddleware as any), requireAi, async (req: Request, res: Response) => {
    try {
        const { problem } = req.body;
        const prompt = `Solve coding problem: ${problem}. Return JSON with language, code, explanation.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: problem,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { language: { type: Type.STRING }, code: { type: Type.STRING }, explanation: { type: Type.STRING } } } }
        });
        return res.json(JSON.parse(response.text || '{}'));
    } catch (error) {
        logError("Code Solution Error", error);
        return res.status(500).json({ error: 'Generation failed' });
    }
});

// Simulation
router.post('/simulation', (authMiddleware as any), requireAi, async (req: Request, res: Response) => {
    try {
        const { scenario } = req.body;
        const prompt = `Simulate scenario: ${scenario}. Return JSON with likelyCase, bestCase, worstCase, strategicAdvice.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { likelyCase: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, probability: { type: Type.NUMBER }, timeline: { type: Type.STRING }, description: { type: Type.STRING }, keyEvents: { type: Type.ARRAY, items: { type: Type.STRING } } } }, bestCase: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, probability: { type: Type.NUMBER }, timeline: { type: Type.STRING }, description: { type: Type.STRING }, keyEvents: { type: Type.ARRAY, items: { type: Type.STRING } } } }, worstCase: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, probability: { type: Type.NUMBER }, timeline: { type: Type.STRING }, description: { type: Type.STRING }, keyEvents: { type: Type.ARRAY, items: { type: Type.STRING } } } }, strategicAdvice: { type: Type.STRING } } } }
        });
        return res.json({ ...JSON.parse(response.text || '{}'), id: `sim-${Date.now()}`, timestamp: new Date().toISOString() });
    } catch (error) {
        logError("Simulation Error", error);
        return res.status(500).json({ error: 'Generation failed' });
    }
});

// Market Pulse
router.post('/market-pulse', (authMiddleware as any), requireAi, async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const context = await getContext(userId);
        const prompt = `${context}\nSearch for market trends/news for this industry. Summary bullet points.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] }
        });
        const grounding = response.candidates?.[0]?.groundingMetadata;
        const sources = grounding?.groundingChunks?.map((c: any) => c.web).filter((w: any) => w) || [];
        return res.json({ content: response.text || "", sources });
    } catch (error) {
        logError("Market Pulse Error", error);
        return res.status(500).json({ error: 'Generation failed' });
    }
});

// Analyze Opportunity
router.post('/analyze-opportunity', (authMiddleware as any), requireAi, async (req: Request, res: Response) => {
    try {
        const { opportunity } = req.body;
        const userId = req.userId!;
        const context = await getContext(userId);
        
        const prompt = `
            ${context}
            === MISSION: STRATEGIC OPPORTUNITY ANALYSIS ===
            Analyze the following detected opportunity and provide nuanced scoring.
            
            OPPORTUNITY:
            Title: "${opportunity.title}"
            Description: "${opportunity.description}"
            Type: "${opportunity.opportunityType}"
            Evidence: ${JSON.stringify(opportunity.evidence)}
            
            SCORING CRITERIA (0.0 to 10.0):
            - impactScore: Expected revenue/growth impact.
            - effortScore: Implementation difficulty (Inverted: 10.0 = Very Easy, 1.0 = Extremely Hard).
            - timingScore: Market urgency/seasonality.
            - riskScore: Likelihood of failure or competitor counter-move (Inverted: 10.0 = Low Risk, 1.0 = Critical Risk).
            - resourceScore: Feasibility given current solo-founder constraints.
            - strategicAlignmentScore: How well it fits the Brand DNA.
            
            Provide a detailed "verdict" and "actionableInsights" for each recommendation.
        `;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        priorityScore: { type: Type.NUMBER },
                        impactScore: { type: Type.NUMBER },
                        effortScore: { type: Type.NUMBER },
                        timingScore: { type: Type.NUMBER },
                        confidenceScore: { type: Type.NUMBER },
                        riskScore: { type: Type.NUMBER },
                        resourceScore: { type: Type.NUMBER },
                        strategicAlignmentScore: { type: Type.NUMBER },
                        verdict: { type: Type.STRING },
                        actionableInsights: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['priorityScore', 'impactScore', 'effortScore', 'timingScore', 'confidenceScore', 'riskScore', 'resourceScore', 'strategicAlignmentScore', 'verdict', 'actionableInsights']
                }
            }
        });

        return res.json(JSON.parse(response.text || '{}'));
    } catch (error) {
        logError("Analyze Opportunity Error", error);
        return res.status(500).json({ error: 'Generation failed' });
    }
});

export default router;
