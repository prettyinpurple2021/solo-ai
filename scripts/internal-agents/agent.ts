
import { run as runSocial } from './social-manager/index';
// Dynamic imports might be better to avoid loading all deps, but let's keep it simple for now.
// Actually, let's use dynamic imports to keep start time fast and avoid side effects.

const command = process.argv[2];
const args = process.argv.slice(3);

async function main() {
  switch (command) {
    case 'social':
      await runSocial(); 
      break;
    
    case 'generate':
    case 'gen':
      // Pass args to the generator
      // We need to manipulate process.argv or pass args directly.
      // The generator currently reads process.argv[2] (which would be 'generate') so we need to fix that or mock process.argv
      // Let's modify the agents to accept args or just fix process.argv here.
      // Easiest is to shift process.argv so the sub-scripts see their args at index 2.
      process.argv.splice(2, 1); // Remove 'generate'
      const { run: runGenerator } = await import('./code-generator/index');
      await runGenerator();
      break;

    case 'review':
      process.argv.splice(2, 1); // Remove 'review'
      const { run: runReviewer } = await import('./code-reviewer/index');
      await runReviewer();
      break;

    case 'commit':
      process.argv.splice(2, 1); // Remove 'commit'
      const { run: runCommitter } = await import('./repo-committer/index');
      await runCommitter();
      break;

    case 'help':
    default:
      console.log(`
🤖 SoloSuccess Internal Agent Team CLI

Usage: npx tsx scripts/internal-agents/agent.ts <command> [args]

Commands:
  social      - Run the Social Media Manager (checks git, drafts tweets)
  generate    - Run the Code Generator (arguments: "prompt")
  review      - Run the Code Reviewer (arguments: file-path)
  commit      - Run the Repo Committer (analyzes git diff, suggests commit msg)
      `);
      break;
  }
}

main().catch(console.error);
