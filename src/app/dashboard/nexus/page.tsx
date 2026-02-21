
import { NexusClient } from "./NexusClient";
import { CommunityService } from "@/lib/services/community-service";
import { authenticatePage } from "@/lib/auth-server";
import { Suspense } from "react";

export default async function NexusPage() {
  const { user } = await authenticatePage();
  
  // Parallel fetching
  const [posts, challenges, leaderboard] = await Promise.all([
    CommunityService.getPosts(user?.id),
    CommunityService.getChallenges(user?.id),
    CommunityService.getLeaderboard()
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<div className="p-8 text-center font-mono animate-pulse">Synchronizing with the Nexus...</div>}>
        <NexusClient 
          initialPosts={posts} 
          initialChallenges={challenges} 
          initialLeaderboard={leaderboard}
          user={user}
        />
      </Suspense>
    </div>
  );
}
