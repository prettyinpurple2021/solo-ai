export enum AgentId {
    ROXY = 'ROXY',
    ECHO = 'ECHO',
    LEXI = 'LEXI',
    GLITCH = 'GLITCH',
    LUMI = 'LUMI'
}

export interface Agent {
    id: AgentId;
    name: string;
    title: string;
    description: string;
    color: string;
    avatar: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    timestamp?: number;
}

export interface TargetPersona {
    name: string;
    description: string;
    painPoints: string[];
}

export interface BrandDNA {
    tone: {
        formalVsCasual: number;
        playfulVsSerious: number;
        modernVsClassic: number;
    };
    personas: TargetPersona[];
    coreValues: string[];
    bannedWords: string[];
    voice?: string;
    values?: string[];
    audience?: string;
    style?: string;
    onboardingStatus?: 'draft' | 'completed';
    [key: string]: any;
}

export interface BusinessContext {
    id?: string;
    userId?: string;
    founderName: string;
    companyName: string;
    industry: string;
    description: string;
    goals: string[];
    brandDna?: BrandDNA;
    updatedAt?: string;
    // Financials
    currentCash?: number;
    monthlyBurn?: number;
    monthlyRevenue?: number;
    growthRate?: number;
}

export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'done';

export interface Task {
    id: string;
    title: string;
    description: string;
    assignee: AgentId;
    status: TaskStatus;
    priority: 'low' | 'medium' | 'high';
    estimatedTime: string;
    createdAt?: string;
    completedAt?: string;
    rewrittenContent?: string; // For Idea Incinerator tasks
    timestamp?: number;
}

// THE SIGNAL TOWER (DAILY BRIEFING)
export interface DailyBriefing {
    date: string;
    summary: string;
    focusPoints: string[];
    threatAlerts: string[];
    motivationalQuote: string;
}

// THE FORGE (PITCH DECK)
export interface Slide {
    title: string;
    keyPoint: string;
    content: string[];
    visualIdea: string;
}

export interface PitchDeck {
    id: string;
    title: string;
    slides: Slide[];
    generatedAt: string;
}

// THE VAULT (FINANCIALS & ASSETS)
export interface FinancialContext {
    monthlyRevenue: number;
    monthlyBurn: number;
    currentCash: number;
    currency?: string;
    growthRate?: number;
}

export interface FinancialAudit {
    runwayScore: number; // 0-100
    verdict: string;
    strategicMoves: string[];
    riskFactors: string[];
}

export type ContactCategory = 'lead' | 'investor' | 'partner' | 'media' | 'vip';

export interface Contact {
    id: string;
    name: string;
    role: string;
    company: string;
    notes: string;
    status?: 'Lead' | 'Contacted' | 'Negotiating' | 'Closed';
    category: ContactCategory;
    email?: string;
    lastContact?: string;
}

export interface NegotiationPrep {
    strategy: string;
    leveragePoints: string[];
    psychologicalProfile: string;
    openingLine: string;
}

// THE MATRIX (TECH STACK)
export interface TechStackAudit {
    score: number;
    verdict: string;
    pros: string[];
    cons: string[];
    recommendations: string[];
    timestamp: string;
}

// THE SIMULATOR (SCENARIO PLANNING)
export interface SimulationResult {
    id: string;
    query: string;
    timestamp: string;
    likelyCase: ScenarioOutcome;
    bestCase: ScenarioOutcome;
    worstCase: ScenarioOutcome;
    strategicAdvice: string;
}

export interface ScenarioOutcome {
    title: string;
    probability: number;
    timeline: string;
    description: string;
    keyEvents: string[];
}

// THE WATCHTOWER (LEGAL)
export type LegalDocType = 'NDA' | 'Contract' | 'Terms of Service' | 'Privacy Policy';

export interface LegalAnalysis {
    safetyScore: number; // 0-100
    verdict: string;
    criticalRisks: string[];
    suggestions: string[];
}

// THE BOARDROOM (PERFORMANCE REVIEW)
export interface DepartmentGrade {
    agentId: AgentId;
    department: string;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    score: number; // 0-100
    summary: string;
    keyIssue: string;
}

export interface BoardMeetingReport {
    id: string;
    date: string;
    ceoScore: number; // 0-100
    executiveSummary: string;
    grades: DepartmentGrade[];
    consensus: string;
}

// THE PIVOT (BLUE OCEAN STRATEGY)
export interface MarketGap {
    name: string;
    description: string;
    competitionScore: number; // 0-100 (Low is better)
    profitabilityScore: number; // 0-100 (High is better)
    soloFitScore: number; // 0-100 (High is better)
    whyItWorks: string;
    firstStep: string;
}

export interface PivotAnalysis {
    currentIndustry: string;
    gaps: MarketGap[];
}

// THE SANCTUARY (MENTAL OPS)
export interface MentalState {
    mood: string;
    stressLevel: number; // 0-100
    primaryBlocker: string;
}

export interface MentalCoaching {
    reframing: string;
    stoicQuote: string;
    actionableStep: string;
    breathingExercise: boolean;
}

// THE ARCHITECT (PRODUCT SPECS)
export interface ProductFeature {
    name: string;
    userStory: string; // "As a user I want..."
    acceptanceCriteria: string[];
    techNotes: string;
}

export interface ProductSpec {
    id: string;
    featureName: string;
    summary: string;
    features: ProductFeature[];
    dataModel: string[]; // Rough schema description
    generatedAt: string;
}

// THE ACADEMY (TRAINING SIM)
export interface RoleplayScenario {
    id: string;
    title: string;
    description: string;
    difficulty: 'ROOKIE' | 'VETERAN' | 'NIGHTMARE';
    opponentRole: string;
    opponentPersona: string;
    objective: string;
}

export interface RoleplayTurn {
    role: 'user' | 'opponent';
    text: string;
    timestamp?: number;
}

export interface RoleplayFeedback {
    score: number;
    strengths: string[];
    weaknesses: string[];
    proTip: string;
}

// THE TRIBE (COMMUNITY)
export interface TribeRitual {
    name: string;
    frequency: string;
    description: string;
    action: string;
}

export interface CommunityManifesto {
    title: string;
    enemy: string;
    belief: string;
    tagline: string;
}

export interface TribeBlueprint {
    id: string;
    targetAudience: string;
    platform: string;
    manifesto: CommunityManifesto;
    rituals: TribeRitual[];
    engagementLoops: string[];
    generatedAt: string;
}

// THE AMPLIFIER (MARKETING)
export interface ContentAmplification {
    id: string;
    originalContent: string;
    channels: {
        twitter: string;
        linkedin: string;
        newsletter: string;
    };
    viralHooks: string[];
    generatedAt: string;
    // Expanded fields for TheAmplifier
    sourceTitle?: string;
    twitterThread?: string[];
    linkedinPost?: string;
    tiktokScript?: string;
    newsletterSection?: string;
}

export interface CreativeAsset {
    id: string;
    title?: string;
    prompt?: string;
    type: 'image' | 'video' | 'copy' | 'ad';
    content?: string;
    imageBase64?: string;
    platform?: string;
    style?: string;
    generatedAt: string;
}

// THE SYSTEM (SOPs)
export interface SOPStep {
    step: number;
    action: string;
    details: string;
}

export interface SOP {
    id: string;
    taskName: string;
    goal: string;
    steps: SOPStep[];
    successCriteria: string;
    generatedAt: string;
}

// THE RECRUITER (HR)
export interface JobDescription {
    id: string;
    roleTitle: string;
    hook: string;
    responsibilities: string[];
    requirements: string[];
    perks: string[];
    cultureFit?: string;
    generatedAt: string;
}

export interface InterviewQuestion {
    question: string;
    whatToLookFor: string;
    redFlag: string;
}

export interface InterviewGuide {
    id: string;
    roleTitle: string;
    questions: InterviewQuestion[];
    generatedAt: string;
}

export interface CompetitorReport {
    id: string;
    competitorName: string;
    url: string;
    strengths: string[];
    weaknesses: string[];
    pricingModel: string;
    marketingChannels: string[];
    threatLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    missionBrief?: string;
    metrics?: {
        innovation: number;
        marketPresence: number;
        ux: number;
        pricing: number;
        velocity: number;
    };
    intel?: string[];
    vulnerabilities?: string[];
    generatedAt: string;
}

export interface ToastMessage {
    id: string;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'xp';
    xpAmount?: number;
    newProgress?: UserProgress;
}

export interface LaunchEvent {
    day: string;
    title: string;
    description: string;
    owner: string;
    channel: string;
}

export interface LaunchPhase {
    name: string;
    events: LaunchEvent[];
}

export interface LaunchStrategy {
    id: string;
    productName: string;
    launchDate: string;
    phases: LaunchPhase[];
    generatedAt: string;
}

export interface UserProgress {
    level: number;
    currentXP: number;
    nextLevelXP: number;
    rankTitle: string;
    totalActions: number;
    achievements: string[];
}

export interface WarRoomEntry {
    speaker: AgentId;
    text: string;
    timestamp?: number;
}

export interface WarRoomResponse {
    dialogue: WarRoomEntry[];
    consensus: string;
    actionPlan: string[];
}

export interface SavedWarRoomSession extends WarRoomResponse {
    id: string;
    topic: string;
    timestamp: string;
}

export interface CodeSnippet {
    language: string;
    code: string;
    explanation: string;
}

export interface SavedCodeSnippet {
    id: string;
    title: string;
    language: string;
    code: string;
    description: string;
    tags: string[];
    timestamp: string;
}

export interface IncineratorResponse {
    roastSummary: string;
    survivalScore: number;
    feedback: string[];
    rewrittenContent?: string;
}

export interface SocialStrategy {
    pillars: { title: string; description: string }[];
    cadence: string;
    personaTactics: { persona: string; tactic: string }[];
    sampleHooks: string[];
}
