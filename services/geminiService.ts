import { apiService } from './apiService';
import { AgentId, CompetitorReport, WarRoomResponse, FinancialContext } from '../types';

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
    // Generic Content Generation
    async generateContent(prompt: string, options?: { temperature?: number; maxOutputTokens?: number }): Promise<string> {
        try {
            const response = await apiService.post('/ai/generate', { prompt, ...options });
            return response.text;
        } catch (error) {
            console.error('Generate Content Error:', error);
            return "{}"; // Return empty JSON object string on error to prevent parse failure
        }
    },

    // Chat
    async getAgentResponse(agentId: string, history: ChatMessage[], newMessage: string): Promise<string> {
        try {
            const response = await apiService.post('/ai/chat', { agentId, history, message: newMessage });
            return response.text;
        } catch (error) {
            console.error('Chat Error:', error);
            return "I'm having trouble connecting right now. Please try again.";
        }
    },

    // Competitor Analysis
    async generateCompetitorReport(url: string, name: string): Promise<CompetitorReport | null> {
        try {
            return await apiService.post('/ai/competitor-report', { url, name });
        } catch (error) {
            console.error('Competitor Report Error:', error);
            return null;
        }
    },

    // War Room
    async generateWarRoomDebate(topic: string, previousSessionId?: string): Promise<WarRoomResponse | null> {
        try {
            return await apiService.post('/ai/war-room', { topic, previousSessionId });
        } catch (error) {
            console.error('War Room Error:', error);
            return null;
        }
    },

    // Daily Briefing
    async generateDailyBriefing(): Promise<any> {
        try {
            return await apiService.post('/ai/briefing', {});
        } catch (error) {
            console.error('Briefing Error:', error);
            return null;
        }
    },

    // Tactical Plan
    async generateTacticalPlan(goal: string | string[]): Promise<any> {
        try {
            return await apiService.post('/ai/tactical-plan', { goal });
        } catch (error) {
            console.error('Tactical Plan Error:', error);
            return null;
        }
    },

    // Marketing & Strategy
    async generateIncineratorFeedback(idea: string, type?: string, context?: string): Promise<any> {
        try {
            return await apiService.post('/ai/incinerator', { idea, type, context });
        } catch (error) {
            console.error('Incinerator Error:', error);
            return null;
        }
    },

    async generatePitchDeck(businessName?: string, description?: string): Promise<any> {
        try {
            return await apiService.post('/ai/pitch-deck', { businessName, description });
        } catch (error) {
            console.error('Pitch Deck Error:', error);
            return null;
        }
    },

    async findBlueOceans(industry?: string): Promise<any> {
        try {
            return await apiService.post('/ai/blue-oceans', { industry });
        } catch (error) {
            console.error('Blue Ocean Error:', error);
            return null;
        }
    },

    async generateTribeBlueprint(audience: string, manifesto?: string): Promise<any> {
        try {
            return await apiService.post('/ai/tribe-blueprint', { audience, manifesto });
        } catch (error) {
            console.error('Tribe Blueprint Error:', error);
            return null;
        }
    },

    async generateAmplifiedContent(content: string, platforms?: string[]): Promise<any> {
        try {
            return await apiService.post('/ai/amplified-content', { content, platforms });
        } catch (error) {
            console.error('Content Amplifier Error:', error);
            return null;
        }
    },

    async generateSocialStrategy(platform?: string, goal?: string): Promise<any> {
        try {
            return await apiService.post('/ai/social-strategy', { platform, goal });
        } catch (error) {
            console.error('Social Strategy Error:', error);
            return null;
        }
    },

    async generateLaunchStrategy(product: string, context?: string): Promise<any> {
        try {
            return await apiService.post('/ai/launch-strategy', { product, context });
        } catch (error) {
            console.error('Launch Strategy Error:', error);
            return null;
        }
    },

    // Ops & HR
    async generateJobDescription(role: string, culture: string): Promise<any> {
        try {
            return await apiService.post('/ai/job-description', { role, culture });
        } catch (error) {
            console.error('JD Error:', error);
            return null;
        }
    },

    async generateInterviewGuide(role: string, focus?: string): Promise<any> {
        try {
            return await apiService.post('/ai/interview-guide', { role, focus });
        } catch (error) {
            console.error('Interview Guide Error:', error);
            return null;
        }
    },

    async generateSOP(processName: string, goal?: string): Promise<any> {
        try {
            return await apiService.post('/ai/sop', { processName, goal });
        } catch (error) {
            console.error('SOP Error:', error);
            return null;
        }
    },

    async generateBoardReport(period: any, metrics?: any, reports?: any, contacts?: any): Promise<any> {
        try {
            return await apiService.post('/ai/board-report', { period, metrics, reports, contacts });
        } catch (error) {
            console.error('Board Report Error:', error);
            return null;
        }
    },

    async conductFinancialAudit(data: string | FinancialContext): Promise<any> {
        try {
            return await apiService.post('/ai/financial-audit', { data });
        } catch (error) {
            console.error('Financial Audit Error:', error);
            return null;
        }
    },

    async conductTechAudit(stack: string): Promise<any> {
        try {
            return await apiService.post('/ai/tech-audit', { stack });
        } catch (error) {
            console.error('Tech Audit Error:', error);
            return null;
        }
    },

    // Legal & Sales
    async generateColdEmail(contact: any): Promise<any> {
        try {
            return await apiService.post('/ai/cold-email', { contact });
        } catch (error) {
            console.error('Cold Email Error:', error);
            return null;
        }
    },

    async generateNegotiationPrep(contact: any): Promise<any> {
        try {
            return await apiService.post('/ai/negotiation-prep', { contact });
        } catch (error) {
            console.error('Negotiation Prep Error:', error);
            return null;
        }
    },

    async draftLegalDoc(type: string, details: string): Promise<any> {
        try {
            return await apiService.post('/ai/legal-doc', { type, details });
        } catch (error) {
            console.error('Legal Doc Error:', error);
            return null;
        }
    },

    async analyzeContract(text: string): Promise<any> {
        try {
            return await apiService.post('/ai/contract-analysis', { text });
        } catch (error) {
            console.error('Contract Analysis Error:', error);
            return null;
        }
    },

    // Mental & Roleplay
    async generateStoicCoaching(mood: string | any, stressLevel?: number, primaryBlocker?: string): Promise<any> {
        try {
            return await apiService.post('/ai/stoic-coaching', { mood, stressLevel, primaryBlocker });
        } catch (error) {
            console.error('Stoic Coaching Error:', error);
            return null;
        }
    },

    async getRoleplayReply(scenario: any, history: any[], userInput: string): Promise<string> {
        try {
            const response = await apiService.post('/ai/roleplay-reply', { scenario, history, userInput });
            return response.text;
        } catch (error) {
            console.error('Roleplay Reply Error:', error);
            return "...";
        }
    },

    async evaluateRoleplaySession(scenario: any, history: any[]): Promise<any> {
        try {
            return await apiService.post('/ai/roleplay-feedback', { scenario, history });
        } catch (error) {
            console.error('Roleplay Feedback Error:', error);
            return null;
        }
    },

    // Misc
    async generateBrandImage(promptUser: string, styleDesc: string): Promise<string | null> {
        try {
            const response = await apiService.post('/ai/brand-image', { promptUser, styleDesc });
            return response.image;
        } catch (error) {
            console.error('Image Gen Error:', error);
            return null;
        }
    },

    async generateCodeSolution(problem: string): Promise<any> {
        try {
            return await apiService.post('/ai/code-solution', { problem });
        } catch (error) {
            console.error('Code Solution Error:', error);
            return null;
        }
    },

    async runSimulation(scenario: string): Promise<any> {
        try {
            return await apiService.post('/ai/simulation', { scenario });
        } catch (error) {
            console.error('Simulation Error:', error);
            return null;
        }
    },

    async generateMarketPulse(context?: any): Promise<any> {
        try {
            return await apiService.post('/ai/market-pulse', { context });
        } catch (error) {
            console.error('Market Pulse Error:', error);
            return null;
        }
    },

    async generateProductSpec(idea: string): Promise<any> {
        try {
            return await apiService.post('/ai/product-spec', { idea });
        } catch (error) {
            console.error('Product Spec Error:', error);
            return null;
        }
    }
};