import { execSync } from 'child_process';
import { getRecentCommits } from '../shared/git';
import { draftPost, generateEngagementPost } from './post-drafter';
import { postTweet } from './twitter-client';
import { postToWebsite } from './website-client';
import { fileURLToPath } from 'url';

import { loadState, updateAgentState } from '../shared/state';

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
      const success = await postTweet(postContent);
      if (success) {
        console.log("✅ Posted successfully to X.");
        // Also post to website
        await postToWebsite(postContent);
      }
      return;
  }

  // Default Mode: Update based on git commits
  console.log("🔍 Mode: Dev Update (Autopilot)");
  
  // 1. Load State
  const state = loadState();
  const lastHash = state.social?.lastProcessedCommitHash;

  if (lastHash) {
    console.log(`Checking for commits since: ${lastHash}`);
  } else {
    console.log(`No previous state found. Defauting to last 24 hours.`);
  }

  // 2. Get recent git commits
  const { commits, latestHash } = getRecentCommits(lastHash);

  if (!commits || commits.includes("No recent commits") || commits.includes("Error")) {
    console.log("No new commits to share. Skipping update post.");
    return;
  }

  console.log(`Found recent commits:\n${commits.substring(0, 200)}...`);

  // 3. Draft the post
  const draft = await draftPost(commits);
  
  if (draft.includes("No recent updates")) {
      console.log("Agent decided no update is needed based on commits.");
      // Even if no tweet, we might want to update state to avoid re-checking these same commits forever?
      // Actually, if it decided not to tweet, maybe we force update state so it doesn't get stuck?
      // For now, let's ONLY update state if we successfully posted or explicitly skipped.
      if (latestHash) {
         updateAgentState('social', { lastProcessedCommitHash: latestHash, lastRun: new Date().toISOString() });
      }
      return;
  }

  console.log(`\n📝 Generated Update Tweet:\n"${draft}"\n`);

  if (args.includes('--dry-run')) {
      console.log("Creation Successful. [DRY-RUN] Skipping actual post.");
      return;
  }

  // 4. Post to X (Autopilot)
  console.log("🚀 Autopilot: Posting to X...");
  const success = await postTweet(draft);

  if (success && latestHash) {
      console.log(`✅ State updated: Last commit ${latestHash}`);
      updateAgentState('social', { lastProcessedCommitHash: latestHash, lastRun: new Date().toISOString() });
      
      // Also post to website
      await postToWebsite(draft);
  } else if (!success) {
      console.error("❌ Posting failed. State NOT updated (will retry next time).");
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().catch(console.error);
}
