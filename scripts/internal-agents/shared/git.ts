
import { execSync } from 'child_process';


export function getRecentCommits(lastHash?: string, hours: number = 24): { commits: string, latestHash?: string } {
  try {
    let command;
    if (lastHash) {
         // Get everything from lastHash to HEAD (excluding lastHash)
        command = `git log ${lastHash}..HEAD --pretty=format:"%h - %s (%an)"`;
    } else {
        const since = `${hours} hours ago`;
        // Format: "hash - subject (author)"
        command = `git log --since="${since}" --pretty=format:"%h - %s (%an)"`;
    }
    
    const output = execSync(command).toString().trim();
    
    if (!output) {
      return { commits: "No recent commits found." };
    }

    // Get the latest hash from the output (first line) to update state later
    // git log default order is new to old
    const latestHash = output.split('\n')[0].split(' - ')[0].trim();
    
    return { commits: output, latestHash };
  } catch (error) {
    console.error("Error fetching git logs:", error);
    return { commits: "Error fetching git logs." };
  }
}
