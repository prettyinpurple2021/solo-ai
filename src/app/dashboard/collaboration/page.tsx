
import { CollaborationClient } from "./CollaborationClient";
import { CollaborationService } from "@/lib/services/collaboration-service";
import { authenticatePage } from "@/lib/auth-server";
import { Suspense } from "react";

export default async function CollaborationPage() {
  const { user } = await authenticatePage();
  if (!user) return null;

  // Parallel fetching
  const [sessions, agents] = await Promise.all([
    CollaborationService.getSessions(user.id),
    CollaborationService.getAgents()
  ]);

  return (
    <div className="container mx-auto px-4 py-6">
      <Suspense fallback={<div className="p-8 text-center font-mono animate-pulse">Initializing Collaboration Hub...</div>}>
        <CollaborationClient 
          initialSessions={sessions} 
          initialAgents={agents}
          user={user}
        />
      </Suspense>
    </div>
  );
}
