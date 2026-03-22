
import { Router, Request, Response, NextFunction } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';
import { db } from '../db';
import { businessContext, tasks, competitorReports, boardReports, pivotAnalyses, warRoomSessions, dailyIntelligence, userBrandSettings, users } from '../../src/lib/shared/db/schema';
import { eq, desc, and, gte } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';
import { SYSTEM_INSTRUCTIONS, AGENTS, AgentId } from '../constants';
import { logError } from '../utils/logger';
import { requireSubscription, checkUsage, TIER_LEVELS } from '../middleware/subscription';
import { UsageTracker } from '../utils/usage-tracker';
import { DominatorAgentOutputSchema } from '../../src/lib/shared/schemas';
import { canonicalAgentId } from '../../src/lib/agent-id-normalize';

// --- SCHEMAS ---
const ChatRequestSchema = z.object({
    agentId: z.string(),
    history: z.array(z.object({
        role: z.enum(['user', 'model']),
        text: z.string()
    })),
    message: z.string()
});

const CompetitorReportSchema = z.object({
    competitorName: z.string(),
    agentId: z.string()
});

const WarRoomSchema = z.object({
    topic: z.string(),
    previousSessionId: z.string().optional()
});

const TacticalPlanSchema = z.object({
    goal: z.string()
});

const TribeBlueprintSchema = z.object({
    audience: z.string(),
    enemy: z.string()
});

const AmplifiedContentSchema = z.object({
    source: z.string()
});

const LaunchStrategySchema = z.object({
    product: z.string(),
    date: z.string()
});

const commonJobSchema = z.object({
    roleTitle: z.string()
});

const JobDescriptionSchema = commonJobSchema.extend({
    employmentType: z.string()
});

const InterviewGuideSchema = commonJobSchema.extend({
    keyFocus: z.string()
});

const SopSchema = z.object({
    taskName: z.string()
});

const IncineratorSchema = z.object({
    content: z.string(),
    mode: z.string(),
    brutality: z.string()
});

const BoardReportSchema = z.object({
    financials: z.object({
        currentCash: z.number(),
        monthlyBurn: z.number(),
        monthlyRevenue: z.number()
    }),
    tasks: z.array(z.record(z.unknown())),
    reports: z.array(z.record(z.unknown())),
    contacts: z.array(z.record(z.unknown()))
});

const FinancialAuditSchema = z.object({
    financials: z.record(z.unknown())
});

const TechAuditSchema = z.object({
    stack: z.string()
});

const commonContactTargetSchema = z.object({
    name: z.string(),
    role: z.string().optional(),
    company: z.string().optional(),
    notes: z.string().optional()
});

const ColdEmailSchema = z.object({
    contact: commonContactTargetSchema
});

const NegotiationPrepSchema = z.object({
    contact: commonContactTargetSchema,
    dealContext: z.string(),
    otherParty: z.string(),
    goals: z.string()
});

const RoleplayReplySchema = z.object({
    scenario: z.object({
        title: z.string(),
        opponentRole: z.string()
    }),
    history: z.array(z.object({ role: z.string(), parts: z.array(z.object({ text: z.string() })) })),
    userInput: z.string()
});

const BrandImageSchema = z.object({
    promptUser: z.string(),
    styleDesc: z.string().optional()
});

const CodeSolutionSchema = z.object({
    problem: z.string()
});

const SimulationSchema = z.object({
    scenario: z.string()
});

const MarketPulseSchema = z.object({
    industry: z.string().optional()
});

const AnalyzeOpportunitySchema = z.object({
    opportunity: z.object({
        title: z.string(),
        description: z.string(),
        opportunityType: z.string(),
        evidence: z.unknown()
    })
});

const RoleplayFeedbackSchema = z.object({
    scenario: z.object({
        moduleTitle: z.string()
    }),
    history: z.array(z.object({ role: z.string(), parts: z.array(z.object({ text: z.string() })) }))
});

const StoicCoachingSchema = z.object({
    mood: z.string().optional(),
    stressLevel: z.string().optional(),
    primaryBlocker: z.string().optional(),
    message: z.string().optional()
});

const LegalDocSchema = z.object({
    type: z.string(),
    details: z.string()
});

const ContractAnalysisSchema = z.object({
    text: z.string()
});

const router = Router();

// Apply auth middleware to all AI routes
router.use(authMiddleware);

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Helper: Get Business Context
const getContext = async (userId: string): Promise<string> => {
    const brandSettings = await db.select().from(userBrandSettings).where(eq(userBrandSettings.user_id, userId)).limit(1);
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!brandSettings.length) return "";

    const bs = brandSettings[0];
    const u = user.length > 0 ? user[0] : { name: "Founder" };
    
    let dnaContext = "";
    // Access brand_personality from userBrandSettings which corresponds to brand DNA
    const brandPersonality = bs.brand_personality;
    
    if (brandPersonality) {
         dnaContext = `
        === BRAND DNA ===
        Personality: ${JSON.stringify(brandPersonality)}
        Target Audience: ${bs.target_audience || 'General'}
        Industry: ${bs.industry || 'General'}
        `;
    }

    return `
    CONTEXT_AWARENESS_LAYER:
    You are working for: "${bs.company_name || 'Solo Success Company'}"
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
        const gaps = p.gaps as { name: string }[] | null;
        if (gaps && Array.isArray(gaps) && gaps.length > 0) {
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
const requireAi = (req: Request, res: Response, next: NextFunction) => {
    if (!ai) return res.status(500).json({ success: false, error: 'Server AI configuration missing' });
    return next();
};

// --- ENDPOINTS ---

// Generic Chat / Agent Response
router.post('/chat', authMiddleware, requireAi, checkUsage('conversations', 1), async (req: Request, res: Response) => {
    try {
        const validation = ChatRequestSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: validation.error.message });
        }

        const { agentId, history, message } = validation.data;
        const userId = req.userId!;

        // --- TIER ENFORCEMENT ---
        const userTier = await UsageTracker.getUserTier(userId);
        const tierLevel = TIER_LEVELS[userTier as keyof typeof TIER_LEVELS] || 0;

        // Define Agent Tiers (Must match frontend + subscription-utils AGENT_ACCESS)
        const FREE_AGENTS = ['aura'];
        const ACCELERATOR_AGENTS = ['blaze', 'glitch', 'vex', 'finn'];
        const DOMINATOR_AGENTS = ['roxy', 'lexi', 'nova', 'echo', 'lumi'];

        const routeAgentId = canonicalAgentId(agentId);
        let requiredTierLevel = 0; // Free
        if (DOMINATOR_AGENTS.includes(routeAgentId)) {
            requiredTierLevel = TIER_LEVELS['dominator'];
        } else if (ACCELERATOR_AGENTS.includes(routeAgentId)) {
            requiredTierLevel = TIER_LEVELS['accelerator'];
        } else if (!FREE_AGENTS.includes(routeAgentId)) {
            requiredTierLevel = TIER_LEVELS['dominator'];
        }

        if (tierLevel < requiredTierLevel) {
             return res.status(403).json({ 
                success: false,
                error: 'Upgrade required to access this agent.',
                requiredLevel: requiredTierLevel,
                currentLevel: tierLevel
            });
        }
        // ------------------------

        const context = await getContext(userId);
        const deepMind = await getDeepMindContext(userId);

        const routeToAgentId: Record<string, AgentId> = {
            roxy: AgentId.ROXY,
            echo: AgentId.ECHO,
            lexi: AgentId.LEXI,
            glitch: AgentId.GLITCH,
            lumi: AgentId.LUMI,
            nova: AgentId.NOVA,
            blaze: AgentId.BLAZE,
            vex: AgentId.VEX,
            aura: AgentId.AURA,
            finn: AgentId.FINN,
        };
        const resolvedAgentEnum = routeToAgentId[routeAgentId];
        const systemInstruction = resolvedAgentEnum
            ? SYSTEM_INSTRUCTIONS[resolvedAgentEnum]
            : "You are a helpful AI assistant.";

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
            model: 'gemini-2.5-pro', // Standardizing on stable model or intended version
            config: {
                systemInstruction: fullSystemInstruction,
                temperature: 0.8,
            },
            history: history.map((h) => ({
                role: h.role === 'user' ? 'user' : 'model',
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
        
        return res.json({ 
            success: true,
            ...validatedOutput,
            text: validatedOutput.content 
        });

    } catch (error) {
        logError("AI Chat Error", error);
        return res.status(500).json({ success: false, error: 'Generation failed' });
    }
});

// Competitor Report
router.post('/competitor-report', requireAi, requireSubscription('dominator'), async (req: Request, res: Response) => {
    try {
        const validation = CompetitorReportSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: validation.error.message });
        }

        const { competitorName, agentId } = validation.data;
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
            model: 'gemini-2.5-pro',
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
        return res.json({ success: true, ...reportData });
    } catch (error) {
        logError("Competitor Report Error", error);
        return res.status(500).json({ success: false, error: 'Generation failed' });
    }
});

// War Room
router.post('/war-room', requireAi, requireSubscription('dominator'), async (req: Request, res: Response) => {
    try {
        const validation = WarRoomSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: validation.error.message });
        }

        const { topic, previousSessionId } = validation.data;
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
            model: 'gemini-2.5-pro',
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

        return res.json({ success: true, ...data });
    } catch (error) {
        logError("War Room Error", error);
        return res.status(500).json({ success: false, error: 'Generation failed' });
    }
});

// Daily Briefing
router.post('/briefing', requireAi, async (req: Request, res: Response) => {
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
                success: true,
                ...existing[0],
                focusPoints: existing[0].priorityActions,
                threatAlerts: existing[0].alerts,
            });
        }

        const context = await getContext(userId);
        const deepMind = await getDeepMindContext(userId);
        const prompt = `${context}\n${deepMind}\nGenerate Daily Briefing. Return JSON with summary, focusPoints, threatAlerts, motivationalQuote.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-pro',
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
            summary: data.summary || "Daily Briefing",
            priorityActions: data.focusPoints || [],
            alerts: data.threatAlerts || [],
            highlights: [], 
            motivationalMessage: data.motivationalQuote,
            riskLevel: 'low'
        });

        return res.json({ success: true, ...data, date: new Date().toLocaleDateString() });
    } catch (error) {
        logError("Briefing error", error);
        return res.status(500).json({ success: false, error: 'Generation failed' });
    }
});

// Tactical Plan
router.post('/tactical-plan', requireAi, async (req: Request, res: Response) => {
    try {
        const validation = TacticalPlanSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: validation.error.message });
        }

        const { goal } = validation.data;
        const userId = req.userId!;
        const context = await getContext(userId);
        const prompt = `
            ${context}
            === MISSION: TACTICAL ROADMAP GENERATION ===
            Break the following goal into a sequence of highly actionable, professional tasks.
            
            GOAL: "${goal}"
            
            ASSIGNABLE AGENTS (Team SoloSuccess):
            - Roxy: Business Coach / Strategy
            - Aura: Brand Presence & Creative Synthesis
            - Finn: Sales Closer & Pipeline Architect
            - Echo: Marketing & Communication
            - Lexi: Data & Strategic Insights
            - Nova: Product & UX Vision
            - Lumi: Compliance & Legal Guardian
            - Blaze: Growth & Performance
            - Glitch: QA & Root-Cause Problem Solving
            - Vex: Technical Architecture & Systems
            
            Return a JSON array of tasks that efficiently utilize these specialists.
        `;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-pro',
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
        return res.json({ success: true, tasks: JSON.parse(response.text || '[]') });
    } catch (error) {
        logError("Tactical Plan Error", error);
        return res.status(500).json({ success: false, error: 'Generation failed' });
    }
});

// --- MARKETING & STRATEGY ---

// The Incinerator (Reality Check)
router.post('/incinerator', requireAi, requireSubscription('accelerator'), async (req: Request, res: Response) => {
    try {
        const validation = IncineratorSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: validation.error.message });
        }

        const { content, mode, brutality } = validation.data;
        const userId = req.userId!;
        const context = await getContext(userId);
        const deepMind = await getDeepMindContext(userId);
        const prompt = `${context}\n${deepMind}\nIncinerator Mode. Content: "${content}". Mode: ${mode}. Brutality: ${brutality}. 
        INSTRUCTION: Use the "Market Opportunities" and "Competitor Intel" from the system data to validate or destroy this idea. 
        If the idea ignores a known market gap or competitor threat, be extra brutal.
        Return JSON with roastSummary, survivalScore, feedback, rewrittenContent.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: { 
                    type: Type.OBJECT, 
                    properties: { 
                        roastSummary: { type: Type.STRING }, 
                        survivalScore: { type: Type.NUMBER }, 
                        feedback: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                        rewrittenContent: { type: Type.STRING } 
                    } 
                } 
            }
        });
        return res.json({ success: true, ...JSON.parse(response.text || '{}') });
    } catch (error) {
        logError("Incinerator Error", error);
        return res.status(500).json({ success: false, error: 'Generation failed' });
    }
});

// Pitch Deck Intelligence
router.post('/pitch-deck', requireAi, async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const context = await getContext(userId);
        const prompt = `${context}\nGenerate 10-slide pitch deck. Return JSON with title, slides (title, keyPoint, content, visualIdea).`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: { 
                    type: Type.OBJECT, 
                    properties: { 
                        title: { type: Type.STRING }, 
                        slides: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, keyPoint: { type: Type.STRING }, content: { type: Type.ARRAY, items: { type: Type.STRING } }, visualIdea: { type: Type.STRING } } } } 
                    } 
                } 
            }
        });
        return res.json({ success: true, ...JSON.parse(response.text || '{}'), generatedAt: new Date().toISOString() });
    } catch (error) {
        logError("Pitch Deck Error", error);
        return res.status(500).json({ success: false, error: 'Generation failed' });
    }
});

// Blue Ocean Discovery
router.post('/blue-oceans', requireAi, async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const context = await getContext(userId);
        const prompt = `${context}\nFind 3 Blue Ocean market gaps. Return JSON with currentIndustry, gaps(name, description, competitionScore, profitabilityScore, soloFitScore, whyItWorks, firstStep).`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: { 
                    type: Type.OBJECT, 
                    properties: { 
                        currentIndustry: { type: Type.STRING }, 
                        gaps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING }, competitionScore: { type: Type.NUMBER }, profitabilityScore: { type: Type.NUMBER }, soloFitScore: { type: Type.NUMBER }, whyItWorks: { type: Type.STRING }, firstStep: { type: Type.STRING } } } } 
                    } 
                } 
            }
        });
        return res.json({ success: true, ...JSON.parse(response.text || '{}') });
    } catch (error) {
        logError("Blue Ocean Error", error);
        return res.status(500).json({ success: false, error: 'Discovery failed' });
    }
});

// Tribe Blueprint
router.post('/tribe-blueprint', requireAi, async (req: Request, res: Response) => {
    try {
        const validation = TribeBlueprintSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: validation.error.message });
        }

        const { audience, enemy } = validation.data;
        const userId = req.userId!;
        const context = await getContext(userId);
        const prompt = `${context}\nGenerate Tribe Blueprint. Audience: ${audience}. Enemy: ${enemy}. Return JSON with manifesto(title, enemy, belief, tagline), rituals(name, frequency, description, action), engagementLoops(array of strings).`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: { 
                    type: Type.OBJECT, 
                    properties: { 
                        manifesto: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, enemy: { type: Type.STRING }, belief: { type: Type.STRING }, tagline: { type: Type.STRING } } }, 
                        rituals: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, frequency: { type: Type.STRING }, description: { type: Type.STRING }, action: { type: Type.STRING } } } }, 
                        engagementLoops: { type: Type.ARRAY, items: { type: Type.STRING } } 
                    } 
                } 
            }
        });
        return res.json({ success: true, ...JSON.parse(response.text || '{}'), generatedAt: new Date().toISOString() });
    } catch (error) {
        logError("Tribe Error", error);
        return res.status(500).json({ success: false, error: 'Generation failed' });
    }
});

// Amplified Content
router.post('/amplified-content', requireAi, async (req: Request, res: Response) => {
    try {
        const validation = AmplifiedContentSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: validation.error.message });
        }

        const { source } = validation.data;
        const userId = req.userId!;
        const context = await getContext(userId);
        const prompt = `${context}\nAmplify content: "${source}". Return JSON with sourceTitle, twitterThread (array of strings), linkedinPost, tiktokScript, newsletterSection.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: { 
                    type: Type.OBJECT, 
                    properties: { 
                        sourceTitle: { type: Type.STRING }, 
                        twitterThread: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                        linkedinPost: { type: Type.STRING }, 
                        tiktokScript: { type: Type.STRING }, 
                        newsletterSection: { type: Type.STRING } 
                    } 
                } 
            }
        });
        return res.json({ success: true, ...JSON.parse(response.text || '{}'), generatedAt: new Date().toISOString() });
    } catch (error) {
        logError("Amplified Content Error", error);
        return res.status(500).json({ success: false, error: 'Generation failed' });
    }
});

// Social Strategy
router.post('/social-strategy', requireAi, async (req: Request, res: Response) => {
    try {
        const userId = req.userId!;
        const context = await getContext(userId);
        const prompt = `${context}\nMISSION: SOCIAL STRATEGY (The Amplifier). Act as Echo (CMO). Analyze Brand DNA. Generate strategy. Return JSON with pillars(title, description), cadence, personaTactics(persona, tactic), sampleHooks(array of strings).`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: { 
                    type: Type.OBJECT, 
                    properties: { 
                        pillars: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } } } }, 
                        cadence: { type: Type.STRING }, 
                        personaTactics: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { persona: { type: Type.STRING }, tactic: { type: Type.STRING } } } }, 
                        sampleHooks: { type: Type.ARRAY, items: { type: Type.STRING } } 
                    } 
                } 
            }
        });
        return res.json({ success: true, ...JSON.parse(response.text || '{}'), generatedAt: new Date().toISOString() });
    } catch (error) {
        logError("Social Strategy Error", error);
        return res.status(500).json({ success: false, error: 'Generation failed' });
    }
});

// Launch Strategy
router.post('/launch-strategy', requireAi, async (req: Request, res: Response) => {
    try {
        const validation = LaunchStrategySchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: validation.error.message });
        }

        const { product, date } = validation.data;
        const userId = req.userId!;
        const context = await getContext(userId);
        const prompt = `${context}\nLaunch Strategy for "${product}" on ${date}. Return JSON with phases(name, events(day, title, description, owner, channel)).`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: { 
                    type: Type.OBJECT, 
                    properties: { 
                        productName: { type: Type.STRING }, 
                        launchDate: { type: Type.STRING }, 
                        phases: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, events: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { day: { type: Type.STRING }, title: { type: Type.STRING }, description: { type: Type.STRING }, owner: { type: Type.STRING }, channel: { type: Type.STRING } } } } } } } 
                    } 
                } 
            }
        });
        return res.json({ success: true, ...JSON.parse(response.text || '{}'), generatedAt: new Date().toISOString() });
    } catch (error) {
        logError("Launch Strategy Error", error);
        return res.status(500).json({ success: false, error: 'Generation failed' });
    }
});

// --- OPS & HR ---

// Job Description
router.post('/job-description', requireAi, async (req: Request, res: Response) => {
    try {
        const validation = JobDescriptionSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: validation.error.message });
        }

        const { roleTitle, employmentType } = validation.data;
        const userId = req.userId!;
        const context = await getContext(userId);
        const prompt = `${context}\nMISSION: HIRE TALENT (The Scout). ROLE: "${roleTitle}". TYPE: "${employmentType}". Act as Roxy. Create Job Description. Return JSON with roleTitle, hook, responsibilities, requirements, perks.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: { 
                    type: Type.OBJECT, 
                    properties: { 
                        roleTitle: { type: Type.STRING }, 
                        hook: { type: Type.STRING }, 
                        responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                        requirements: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                        perks: { type: Type.ARRAY, items: { type: Type.STRING } } 
                    } 
                } 
            }
        });
        return res.json({ success: true, ...JSON.parse(response.text || '{}'), generatedAt: new Date().toISOString() });
    } catch (error) {
        logError("Job Description AI Error", error);
        return res.status(500).json({ success: false, error: 'Generation failed' });
    }
});

// Interview Guide
router.post('/interview-guide', requireAi, async (req: Request, res: Response) => {
    try {
        const validation = InterviewGuideSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: validation.error.message });
        }

        const { roleTitle, keyFocus } = validation.data;
        const userId = req.userId!;
        const context = await getContext(userId);
        const prompt = `${context}\nMISSION: VET TALENT. ROLE: "${roleTitle}". FOCUS: "${keyFocus}". Act as Roxy & Glitch. Create Interview Guide. Return JSON with roleTitle, questions(question, whatToLookFor, redFlag).`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: { 
                    type: Type.OBJECT, 
                    properties: { 
                        roleTitle: { type: Type.STRING }, 
                        questions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, whatToLookFor: { type: Type.STRING }, redFlag: { type: Type.STRING } } } } 
                    } 
                } 
            }
        });
        return res.json({ success: true, ...JSON.parse(response.text || '{}'), generatedAt: new Date().toISOString() });
    } catch (error) {
        logError("Interview Guide AI Error", error);
        return res.status(500).json({ success: false, error: 'Generation failed' });
    }
});

// SOP
router.post('/sop', requireAi, async (req: Request, res: Response) => {
    try {
        const validation = SopSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: validation.error.message });
        }

        const { taskName } = validation.data;
        const userId = req.userId!;
        const context = await getContext(userId);
        const prompt = `${context}\nMISSION: DELEGATION SYSTEM (SOP). TASK: "${taskName}". Act as Roxy. Create SOP. Return JSON with taskName, goal, steps(step, action, details), definitionOfDone.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: { 
                    type: Type.OBJECT, 
                    properties: { 
                        taskName: { type: Type.STRING }, 
                        goal: { type: Type.STRING }, 
                        steps: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { step: { type: Type.NUMBER }, action: { type: Type.STRING }, details: { type: Type.STRING } } } }, 
                        definitionOfDone: { type: Type.ARRAY, items: { type: Type.STRING } } 
                    } 
                } 
            }
        });
        return res.json({ success: true, ...JSON.parse(response.text || '{}'), generatedAt: new Date().toISOString() });
    } catch (error) {
        logError("SOP AI Error", error);
        return res.status(500).json({ success: false, error: 'Generation failed' });
    }
});

// Board Report
router.post('/board-report', requireAi, async (req: Request, res: Response) => {
    try {
        const validation = BoardReportSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: validation.error.message });
        }

        const { financials, tasks, reports, contacts } = validation.data;
        const userId = req.userId!;
        const context = await getContext(userId);
        const dataSummary = `FINANCIALS: Cash ${financials.currentCash}, Burn ${financials.monthlyBurn}, Revenue ${financials.monthlyRevenue}. OPS: ${tasks.length} total tasks. INTEL: ${reports.length} competitors. NETWORK: ${contacts.length} contacts.`;
        const prompt = `${context}\nGenerate Board Meeting Report based on data: ${dataSummary}. Return JSON with ceoScore, executiveSummary, consensus, grades(agentId, department, grade, score, summary, keyIssue).`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: { 
                    type: Type.OBJECT, 
                    properties: { 
                        ceoScore: { type: Type.NUMBER }, 
                        executiveSummary: { type: Type.STRING }, 
                        consensus: { type: Type.STRING }, 
                        grades: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { agentId: { type: Type.STRING }, department: { type: Type.STRING }, grade: { type: Type.STRING }, score: { type: Type.NUMBER }, summary: { type: Type.STRING }, keyIssue: { type: Type.STRING } } } } 
                    } 
                } 
            }
        });
        return res.json({ success: true, ...JSON.parse(response.text || '{}'), date: new Date().toISOString() });
    } catch (error) {
        logError("Board Report AI Error", error);
        return res.status(500).json({ success: false, error: 'Generation failed' });
    }
});

// Financial Audit
router.post('/financial-audit', requireAi, async (req: Request, res: Response) => {
    try {
        const validation = FinancialAuditSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: validation.error.message });
        }

        const { financials } = validation.data;
        const prompt = `Audit these financials: ${JSON.stringify(financials)}. Return JSON with runwayScore, verdict, strategicMoves, riskFactors.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: { 
                    type: Type.OBJECT, 
                    properties: { 
                        runwayScore: { type: Type.NUMBER }, 
                        verdict: { type: Type.STRING }, 
                        strategicMoves: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                        riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } } 
                    } 
                } 
            }
        });
        return res.json({ success: true, ...JSON.parse(response.text || '{}') });
    } catch (error) {
        logError("Financial Audit Error", error);
        return res.status(500).json({ success: false, error: 'Generation failed' });
    }
});

// Tech Audit
router.post('/tech-audit', requireAi, async (req: Request, res: Response) => {
    try {
        const validation = TechAuditSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: validation.error.message });
        }

        const { stack } = validation.data;
        const prompt = `Audit tech stack: ${stack}. Return JSON with score, verdict, pros, cons, recommendations.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: { 
                    type: Type.OBJECT, 
                    properties: { 
                        score: { type: Type.NUMBER }, 
                        verdict: { type: Type.STRING }, 
                        pros: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                        cons: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } } 
                    } 
                } 
            }
        });
        return res.json({ success: true, ...JSON.parse(response.text || '{}') });
    } catch (error) {
        logError("Tech Audit Error", error);
        return res.status(500).json({ success: false, error: 'Generation failed' });
    }
});

// --- LEGAL & SALES ---

// Cold Email
router.post('/cold-email', requireAi, async (req: Request, res: Response) => {
    try {
        const validation = ColdEmailSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: validation.error.message });
        }

        const { contact } = validation.data;
        const userId = req.userId!;
        const context = await getContext(userId);
        const prompt = `${context}\nDraft cold email for ${contact.name}, ${contact.role} at ${contact.company}. Notes: ${contact.notes}.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { responseMimeType: "text/plain" }
        });
        return res.json({ success: true, text: response.text || "" });
    } catch (error) {
        logError("Cold Email Error", error);
        return res.status(500).json({ success: false, error: 'Generation failed' });
    }
});

// Negotiation Prep
router.post('/negotiation-prep', requireAi, async (req: Request, res: Response) => {
    try {
        const validation = NegotiationPrepSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: validation.error.message });
        }

        const { dealContext, otherParty, goals } = validation.data;
        const userId = req.userId!;
        const context = await getContext(userId);
        const prompt = `${context}\nAct as Shadow (COO). Negotiate deal: "${dealContext}" with "${otherParty}". My goals: ${goals}. Return JSON with leveragePoints, concessions, scripts(line, reasoning), counterMoves.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: { 
                    type: Type.OBJECT, 
                    properties: { 
                        leveragePoints: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                        concessions: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                        scripts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { line: { type: Type.STRING }, reasoning: { type: Type.STRING } } } }, 
                        counterMoves: { type: Type.ARRAY, items: { type: Type.STRING } } 
                    } 
                } 
            }
        });
        return res.json({ success: true, ...JSON.parse(response.text || '{}'), generatedAt: new Date().toISOString() });
    } catch (error) {
        logError("Negotiation Prep Error", error);
        return res.status(500).json({ success: false, error: 'Generation failed' });
    }
});

// Draft Legal Doc
router.post('/legal-doc', requireAi, requireSubscription('dominator'), async (req: Request, res: Response) => {
    try {
        const validation = LegalDocSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: validation.error.message });
        }

        const { type, details } = validation.data;
        const userId = req.userId!;
        const context = await getContext(userId);
        const persona = SYSTEM_INSTRUCTIONS[AgentId.LUMI];
        const prompt = `${context}\n${persona}\nDraft ${type}. Details: ${details}. Include strict standard legal disclaimer that this is AI generated.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { responseMimeType: "text/plain" }
        });
        return res.json({ success: true, text: response.text || "" });
    } catch (error) {
        logError("Legal Doc Error", error);
        return res.status(500).json({ success: false, error: 'Generation failed' });
    }
});

// Analyze Contract
router.post('/contract-analysis', requireAi, requireSubscription('dominator'), async (req: Request, res: Response) => {
    try {
        const validation = ContractAnalysisSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: validation.error.message });
        }

        const { text } = validation.data;
        const userId = req.userId!;
        const context = await getContext(userId);
        const persona = SYSTEM_INSTRUCTIONS[AgentId.LUMI];
        const prompt = `${context}\n${persona}\nAnalyze contract: ${text.substring(0, 20000)}. Return JSON with safetyScore, verdict, criticalRisks, suggestions.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: { 
                    type: Type.OBJECT, 
                    properties: { 
                        safetyScore: { type: Type.NUMBER }, 
                        verdict: { type: Type.STRING }, 
                        criticalRisks: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                        suggestions: { type: Type.ARRAY, items: { type: Type.STRING } } 
                    } 
                } 
            }
        });
        return res.json({ success: true, ...JSON.parse(response.text || '{}') });
    } catch (error) {
        logError("Contract Analysis Error", error);
        return res.status(500).json({ success: false, error: 'Generation failed' });
    }
});

// --- MENTAL & ROLEPLAY ---

// Stoic Coaching
router.post('/stoic-coaching', requireAi, async (req: Request, res: Response) => {
    try {
        const validation = StoicCoachingSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: validation.error.message });
        }

        const userId = req.userId!;
        const context = await getContext(userId);
        const { mood, stressLevel, primaryBlocker, message } = validation.data;
        
        const inputData = message ? `Issue: ${message}` : `Mood: ${mood}, Stress: ${stressLevel}, Blocker: ${primaryBlocker}`;
        const persona = SYSTEM_INSTRUCTIONS[AgentId.SENECA];
        const prompt = `${context}\n${persona}\nCoaching for: ${inputData}. Offer Stoic wisdom and a practical exercise. Return JSON with wisdom, exercise, reflectionQuestion.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: { 
                    type: Type.OBJECT, 
                    properties: { 
                        reframing: { type: Type.STRING }, // Legacy support
                        stoicQuote: { type: Type.STRING }, // Legacy support
                        actionableStep: { type: Type.STRING }, // Legacy support
                        breathingExercise: { type: Type.BOOLEAN }, // Legacy support
                        wisdom: { type: Type.STRING }, 
                        exercise: { type: Type.STRING }, 
                        reflectionQuestion: { type: Type.STRING } 
                    } 
                } 
            }
        });
        return res.json({ success: true, ...JSON.parse(response.text || '{}') });
    } catch (error) {
        logError("Stoic Coaching Error", error);
        return res.status(500).json({ success: false, error: 'Generation failed' });
    }
});

// Roleplay Reply
router.post('/roleplay-reply', requireAi, async (req: Request, res: Response) => {
    try {
        const validation = RoleplayReplySchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: validation.error.message });
        }

        const { scenario, history, userInput } = validation.data;
        const prompt = `Roleplay: ${scenario.title}. Role: ${scenario.opponentRole}. History: ${JSON.stringify(history)}. User: ${userInput}. Respond in character.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { responseMimeType: "text/plain" }
        });
        return res.json({ success: true, text: response.text || "..." });
    } catch (error) {
        logError("Roleplay Reply Error", error);
        return res.status(500).json({ success: false, error: 'Generation failed' });
    }
});

// Roleplay Feedback
router.post('/roleplay-feedback', requireAi, async (req: Request, res: Response) => {
    try {
        const validation = RoleplayFeedbackSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: validation.error.message });
        }
        const { scenario, history } = validation.data;
        const prompt = `Roleplay Analysis: ${scenario.moduleTitle}. History: ${JSON.stringify(history)}. Provide feedback on user performance. Return JSON with score, strengths, improvements, coaching.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: { 
                    type: Type.OBJECT, 
                    properties: { 
                        score: { type: Type.NUMBER }, 
                        strengths: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                        improvements: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                        coaching: { type: Type.STRING } 
                    } 
                } 
            }
        });
        return res.json({ success: true, ...JSON.parse(response.text || '{}') });
    } catch (error) {
        logError("Roleplay Feedback Error", error);
        return res.status(500).json({ success: false, error: 'Generation failed' });
    }
});

// --- MISC ---

// Brand Image
router.post('/brand-image', requireAi, async (req: Request, res: Response) => {
    try {
        const validation = BrandImageSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: validation.error.message });
        }

        const { promptUser, styleDesc } = validation.data;
        const userId = req.userId!;
        const context = await getContext(userId);
        const prompt = `${context}\nImage Gen: ${promptUser}. Style: ${styleDesc || 'Professional'}.`;

        const response = await ai!.models.generateImages({
            model: 'imagen-3.0-generate-001',
            prompt,
            config: { numberOfImages: 1, aspectRatio: '16:9', outputMimeType: 'image/jpeg' }
        });
        const b64 = response.generatedImages?.[0]?.image?.imageBytes;
        return res.json({ success: true, image: b64 ? `data:image/jpeg;base64,${b64}` : null });
    } catch (error) {
        logError("Brand Image Error", error);
        return res.status(500).json({ success: false, error: 'Generation failed' });
    }
});

// Code Solution
router.post('/code-solution', requireAi, async (req: Request, res: Response) => {
    try {
        const validation = CodeSolutionSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: validation.error.message });
        }

        const { problem } = validation.data;
        const prompt = `Solve coding problem: ${problem}. Return JSON with language, code, explanation.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: { 
                    type: Type.OBJECT, 
                    properties: { 
                        language: { type: Type.STRING }, 
                        code: { type: Type.STRING }, 
                        explanation: { type: Type.STRING } 
                    } 
                } 
            }
        });
        return res.json({ success: true, ...JSON.parse(response.text || '{}') });
    } catch (error) {
        logError("Code Solution Error", error);
        return res.status(500).json({ success: false, error: 'Generation failed' });
    }
});

// Simulation
router.post('/simulation', requireAi, async (req: Request, res: Response) => {
    try {
        const validation = SimulationSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: validation.error.message });
        }

        const { scenario } = validation.data;
        const prompt = `Simulate scenario: ${scenario}. Return JSON with likelyCase, bestCase, worstCase, strategicAdvice.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: { 
                    type: Type.OBJECT, 
                    properties: { 
                        likelyCase: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, probability: { type: Type.NUMBER }, timeline: { type: Type.STRING }, description: { type: Type.STRING }, keyEvents: { type: Type.ARRAY, items: { type: Type.STRING } } } }, 
                        bestCase: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, probability: { type: Type.NUMBER }, timeline: { type: Type.STRING }, description: { type: Type.STRING }, keyEvents: { type: Type.ARRAY, items: { type: Type.STRING } } } }, 
                        worstCase: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, probability: { type: Type.NUMBER }, timeline: { type: Type.STRING }, description: { type: Type.STRING }, keyEvents: { type: Type.ARRAY, items: { type: Type.STRING } } } }, 
                        strategicAdvice: { type: Type.STRING } 
                    } 
                } 
            }
        });
        return res.json({ success: true, ...JSON.parse(response.text || '{}'), id: `sim-${Date.now()}`, timestamp: new Date().toISOString() });
    } catch (error) {
        logError("Simulation Error", error);
        return res.status(500).json({ success: false, error: 'Generation failed' });
    }
});

// Market Pulse
router.post('/market-pulse', requireAi, async (req: Request, res: Response) => {
    try {
        const validation = MarketPulseSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: validation.error.message });
        }

        const userId = req.userId!;
        const context = await getContext(userId);
        const { industry } = validation.data;
        const prompt = `${context}\nMISSION: MARKET PULSE. INDUSTRY: "${industry || 'general tech'}". Act as Glitch. Find market trends. Summary bullet points.`;

        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { 
                tools: [{ googleSearch: {} }] 
            } as Parameters<NonNullable<typeof ai>['models']['generateContent']>[0]['config']
        });
        const grounding = response.candidates?.[0]?.groundingMetadata as { groundingChunks?: { web?: { title: string, uri: string } }[] } | undefined;
        const sources = grounding?.groundingChunks?.map(c => c.web).filter(w => !!w) || [];
        
        return res.json({ success: true, text: response.text || "", sources });
    } catch (error) {
        logError("Market Pulse Error", error);
        return res.status(500).json({ success: false, error: 'Generation failed' });
    }
});

// Analyze Opportunity
router.post('/analyze-opportunity', requireAi, async (req: Request, res: Response) => {
    try {
        const validation = AnalyzeOpportunitySchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: validation.error.message });
        }

        const { opportunity } = validation.data;
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
            model: 'gemini-2.5-pro',
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

        return res.json({ success: true, ...JSON.parse(response.text || '{}') });
    } catch (error) {
        logError("Analyze Opportunity Error", error);
        return res.status(500).json({ success: false, error: 'Generation failed' });
    }
});

export default router;
