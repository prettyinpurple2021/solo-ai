
import { generateText } from 'ai';
import { getAgentConfig } from '../shared/index';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export async function run() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.log("Usage: npx tsx scripts/internal-agents/code-reviewer [file-path]");
    return;
  }

  const absolutePath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    return;
  }

  const code = fs.readFileSync(absolutePath, 'utf-8');
  console.log(`🤖 Reviewing ${filePath}...`);
  
  const persona = getAgentConfig('reviewer');
  const prompt = `
    Review the following TypeScript code for:
    1. Bugs or logic errors.
    2. Missing types or poor TypeScript practices.
    3. Performance issues.
    4. Provide specific suggestions.
    
    Code:
    ${code.substring(0, 10000)} // Limit input
  `;

  try {
    const { text } = await generateText({
      model: persona.model, // Haiku
      system: persona.systemPrompt,
      prompt: prompt,
    });
    
    console.log("\nReview Summary:");
    console.log(text);
    
  } catch (error) {
    console.error("Error generating review:", error);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    run().catch(console.error);
}
