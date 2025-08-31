// Competitor Intelligence Type Definitions
// Based on the database schema and design requirements

export type ThreatLevel = 'low' | 'medium' | 'high' | 'critical';
export type MonitoringStatus = 'active' | 'paused' | 'archived';
export type FundingStage = 'seed' | 'series-a' | 'series-b' | 'series-c' | 'ipo' | 'private';
export type SourceType = 'website' | 'social_media' | 'news' | 'job_posting' | 'app_store' | 'manual';
export type ImportanceLevel = 'low' | 'medium' | 'high' | 'critical';
export type AlertSeverity = 'info' | 'warning' | 'urgent' | 'critical';

// Social Media Handles
export interface SocialMediaHandles {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
}

// Key Personnel
export interface KeyPerson {
  name: string;
  role: string;
  linkedinProfile?: string;
  joinedDate?: string;
  previousCompanies: string[];
}

// Product Information
export interface Product {
  name: string;
  description?: string;
  category?: string;
  launchDate?: string;
  status: 'active' | 'discontinued' | 'beta';
  features: string[];
}

// Market Position
export interface MarketPosition {
  marketShare?: number;
  ranking?: number;
  targetMarkets: string[];
  competitiveAdvantages: string[];
  marketSegments: string[];
}

// Monitoring Configuration
export interface MonitoringConfig {
  websiteMonitoring: boolean;
  socialMediaMonitoring: boolean;
  newsMonitoring: boolean;
  jobPostingMonitoring: boolean;
  appStoreMonitoring: boolean;
  monitoringFrequency: 'hourly' | 'daily' | 'weekly';
  alertThresholds: {
    pricing: boolean;
    productLaunches: boolean;
    hiring: boolean;
    funding: boolean;
    partnerships: boolean;
  };
}

// Competitor Profile
export interface CompetitorProfile {
  id: number;
  userId: string;
  name: string;
  domain?: string;
  description?: string;
  industry?: string;
  headquarters?: string;
  foundedYear?: number;
  employeeCount?: number;
  fundingAmount?: number;
  fundingStage?: FundingStage;
  threatLevel: ThreatLevel;
  monitoringStatus: MonitoringStatus;
  socialMediaHandles: SocialMediaHandles;
  keyPersonnel: KeyPerson[];
  products: Product[];
  marketPosition: MarketPosition;
  competitiveAdvantages: string[];
  vulnerabilities: string[];
  monitoringConfig: MonitoringConfig;
  lastAnalyzed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Extracted Data from Intelligence Collection
export interface ExtractedData {
  title?: string;
  content?: string;
  metadata: Record<string, any>;
  entities: Entity[];
  sentiment?: SentimentScore;
  topics: string[];
  keyInsights: string[];
}

// Entity Recognition
export interface Entity {
  text: string;
  type: 'person' | 'organization' | 'location' | 'product' | 'technology' | 'other';
  confidence: number;
}

// Sentiment Analysis
export interface SentimentScore {
  score: number; // -1 to 1
  magnitude: number; // 0 to 1
  label: 'positive' | 'negative' | 'neutral';
}

// Analysis Results from AI Agents
export interface AnalysisResult {
  agentId: string;
  analysisType: string;
  insights: Insight[];
  recommendations: Recommendation[];
  confidence: number;
  analyzedAt: Date;
}

// Insights from AI Analysis
export interface Insight {
  id: string;
  type: 'marketing' | 'strategic' | 'product' | 'pricing' | 'technical' | 'opportunity' | 'threat';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
  supportingData: any[];
}

// Recommendations from AI Analysis
export interface Recommendation {
  id: string;
  type: 'defensive' | 'offensive' | 'monitoring' | 'strategic';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedEffort: string;
  potentialImpact: string;
  timeline: string;
  actionItems: string[];
}

// Intelligence Data Entry
export interface IntelligenceData {
  id: number;
  competitorId: number;
  userId: string;
  sourceType: SourceType;
  sourceUrl?: string;
  dataType: string;
  rawContent?: any;
  extractedData: ExtractedData;
  analysisResults: AnalysisResult[];
  confidence: number;
  importance: ImportanceLevel;
  tags: string[];
  collectedAt: Date;
  processedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Action Items for Alerts
export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedEffort: string;
  potentialImpact: string;
  recommendedBy: string;
  dueDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
}

// Competitor Alert
export interface CompetitorAlert {
  id: number;
  competitorId: number;
  userId: string;
  intelligenceId?: number;
  alertType: string;
  severity: AlertSeverity;
  title: string;
  description?: string;
  sourceData: Record<string, any>;
  actionItems: ActionItem[];
  recommendedActions: Recommendation[];
  isRead: boolean;
  isArchived: boolean;
  acknowledgedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Alert Types
export type AlertType = 
  | 'product_launch'
  | 'pricing_change'
  | 'funding_announcement'
  | 'key_hire'
  | 'partnership'
  | 'acquisition'
  | 'negative_news'
  | 'website_change'
  | 'social_media_activity'
  | 'job_posting'
  | 'app_update'
  | 'market_expansion'
  | 'competitive_threat'
  | 'opportunity_detected';

// Database Insert Types (without auto-generated fields)
export type CompetitorProfileInsert = Omit<CompetitorProfile, 'id' | 'createdAt' | 'updatedAt'>;
export type IntelligenceDataInsert = Omit<IntelligenceData, 'id' | 'createdAt' | 'updatedAt'>;
export type CompetitorAlertInsert = Omit<CompetitorAlert, 'id' | 'createdAt' | 'updatedAt'>;

// Database Update Types (partial updates)
export type CompetitorProfileUpdate = Partial<Omit<CompetitorProfile, 'id' | 'userId' | 'createdAt'>>;
export type IntelligenceDataUpdate = Partial<Omit<IntelligenceData, 'id' | 'competitorId' | 'userId' | 'createdAt'>>;
export type CompetitorAlertUpdate = Partial<Omit<CompetitorAlert, 'id' | 'competitorId' | 'userId' | 'createdAt'>>;

// Query Filter Types
export interface CompetitorFilters {
  threatLevel?: ThreatLevel[];
  monitoringStatus?: MonitoringStatus[];
  industry?: string[];
  fundingStage?: FundingStage[];
  search?: string;
}

export interface IntelligenceFilters {
  competitorIds?: number[];
  sourceTypes?: SourceType[];
  dataTypes?: string[];
  importance?: ImportanceLevel[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
}

export interface AlertFilters {
  competitorIds?: number[];
  alertTypes?: AlertType[];
  severity?: AlertSeverity[];
  isRead?: boolean;
  isArchived?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// API Response Types
export interface CompetitorProfileWithStats extends CompetitorProfile {
  intelligenceCount: number;
  alertCount: number;
  lastIntelligenceDate?: Date;
  lastAlertDate?: Date;
}

export interface IntelligenceDataWithCompetitor extends IntelligenceData {
  competitor: Pick<CompetitorProfile, 'id' | 'name' | 'domain' | 'threatLevel'>;
}

export interface CompetitorAlertWithDetails extends CompetitorAlert {
  competitor: Pick<CompetitorProfile, 'id' | 'name' | 'domain' | 'threatLevel'>;
  intelligence?: Pick<IntelligenceData, 'id' | 'sourceType' | 'dataType' | 'sourceUrl'>;
}