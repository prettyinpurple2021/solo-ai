
import { execSync } from 'child_process';

export function getRecentCommits(hours: number = 24): string {
  try {
    const since = `${hours} hours ago`;
    // Format: "hash - subject (author)"
    const command = `git log --since="${since}" --pretty=format:"- %s (%an)"`;
    const output = execSync(command).toString().trim();
    
    if (!output) {
      return "No recent commits found.";
    }
    
    return output;
  } catch (error) {
    console.error("Error fetching git logs:", error);
    return "Error fetching git logs.";
  }
}
