export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          subscription_tier: string | null
          subscription_status: string | null
            clerk_customer_id: string | null
  clerk_subscription_id: string | null
          subscription_current_period_start: string | null
          subscription_current_period_end: string | null
          level: number
          total_points: number
          current_streak: number
          wellness_score: number
          focus_minutes: number
          onboarding_completed: boolean
          preferred_ai_agent: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: string | null
          subscription_status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_current_period_start?: string | null
          subscription_current_period_end?: string | null
          level?: number
          total_points?: number
          current_streak?: number
          wellness_score?: number
          focus_minutes?: number
          onboarding_completed?: boolean
          preferred_ai_agent?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: string | null
          subscription_status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_current_period_start?: string | null
          subscription_current_period_end?: string | null
          level?: number
          total_points?: number
          current_streak?: number
          wellness_score?: number
          focus_minutes?: number
          onboarding_completed?: boolean
          preferred_ai_agent?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: 'active' | 'completed' | 'paused' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          target_date: string | null
          completion_date: string | null
          ai_suggestions: Json
          progress_percentage: number
          category: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: 'active' | 'completed' | 'paused' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          target_date?: string | null
          completion_date?: string | null
          ai_suggestions?: Json
          progress_percentage?: number
          category?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: 'active' | 'completed' | 'paused' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          target_date?: string | null
          completion_date?: string | null
          ai_suggestions?: Json
          progress_percentage?: number
          category?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          goal_id: string | null
          title: string
          description: string | null
          status: 'todo' | 'in_progress' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          due_date: string | null
          completed_at: string | null
          estimated_minutes: number | null
          actual_minutes: number | null
          ai_generated: boolean
          ai_suggestions: Json
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_id?: string | null
          title: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          completed_at?: string | null
          estimated_minutes?: number | null
          actual_minutes?: number | null
          ai_generated?: boolean
          ai_suggestions?: Json
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_id?: string | null
          title?: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          completed_at?: string | null
          estimated_minutes?: number | null
          actual_minutes?: number | null
          ai_generated?: boolean
          ai_suggestions?: Json
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_agents: {
        Row: {
          id: string
          name: string
          display_name: string
          description: string
          personality: string
          capabilities: string[]
          accent_color: string
          avatar_url: string | null
          system_prompt: string
          model_preference: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          description: string
          personality: string
          capabilities: string[]
          accent_color: string
          avatar_url?: string | null
          system_prompt: string
          model_preference?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          description?: string
          personality?: string
          capabilities?: string[]
          accent_color?: string
          avatar_url?: string | null
          system_prompt?: string
          model_preference?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          id: string
          user_id: string
          agent_id: string
          title: string | null
          context: Json
          last_message_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          agent_id: string
          title?: string | null
          context?: Json
          last_message_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          agent_id?: string
          title?: string | null
          context?: Json
          last_message_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          metadata: Json
          tokens_used: number | null
          model_used: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          metadata?: Json
          tokens_used?: number | null
          model_used?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          metadata?: Json
          tokens_used?: number | null
          model_used?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          }
        ]
      }
      documents: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string | null
          file_url: string | null
          file_type: string | null
          file_size: number | null
          folder: string
          tags: string[] | null
          is_ai_processed: boolean
          ai_summary: string | null
          ai_insights: Json
          version: number
          is_template: boolean
          template_category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content?: string | null
          file_url?: string | null
          file_type?: string | null
          file_size?: number | null
          folder?: string
          tags?: string[] | null
          is_ai_processed?: boolean
          ai_summary?: string | null
          ai_insights?: Json
          version?: number
          is_template?: boolean
          template_category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string | null
          file_url?: string | null
          file_type?: string | null
          file_size?: number | null
          folder?: string
          tags?: string[] | null
          is_ai_processed?: boolean
          ai_summary?: string | null
          ai_insights?: Json
          version?: number
          is_template?: boolean
          template_category?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      document_versions: {
        Row: {
          id: string
          document_id: string
          version_number: number
          content: string | null
          file_url: string | null
          changes_summary: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          version_number: number
          content?: string | null
          file_url?: string | null
          changes_summary?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          version_number?: number
          content?: string | null
          file_url?: string | null
          changes_summary?: string | null
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      brand_profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          tagline: string | null
          description: string | null
          industry: string | null
          target_audience: string | null
          brand_voice: string | null
          color_palette: Json
          fonts: Json
          logo_url: string | null
          style_guide: Json
          is_primary: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          tagline?: string | null
          description?: string | null
          industry?: string | null
          target_audience?: string | null
          brand_voice?: string | null
          color_palette?: Json
          fonts?: Json
          logo_url?: string | null
          style_guide?: Json
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          tagline?: string | null
          description?: string | null
          industry?: string | null
          target_audience?: string | null
          brand_voice?: string | null
          color_palette?: Json
          fonts?: Json
          logo_url?: string | null
          style_guide?: Json
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      brand_assets: {
        Row: {
          id: string
          brand_profile_id: string
          user_id: string
          name: string
          type: 'logo' | 'image' | 'template' | 'copy' | 'video' | 'other'
          file_url: string | null
          content: string | null
          category: string | null
          tags: string[] | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_profile_id: string
          user_id: string
          name: string
          type: 'logo' | 'image' | 'template' | 'copy' | 'video' | 'other'
          file_url?: string | null
          content?: string | null
          category?: string | null
          tags?: string[] | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_profile_id?: string
          user_id?: string
          name?: string
          type?: 'logo' | 'image' | 'template' | 'copy' | 'video' | 'other'
          file_url?: string | null
          content?: string | null
          category?: string | null
          tags?: string[] | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_assets_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_assets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      focus_sessions: {
        Row: {
          id: string
          user_id: string
          task_id: string | null
          goal_id: string | null
          planned_minutes: number
          actual_minutes: number
          mode: 'focus' | 'break' | 'deep_work' | 'planning'
          status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
          started_at: string | null
          completed_at: string | null
          notes: string | null
          productivity_rating: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_id?: string | null
          goal_id?: string | null
          planned_minutes: number
          actual_minutes?: number
          mode?: 'focus' | 'break' | 'deep_work' | 'planning'
          status?: 'planned' | 'in_progress' | 'completed' | 'cancelled'
          started_at?: string | null
          completed_at?: string | null
          notes?: string | null
          productivity_rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string | null
          goal_id?: string | null
          planned_minutes?: number
          actual_minutes?: number
          mode?: 'focus' | 'break' | 'deep_work' | 'planning'
          status?: 'planned' | 'in_progress' | 'completed' | 'cancelled'
          started_at?: string | null
          completed_at?: string | null
          notes?: string | null
          productivity_rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "focus_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "focus_sessions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "focus_sessions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          }
        ]
      }
      wellness_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          energy_level: number | null
          stress_level: number | null
          motivation_level: number | null
          sleep_hours: number | null
          exercise_minutes: number
          meditation_minutes: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          energy_level?: number | null
          stress_level?: number | null
          motivation_level?: number | null
          sleep_hours?: number | null
          exercise_minutes?: number
          meditation_minutes?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          energy_level?: number | null
          stress_level?: number | null
          motivation_level?: number | null
          sleep_hours?: number | null
          exercise_minutes?: number
          meditation_minutes?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wellness_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          owner_id: string
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          owner_id: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          owner_id?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          permissions: Json
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member'
          permissions?: Json
          joined_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          permissions?: Json
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      achievements: {
        Row: {
          id: string
          name: string
          title: string
          description: string
          icon: string | null
          category: string
          points: number
          criteria: Json
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          title: string
          description: string
          icon?: string | null
          category: string
          points?: number
          criteria: Json
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          title?: string
          description?: string
          icon?: string | null
          category?: string
          points?: number
          criteria?: Json
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          earned_at: string
          progress_data: Json
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          earned_at?: string
          progress_data?: Json
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          earned_at?: string
          progress_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          }
        ]
      }
      daily_stats: {
        Row: {
          id: string
          user_id: string
          date: string
          tasks_completed: number
          focus_minutes: number
          ai_interactions: number
          documents_created: number
          goals_achieved: number
          productivity_score: number
          wellness_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          tasks_completed?: number
          focus_minutes?: number
          ai_interactions?: number
          documents_created?: number
          goals_achieved?: number
          productivity_score?: number
          wellness_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          tasks_completed?: number
          focus_minutes?: number
          ai_interactions?: number
          documents_created?: number
          goals_achieved?: number
          productivity_score?: number
          wellness_score?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_usage: {
        Row: {
          id: string
          user_id: string
          month_year: string
          tasks_completed: number
          ai_interactions: number
          storage_used_gb: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          month_year: string
          tasks_completed?: number
          ai_interactions?: number
          storage_used_gb?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          month_year?: string
          tasks_completed?: number
          ai_interactions?: number
          storage_used_gb?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      // Views are not currently used in the database schema
    }
    Functions: {
      get_or_create_monthly_usage: {
        Args: {
          p_user_id: string
        }
        Returns: {
          id: string
          user_id: string
          month_year: string
          tasks_completed: number
          ai_interactions: number
          storage_used_gb: number
          created_at: string
          updated_at: string
        }
      }
      increment_task_count: {
        Args: {
          p_user_id: string
        }
        Returns: undefined
      }
      increment_ai_interaction: {
        Args: {
          p_user_id: string
        }
        Returns: undefined
      }
      update_storage_usage: {
        Args: {
          p_user_id: string
          p_storage_gb: number
        }
        Returns: undefined
      }
      update_daily_stats: {
        Args: {
          p_user_id: string
          p_stat_type: string
          p_increment?: number
        }
        Returns: undefined
      }
      check_achievements: {
        Args: {
          p_user_id: string
        }
        Returns: {
          achievement_name: string
          title: string
          points: number
        }[]
      }
      update_user_gamification: {
        Args: {
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      // Enums are not currently used in the database schema
    }
    CompositeTypes: {
      // Composite types are not currently used in the database schema
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    ? (Database["public"]["Tables"] & Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof Database["public"]["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof Database["public"]["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends keyof Database["public"]["Enums"] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never

// Helper types for common operations
export type Profile = Tables<'profiles'>
export type Goal = Tables<'goals'>
export type Task = Tables<'tasks'>
export type AIAgent = Tables<'ai_agents'>
export type AIConversation = Tables<'ai_conversations'>
export type AIMessage = Tables<'ai_messages'>
export type Document = Tables<'documents'>
export type BrandProfile = Tables<'brand_profiles'>
export type BrandAsset = Tables<'brand_assets'>
export type FocusSession = Tables<'focus_sessions'>
export type WellnessEntry = Tables<'wellness_entries'>
export type Achievement = Tables<'achievements'>
export type UserAchievement = Tables<'user_achievements'>
export type DailyStat = Tables<'daily_stats'>
export type Team = Tables<'teams'>
export type TeamMember = Tables<'team_members'>
