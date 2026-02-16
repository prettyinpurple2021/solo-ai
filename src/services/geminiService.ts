
import { logError } from '@/lib/logger';
import { apiService } from './apiService';
import {
    AgentId,
    CompetitorReport,
    WarRoomResponse,
    FinancialContext,
    Contact,
    RoleplayScenario,
    RoleplayTurn,
    RoleplayFeedback,
    JobDescription,
    InterviewGuide,
    SOP,
    ProductSpec,
    LegalDoc,
    LaunchStrategy,
    SocialStrategy,
    ContentAmplification,
    TribeBlueprint,
    PitchDeck,
    TechStackAudit,
    BoardMeetingReport,
    NegotiationPrep,
    MentalCoaching,
    SimulationResult,
    MarketPulse,
    LegalAnalysis,
    Task,
    PivotAnalysis,
    IncineratorResponse,
    CodeSnippet,
    FinancialAudit
} from '../types';

// Types
export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface WarRoomDebate {
    transcript: Array<{ agentId: AgentId; text: string }>;
    consensus: string;
    actionItems: string[];
}

// --- AI Service ---

export const geminiService = {
    // Generic generation
    async generateContent(prompt: string, options: Record<string, unknown> = {}): Promise<string> {
        return apiService.generate({
            prompt,
            systemInstruction: "You are the SoloSuccess AI Executive Team. Provide high-level strategic intelligence.",
            ...options
        });
    },

    // Chat
    async getAgentResponse(agentId: string, history: ChatMessage[], newMessage: string): Promise<string> {
        try {
            const response = await apiService.post<{ text: string }>('/ai/chat', { agentId, history, message: newMessage });
            return response.text;
        } catch (error) {
            logError('Chat Error:', error);
            return "I'm having trouble connecting right now. Please try again.";
        }
    },

    // Competitor Analysis
    async generateCompetitorReport(url: string, name: string): Promise<CompetitorReport | null> {
        try {
            return await apiService.post<CompetitorReport>('/ai/competitor-report', { url, name });
        } catch (error) {
            logError('Competitor Report Error:', error);
            return null;
        }
    },

    // War Room
    async generateWarRoomDebate(topic: string, previousSessionId?: string): Promise<WarRoomResponse | null> {
        try {
            return await apiService.post<WarRoomResponse>('/ai/war-room', { topic, previousSessionId });
        } catch (error) {
            logError('War Room Error:', error);
            return null;
        }
    },

    // Daily Briefing
    async generateDailyBriefing(): Promise<unknown> {
        try {
            return await apiService.post('/ai/briefing', {});
        } catch (error) {
            logError('Briefing Error:', error);
            return null;
        }
    },

    // Tactical Plan
    async generateTacticalPlan(goal: string | string[]): Promise<Task[]> {
        try {
            return await apiService.post<Task[]>('/ai/tactical-plan', { goal });
        } catch (error) {
            logError('Tactical Plan Error:', error);
            return [];
        }
    },

    // Marketing & Strategy
    async generateIncineratorFeedback(idea: string, type?: string, context?: string): Promise<IncineratorResponse | null> {
        try {
            return await apiService.post<IncineratorResponse>('/ai/incinerator', { idea, type, context });
        } catch (error) {
            logError('Incinerator Error:', error);
            return null;
        }
    },

    async generatePitchDeck(businessName?: string, description?: string): Promise<PitchDeck | null> {
        try {
            return await apiService.post<PitchDeck>('/ai/pitch-deck', { businessName, description });
        } catch (error) {
            logError('Pitch Deck Error:', error);
            return null;
        }
    },

    async findBlueOceans(industry?: string): Promise<PivotAnalysis | null> {
        try {
            return await apiService.post<PivotAnalysis>('/ai/blue-oceans', { industry });
        } catch (error) {
            logError('Blue Ocean Error:', error);
            return null;
        }
    },

    async generateTribeBlueprint(audience: string, manifesto?: string): Promise<TribeBlueprint | null> {
        try {
            return await apiService.post<TribeBlueprint>('/ai/tribe-blueprint', { audience, manifesto });
        } catch (error) {
            logError('Tribe Blueprint Error:', error);
            return null;
        }
    },

    async generateAmplifiedContent(content: string, platforms?: string[]): Promise<ContentAmplification | null> {
        try {
            return await apiService.post<ContentAmplification>('/ai/amplified-content', { content, platforms });
        } catch (error) {
            logError('Content Amplifier Error:', error);
            return null;
        }
    },

    async generateSocialStrategy(platform?: string, goal?: string): Promise<SocialStrategy | null> {
        try {
            return await apiService.post<SocialStrategy>('/ai/social-strategy', { platform, goal });
        } catch (error) {
            logError('Social Strategy Error:', error);
            return null;
        }
    },

    async generateLaunchStrategy(product: string, context?: string): Promise<LaunchStrategy | null> {
        try {
            return await apiService.post<LaunchStrategy>('/ai/launch-strategy', { product, context });
        } catch (error) {
            logError('Launch Strategy Error:', error);
            return null;
        }
    },

    // Ops & HR
    async generateJobDescription(role: string, culture: string): Promise<JobDescription | null> {
        try {
            return await apiService.post<JobDescription>('/ai/job-description', { role, culture });
        } catch (error) {
            logError('JD Error:', error);
            return null;
        }
    },

    async generateInterviewGuide(role: string, focus?: string): Promise<InterviewGuide | null> {
        try {
            return await apiService.post<InterviewGuide>('/ai/interview-guide', { role, focus });
        } catch (error) {
            logError('Interview Guide Error:', error);
            return null;
        }
    },

    async generateSOP(processName: string, goal?: string): Promise<SOP | null> {
        try {
            return await apiService.post<SOP>('/ai/sop', { processName, goal });
        } catch (error) {
            logError('SOP Error:', error);
            return null;
        }
    },

    async generateBoardReport(
        financials: Partial<FinancialContext>,
        tasks?: Task[],
        reports?: CompetitorReport[],
        contacts?: Contact[]
    ): Promise<BoardMeetingReport | null> {
        try {
            return await apiService.post<BoardMeetingReport>('/ai/board-report', { financials, tasks, reports, contacts });
        } catch (error) {
            logError('Board Report Error:', error);
            return null;
        }
    },

    async conductFinancialAudit(data: string | FinancialContext): Promise<FinancialAudit | null> {
        try {
            return await apiService.post<FinancialAudit>('/ai/financial-audit', { data });
        } catch (error) {
            logError('Financial Audit Error:', error);
            return null;
        }
    },

    async conductTechAudit(stack: string): Promise<TechStackAudit | null> {
        try {
            return await apiService.post<TechStackAudit>('/ai/tech-audit', { stack });
        } catch (error) {
            logError('Tech Audit Error:', error);
            return null;
        }
    },

    // Legal & Sales
    async generateColdEmail(contact: Contact): Promise<string> {
        try {
            const response = await apiService.post<{ text: string }>('/ai/cold-email', { contact });
            return response.text;
        } catch (error) {
            logError('Cold Email Error:', error);
            return 'Failed to generate email.';
        }
    },

    async generateNegotiationPrep(contact: Contact): Promise<NegotiationPrep | null> {
        try {
            return await apiService.post<NegotiationPrep>('/ai/negotiation-prep', { contact });
        } catch (error) {
            logError('Negotiation Prep Error:', error);
            return null;
        }
    },

    async draftLegalDoc(type: string, details: string): Promise<LegalDoc | null> {
        try {
            return await apiService.post<LegalDoc>('/ai/legal-doc', { type, details });
        } catch (error) {
            logError('Legal Doc Error:', error);
            return null;
        }
    },

    async analyzeContract(text: string): Promise<LegalAnalysis | null> {
        try {
            return await apiService.post<LegalAnalysis>('/ai/contract-analysis', { text });
        } catch (error) {
            logError('Contract Analysis Error:', error);
            return null;
        }
    },

    // Mental & Roleplay
    async generateStoicCoaching(mood: string, stressLevel?: number, primaryBlocker?: string): Promise<MentalCoaching | null> {
        try {
            return await apiService.post<MentalCoaching>('/ai/stoic-coaching', { mood, stressLevel, primaryBlocker });
        } catch (error) {
            logError('Stoic Coaching Error:', error);
            return null;
        }
    },

    async getRoleplayReply(scenario: RoleplayScenario, history: RoleplayTurn[], userInput: string): Promise<string> {
        try {
            const response = await apiService.post<{ text: string }>('/ai/roleplay-reply', { scenario, history, userInput });
            return response.text;
        } catch (error) {
            logError('Roleplay Reply Error:', error);
            return "...";
        }
    },

    async evaluateRoleplaySession(scenario: RoleplayScenario, history: RoleplayTurn[]): Promise<RoleplayFeedback | null> {
        try {
            return await apiService.post<RoleplayFeedback>('/ai/roleplay-feedback', { scenario, history });
        } catch (error) {
            logError('Roleplay Feedback Error:', error);
            return null;
        }
    },

    // Misc
    async generateBrandImage(promptUser: string, styleDesc: string): Promise<string | null> {
        try {
            const response = await apiService.post<{ image: string }>('/ai/brand-image', { promptUser, styleDesc });
            return response.image;
        } catch (error) {
            logError('Image Gen Error:', error);
            return null;
        }
    },

    async generateCodeSolution(problem: string): Promise<CodeSnippet | null> {
        try {
            return await apiService.post<CodeSnippet>('/ai/code-solution', { problem });
        } catch (error) {
            logError('Code Solution Error:', error);
            return null;
        }
    },

    async runSimulation(scenario: string): Promise<SimulationResult | null> {
        try {
            return await apiService.post<SimulationResult>('/ai/simulation', { scenario });
        } catch (error) {
            logError('Simulation Error:', error);
            return null;
        }
    },

    async generateMarketPulse(industry: string): Promise<MarketPulse | null> {
        try {
            return await apiService.post<MarketPulse>('/ai/market-pulse', { industry });
        } catch (error) {
            logError('Market Pulse Error:', error);
            return null;
        }
    },

    async generateProductSpec(idea: string): Promise<ProductSpec | null> {
        try {
            return await apiService.post<ProductSpec>('/ai/product-spec', { idea });
        } catch (error) {
            logError('Product Spec Error:', error);
            return null;
        }
    },

    async analyzeOpportunity(opportunity: any): Promise<any> {
        try {
            return await apiService.post<any>('/ai/analyze-opportunity', { opportunity });
        } catch (error) {
            logError('Analyze Opportunity Error:', error);
            return null;
        }
    }
};
