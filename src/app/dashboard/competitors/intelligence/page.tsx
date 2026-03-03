
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getIntelligencePageData } from '@/lib/services/competitor-service';
import IntelligenceClient from './IntelligenceClient';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default async function IntelligencePage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const intelligenceData = await getIntelligencePageData(session.user.id);

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-950 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-purple-200 text-lg font-mono animate-pulse uppercase tracking-widest">Gathering Competitive Intel...</p>
        </div>
      </div>
    }>
      <IntelligenceClient initialData={intelligenceData} userId={session.user.id} />
    </Suspense>
  );
}
