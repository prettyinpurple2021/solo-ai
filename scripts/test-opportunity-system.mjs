#!/usr/bin/env node

import { competitiveOpportunityDetector } from '../lib/competitive-opportunity-detection.js'
import { opportunityRecommendationSystem } from '../lib/opportunity-recommendation-system.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testOpportunitySystem() {
  try {
    console.log('🧪 Testing Opportunity Recommendation System...')

    // Create a mock opportunity detection result
    const mockOpportunity = {
      id: `test_opp_${Date.now()}`,
      competitorId: '550e8400-e29b-41d4-a716-446655440000', // Mock UUID
      opportunityType: 'competitor_weakness',
      title: 'Test Competitor Weakness Opportunity',
      description: 'Test opportunity for system validation',
      confidence: 0.8,
      impact: 'high',
      effort: 'medium',
      timing: 'short-term',
      evidence: [
        {
          type: 'customer_complaint',
          source: 'test_source',
          content: 'Test evidence content',
          relevance: 0.9,
          collectedAt: new Date()
        }
      ],
      recommendations: ['Test recommendation 1', 'Test recommendation 2'],
      detectedAt: new Date()
    }

    console.log('📊 Mock opportunity created:', mockOpportunity.title)

    // Test recommendation generation
    console.log('🔍 Generating recommendations...')
    const recommendations = await opportunityRecommendationSystem.generateRecommendations(mockOpportunity)
    console.log(`✅ Generated ${recommendations.length} recommendations`)
    
    recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec.title} (Priority: ${rec.priority}, ROI: ${rec.expectedROI}%)`)
    })

    // Test prioritization calculation
    console.log('📈 Calculating priority score...')
    const prioritization = await opportunityRecommendationSystem.calculatePriorityScore(mockOpportunity)
    console.log(`✅ Priority score: ${prioritization.priorityScore.toFixed(2)}`)
    console.log(`   - Impact: ${prioritization.impactScore}`)
    console.log(`   - Effort: ${prioritization.effortScore}`)
    console.log(`   - Timing: ${prioritization.timingScore}`)
    console.log(`   - Confidence: ${prioritization.confidenceScore}`)

    console.log('🎉 Opportunity Recommendation System test completed successfully!')

  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

testOpportunitySystem()