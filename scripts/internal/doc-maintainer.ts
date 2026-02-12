
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config(); // Fallback to .env

/**
 * Internal Documentation Maintainer Script (AI-Powered)
 * 
 * This tool scans the codebase and uses AI to generate technical documentation.
 * It is a standalone developer tool and NOT part of the runtime application.
 * 
 * Usage:
 *   npm run internal:docs            # Scan mode (report only)
 *   npm run internal:docs -- --generate  # Generation mode (writes files)
 */

const PROJECT_ROOT = process.cwd();
const SRC_DIR = path.join(PROJECT_ROOT, 'src');
const DOCS_OUTPUT_DIR = path.join(PROJECT_ROOT, 'docs', 'technical');

// Ensure output directory exists
if (!fs.existsSync(DOCS_OUTPUT_DIR)) {
  fs.mkdirSync(DOCS_OUTPUT_DIR, { recursive: true });
}

function scanDirectory(dir: string, extension: string): string[] {
  let results: string[] = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(scanDirectory(filePath, extension));
      } else {
        if (file.endsWith(extension) && !file.includes('.test.') && !file.includes('.spec.')) {
          results.push(filePath);
        }
      }
    });
  } catch (error) {
    console.warn(`Warning: Could not scan directory ${dir}`);
  }
  return results;
}

async function generateDocForFile(filePath: string) {
  const relativePath = path.relative(PROJECT_ROOT, filePath);
  const fileName = path.basename(filePath);
  const docName = `generated-${fileName.replace(/\./g, '-')}.md`;
  const docPath = path.join(DOCS_OUTPUT_DIR, docName);

  if (fs.existsSync(docPath)) {
    console.log(`sv  Skipping ${relativePath} (Documentation already exists)`);
    return;
  }

  console.log(`📝 Generating documentation for ${relativePath}...`);

  try {
    const code = fs.readFileSync(filePath, 'utf-8');
    
    // Check if key exists
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ Error: OPENAI_API_KEY not found in environment variables.');
      process.exit(1);
    }

    const { text } = await generateText({
      model: openai('gpt-4o'),
      system: `You are a Senior Technical Writer. Analyze the provided code and generate a comprehensive technical documentation file in Markdown.
      
      Structure:
      1. **Overview**: High-level purpose of the file.
      2. **Key Components**: Classes, functions, interfaces exported.
      3. **Usage Example**: A brief example of how to use this module.
      4. **Dependencies**: Key external or internal imports.
      
      Keep it concise but technical.`,
      prompt: `File Name: ${relativePath}\n\nCode:\n\`\`\`typescript\n${code}\n\`\`\``,
    });

    const frontmatter = `---\ntitle: ${fileName}\nsource: ${relativePath}\ngenerated: ${new Date().toISOString()}\n---\n\n`;
    fs.writeFileSync(docPath, frontmatter + text);
    console.log(`✅ Created ${docName}`);

  } catch (error) {
    console.error(`❌ Failed to generate docs for ${relativePath}:`, error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const generateMode = args.includes('--generate');

  console.log('🔍 Starting AI Documentation Maintainer...');
  console.log('=============================================');

  // 1. Scan for Source Files usually used for logic (utils, lib, agents)
  // Focusing on 'lib' first to avoid scanning all UI components initially
  const targetDir = path.join(SRC_DIR, 'lib'); 
  const files = scanDirectory(targetDir, '.ts');
  
  console.log(`\n📊 Found ${files.length} core TypeScript files in src/lib/`);

  if (generateMode) {
    console.log(`🚀 Mode: GENERATE (Creating markdown files in docs/technical/)`);
    console.log(`   Using OpenAI API Key: ${process.env.OPENAI_API_KEY ? '******' + process.env.OPENAI_API_KEY.slice(-4) : 'MISSING'}`);
    
    // Limit to first 3 files for safety/demo purposes unless overriden
    const filesToProcess = files.slice(0, 3); 
    
    for (const file of filesToProcess) {
      await generateDocForFile(file);
    }
    
    console.log(`\nℹ️  Processed ${filesToProcess.length} files. (Limited to 3 for safety).`);
    console.log(`   Run specific files manually or update script to run all.`);

  } else {
    console.log(`\nMode: SCAN ONLY`);
    console.log(`Use 'npm run internal:docs -- --generate' to actually create files.`);
  }

  console.log('\n=============================================');
}

main().catch(console.error);
