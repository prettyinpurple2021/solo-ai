
import { fileURLToPath } from 'url';
import { draftBlogPost, draftDevlog, saveBlogPost } from './drafter';
import { getRecentCommits } from '../shared/git';
import { loadState, updateAgentState } from '../shared/state';

export async function run() {
  console.log("✍️  Internal Agent: Blog Writer");
  console.log("------------------------------");

  const args = process.argv.slice(2);
  const command = args[0];
  const topic = args.slice(1).join(' ');

  // HANDLE DEVLOG MODE
  if (command === 'devlog') {
      console.log("📅 Mode: Weekly Devlog (Autopilot)");
      
      const state = loadState();
      // For devlog, maybe look back 7 days or since last devlog?
      // For simplicity, let's just do "last 7 days" if no state, or since last run.
      // Actually, git log logic we have is robust enough to take a hash.
      
      // Let's default to 7 days (168 hours) for devlogs
      const { commits, latestHash } = getRecentCommits(state.blog?.lastDevlogDate ? undefined : undefined, 168);

      if (!commits || commits.includes("No recent commits")) {
          console.log("No commits found for devlog.");
          return;
      }

      const content = await draftDevlog(commits);
      if (!content || content.includes("Failed")) {
        console.error("❌ Failed to generate devlog.");
        return;
      }
      
      console.log("\n📄 Devlog Preview:\n" + content.substring(0, 300) + "...\n");
      
      if (args.includes('--dry-run')) {
         console.log("[DRY-RUN] Skipping save.");
         return;
      }

      const savedPath = saveBlogPost(content);
      console.log(`🚀 Devlog saved to: ${savedPath}`);
      
      // Update state
      updateAgentState('blog', { lastDevlogDate: new Date().toISOString() });
      return;
  }

  // HANDLE STANDARD WRITE MODE
  if (command !== 'write' || !topic) {
    console.log("Usage:");
    console.log("  npx tsx scripts/internal-agents/agent.ts blog write \"Topic\"");
    console.log("  npx tsx scripts/internal-agents/agent.ts blog devlog");
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
