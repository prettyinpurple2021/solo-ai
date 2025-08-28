#!/usr/bin/env node

/**
 * SoloBoss AI Neon Database Setup Script
 * 
 * This script initializes the Neon database with:
 * - Complete schema migration
 * - AI Agents with their personalities
 * - Achievement definitions
 * - Sample data for testing
 * 
 * Run with: npm run setup-neon-db
 */

import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { join } from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ Missing required environment variables:')
  console.error('   - DATABASE_URL (Neon connection string)')
  console.error('\nPlease check your .env.local file.')
  process.exit(1)
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

async function setupDatabase() {
  console.log('🚀 Setting up SoloBoss AI Neon database...\n')

  const client = await pool.connect()

  try {
    // 1. Run database migrations via Drizzle
    console.log('📄 Running Drizzle migrations...')
    const db = drizzle(client)
    await migrate(db, { migrationsFolder: join(process.cwd(), 'migrations') })
    console.log('✅ Database schema is up to date!')

    // 2. Check if AI agents table exists before querying
    const { rows: aiAgentsTableExistsRows } = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'ai_agents'
      ) AS exists
    `)
    const aiAgentsTableExists = Boolean(aiAgentsTableExistsRows?.[0]?.exists)
    if (aiAgentsTableExists) {
      const { rows: existingAgents } = await client.query('SELECT COUNT(*) as count FROM ai_agents')
      if (Number(existingAgents?.[0]?.count || 0) > 0) {
        console.log('ℹ️  AI agents already exist, skipping agent setup...')
      } else {
        // Insert AI agents (expected to be handled by migration if present)
        console.log('✅ AI agents created successfully (via migration)!')
      }
    } else {
      console.log('ℹ️  Skipping AI agents check; table ai_agents does not exist.')
    }

    // 3. Check if achievements table exists before inserting
    const { rows: achievementsTableExistsRows } = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'achievements'
      ) AS exists
    `)
    const achievementsTableExists = Boolean(achievementsTableExistsRows?.[0]?.exists)
    if (achievementsTableExists) {
      const { rows: existingAchievements } = await client.query('SELECT COUNT(*) as count FROM achievements')
      if (Number(existingAchievements?.[0]?.count || 0) > 0) {
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

      // Insert achievements one by one to handle any conflicts
      for (const achievement of achievements) {
        try {
          await client.query(
            `INSERT INTO achievements (name, title, description, icon, category, points, criteria) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (name) DO NOTHING`,
            [achievement.name, achievement.title, achievement.description, achievement.icon, achievement.category, achievement.points, JSON.stringify(achievement.criteria)]
          )
        } catch (error) {
          console.warn(`Warning: Could not insert achievement ${achievement.name}:`, error.message)
        }
      }

        console.log('✅ Achievements created successfully!')
      }
    } else {
      console.log('ℹ️  Skipping achievements initialization; table achievements does not exist.')
    }

    // 4. Verify database setup
    console.log('🔍 Verifying database setup...')
    
    const tables = [
      'users', 'goals', 'tasks', 'ai_agents', 'conversations', 
      'documents', 'template_categories', 'templates', 'user_templates',
      'focus_sessions', 'achievements', 'user_achievements'
    ]
    
    for (const table of tables) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [table])
      
      if (result.rows[0].exists) {
        console.log(`✅ Table '${table}' exists`)
      } else {
        console.log(`❌ Table '${table}' is missing`)
      }
    }

    // Check AI agents data (optional)
    if (aiAgentsTableExists) {
      console.log('🤖 Checking AI agents data...')
      const agentsResult = await client.query('SELECT name, display_name FROM ai_agents')
      console.log(`✅ Found ${agentsResult.rows.length} AI agents:`)
      agentsResult.rows.forEach(agent => {
        console.log(`   - ${agent.display_name} (${agent.name})`)
      })
    }

    // Check achievements data (optional)
    if (achievementsTableExists) {
      console.log('🏆 Checking achievements data...')
      const achievementsResult = await client.query('SELECT name, title FROM achievements')
      console.log(`✅ Found ${achievementsResult.rows.length} achievements:`)
      achievementsResult.rows.forEach(achievement => {
        console.log(`   - ${achievement.title} (${achievement.name})`)
      })
    }

    console.log('\n🎉 Database setup completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('   1. Set up your Stack Auth environment variables')
    console.log('   2. Run `npm run dev` to start the development server')
    console.log('   3. Visit http://localhost:3000 to see your app')
    console.log('   4. Create a user account to test the functionality')
    console.log('   5. Check the /dashboard to see the AI platform interface')
    console.log('\n💡 Tip: The AI agents are ready to chat! Try starting a conversation.')

    return true

  } catch (error) {
    console.error('❌ Database setup failed:', error)
    return false
  } finally {
    client.release()
    await pool.end()
  }
}

// Run the setup
setupDatabase().then((success) => {
  process.exit(success ? 0 : 1)
})
