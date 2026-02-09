
import { getRecentCommits } from './git-monitor';
import { draftPost } from './post-drafter';

(async () => {
    console.log("TEST: Start (Cheap Models)");
    const commits = getRecentCommits(24);
    
    if (!commits) {
        console.log("TEST: No commits");
        return;
    }
    console.log("TEST: Drafting...");
    const draft = await draftPost(commits);

    console.log("TEST: Draft result:");
    console.log(draft);
})();
