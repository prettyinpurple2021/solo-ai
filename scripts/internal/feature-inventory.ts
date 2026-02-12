
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const PROJECT_ROOT = process.cwd();

// Helper to minify code context
function minifyContext(content: string): string {
  return content
    .replace(/\/\/.*$/gm, '') // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .replace(/^\s*[\r\n]/gm, '') // Remove empty lines
    .trim();
}

function scanDir(dir: string, extension: string): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;
    
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(scanDir(filePath, extension));
        } else {
            if (file.endsWith(extension)) {
                results.push(filePath);
            }
        }
    });
    return results;
}

async function gatherContext() {
  console.log('🔍 Scanning codebase for features (Deep Scan)...');
  let context = "";

  // 1. Pages (User Interface)
  const appDir = path.join(PROJECT_ROOT, 'src/app');
  const pageFiles = scanDir(appDir, 'page.tsx');
  context += `\n\n--- UI ROUTES (Pages) ---\n${pageFiles.map(f => path.relative(PROJECT_ROOT, f)).join('\n')}`;

  // 2. Actions/API (Backend Logic)
  const actionsDir = path.join(PROJECT_ROOT, 'src/lib/actions');
  const apiDir = path.join(PROJECT_ROOT, 'server/routes');
  context += `\n\n--- SERVER ACTIONS ---\n${scanDir(actionsDir, '.ts').map(f => path.relative(PROJECT_ROOT, f)).join('\n')}`;
  context += `\n\n--- API ROUTES ---\n${scanDir(apiDir, '.ts').map(f => path.relative(PROJECT_ROOT, f)).join('\n')}`;

  // 3. Components (The "Meat" of the app)
  const componentsDir = path.join(PROJECT_ROOT, 'src/components');
  // Just capturing file names is usually enough to hint at capability: "CompetitorStalker.tsx"
  const componentFiles = scanDir(componentsDir, '.tsx');
  context += `\n\n--- UI COMPONENTS (Capabilities) ---\n${componentFiles.map(f => path.relative(PROJECT_ROOT, f)).join('\n')}`;

  // 4. Intelligence & Services (The Brains)
  const intelligenceDir = path.join(PROJECT_ROOT, 'src/lib');
  // Scan for "intelligence", "services", "agents"
  const serviceFiles = scanDir(intelligenceDir, '.ts').filter(f => 
    !f.includes('.test.') && 
    (f.includes('intelligence') || f.includes('service') || f.includes('engine') || f.includes('system'))
  );
  context += `\n\n--- INTELLIGENCE & SERVICES ---\n${serviceFiles.map(f => path.relative(PROJECT_ROOT, f)).join('\n')}`;

  // 5. Database Schema (Data Models)
  const schemaPath = path.join(PROJECT_ROOT, 'server/db/schema.ts');
  if (fs.existsSync(schemaPath)) {
      let schemaContent = fs.readFileSync(schemaPath, 'utf-8');
      schemaContent = minifyContext(schemaContent);
      if (schemaContent.length > 20000) schemaContent = schemaContent.substring(0, 20000) + "\n...[TRUNCATED]";
      context += `\n\n--- DATABASE SCHEMA ---\n${schemaContent}`;
  }

  return context;
}

async function analyzeFeatures(context: string) {
  console.log('🤖 Analyzing Feature Value Matrix (High/Med/Low)...');
  
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is missing.');
  }

  const { text } = await generateText({
    model: openai('gpt-4o'),
    system: `You are the Product Manager for "SoloSuccess AI".
    
    OBJECTIVE:
    1. List every user-facing feature found in the codebase.
    2. Classify each feature's Value:
       - 🔴 HIGH: Killer features, significant outcome (Dominator Tier).
       - 🟡 MEDIUM: Core functionality, standard productivity (Accelerator Tier).
       - 🟢 LOW: Basic utility, entry-level (Free/Launch Tier).
    3. Propose a strict Tier Structure based on this value extraction.
    
    OUTPUT FORMAT (Markdown):
    
    # Feature Inventory & Pricing Strategy

    ## 1. Feature Value Matrix
    | Feature Name | Description | Value | Recommended Tier |
    |---|---|---|---|
    | e.g. "Chat with Roxy" | Main AI Business Coach | HIGH | Accelerator |
    
    ## 2. Proposed Tier Structure
    ### Free (Launch)
    - [List features]
    
    ### Accelerator ($19/mo)
    - [List features]
    
    ### Dominator ($29/mo)
    - [List features]
    
    ## 3. Discrepancy Alert
    - Note any features that currently seem miss-tiered based on existing logic.
    `,
    prompt: `Codebase Scan:\n${context}`
  });

  return text;
}

async function main() {
  try {
    const context = await gatherContext();
    const markdown = await analyzeFeatures(context);
    
    fs.writeFileSync(path.join(PROJECT_ROOT, 'FEATURES_AND_TIERS.md'), markdown);
    console.log('✅ Generated FEATURES_AND_TIERS.md');
    
  } catch (error) {
    console.error('❌ Feature Audit failed:', error);
    process.exit(1);
  }
}

main();
