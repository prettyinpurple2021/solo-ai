
import { generateText } from 'ai';
import { getAgentConfig } from '../shared';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export async function run() {
  const prompt = process.argv.slice(2).join(' ');
  if (!prompt) {
    console.log("Usage: npx tsx scripts/internal-agents/code-gen [prompt]");
    return;
  }

  const persona = getAgentConfig('coder');
  const generatorPrompt = `
    Generate a TypeScript code snippet based on the following request:
    "${prompt}"
    
    Requirements:
    - Use efficient, modern Next.js/React patterns.
    - Include comments explaining key logic.
    - Provide ONLY the code block.
    
    If it's a component, export it as default.
  `;

  console.log(`🤖 Generating code for: "${prompt}"...`);

  try {
    const { text } = await generateText({
      model: persona.model, // Haiku
      system: persona.systemPrompt,
      prompt: generatorPrompt,
    });
    
    console.log("\nGenerated Code:");
    console.log(text.replace(/`/g, ''));
    
    // (Optional: Write to file directly if user provides --output flag)
    
  } catch (error) {
    console.error("Error generating code:", error);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    run().catch(console.error);
}
