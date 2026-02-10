
import { fileURLToPath } from 'url';
import { generateReadme, generateUserGuide } from './generator';

export async function run() {
  console.log("📚 Internal Agent: Docs Maintainer");
  console.log("------------------------------");

  const args = process.argv.slice(2);
  const command = args[0];
  const topic = args.slice(1).join(' ');

  if (command === 'readme') {
      console.log("🔄 Updating README.md based on current project state...");
      const result = await generateReadme();
      console.log(result);
  } else if (command === 'guide') {
      if (!topic) {
          console.log("Usage: npx tsx scripts/internal-agents/agent.ts docs guide \"Topic Name\"");
          return;
      }
      console.log(`📘 Generating User Guide for: "${topic}"...`);
      const result = await generateUserGuide(topic);
      console.log(result);
  } else {
      console.log(`
Usage:
  npx tsx scripts/internal-agents/agent.ts docs readme          (Update README.md)
  npx tsx scripts/internal-agents/agent.ts docs guide "Topic"   (Create User Guide)
      `);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().catch(console.error);
}
