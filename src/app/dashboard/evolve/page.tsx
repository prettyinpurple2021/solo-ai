
import { EvolveClient } from "./EvolveClient";
import { authenticatePage } from "@/lib/auth-server";
import { Suspense } from "react";

export default async function EvolvePage() {
  const { user } = await authenticatePage();
  if (!user) return null;

  // Placeholder for future metrics service
  const initialMetrics = {
    currentTeamSize: 1,
    targetTeamSize: 3,
    hiringBudget: 150000,
    timeToHire: 45,
    successRate: 85
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div className="p-8 text-center font-mono animate-pulse text-neon-purple uppercase">Synchronizing Evolve Module...</div>}>
        <EvolveClient initialMetrics={initialMetrics} user={user} />
      </Suspense>
    </div>
  );
}
