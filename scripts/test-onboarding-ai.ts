/* eslint-disable no-console */

import { onboardingAI, LaunchPlan } from '../src/services/onboarding-ai';

import { config } from 'dotenv';

// Load env vars
config({ path: '.env.local' });

async function testGeneration() {
  console.log('🧪 Testing Onboarding AI Service...');
  
  const profile = {
    name: "Test User",
    businessType: "SaaS Founder",
    goals: ["Scale Business", "Automate Tasks"]
  };

  console.log(`📋 Profile: ${profile.businessType} - Goals: ${profile.goals.join(', ')}`);

  const start = Date.now();
  try {
    const plan: LaunchPlan = await onboardingAI.generateLaunchPlan(profile);
    const duration = Date.now() - start;
    
    // Verify structure
    if (!plan.roadmap || !Array.isArray(plan.roadmap)) {
      throw new Error('Invalid plan structure: roadmap is missing or not an array');
    }

    console.log(`✅ Plan Generated in ${duration}ms`);
    console.log(`   Phases: ${plan.roadmap.length}`);
    
    if (plan.roadmap.length > 0) {
      console.log(`   First Phase: ${plan.roadmap[0].phaseName}`);
      
      const firstPhase = plan.roadmap[0];
      if (Array.isArray(firstPhase.tasks) && firstPhase.tasks.length > 0) {
        console.log(`   First Task: ${firstPhase.tasks[0].title}`);
      } else {
        console.log(`   First Task: (No tasks in phase 1)`);
      }
    } else {
      console.log(`   (No phases generated)`);
    }
  } catch (error) {
    console.error('❌ Test Failed:', error);
    process.exit(1);
  }
}

testGeneration().catch(err => {
  console.error("Unhanlded rejection in testGeneration:", err);
  process.exit(1);
});
