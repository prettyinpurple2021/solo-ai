
import { execSync } from 'child_process';
import { draftPost, generateEngagementPost } from './post-drafter';
import { postTweet } from './twitter-client';
import { fileURLToPath } from 'url';

export async function run() {
  console.log("🐦 Internal Agent: Social Media Manager");
  console.log("-------------------------------------");

  // Check for mode arguments
  const args = process.argv.slice(2);
  const mode = args.includes('--engagement') ? 'engagement' : 'update';

  if (mode === 'engagement') {
      console.log("🎨 Mode: Engagement Post (Autopilot)");
      const postContent = await generateEngagementPost();
      
      if (!postContent || postContent.includes("Failed")) {
          console.error("❌ Failed to generate engagement post.");
          return;
      }

      console.log(`\n📝 Generated Engagement Tweet:\n"${postContent}"\n`);
      
      if (args.includes('--dry-run')) {
          console.log("Creation Successful. [DRY-RUN] Skipping actual post.");
          return;
      }

      console.log("🚀 Autopilot: Posting to X...");
      await postTweet(postContent);
      return;
  }

  // Default Mode: Update based on git commits
  console.log("🔍 Mode: Dev Update (Autopilot)");
  
  // 1. Get recent git commits (last 24 hours)
  let commits = '';
  try {
    commits = execSync('git log --since="24 hours ago" --oneline').toString();
  } catch (e) {
    console.warn("Could not fetch git logs, assuming no recent changes.");
  }

  if (!commits) {
    console.log("No commits in the last 24 hours. Skipping update post.");
    return;
  }

  console.log(`Found recent commits:\n${commits.substring(0, 200)}...`);

  // 2. Draft the post
  const draft = await draftPost(commits);
  
  if (draft.includes("No recent updates")) {
      console.log("Agent decided no update is needed based on commits.");
      return;
  }

  console.log(`\n📝 Generated Update Tweet:\n"${draft}"\n`);

  if (args.includes('--dry-run')) {
      console.log("Creation Successful. [DRY-RUN] Skipping actual post.");
      return;
  }

  // 3. Post to X (Autopilot)
  console.log("🚀 Autopilot: Posting to X...");
  await postTweet(draft);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().catch(console.error);
}
