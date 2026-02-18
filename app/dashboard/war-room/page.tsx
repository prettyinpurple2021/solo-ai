
import { WarRoomClient } from "./WarRoomClient";
import { WarRoomService } from "@/lib/services/war-room-service";
import { authenticatePage } from "@/lib/auth-server";
import { Suspense } from "react";

export default async function WarRoomPage() {
  const { user } = await authenticatePage();
  if (!user) return null;

  const sessions = await WarRoomService.getSessions(user.id);

  return (
    <div className="min-h-screen bg-black/90 p-6 relative">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        <Suspense fallback={<div className="p-8 text-center font-mono animate-pulse text-neon-magenta uppercase tracking-widest">Waking C-Suite Operatives...</div>}>
          <WarRoomClient initialSessions={sessions} user={user} />
        </Suspense>
      </div>
    </div>
  );
}
