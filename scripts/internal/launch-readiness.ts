
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const PROJECT_ROOT = process.cwd();

// Files to analyze for context
const KEY_FILES = [
  'package.json',
  'src/lib/stripe.ts',
  'src/lib/subscription-utils.ts',
  'server/db/schema.ts',
  'src/lib/custom-ai-agents/agent-collaboration-system.ts',
  'src/middleware.ts',
  '.env.example'
];

// Helper to minify code context
function minifyContext(content: string, type: string): string {
  if (type === 'json') return content;
  
  // Remove comments and empty lines
  return content
    .replace(/\/\/.*$/gm, '') // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .replace(/^\s*[\r\n]/gm, '') // Remove empty lines
    .trim();
}

async function gatherContext() {
  let context = "";
  
  console.log('🔍 Gathering project context...');
  
  for (const filePath of KEY_FILES) {
    try {
      const fullPath = path.join(PROJECT_ROOT, filePath);
      if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf-8');
        
        // Optimize schema.ts specifically
        if (filePath.includes('schema.ts')) {
          console.log('   Stats: Optimizing schema.ts size...');
          content = minifyContext(content, 'ts');
          // Further truncate if still huge
          if (content.length > 30000) {
            content = content.substring(0, 30000) + "\n...[TRUNCATED]...";
          }
        }
        
        context += `\n\n--- FILE: ${filePath} ---\n${content}`;
      } else {
        context += `\n\n--- FILE: ${filePath} ---\n(File missing)`;
      }
    } catch (err) {
      console.warn(`⚠️  Error reading ${filePath}:`, err);
    }
  }

  // Also list the structure of src/lib/custom-ai-agents to verify the 8 agents
  try {
    const agentsDir = path.join(PROJECT_ROOT, 'src/lib/custom-ai-agents');
    if (fs.existsSync(agentsDir)) {
      const files = fs.readdirSync(agentsDir);
      context += `\n\n--- DIRECTORY: src/lib/custom-ai-agents ---\n${files.join('\n')}`;
    }
  } catch (err) {
    console.warn('⚠️  Could not read agents directory');
  }

  return context;
}

async function analyzeReadiness(context: string) {
  console.log('🤖 Analyzing with AI (this may take a minute)...');
  
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is missing.');
  }

  const { text } = await generateText({
    model: openai('gpt-4o'),
    system: `You are the Setup CTO of "SoloSuccess AI". Your job is to bring this project to a public launch.
    
    The user wants a unified "Launch To-Do List" and "Roadmap".
    
    CRITICAL OBJECTIVES:
    1. **Subscription Logic Consistency**: Compare 'stripe.ts' and 'subscription-utils.ts'. Identify ANY discrepancies in limits (e.g. team members, agent counts). This is P0.
    2. **Agent Verification**: Verify that the 8 core agents (Roxy, Blaze, Echo, Lumi, Vex, Lexi, Nova, Glitch) are present and registered in the collaboration system.
    3. **Payment Readiness**: properties in schema vs stripe config.
    4. **Feature Completeness**: Identify missing routes or logic based on the schema (e.g. if 'competitors' table exists, is there logic for it?).
    
    Output Format:
    Return a MARKDOWN string with two distinct sections using "---SECTION_BREAK---" as a separator.
    
    Section 1: LAUNCH_CHECKLIST.md
    - A strict checklist of tasks to complete before launch.
    - Group by: 🔴 Critical (Must Fix), 🟡 Important (Should Fix), 🟢 Polish.
    - Be specific about file names and discrepancies found.

    Section 2: ROADMAP.md
    - A strategic view for post-launch.
    - Phases: Phase 1 (Launch/Stabilize), Phase 2 (Growth/Features), Phase 3 (Scale).
    `,
    prompt: `Project Context:\n${context}`
  });

  return text;
}

async function main() {
  try {
    console.log('🚀 Starting Launch Readiness Audit...');
    
    const context = await gatherContext();
    const result = await analyzeReadiness(context);
    
    const [checklistContent, roadmapContent] = result.split('---SECTION_BREAK---');

    if (checklistContent) {
      fs.writeFileSync(path.join(PROJECT_ROOT, 'LAUNCH_CHECKLIST.md'), checklistContent.trim());
      console.log('✅ Generated LAUNCH_CHECKLIST.md');
    }

    if (roadmapContent) {
      fs.writeFileSync(path.join(PROJECT_ROOT, 'ROADMAP.md'), roadmapContent.trim());
      console.log('✅ Generated ROADMAP.md');
    }

    console.log('\nAudit complete! Review the generated markdown files.');
    
  } catch (error) {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  }
}

main();
