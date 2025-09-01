#!/usr/bin/env node

import pg from 'pg'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const { Client } = pg

async function testOpportunityDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    await client.connect()
    console.log('🔗 Connected to database')

    // Test inserting a mock opportunity
    const mockOpportunityId = `test_opp_${Date.now()}`
    const mockUserId = '550e8400-e29b-41d4-a716-446655440001' // Mock user UUID
    const mockCompetitorId = '550e8400-e29b-41d4-a716-446655440002' // Mock competitor UUID

    console.log('📝 Testing opportunity insertion...')
    
    // First, let's check if we have any users to use
    const usersResult = await client.query('SELECT id FROM users LIMIT 1')
    if (usersResult.rows.length === 0) {
      console.log('⚠️  No users found in database. Creating test user...')
      await client.query(`
        INSERT INTO users (id, email, password_hash, full_name) 
        VALUES ($1, 'test@example.com', 'test_hash', 'Test User')
        ON CONFLICT (id) DO NOTHING
      `, [mockUserId])
    } else {
      console.log('✅ Using existing user:', usersResult.rows[0].id)
      // Use the existing user ID
      const existingUserId = usersResult.rows[0].id
      
      // Check if we have any competitors
      const competitorsResult = await client.query('SELECT id FROM competitor_profiles WHERE user_id = $1 LIMIT 1', [existingUserId])
      if (competitorsResult.rows.length === 0) {
        console.log('⚠️  No competitors found. Creating test competitor...')
        const newCompetitorResult = await client.query(`
          INSERT INTO competitor_profiles (
            user_id, name, domain, description, industry, 
            threat_level, monitoring_status
          ) 
          VALUES ($1, 'Test Competitor', 'test-competitor.com', 'Test competitor description', 'Technology', 'medium', 'active')
          RETURNING id
        `, [existingUserId])
        const newCompetitor = newCompetitorResult.rows[0]
        console.log('✅ Created test competitor:', newCompetitor.id)
        
        // Now test inserting an opportunity
        await client.query(`
          INSERT INTO competitive_opportunities (
            id, user_id, competitor_id, opportunity_type, title, description,
            confidence, impact, effort, timing, priority_score, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          mockOpportunityId,
          existingUserId,
          newCompetitor.id,
          'competitor_weakness',
          'Test Opportunity',
          'This is a test opportunity for validation',
          0.8,
          'high',
          'medium',
          'short-term',
          7.5,
          'identified'
        ])
        
        console.log('✅ Successfully inserted test opportunity')
        
        // Test inserting an action
        await client.query(`
          INSERT INTO opportunity_actions (
            opportunity_id, user_id, action_type, title, description, priority, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          mockOpportunityId,
          existingUserId,
          'strategic',
          'Test Action',
          'This is a test action',
          'high',
          'pending'
        ])
        
        console.log('✅ Successfully inserted test action')
        
        // Test inserting a metric
        await client.query(`
          INSERT INTO opportunity_metrics (
            opportunity_id, user_id, metric_name, metric_type, target_value, current_value, unit
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          mockOpportunityId,
          existingUserId,
          'Revenue Impact',
          'revenue',
          10000,
          0,
          'USD'
        ])
        
        console.log('✅ Successfully inserted test metric')
        
        // Query the data back
        const opportunityResult = await client.query(`
          SELECT o.*, c.name as competitor_name 
          FROM competitive_opportunities o
          JOIN competitor_profiles c ON o.competitor_id = c.id
          WHERE o.id = $1
        `, [mockOpportunityId])
        
        console.log('📊 Retrieved opportunity:', {
          id: opportunityResult.rows[0].id,
          title: opportunityResult.rows[0].title,
          competitor: opportunityResult.rows[0].competitor_name,
          impact: opportunityResult.rows[0].impact,
          priority_score: opportunityResult.rows[0].priority_score
        })
        
        // Clean up test data
        console.log('🧹 Cleaning up test data...')
        await client.query('DELETE FROM competitive_opportunities WHERE id = $1', [mockOpportunityId])
        await client.query('DELETE FROM competitor_profiles WHERE id = $1', [newCompetitor.id])
        
      } else {
        console.log('✅ Using existing competitor:', competitorsResult.rows[0].id)
        
        // Test with existing competitor
        await client.query(`
          INSERT INTO competitive_opportunities (
            id, user_id, competitor_id, opportunity_type, title, description,
            confidence, impact, effort, timing, priority_score, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          mockOpportunityId,
          existingUserId,
          competitorsResult.rows[0].id,
          'competitor_weakness',
          'Test Opportunity',
          'This is a test opportunity for validation',
          0.8,
          'high',
          'medium',
          'short-term',
          7.5,
          'identified'
        ])
        
        console.log('✅ Successfully inserted test opportunity with existing competitor')
        
        // Clean up
        await client.query('DELETE FROM competitive_opportunities WHERE id = $1', [mockOpportunityId])
      }
    }

    console.log('🎉 Database test completed successfully!')

  } catch (error) {
    console.error('❌ Database test failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

testOpportunityDatabase()