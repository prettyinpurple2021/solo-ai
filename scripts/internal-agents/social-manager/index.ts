

import { getRecentCommits } from './git-monitor';
import { draftPost } from './post-drafter';
import { postToX } from './browser-poster';
import readline from 'readline';
import { fileURLToPath } from 'url';

const ask = (query: string): Promise<string> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
};

export async function run() {
  console.log("🤖 SoloSuccess Autonomous Social Agent");
  console.log("-----------------------------------------");

  // Configurable via argv if needed (e.g. process.argv[2])
  const hours = 24;

  console.log(`Checking for project updates in the last ${hours} hours...`);
  const commits = getRecentCommits(hours);

  console.log(`Debug: Commits fetched. Length: ${commits?.length}`);

  if (!commits || commits.includes("No recent commits found.")) {
    console.log("No updates found. Exiting.");
    process.exit(0);
  }

  console.log("\nFound updates (first 500 chars):");
  console.log((commits.substring(0, 500) + (commits.length > 500 ? "..." : "")).replace(/\n/g, '\n> '));

  console.log("\nDrafting post using Build-in-Public Founder persona...");
  let draft = "";
  try {
     draft = await draftPost(commits);
     console.log("Debug: Draft generated successfully.");
  } catch (err) {
      console.error("Debug: Error drafting post:", err);
      draft = "Error generating draft.";
  }


  console.log("\n-----------------------------------------");
  console.log("Draft Post:");
  console.log(`"${draft}"`);
  console.log("-----------------------------------------");

  const answer = await ask('Do you want to post this to X? (y = yes, n = no, m = manual edit): ');

  if (answer.toLowerCase().startsWith('y')) {
    await postToX(draft);
  } else if (answer.toLowerCase().startsWith('m')) {
    const customText = await ask('Enter custom post text: ');
    await postToX(customText);
  } else {
    console.log("Aborted.");
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().catch(console.error);
}

