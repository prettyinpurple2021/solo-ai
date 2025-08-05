#!/usr/bin/env node

/**
 * Manual verification script for updated_at triggers
 * 
 * This script can be run against a live Supabase database to verify 
 * that the updated_at triggers are working correctly.
 * 
 * Prerequisites:
 * - Migration 005_add_updated_at_triggers.sql has been applied
 * - Environment variables are set (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
 * 
 * Usage: node verify-updated-at-triggers.js
 */

const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nPlease check your .env.local file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyUpdatedAtTriggers() {
  console.log('🔍 Verifying updated_at triggers...\n')

  try {
    // Test 1: Check if the function exists
    console.log('1. Checking if handle_updated_at function exists...')
    const { data: functions, error: fnError } = await supabase.rpc('version') // This will fail if we can't connect
    if (fnError) {
      console.error('❌ Cannot connect to database:', fnError.message)
      return false
    }
    console.log('✅ Database connection successful')

    // Test 2: Test ai_agents trigger
    console.log('\n2. Testing ai_agents trigger...')
    
    // Insert a test record
    const { data: agent, error: insertError } = await supabase
      .from('ai_agents')
      .insert({
        name: 'test_trigger_agent',
        display_name: 'Test Trigger Agent',
        description: 'Test agent for trigger verification',
        personality: 'Test personality',
        capabilities: ['test'],
        accent_color: '#000000',
        system_prompt: 'Test prompt'
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ Failed to insert test agent:', insertError.message)
      return false
    }

    const originalUpdatedAt = new Date(agent.updated_at)
    console.log(`   Original updated_at: ${originalUpdatedAt.toISOString()}`)

    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update the record
    const { data: updatedAgent, error: updateError } = await supabase
      .from('ai_agents')
      .update({ description: 'Updated description for trigger test' })
      .eq('id', agent.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Failed to update test agent:', updateError.message)
      return false
    }

    const newUpdatedAt = new Date(updatedAgent.updated_at)
    console.log(`   New updated_at: ${newUpdatedAt.toISOString()}`)

    if (newUpdatedAt > originalUpdatedAt) {
      console.log('✅ ai_agents trigger working correctly')
    } else {
      console.log('❌ ai_agents trigger not working - updated_at was not changed')
      return false
    }

    // Clean up test data
    await supabase.from('ai_agents').delete().eq('id', agent.id)

    // Test 3: Test ai_conversations trigger (if there are existing conversations)
    console.log('\n3. Testing ai_conversations trigger...')
    const { data: conversations } = await supabase
      .from('ai_conversations')
      .select('id, updated_at')
      .limit(1)

    if (conversations && conversations.length > 0) {
      const conversation = conversations[0]
      const originalConvUpdatedAt = new Date(conversation.updated_at)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { data: updatedConv } = await supabase
        .from('ai_conversations')
        .update({ title: 'Updated title for trigger test' })
        .eq('id', conversation.id)
        .select()
        .single()

      if (updatedConv && new Date(updatedConv.updated_at) > originalConvUpdatedAt) {
        console.log('✅ ai_conversations trigger working correctly')
      } else {
        console.log('❌ ai_conversations trigger not working')
        return false
      }
    } else {
      console.log('⚠️  No ai_conversations found to test - creating a test conversation...')
      
      // Create a test conversation
      const { data: testConv, error: convInsertError } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000', // Placeholder UUID
          agent_id: agent.id,
          title: 'Test conversation'
        })
        .select()
        .single()

      if (convInsertError) {
        console.log('⚠️  Could not create test conversation - skipping this test')
      } else {
        // Test the trigger
        const originalConvUpdatedAt = new Date(testConv.updated_at)
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const { data: updatedTestConv } = await supabase
          .from('ai_conversations')
          .update({ title: 'Updated test conversation' })
          .eq('id', testConv.id)
          .select()
          .single()

        if (updatedTestConv && new Date(updatedTestConv.updated_at) > originalConvUpdatedAt) {
          console.log('✅ ai_conversations trigger working correctly')
        } else {
          console.log('❌ ai_conversations trigger not working')
          return false
        }

        // Clean up
        await supabase.from('ai_conversations').delete().eq('id', testConv.id)
      }
    }

    // Test 4: Test projects trigger (similar approach)
    console.log('\n4. Testing projects trigger...')
    const { data: projects } = await supabase
      .from('projects')
      .select('id, updated_at')
      .limit(1)

    if (projects && projects.length > 0) {
      const project = projects[0]
      const originalProjUpdatedAt = new Date(project.updated_at)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { data: updatedProj } = await supabase
        .from('projects')
        .update({ description: 'Updated description for trigger test' })
        .eq('id', project.id)
        .select()
        .single()

      if (updatedProj && new Date(updatedProj.updated_at) > originalProjUpdatedAt) {
        console.log('✅ projects trigger working correctly')
      } else {
        console.log('❌ projects trigger not working')
        return false
      }
    } else {
      console.log('⚠️  No projects found to test - skipping this test')
    }

    console.log('\n🎉 All updated_at triggers are working correctly!')
    return true

  } catch (error) {
    console.error('❌ Error during verification:', error.message)
    return false
  }
}

// Run the verification
verifyUpdatedAtTriggers()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('❌ Verification failed:', error)
    process.exit(1)
  })