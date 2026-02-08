
import { execSync } from 'child_process';
import { generateText } from 'ai';
import { getAgentConfig } from '../shared/config';
import fs from 'fs';
import path from 'path';

export async function run() {
  console.log("🛠️  Internal Agent: Repo Committer");
  console.log("-------------------------------------");

  // Get status
  const status = execSync('git status --porcelain').toString().trim();
  if (!status) {
    console.log("No changes to commit.");
    return;
  }

  // Get diff
  const diff = execSync('git diff --staged').toString().substring(0, 5000); // Limit context
  
  if (!diff) {
    console.log("No STAGED changes. Please stage files first.");
    return;
  }

  console.log("Analyzing changes...");
  
  const persona = getAgentConfig('committer');
  const prompt = `
    Based on the following git diff, generate a concise Conventional Commit message.
    Format: type(scope): subject
    - Keep subject under 50 chars if possible.
    - Use present tense ("Add feature" not "Added feature").
    - If multiple files, determine scope based on common path/functionality.
    
    Diff:
    ${diff}
  `;

  try {
    const { text } = await generateText({
      model: persona.model, // Haiku
      system: persona.systemPrompt,
      prompt: prompt,
    });
    
    const commitMsg = text.trim().replace(/`/g, '');
    console.log("\nSuggested Commit Message:");
    console.log(`"${commitMsg}"`);
    
    // (Optional: Implement interactive confirm/commit using readline here)
    // For now, just generate the suggestion.
    
  } catch (error) {
    console.error("Error generating commit message:", error);
  }
}

if (require.main === module) {
    run().catch(console.error);
}
