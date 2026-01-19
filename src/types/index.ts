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

export interface BrandDNA {
    voice?: string;
    values?: string[];
    audience?: string;
    style?: string;
    onboardingStatus?: 'draft' | 'completed';
    [key: string]: unknown;
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
    // Financial context properties
    monthlyRevenue?: number;
    monthlyBurn?: number;
    currentCash?: number;
    growthRate?: number;
    updatedAt?: string;
}

export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'done';

export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    dueDate?: string | Date;
    tags?: string[];
    assignee?: AgentId;
    createdAt?: string;
    updatedAt?: string;
}
// ... existing imports ...
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
    date: string | Date;
    ceoScore: number; // 0-100
    executiveSummary: string;
    grades: DepartmentGrade[];
    consensus: string;
}

// ...

export interface CommunityManifesto {
    title: string;
    enemy: string;
    belief: string;
    tagline: string;
    values?: string[]; // Make optional or keep if used elsewhere
    missionStatement?: string; // Make optional
    rituals?: string[]; // Make optional or deprecated in favor of TribeBlueprint.rituals
}

export interface TribeBlueprint {
    id?: string;
    targetAudience?: string; // or audience
    platform?: string;
    manifesto: CommunityManifesto;
    rituals: { name: string, frequency: string, description: string, action: string }[];
    engagementLoops: string[];
    growthTactics?: string[];
    generatedAt?: string;
}

// THE AMPLIFIER (MARKETING)
export interface ContentAmplification {
    id?: string;
    originalContent?: string;
    sourceTitle?: string;
    twitterThread: string[];
    linkedinPost: string;
    tiktokScript: string;
    newsletterSection: string;
    channels?: {
        twitter: string;
        linkedin: string;
        newsletter: string;
    };
    viralHooks?: string[];
    generatedAt?: string;
}

export interface SocialStrategy {
    platform?: string;
    frequency?: string;
    contentTypes?: string[];
    growthTactics?: string[];
    pillars: { title: string, description: string }[];
    cadence: string;
    personaTactics: { persona: string, tactic: string }[];
    sampleHooks: string[];
}

// ...

// THE SYSTEM (SOPs)
export interface SOP {
    id?: string;
    taskName: string;
    goal: string;
    title?: string;
    trigger?: string;
    steps: { step: number, action: string, details: string }[];
    tools?: string[];
    successCriteria: string;
    generatedAt?: string;
}

// THE RECRUITER (HR)
export interface JobDescription {
    id?: string;
    roleTitle: string;
    hook: string;
    responsibilities: string[];
    requirements: string[];
    perks: string[];
    cultureFit?: string;
    generatedAt?: string;
}

export interface InterviewGuide {
    id?: string;
    roleTitle: string;
    questions: { question: string, whatToLookFor: string, redFlag: string }[];
    founderName?: string;
    industry?: string;
    description?: string;
    brandDna?: BrandDNA;
    updatedAt?: string;
}

export interface CompetitorReport {
    id: string;
    competitorName: string;
    url: string;
    strengths: string[];
    weaknesses: string[];
    vulnerabilities?: string[]; // Alias or additional detailed weaknesses
    pricingModel: string;
    marketingChannels: string[];
    intel?: string[]; // Detailed intel items
    threatLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    missionBrief?: string;
    metrics?: {
        innovation: number;
        marketPresence: number;
        ux: number;
        pricing: number;
        velocity: number;
    };
    generatedAt: string;
}

export interface CreativeAsset {
    id: string;
    type: 'image' | 'logo' | 'banner' | 'icon';
    url: string;
    prompt?: string;
    metadata?: Record<string, any>;
    generatedAt: string;
}

export interface SavedCodeSnippet {
    id: string;
    title: string;
    code: string;
    language: string;
    description?: string;
    generatedAt: string;
}

export interface ToastMessage {
    id: string;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'xp';
    xpAmount?: number;
}

export interface LaunchStrategy {
    id: string;
    productName: string;
    phases: {
        name: string;
        duration: string;
        actions: string[];
    }[];
    channels: string[];
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

export interface MentalCoaching {
    stoicQuote: string;
    reframing: string;
    actionableStep: string;
    breathingExercise?: boolean;
}

export interface IncineratorResponse {
    roastSummary: string;
    survivalScore: number; // 0-100
    feedback: string[];
    rewrittenContent?: string;
}

export interface TacticalPlan {
    goal: string;
    tasks: Task[];
    createdAt: string;
    completedAt?: string;
}

export interface FinancialContext {
    currentCash: number;
    monthlyBurn: number;
    monthlyRevenue: number;
    growthRate: number; // percentage
}

export interface FinancialAudit {
    runwayScore: number; // 0-100
    verdict: string;
    strategicMoves: string[];
    riskFactors: string[];
}

export interface PitchDeck {
    id: string;
    title: string;
    slides: Slide[];
    generatedAt: string;
}

export interface Slide {
    title: string;
    keyPoint: string;
    content: string[];
    visualIdea: string;
}

export interface TechStackAudit {
    score: number; // 0-100
    verdict: string;
    pros: string[];
    cons: string[];
    recommendations: string[];
}

export interface CodeSnippet {
    language: string;
    code: string;
    explanation: string;
}

export interface SimulationResult {
    id: string;
    query: string;
    likelyCase: ScenarioOutcome;
    bestCase: ScenarioOutcome;
    worstCase: ScenarioOutcome;
    strategicAdvice: string;
    timestamp: string;
}

export interface ScenarioOutcome {
    title: string;
    probability: number; // 0-100
    timeline: string; // e.g. "3 Months"
    description: string;
    keyEvents: string[];
}

export type ContactCategory = 'investor' | 'lead' | 'partner' | 'media' | 'vip';

export interface Contact {
    id: string;
    name: string;
    role: string;
    company: string;
    category: ContactCategory;
    email: string;
    notes: string;
    lastContact?: string;
    aiAnalysis?: string;
}

export interface NegotiationPrep {
    strategy: string;
    leveragePoints: string[];
    psychologicalProfile: string;
    openingLine: string;
}

export interface LegalAnalysis {
    safetyScore: number; // 0-100
    verdict: string;
    criticalRisks: string[];
    suggestions: string[];
}

export type LegalDocType = 'NDA' | 'Contractor Agreement' | 'SaaS Terms of Service' | 'Privacy Policy' | 'Offer Letter';

export interface LegalDoc {
    id: string;
    title: string;
    type: LegalDocType;
    content: string;
    generatedAt: string;
    metadata?: Record<string, unknown>;
}

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

export interface MentalState {
    mood: string;
    stressLevel: number; // 0-100
    primaryBlocker: string;
}

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
}

export interface RoleplayFeedback {
    score: number;
    strengths: string[];
    weaknesses: string[];
    proTip: string;
}

export interface LaunchEvent {
    day: string; // e.g. "T-Minus 7"
    title: string;
    description: string;
    owner: AgentId;
    channel: string;
}
