/**
 * AI-assisted launch notes. Writes ONLY under docs/internal/generated/ (gitignored).
 * Curated checklists stay at repo root — never overwrite LAUNCH_CHECKLIST.md / ROADMAP.md here.
 */
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const PROJECT_ROOT = process.cwd();
/** Never write AI output to repo root — those files are human-curated. */
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'docs', 'internal', 'generated');
const SECTION_BREAK = '---SECTION_BREAK---';

// Files to analyze for context
const KEY_FILES = [
  'package.json',
  'src/lib/stripe.ts',
  'src/lib/subscription-utils.ts',
  'server/db/schema.ts',
  'src/lib/custom-ai-agents/agent-collaboration-system.ts',
  'src/proxy.ts',
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

  // Also list custom-ai-agents directory for registry context
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

    Produce a draft "Launch To-Do List" and "Roadmap" for engineer review only.

    FACTS ABOUT THIS REPO (do not claim the opposite):
    - Edge auth and route gating live in src/proxy.ts (NextAuth middleware wrapper), not necessarily src/middleware.ts.
    - Custom agent collaboration may register multiple agents including Aura and Finn in addition to the eight named cores — count and list what the code actually registers.

    OBJECTIVES:
    1. **Subscription / billing alignment**: Compare stripe.ts (SDK, checkout) vs subscription-utils.ts (tier limits, agent access). Note behavioral gaps, not fictional duplicate constants.
    2. **Agent registry**: List agents actually registered in agent-collaboration-system.ts.
    3. **Payment readiness**: Schema / webhooks vs Stripe usage where visible in context.
    4. **Feature completeness**: High-level gaps vs schema (if context shows them).

    Output format (STRICT):
    - Return plain Markdown only. Do NOT wrap the whole response in a fenced code block.
    - Use exactly one line containing only: ${SECTION_BREAK}
    - Before that line: body of LAUNCH_CHECKLIST_DRAFT (sections: Critical / Important / Polish).
    - After that line: body of ROADMAP_DRAFT (Phase 1 Launch/Stabilize, Phase 2 Growth, Phase 3 Scale).
    `,
    prompt: `Project Context:\n${context}`
  });

  return text;
}

function stripOuterFencedMarkdown(raw: string): string {
  let s = raw.trim();
  const fence = /^```(?:markdown|md)?\s*\n?([\s\S]*?)\n?```\s*$/i;
  const m = s.match(fence);
  if (m) return m[1].trim();
  return s;
}

async function main() {
  try {
    console.log('🚀 Starting Launch Readiness Audit...');

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    const context = await gatherContext();
    const resultRaw = await analyzeReadiness(context);
    const result = stripOuterFencedMarkdown(resultRaw);

    const parts = result.split(SECTION_BREAK);
    const checklistContent = parts[0]?.trim();
    const roadmapContent = parts.length > 1 ? parts.slice(1).join(SECTION_BREAK).trim() : '';

    if (parts.length >= 2 && checklistContent && roadmapContent) {
      fs.writeFileSync(path.join(OUTPUT_DIR, 'LAUNCH_CHECKLIST_DRAFT.md'), `${checklistContent}\n`);
      fs.writeFileSync(path.join(OUTPUT_DIR, 'ROADMAP_DRAFT.md'), `${roadmapContent}\n`);
      console.log(`✅ Wrote ${path.relative(PROJECT_ROOT, path.join(OUTPUT_DIR, 'LAUNCH_CHECKLIST_DRAFT.md'))}`);
      console.log(`✅ Wrote ${path.relative(PROJECT_ROOT, path.join(OUTPUT_DIR, 'ROADMAP_DRAFT.md'))}`);
    } else {
      const fallbackPath = path.join(OUTPUT_DIR, 'launch-readiness-raw.md');
      fs.writeFileSync(fallbackPath, result);
      console.warn(
        `⚠️  Missing "${SECTION_BREAK}" or empty section — full response saved to ${path.relative(PROJECT_ROOT, fallbackPath)}`
      );
    }

    console.log(
      `\nAudit complete. Drafts are under docs/internal/generated/ (gitignored). Do not commit as replacements for root LAUNCH_CHECKLIST.md or ROADMAP.md without human review.`
    );
  } catch (error) {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  }
}

main();
