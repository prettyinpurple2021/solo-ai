
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getConversations } from '@/lib/services/agent-service';
import AgentClient from './AgentClient';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default async function AgentsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const conversations = await getConversations(session.user.id);

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-bg p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-neon-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-mono animate-pulse uppercase tracking-widest">Activating AI Squad...</p>
        </div>
      </div>
    }>
      <AgentClient initialConversations={conversations} userId={session.user.id} />
    </Suspense>
  );
}
