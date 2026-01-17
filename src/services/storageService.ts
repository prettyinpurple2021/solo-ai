import { logError, logWarn, logInfo } from '@/lib/logger';
import {
    UserProgress, Task, ChatMessage, CompetitorReport, BusinessContext, BrandDNA,
    PitchDeck, CreativeAsset, Contact, LaunchStrategy, TribeBlueprint,
    SOP, JobDescription, InterviewGuide, ProductSpec, PivotAnalysis,
    BoardMeetingReport, SavedCodeSnippet, SavedWarRoomSession,
    RoleplayFeedback, ContentAmplification, SimulationResult
} from '../types';

// Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const USE_BACKEND = process.env.NEXT_PUBLIC_USE_BACKEND_STORAGE !== 'false'; // Default to true

const DELAY = 50;
const delay = () => new Promise(resolve => setTimeout(resolve, DELAY));

// Storage Keys for localStorage fallback
const KEYS = {
    PROGRESS: 'solo_user_progress',
    TASKS: 'solo_tactical_tasks',
    CONTEXT: 'solo_business_context',
    REPORTS: 'solo_competitor_reports',
    BRAND_DNA: 'solo_brand_dna',
    PITCH_DECKS: 'solo_pitch_decks',
    CREATIVE_ASSETS: 'solo_creative_assets',
    CONTACTS: 'solo_contacts',
    LAUNCH_STRATEGIES: 'solo_launch_strategies',
    TRIBE_BLUEPRINTS: 'solo_tribe_blueprints',
    SOPS: 'solo_sops',
    JOB_DESCRIPTIONS: 'solo_job_descriptions',
    INTERVIEW_GUIDES: 'solo_interview_guides',
    PRODUCT_SPECS: 'solo_product_specs',
    PIVOT_ANALYSES: 'solo_pivot_analyses',
    BOARD_REPORTS: 'solo_board_reports',
    CODE_SNIPPETS: 'solo_code_snippets',
    WAR_ROOM_SESSIONS: 'solo_war_room_sessions',
    LEGAL_DOCS: 'solo_legal_docs',
    TRAINING_HISTORY: 'solo_training_history',
    CHAT_PREFIX: 'solo_chat_history_'
};

// ===== HELPER FUNCTIONS =====

// Generic Get/Set for localStorage fallback
const get = <T>(key: string, defaultVal: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultVal;
    } catch (e) {
        logError(`Error reading ${key}`, e);
        return defaultVal;
    }
};

const set = <T>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        logError(`Error writing ${key}`, e);
    }
};

// API helper with fallback and authentication
async function apiCall<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    fallbackKey?: string,
    fallbackValue?: T
): Promise<T> {
    if (!USE_BACKEND) {
        await delay();
        if (fallbackKey) {
            if (body !== undefined && (method === 'POST' || method === 'PUT')) {
                set(fallbackKey, body);
                return body as T;
            }
            return get<T>(fallbackKey, fallbackValue as T);
        }
        throw new Error('Backend disabled and no fallback key provided');
    }

    try {
        // Get Stack Auth user ID
        const stackApp = (window as unknown as { stackApp?: { user?: { id?: string } } }).stackApp;
        const userId = stackApp?.user?.id || '';

        const options: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'x-stack-user-id': userId, // Pass user ID to backend
            }
        };

        if (body !== undefined) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_URL}${endpoint}`, options);

        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }

        const data = await response.json();

        // Cache in localStorage for offline fallback
        if (fallbackKey && data) {
            set(fallbackKey, data);
        }

        return data as T;
    } catch (error) {
        logWarn(`API call failed, using localStorage fallback:`, error);
        // Fallback to localStorage
        if (fallbackKey) {
            return get<T>(fallbackKey, fallbackValue as T);
        }
        throw error;
    }
}

// ===== SERVICE EXPORTS =====

export const storageService = {
    // --- User Progress ---
    async getUserProgress(): Promise<UserProgress> {
        const defaultProgress: UserProgress = {
            level: 1, currentXP: 0, nextLevelXP: 100, rankTitle: 'Garage Hacker', totalActions: 0, achievements: []
        };

        try {
            const user = await apiCall<Record<string, unknown>>('GET', '/api/user', undefined, KEYS.PROGRESS, defaultProgress as unknown as Record<string, unknown>);
            // Map backend user to UserProgress format
            return {
                level: Number(user.level) || 1,
                currentXP: Number(user.xp) || 0,
                nextLevelXP: Number(user.nextLevelXP) || 100,
                rankTitle: String(user.rankTitle || 'Garage Hacker'),
                totalActions: Number(user.totalActions) || 0,
                achievements: Array.isArray(user.achievements) ? user.achievements as string[] : []
            };
        } catch (error) {
            return defaultProgress;
        }
    },

    async saveUserProgress(progress: UserProgress): Promise<void> {
        await apiCall('POST', '/api/user/progress', {
            xp: progress.currentXP,
            level: progress.level,
            totalActions: progress.totalActions
        } as unknown, KEYS.PROGRESS, progress);
    },

    // --- Tasks ---
    async getTasks(): Promise<Task[]> {
        return apiCall<Task[]>('GET', '/api/tasks', undefined, KEYS.TASKS, []);
    },

    async saveTasks(tasks: Task[]): Promise<void> {
        await apiCall('POST', '/api/tasks/batch', tasks, KEYS.TASKS, tasks);
    },

    async addTask(task: Task): Promise<void> {
        await apiCall('POST', '/api/tasks', task, KEYS.TASKS);
        // Also update cache
        const tasks = await this.getTasks();
        tasks.unshift(task);
        set(KEYS.TASKS, tasks);
    },

    async updateTask(taskId: string, updates: Partial<Task>): Promise<Task[]> {
        const tasks = await this.getTasks();
        const updated = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
        await this.saveTasks(updated);
        return updated;
    },

    async deleteTask(taskId: string): Promise<void> {
        await apiCall('DELETE', `/api/tasks/${taskId}`);
        const tasks = await this.getTasks();
        const filtered = tasks.filter(t => t.id !== taskId);
        set(KEYS.TASKS, filtered);
    },

    async clearTasks(): Promise<void> {
        await apiCall('DELETE', '/api/tasks');
        set(KEYS.TASKS, []);
    },

    // --- Chat History ---
    async getChatHistory(agentId: string): Promise<ChatMessage[]> {
        try {
            const history = await apiCall<Record<string, unknown>[]>('GET', `/api/chat/${agentId}`, undefined, `${KEYS.CHAT_PREFIX}${agentId}`, []);
            // Map backend format to ChatMessage
            return history.map(h => ({
                role: (h.role as 'user' | 'model') || 'user',
                text: String(h.text || ''),
                timestamp: parseInt(String(h.timestamp || '0'))
            }));
        } catch (error) {
            return [];
        }
    },

    async saveChatHistory(agentId: string, messages: ChatMessage[]): Promise<void> {
        await apiCall('POST', '/api/chat', { agentId, messages }, `${KEYS.CHAT_PREFIX}${agentId}`, messages);
    },

    async clearChatHistory(agentId: string): Promise<void> {
        await apiCall('POST', '/api/chat', { agentId, messages: [] }, `${KEYS.CHAT_PREFIX}${agentId}`, []);
        localStorage.removeItem(`${KEYS.CHAT_PREFIX}${agentId}`);
    },

    // --- Business Context ---
    async getContext(): Promise<BusinessContext | null> {
        return apiCall<BusinessContext | null>('GET', '/api/context', undefined, KEYS.CONTEXT, null);
    },

    async saveContext(context: BusinessContext): Promise<void> {
        await apiCall('POST', '/api/context', context, KEYS.CONTEXT, context);
    },

    // --- Brand DNA ---
    async getBrandDNA(): Promise<BrandDNA | null> {
        const context = await this.getContext();
        return context?.brandDna || null;
    },

    async saveBrandDNA(dna: BrandDNA): Promise<void> {
        const context = await this.getContext() || {
            id: '',
            userId: '',
            companyName: '',
            founderName: '',
            industry: '',
            description: '',
            brandDna: dna,
            goals: [],
            updatedAt: new Date().toISOString()
        };
        context.brandDna = dna;
        await this.saveContext(context);
    },

    // --- Competitor Reports ---
    async getCompetitorReports(): Promise<CompetitorReport[]> {
        return apiCall<CompetitorReport[]>('GET', '/api/resources/competitor-reports', undefined, KEYS.REPORTS, []);
    },

    async saveCompetitorReport(report: CompetitorReport): Promise<void> {
        await apiCall('POST', '/api/resources/competitor-reports', report, KEYS.REPORTS);
        const reports = await this.getCompetitorReports();
        reports.unshift(report);
        set(KEYS.REPORTS, reports);
    },

    // Alias for getCompetitorReports
    async getCompetitors(): Promise<CompetitorReport[]> {
        return this.getCompetitorReports();
    },

    // --- Pitch Decks ---
    async getPitchDecks(): Promise<PitchDeck[]> {
        return apiCall<PitchDeck[]>('GET', '/api/pitch-decks', null, KEYS.PITCH_DECKS, []);
    },

    async savePitchDeck(deck: PitchDeck): Promise<void> {
        await apiCall('POST', '/api/pitch-decks', deck, KEYS.PITCH_DECKS);
    },

    // --- Creative Assets ---
    async getCreativeAssets(): Promise<CreativeAsset[]> {
        return apiCall<CreativeAsset[]>('GET', '/api/resources/creative', undefined, KEYS.CREATIVE_ASSETS, []);
    },

    async saveCreativeAsset(asset: CreativeAsset): Promise<void> {
        await apiCall('POST', '/api/resources/creative', asset, KEYS.CREATIVE_ASSETS);
        const assets = await this.getCreativeAssets();
        assets.unshift(asset);
        set(KEYS.CREATIVE_ASSETS, assets);
    },

    // --- Contacts ---
    async getContacts(): Promise<Contact[]> {
        return apiCall<Contact[]>('GET', '/api/contacts', null, KEYS.CONTACTS, []);
    },

    async saveContact(contact: Contact): Promise<void> {
        if (contact.id) {
            await apiCall('PUT', `/api/contacts/${contact.id}`, contact, KEYS.CONTACTS);
        } else {
            await apiCall('POST', '/api/contacts', contact, KEYS.CONTACTS);
        }
    },

    // --- Launch Strategies ---
    async getLaunchStrategies(): Promise<LaunchStrategy[]> {
        return apiCall<LaunchStrategy[]>('GET', '/api/resources/launch', undefined, KEYS.LAUNCH_STRATEGIES, []);
    },

    async saveLaunchStrategy(strategy: LaunchStrategy): Promise<void> {
        await apiCall('POST', '/api/resources/launch', strategy, KEYS.LAUNCH_STRATEGIES);
        const items = await this.getLaunchStrategies();
        items.unshift(strategy);
        set(KEYS.LAUNCH_STRATEGIES, items);
    },

    // --- Tribe Blueprints ---
    async getTribeBlueprints(): Promise<TribeBlueprint[]> {
        return apiCall<TribeBlueprint[]>('GET', '/api/resources/tribe', undefined, KEYS.TRIBE_BLUEPRINTS, []);
    },

    async saveTribeBlueprint(blueprint: TribeBlueprint): Promise<void> {
        await apiCall('POST', '/api/resources/tribe', blueprint, KEYS.TRIBE_BLUEPRINTS);
        const items = await this.getTribeBlueprints();
        items.unshift(blueprint);
        set(KEYS.TRIBE_BLUEPRINTS, items);
    },

    // --- SOPs & HR ---
    async getSOPs(): Promise<SOP[]> {
        return apiCall<SOP[]>('GET', '/api/resources/sops', undefined, KEYS.SOPS, []);
    },

    async saveSOP(sop: SOP): Promise<void> {
        await apiCall('POST', '/api/resources/sops', sop, KEYS.SOPS);
        const items = await this.getSOPs();
        items.unshift(sop);
        set(KEYS.SOPS, items);
    },

    async getJobDescriptions(): Promise<JobDescription[]> {
        return apiCall<JobDescription[]>('GET', '/api/resources/job-descriptions', undefined, KEYS.JOB_DESCRIPTIONS, []);
    },

    async saveJobDescription(jd: JobDescription): Promise<void> {
        await apiCall('POST', '/api/resources/job-descriptions', jd, KEYS.JOB_DESCRIPTIONS);
        const items = await this.getJobDescriptions();
        items.unshift(jd);
        set(KEYS.JOB_DESCRIPTIONS, items);
    },

    async getInterviewGuides(): Promise<InterviewGuide[]> {
        return apiCall<InterviewGuide[]>('GET', '/api/resources/interview-guides', undefined, KEYS.INTERVIEW_GUIDES, []);
    },

    async saveInterviewGuide(guide: InterviewGuide): Promise<void> {
        await apiCall('POST', '/api/resources/interview-guides', guide, KEYS.INTERVIEW_GUIDES);
        const items = await this.getInterviewGuides();
        items.unshift(guide);
        set(KEYS.INTERVIEW_GUIDES, items);
    },

    // --- Product Specs ---
    async getProductSpecs(): Promise<ProductSpec[]> {
        return apiCall<ProductSpec[]>('GET', '/api/resources/product-specs', undefined, KEYS.PRODUCT_SPECS, []);
    },

    async saveProductSpec(spec: ProductSpec): Promise<void> {
        await apiCall('POST', '/api/resources/product-specs', spec, KEYS.PRODUCT_SPECS);
        const items = await this.getProductSpecs();
        items.unshift(spec);
        set(KEYS.PRODUCT_SPECS, items);
    },

    async saveProductSpecs(specs: ProductSpec[]): Promise<void> {
        // Optimized: Parallel execution using Promise.allSettled for robustness
        // Future: Implement true batch API endpoint '/api/resources/product-specs/batch'
        const results = await Promise.allSettled(specs.map(spec => this.saveProductSpec(spec)));
        
        // Log any failures
        const failures = results.filter(r => r.status === 'rejected');
        if (failures.length > 0) {
            logError(`Failed to save ${failures.length} product specs`, failures);
            throw new Error(`Batch save failed for ${failures.length} items`);
        }
    },

    // --- Pivot Analyses ---
    async getPivotAnalyses(): Promise<PivotAnalysis[]> {
        return apiCall<PivotAnalysis[]>('GET', '/api/resources/pivot-analyses', undefined, KEYS.PIVOT_ANALYSES, []);
    },

    async savePivotAnalysis(analysis: PivotAnalysis): Promise<void> {
        await apiCall('POST', '/api/resources/pivot-analyses', analysis, KEYS.PIVOT_ANALYSES);
        const items = await this.getPivotAnalyses();
        items.unshift(analysis);
        set(KEYS.PIVOT_ANALYSES, items);
    },

    // --- Board Reports ---
    async getBoardReports(): Promise<BoardMeetingReport[]> {
        return apiCall<BoardMeetingReport[]>('GET', '/api/resources/board-reports', undefined, KEYS.BOARD_REPORTS, []);
    },

    async saveBoardReport(report: BoardMeetingReport): Promise<void> {
        await apiCall('POST', '/api/resources/board-reports', report, KEYS.BOARD_REPORTS);
        const items = await this.getBoardReports();
        items.unshift(report);
        set(KEYS.BOARD_REPORTS, items);
    },

    // --- Code Snippets ---
    async getCodeSnippets(): Promise<SavedCodeSnippet[]> {
        return apiCall<SavedCodeSnippet[]>('GET', '/api/resources/snippets', undefined, KEYS.CODE_SNIPPETS, []);
    },

    async saveCodeSnippet(snippet: SavedCodeSnippet): Promise<void> {
        await apiCall('POST', '/api/resources/snippets', snippet, KEYS.CODE_SNIPPETS);
        const items = await this.getCodeSnippets();
        items.unshift(snippet);
        set(KEYS.CODE_SNIPPETS, items);
    },

    // --- War Room ---
    async getWarRoomSessions(): Promise<SavedWarRoomSession[]> {
        return apiCall<SavedWarRoomSession[]>('GET', '/api/resources/war-room', undefined, KEYS.WAR_ROOM_SESSIONS, []);
    },

    async saveWarRoomSession(session: SavedWarRoomSession): Promise<void> {
        await apiCall('POST', '/api/resources/war-room', session, KEYS.WAR_ROOM_SESSIONS);
        const items = await this.getWarRoomSessions();
        items.unshift(session);
        set(KEYS.WAR_ROOM_SESSIONS, items);
    },

    // --- Legal Docs ---
    async getLegalDocs(): Promise<unknown[]> {
        return apiCall<unknown[]>('GET', '/api/resources/legal-docs', undefined, KEYS.LEGAL_DOCS, []);
    },

    async saveLegalDoc(doc: unknown): Promise<void> {
        await apiCall('POST', '/api/resources/legal-docs', doc, KEYS.LEGAL_DOCS);
        const items = await this.getLegalDocs();
        items.unshift(doc);
        set(KEYS.LEGAL_DOCS, items);
    },

    // --- Training History ---
    async getTrainingHistory(): Promise<RoleplayFeedback[]> {
        return apiCall<RoleplayFeedback[]>('GET', '/api/resources/training', undefined, KEYS.TRAINING_HISTORY, []);
    },

    async saveTrainingResult(result: RoleplayFeedback): Promise<void> {
        await apiCall('POST', '/api/resources/training', result, KEYS.TRAINING_HISTORY);
        const items = await this.getTrainingHistory();
        items.unshift(result);
        set(KEYS.TRAINING_HISTORY, items);
    },

    // --- System Instructions ---
    async getSystemInstructions(agentId: string): Promise<string | null> {
        // Fetch from agent-instructions table
        try {
            const instructions = await apiCall<{ agentId: string, instruction: string }[]>('GET', '/api/resources/agent-instructions', undefined, `solo_agent_prompt_${agentId}`, []);
            const agentInstruction = instructions.find((i) => i.agentId === agentId);
            return agentInstruction ? agentInstruction.instruction : null;
        } catch (e) {
            return null;
        }
    },

    // --- System Management ---
    async clearAll(): Promise<void> {
        await delay();
        localStorage.clear();
    },

    async exportData(): Promise<Record<string, unknown>> {
        await delay();
        const allData: Record<string, unknown> = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('solo_')) {
                allData[key] = localStorage.getItem(key);
            }
        }
        return allData;
    },

    async importData(data: Record<string, unknown>): Promise<void> {
        await delay();
        Object.keys(data).forEach(key => {
            if (key.startsWith('solo_')) {
                const value = data[key];
                if (typeof value === 'string') {
                    localStorage.setItem(key, value);
                }
            }
        });
    },

    // --- Campaigns (The Amplifier) ---
    async getCampaigns(): Promise<ContentAmplification[]> {
        return apiCall<ContentAmplification[]>('GET', '/api/resources/campaigns', undefined, 'solo_campaigns', []);
    },

    async saveCampaign(campaign: ContentAmplification): Promise<void> {
        await apiCall('POST', '/api/resources/campaigns', campaign, 'solo_campaigns');
        const items = await this.getCampaigns();
        items.unshift(campaign);
        set('solo_campaigns', items);
    },

    // --- Simulations (The Simulator) ---
    async getSimulations(): Promise<SimulationResult[]> {
        return apiCall<SimulationResult[]>('GET', '/api/resources/simulations', undefined, 'solo_simulations', []);
    },

    async saveSimulation(simulation: SimulationResult): Promise<void> {
        await apiCall('POST', '/api/resources/simulations', simulation, 'solo_simulations');
        const items = await this.getSimulations();
        items.unshift(simulation);
        set('solo_simulations', items);
    },

    // --- Migration ---
    async migrateLocalToBackend(): Promise<void> {
        if (!USE_BACKEND) {
            logInfo('Migration skipped: Backend not enabled');
            return;
        }

        logInfo('Starting migration to backend...');

        // Progress
        const progress = get<UserProgress | null>(KEYS.PROGRESS, null);
        if (progress) {
            logInfo('Migrating Progress...');
            await this.saveUserProgress(progress);
        }

        // Tasks
        const tasks = get<Task[]>(KEYS.TASKS, []);
        if (tasks.length) {
            logInfo(`Migrating ${tasks.length} Tasks...`);
            await this.saveTasks(tasks);
        }

        // Context
        const context = get<BusinessContext | null>(KEYS.CONTEXT, null);
        if (context) {
            logInfo('Migrating Context...');
            await this.saveContext(context);
        }

        // Competitor Reports
        const reports = get<CompetitorReport[]>(KEYS.REPORTS, []);
        if (reports.length) {
            logInfo(`Migrating ${reports.length} Reports...`);
            for (const r of reports) await this.saveCompetitorReport(r);
        }

        // Pitch Decks
        const decks = get<PitchDeck[]>(KEYS.PITCH_DECKS, []);
        if (decks.length) {
            logInfo(`Migrating ${decks.length} Pitch Decks...`);
            for (const d of decks) await this.savePitchDeck(d);
        }

        // Creative Assets
        const assets = get<CreativeAsset[]>(KEYS.CREATIVE_ASSETS, []);
        if (assets.length) {
            logInfo(`Migrating ${assets.length} Assets...`);
            for (const a of assets) await this.saveCreativeAsset(a);
        }

        // Contacts
        const contacts = get<Contact[]>(KEYS.CONTACTS, []);
        if (contacts.length) {
            logInfo(`Migrating ${contacts.length} Contacts...`);
            for (const c of contacts) await this.saveContact(c);
        }

        // Launch Strategies
        const launches = get<LaunchStrategy[]>(KEYS.LAUNCH_STRATEGIES, []);
        if (launches.length) {
            logInfo(`Migrating ${launches.length} Launch Strategies...`);
            for (const l of launches) await this.saveLaunchStrategy(l);
        }

        // Tribe Blueprints
        const tribes = get<TribeBlueprint[]>(KEYS.TRIBE_BLUEPRINTS, []);
        if (tribes.length) {
            logInfo(`Migrating ${tribes.length} Tribe Blueprints...`);
            for (const t of tribes) await this.saveTribeBlueprint(t);
        }

        // SOPs
        const sops = get<SOP[]>(KEYS.SOPS, []);
        if (sops.length) {
            logInfo(`Migrating ${sops.length} SOPs...`);
            for (const s of sops) await this.saveSOP(s);
        }

        // Job Descriptions
        const jds = get<JobDescription[]>(KEYS.JOB_DESCRIPTIONS, []);
        if (jds.length) {
            logInfo(`Migrating ${jds.length} JDs...`);
            for (const j of jds) await this.saveJobDescription(j);
        }

        // Interview Guides
        const guides = get<InterviewGuide[]>(KEYS.INTERVIEW_GUIDES, []);
        if (guides.length) {
            logInfo(`Migrating ${guides.length} Interview Guides...`);
            for (const g of guides) await this.saveInterviewGuide(g);
        }

        // Product Specs
        const specs = get<ProductSpec[]>(KEYS.PRODUCT_SPECS, []);
        if (specs.length) {
            logInfo(`Migrating ${specs.length} Product Specs...`);
            for (const s of specs) await this.saveProductSpec(s);
        }

        // Pivot Analyses
        const pivots = get<PivotAnalysis[]>(KEYS.PIVOT_ANALYSES, []);
        if (pivots.length) {
            logInfo(`Migrating ${pivots.length} Pivot Analyses...`);
            for (const p of pivots) await this.savePivotAnalysis(p);
        }

        // Board Reports
        const boardReports = get<BoardMeetingReport[]>(KEYS.BOARD_REPORTS, []);
        if (boardReports.length) {
            logInfo(`Migrating ${boardReports.length} Board Reports...`);
            for (const b of boardReports) await this.saveBoardReport(b);
        }

        // Code Snippets
        const snippets = get<SavedCodeSnippet[]>(KEYS.CODE_SNIPPETS, []);
        if (snippets.length) {
            logInfo(`Migrating ${snippets.length} Snippets...`);
            for (const s of snippets) await this.saveCodeSnippet(s);
        }

        // War Room
        const warRooms = get<SavedWarRoomSession[]>(KEYS.WAR_ROOM_SESSIONS, []);
        if (warRooms.length) {
            logInfo(`Migrating ${warRooms.length} War Room Sessions...`);
            for (const w of warRooms) await this.saveWarRoomSession(w);
        }

        // Legal Docs
        const legalDocs = get<unknown[]>(KEYS.LEGAL_DOCS, []);
        if (legalDocs.length) {
            logInfo(`Migrating ${legalDocs.length} Legal Docs...`);
            for (const l of legalDocs) await this.saveLegalDoc(l);
        }

        // Training History
        const training = get<RoleplayFeedback[]>(KEYS.TRAINING_HISTORY, []);
        if (training.length) {
            logInfo(`Migrating ${training.length} Training Records...`);
            for (const t of training) await this.saveTrainingResult(t);
        }

        logInfo('Migration Complete!');
    }
};

logInfo(`📦 Storage Service: ${USE_BACKEND ? '✅ Using backend database' : '⚠️ Using localStorage only'}`);
