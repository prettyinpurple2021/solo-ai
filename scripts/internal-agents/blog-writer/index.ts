
import { fileURLToPath } from 'url';
import { draftBlogPost, saveBlogPost } from './drafter';

export async function run() {
  console.log("✍️  Internal Agent: Blog Writer");
  console.log("------------------------------");

  const args = process.argv.slice(2);
  const command = args[0];
  const topic = args.slice(1).join(' ');

  if (command !== 'write' || !topic) {
    console.log("Usage: npx tsx scripts/internal-agents/agent.ts blog write \"Your Topic Here\"");
    return;
  }

  console.log(`📝 Drafting blog post about: "${topic}"...`);
  
  const content = await draftBlogPost(topic);

  if (!content || content.includes("Failed")) {
      console.error("❌ Failed to generate blog post.");
      return;
  }

  console.log("\n📄 Generated Content Preview (First 500 chars):\n");
  console.log(content.substring(0, 500) + "...\n");

  // Save automatically
  const savedPath = saveBlogPost(content);
  console.log(`🚀 Blog post saved! You can review it at: ${savedPath}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().catch(console.error);
}
