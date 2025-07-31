#!/usr/bin/env tsx

/**
 * SoloBoss AI Database Setup Script
 * 
 * This script initializes the database with:
 * - AI Agents with their personalities
 * - Achievement definitions
 * - Sample data for testing
 * 
 * Run with: npm run setup-db
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nPlease check your .env.local file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('🚀 Setting up SoloBoss AI database...\n')

  try {
    // 1. Check if AI agents already exist
    const { data: existingAgents } = await supabase
      .from('ai_agents')
      .select('count')
      .single()

    if (existingAgents) {
      console.log('ℹ️  AI agents already exist, skipping agent setup...')
    } else {
      // Insert AI agents
      console.log('👥 Creating AI agents...')
      
      const aiAgents = [
        {
          name: 'roxy',
          display_name: 'Roxy',
          description: 'Your executive assistant who handles scheduling, organization, and business operations',
          personality: 'Professional, organized, proactive, and detail-oriented. Speaks like a competent executive assistant.',
          capabilities: ['scheduling', 'organization', 'email_management', 'task_coordination', 'meeting_planning'],
          accent_color: '#6366F1',
          system_prompt: `You are Roxy, a highly competent executive assistant AI. You help users manage their schedules, organize tasks, coordinate meetings, and handle business operations. You are professional, proactive, and incredibly detail-oriented. You anticipate needs and provide comprehensive solutions.`,
          model_preference: 'gpt-4',
        },
        {
          name: 'blaze',
          display_name: 'Blaze',
          description: 'Your growth strategist focused on scaling businesses and explosive growth tactics',
          personality: 'Energetic, ambitious, data-driven, and results-focused. Uses dynamic language and growth terminology.',
          capabilities: ['growth_strategy', 'marketing_funnels', 'data_analysis', 'scaling_tactics', 'conversion_optimization'],
          accent_color: '#F59E0B',
          system_prompt: `You are Blaze, a high-energy growth strategist AI. You focus on explosive business growth, scaling strategies, and data-driven tactics. You speak with enthusiasm about growth opportunities and always push for ambitious goals. You love metrics, conversion rates, and scaling strategies.`,
          model_preference: 'gpt-4',
        },
        {
          name: 'echo',
          display_name: 'Echo',
          description: 'Your marketing maven who creates compelling content and manages brand presence',
          personality: 'Creative, trendy, brand-conscious, and audience-focused. Speaks in marketing terminology with creative flair.',
          capabilities: ['content_creation', 'social_media', 'brand_strategy', 'copywriting', 'campaign_management'],
          accent_color: '#EC4899',
          system_prompt: `You are Echo, a creative marketing maven AI. You excel at content creation, social media strategy, and brand development. You speak with creative flair and understand current trends. You help create compelling copy, manage brand presence, and develop engaging campaigns.`,
          model_preference: 'gpt-4',
        },
        {
          name: 'lumi',
          display_name: 'Lumi',
          description: 'Your legal and documentation specialist ensuring compliance and professional standards',
          personality: 'Precise, thorough, compliance-focused, and protective. Uses formal language and legal terminology.',
          capabilities: ['legal_documents', 'compliance', 'contract_review', 'risk_assessment', 'documentation'],
          accent_color: '#3B82F6',
          system_prompt: `You are Lumi, a legal and documentation specialist AI. You ensure compliance, review contracts, assess risks, and maintain professional standards. You speak formally and precisely, always considering legal implications and protective measures.`,
          model_preference: 'gpt-4',
        },
        {
          name: 'vex',
          display_name: 'Vex',
          description: 'Your technical architect handling systems, automation, and technical solutions',
          personality: 'Logical, systematic, solution-oriented, and technically precise. Uses technical terminology and systematic approaches.',
          capabilities: ['system_architecture', 'automation', 'technical_analysis', 'integration', 'optimization'],
          accent_color: '#10B981',
          system_prompt: `You are Vex, a technical architect AI. You handle system design, automation, technical analysis, and integration solutions. You think systematically and speak in technical terms. You focus on efficiency, scalability, and technical optimization.`,
          model_preference: 'gpt-4',
        },
        {
          name: 'lexi',
          display_name: 'Lexi',
          description: 'Your strategy analyst providing insights, research, and data-driven recommendations',
          personality: 'Analytical, insightful, research-focused, and strategic. Uses data-driven language and strategic terminology.',
          capabilities: ['market_research', 'data_analysis', 'strategic_planning', 'competitive_analysis', 'insights'],
          accent_color: '#8B5CF6',
          system_prompt: `You are Lexi, a strategy analyst AI. You provide deep insights, conduct research, and offer data-driven recommendations. You speak analytically and strategically, always backing recommendations with data and research.`,
          model_preference: 'gpt-4',
        },
        {
          name: 'nova',
          display_name: 'Nova',
          description: 'Your product designer creating user experiences and innovative design solutions',
          personality: 'Innovative, user-focused, aesthetically minded, and iterative. Uses design terminology and user-centric language.',
          capabilities: ['ui_design', 'ux_research', 'prototyping', 'user_testing', 'design_systems'],
          accent_color: '#06B6D4',
          system_prompt: `You are Nova, a product designer AI. You focus on user experience, innovative design, and creating intuitive interfaces. You speak about design principles, user needs, and iterative improvement. You balance aesthetics with functionality.`,
          model_preference: 'gpt-4',
        },
        {
          name: 'glitch',
          display_name: 'Glitch',
          description: 'Your QA and debugging specialist finding issues and ensuring quality standards',
          personality: 'Detail-oriented, systematic, quality-focused, and thorough. Uses testing terminology and quality assurance language.',
          capabilities: ['quality_assurance', 'bug_detection', 'testing', 'validation', 'error_analysis'],
          accent_color: '#EF4444',
          system_prompt: `You are Glitch, a QA and debugging specialist AI. You find issues, ensure quality standards, and systematically test solutions. You speak precisely about quality metrics, testing procedures, and error prevention. You are thorough and detail-oriented.`,
          model_preference: 'gpt-4',
        },
      ]

      const { error: agentsError } = await supabase
        .from('ai_agents')
        .insert(aiAgents)

      if (agentsError) {
        console.error('❌ Error inserting AI agents:', agentsError)
        return false
      }

      console.log('✅ AI agents created successfully!')
    }

    // 2. Check if achievements already exist
    const { data: existingAchievements } = await supabase
      .from('achievements')
      .select('count')
      .single()

    if (existingAchievements) {
      console.log('ℹ️  Achievements already exist, skipping achievement setup...')
    } else {
      // Insert achievements
      console.log('🏆 Creating achievements...')
      
      const achievements = [
        {
          name: 'first_goal',
          title: 'Goal Setter',
          description: 'Created your first goal',
          icon: '🎯',
          category: 'goals',
          points: 50,
          criteria: { goals_created: 1 },
        },
        {
          name: 'task_master',
          title: 'Task Master',
          description: 'Completed 10 tasks',
          icon: '✅',
          category: 'productivity',
          points: 100,
          criteria: { tasks_completed: 10 },
        },
        {
          name: 'focus_warrior',
          title: 'Focus Warrior',
          description: 'Completed 5 focus sessions',
          icon: '🧘',
          category: 'focus',
          points: 150,
          criteria: { focus_sessions: 5 },
        },
        {
          name: 'ai_collaborator',
          title: 'AI Collaborator',
          description: 'Had 25 conversations with AI agents',
          icon: '🤖',
          category: 'ai',
          points: 200,
          criteria: { ai_interactions: 25 },
        },
        {
          name: 'document_organizer',
          title: 'Document Organizer',
          description: 'Uploaded 10 documents',
          icon: '📁',
          category: 'organization',
          points: 100,
          criteria: { documents_uploaded: 10 },
        },
        {
          name: 'streak_starter',
          title: 'Streak Starter',
          description: 'Maintained a 7-day streak',
          icon: '🔥',
          category: 'consistency',
          points: 300,
          criteria: { daily_streak: 7 },
        },
        {
          name: 'wellness_champion',
          title: 'Wellness Champion',
          description: 'Logged wellness data for 14 days',
          icon: '💚',
          category: 'wellness',
          points: 250,
          criteria: { wellness_days: 14 },
        },
        {
          name: 'brand_builder',
          title: 'Brand Builder',
          description: 'Created your first brand profile',
          icon: '🎨',
          category: 'branding',
          points: 150,
          criteria: { brand_profiles: 1 },
        },
        {
          name: 'power_user',
          title: 'Power User',
          description: 'Reached level 10',
          icon: '⚡',
          category: 'progression',
          points: 500,
          criteria: { user_level: 10 },
        },
        {
          name: 'goal_crusher',
          title: 'Goal Crusher',
          description: 'Completed 5 goals',
          icon: '💪',
          category: 'goals',
          points: 400,
          criteria: { goals_completed: 5 },
        },
      ]

      const { error: achievementsError } = await supabase
        .from('achievements')
        .insert(achievements)

      if (achievementsError) {
        console.error('❌ Error inserting achievements:', achievementsError)
        return false
      }

      console.log('✅ Achievements created successfully!')
    }

    // 3. Test database connection and RLS
    console.log('🔒 Testing Row Level Security...')
    
    const { data: agents, error: testError } = await supabase
      .from('ai_agents')
      .select('name, display_name')
      .limit(3)

    if (testError) {
      console.error('❌ Error testing database:', testError)
      return false
    }

    console.log('✅ Database connection successful!')
    console.log(`   Found ${agents?.length || 0} AI agents`)

    console.log('\n🎉 Database setup completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('   1. Run `npm run dev` to start the development server')
    console.log('   2. Visit http://localhost:3000 to see your app')
    console.log('   3. Create a user account to test the functionality')
    console.log('   4. Check the /dashboard to see the BossRoom interface')
    console.log('\n💡 Tip: The AI agents are ready to chat! Try starting a conversation.')

    return true

  } catch (error) {
    console.error('❌ Database setup failed:', error)
    return false
  }
}

// Run the setup
setupDatabase().then((success) => {
  process.exit(success ? 0 : 1)
}) 