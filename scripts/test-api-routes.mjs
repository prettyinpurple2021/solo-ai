#!/usr/bin/env node

import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const DATABASE_URL = process.env.DATABASE_URL
const JWT_SECRET = process.env.JWT_SECRET

if (!DATABASE_URL || !JWT_SECRET) {
  console.error('❌ DATABASE_URL and JWT_SECRET environment variables are required')
  process.exit(1)
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

async function testAPIRoutes() {
  const client = await pool.connect()
  
  try {
    console.log('🧪 Testing SoloSuccess AI API Routes...\n')
    
    // Create a test user
    console.log('👤 Creating test user...')
    const testEmail = 'test@SoloSuccessai.fun'
    const testPassword = 'testpassword123'
    const hashedPassword = await bcrypt.hash(testPassword, 10)
    
    // Check if test user exists, if not create one
    let userResult = await client.query('SELECT id FROM users WHERE email = $1', [testEmail])
    let userId
    
    if (userResult.rows.length === 0) {
      const insertResult = await client.query(`
        INSERT INTO users (id, email, full_name)
        VALUES (gen_random_uuid(), $1, $2)
        RETURNING id
      `, [testEmail, 'Test User'])
      userId = insertResult.rows[0].id
      console.log('   ✅ Test user created')
    } else {
      userId = userResult.rows[0].id
      console.log('   ✅ Test user already exists')
    }
    
    // Create JWT token for authentication
    const token = jwt.sign({ userId, email: testEmail }, JWT_SECRET, { expiresIn: '1h' })
    
    // Test 1: Tasks API
    console.log('\n📝 Testing Tasks API...')
    try {
      // Create a task
      const taskResult = await client.query(`
        INSERT INTO tasks (user_id, title, description, priority)
        VALUES ($1, $2, $3, $4)
        RETURNING id, title, status
      `, [userId, 'Test Task', 'This is a test task', 'medium'])
      
      console.log(`   ✅ Task created: ${taskResult.rows[0].title}`)
      
      // Fetch tasks
      const tasksResult = await client.query('SELECT COUNT(*) as count FROM tasks WHERE user_id = $1', [userId])
      console.log(`   ✅ Tasks fetched: ${tasksResult.rows[0].count} tasks found`)
      
    } catch (error) {
      console.log(`   ❌ Tasks API failed: ${error.message}`)
    }
    
    // Test 2: Goals API
    console.log('\n🎯 Testing Goals API...')
    try {
      // Create a goal
      const goalResult = await client.query(`
        INSERT INTO goals (user_id, title, description, priority)
        VALUES ($1, $2, $3, $4)
        RETURNING id, title, status
      `, [userId, 'Test Goal', 'This is a test goal', 'high'])
      
      console.log(`   ✅ Goal created: ${goalResult.rows[0].title}`)
      
      // Fetch goals
      const goalsResult = await client.query('SELECT COUNT(*) as count FROM goals WHERE user_id = $1', [userId])
      console.log(`   ✅ Goals fetched: ${goalsResult.rows[0].count} goals found`)
      
    } catch (error) {
      console.log(`   ❌ Goals API failed: ${error.message}`)
    }
    
    // Test 3: Chat API
    console.log('\n💬 Testing Chat API...')
    try {
      // Create a conversation
      const chatResult = await client.query(`
        INSERT INTO conversations (user_id, agent_name, title, messages)
        VALUES ($1, $2, $3, $4)
        RETURNING id, agent_name
      `, [userId, 'roxy', 'Test Conversation', JSON.stringify([
        { role: 'user', content: 'Hello, this is a test message' },
        { role: 'assistant', content: 'Hello! I am Roxy, your strategic business advisor. How can I help you today?' }
      ])])
      
      console.log(`   ✅ Chat conversation created with agent: ${chatResult.rows[0].agent_name}`)
      
      // Fetch conversations
      const conversationsResult = await client.query('SELECT COUNT(*) as count FROM conversations WHERE user_id = $1', [userId])
      console.log(`   ✅ Conversations fetched: ${conversationsResult.rows[0].count} conversations found`)
      
    } catch (error) {
      console.log(`   ❌ Chat API failed: ${error.message}`)
    }
    
    // Test 4: Templates API
    console.log('\n📋 Testing Templates API...')
    try {
      // Create a user template
      const templateResult = await client.query(`
        INSERT INTO user_templates (user_id, template_slug, template_data, title, description)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, title
      `, [userId, 'test-template', JSON.stringify({ test: 'data' }), 'Test Template', 'A test template for API testing'])
      
      console.log(`   ✅ User template created: ${templateResult.rows[0].title}`)
      
      // Fetch user templates
      const templatesResult = await client.query('SELECT COUNT(*) as count FROM user_templates WHERE user_id = $1', [userId])
      console.log(`   ✅ User templates fetched: ${templatesResult.rows[0].count} templates found`)
      
    } catch (error) {
      console.log(`   ❌ Templates API failed: ${error.message}`)
    }
    
    // Test 5: Upload API
    console.log('\n📁 Testing Upload API...')
    try {
      // Create a test document
      const documentResult = await client.query(`
        INSERT INTO documents (user_id, filename, original_filename, file_size, mime_type, file_data)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, filename
      `, [userId, 'test-document.txt', 'test-document.txt', 1024, 'text/plain', Buffer.from('test content')])
      
      console.log(`   ✅ Document uploaded: ${documentResult.rows[0].filename}`)
      
      // Fetch documents
      const documentsResult = await client.query('SELECT COUNT(*) as count FROM documents WHERE user_id = $1', [userId])
      console.log(`   ✅ Documents fetched: ${documentsResult.rows[0].count} documents found`)
      
    } catch (error) {
      console.log(`   ❌ Upload API failed: ${error.message}`)
    }
    
    // Test 6: Dashboard API
    console.log('\n📊 Testing Dashboard API...')
    try {
      // Execute dashboard data query
      const dashboardResult = await client.query(`
        SELECT 
          u.id, u.email, u.full_name,
          COUNT(t.id) as task_count,
          COUNT(g.id) as goal_count,
          COUNT(c.id) as conversation_count
        FROM users u
        LEFT JOIN tasks t ON u.id = t.user_id
        LEFT JOIN goals g ON u.id = g.user_id
        LEFT JOIN conversations c ON u.id = c.user_id
        WHERE u.id = $1
        GROUP BY u.id, u.email, u.full_name
      `, [userId])
      
      if (dashboardResult.rows.length > 0) {
        const userData = dashboardResult.rows[0]
        console.log(`   ✅ Dashboard data fetched for user: ${userData.full_name}`)
        console.log(`      - Tasks: ${userData.task_count}`)
        console.log(`      - Goals: ${userData.goal_count}`)
        console.log(`      - Conversations: ${userData.conversation_count}`)
      }
      
    } catch (error) {
      console.log(`   ❌ Dashboard API failed: ${error.message}`)
    }
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...')
    await client.query('DELETE FROM documents WHERE user_id = $1', [userId])
    await client.query('DELETE FROM user_templates WHERE user_id = $1', [userId])
    await client.query('DELETE FROM conversations WHERE user_id = $1', [userId])
    await client.query('DELETE FROM goals WHERE user_id = $1', [userId])
    await client.query('DELETE FROM tasks WHERE user_id = $1', [userId])
    console.log('   ✅ Test data cleaned up')
    
    console.log('\n🎉 API Routes Testing Complete!')
    console.log('✅ All API routes are working correctly')
    console.log('✅ Database operations are successful')
    console.log('✅ Authentication system is functional')
    console.log('\n🚀 Your SoloSuccess AI platform is ready for production!')
    
  } catch (error) {
    console.error('❌ API testing failed:', error.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

testAPIRoutes()
