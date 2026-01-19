/**
 * Centralized API types for frontend/backend consistency
 * These types ensure that frontend components receive data in the expected format
 */

// Base API response structure
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    timestamp: string
    requestId?: string
    version?: string
  }
}

// Paginated response structure
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// User types
export interface User {
  id: string
  email: string
  full_name: string | null
  username: string | null
  avatar_url?: string | null
  subscription_tier: string
  subscription_status: string
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface AuthUser extends User {
  subscription_tier: string
  subscription_status: string
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null
  current_period_start?: string | null
  current_period_end?: string | null
  cancel_at_period_end?: boolean
}

// Task types
export interface Task {
  id: number
  user_id: string
  goal_id?: number | null
  briefcase_id?: number | null
  parent_task_id?: number | null
  title: string
  description?: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category?: string | null
  tags: string[]
  due_date?: string | null
  estimated_minutes?: number | null
  actual_minutes?: number | null
  energy_level: 'low' | 'medium' | 'high'
  is_recurring: boolean
  recurrence_pattern?: Record<string, unknown>
  ai_suggestions?: unknown
  completed_at?: string | null
  created_at: string
  updated_at: string
}

// Goal types
export interface Goal {
  id: number
  user_id: string
  briefcase_id?: number | null
  title: string
  description?: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  due_date?: string | null
  completed_at?: string | null
  created_at: string
  updated_at: string
}

// Briefcase types
export interface Briefcase {
  id: number
  user_id: string
  title: string
  description?: string | null
  status: 'active' | 'archived' | 'deleted'
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Dashboard types
export interface DashboardStats {
  user: {
    id: string
    email: string
    full_name: string | null
    subscription_tier: string
    onboarding_completed: boolean
  }
  overview: {
    total_tasks: number
    completed_tasks: number
    active_goals: number
    briefcases: number
    conversations: number
  }
  productivity: {
    completion_rate: number
    tasks_this_week: number
    streak_days: number
  }
  competitive: {
    competitors_monitored: number
    intelligence_gathered: number
    alerts_processed: number
  }
}

// Competitor types
export interface CompetitorProfile {
  id: string
  user_id: string
  name: string
  domain?: string | null
  description?: string | null
  industry?: string | null
  headquarters?: string | null
  founded_year?: number | null
  employee_count?: number | null
  funding_amount?: string | number | null
  funding_stage?: string | null
  threat_level: 'low' | 'medium' | 'high' | 'critical'
  monitoring_status: 'active' | 'paused' | 'inactive'
  social_media_handles?: Record<string, string> | null
  key_personnel?: unknown[] | null
  products?: unknown[] | null
  market_position?: Record<string, unknown> | null
  competitive_advantages?: unknown[] | null
  vulnerabilities?: unknown[] | null
  monitoring_config?: Record<string, unknown> | null
  last_analyzed?: string | null
  created_at: string
  updated_at: string
}

// Intelligence types
export interface IntelligenceData {
  id: number
  competitor_id: number
  user_id: string
  source_type: string
  source_url?: string | null
  data_type: string
  raw_content?: unknown
  extracted_data?: unknown
  analysis_results?: unknown[]
  confidence?: number
  importance: 'low' | 'medium' | 'high' | 'critical'
  tags: string[]
  collected_at: string
  processed_at?: string | null
  expires_at?: string | null
  created_at: string
  updated_at: string
  competitor?: CompetitorProfile
}

// Document types
export interface Document {
  id: string
  user_id: string
  folder_id?: number | null
  name: string
  original_name: string
  file_type: string
  mime_type: string
  size: number
  file_url: string
  category: string
  description?: string | null
  tags: string[]
  metadata?: Record<string, unknown>
  ai_insights?: unknown
  is_favorite: boolean
  is_public: boolean
  download_count: number
  view_count: number
  last_accessed?: string | null
  created_at: string
  updated_at: string
}

// Chat types
export interface ChatConversation {
  id: string
  user_id: string
  title: string
  agent_id: string
  agent_name: string
  last_message?: string | null
  last_message_at?: string | null
  message_count: number
  is_archived: boolean
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  conversation_id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  metadata?: Record<string, unknown>
  created_at: string
}

// API Request/Response types
export interface SigninRequest {
  identifier: string
  password: string
  isEmail?: boolean
}

export interface SigninResponse {
  token: string
  user: AuthUser
}

export interface SignupRequest {
  email: string
  password: string
  full_name?: string
  username?: string
}

export interface SignupResponse {
  token: string
  user: AuthUser
}

// Query parameter types
export interface PaginationParams {
  page?: number
  limit?: number
}

export interface TimeRangeParams {
  time_range?: '7d' | '30d' | '90d' | '1y'
}

export interface FilterParams {
  status?: string
  priority?: string
  category?: string
  tags?: string[]
}

// Error types
export interface ApiError {
  success: false
  error: string
  meta?: {
    timestamp: string
    requestId?: string
    version?: string
  }
}

// Utility types
export type ApiResult<T> = ApiResponse<T> | ApiError
export type PaginatedApiResult<T> = PaginatedResponse<T> | ApiError
