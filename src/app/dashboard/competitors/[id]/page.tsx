import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { getCompetitorDetailData } from '@/lib/services/competitor-service';
import CompetitorDetailClient from './CompetitorDetailClient';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default async function CompetitorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { id } = await params;
  const data = await getCompetitorDetailData(id, session.user.id);

  if (!data) {
    notFound();
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-bg p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 font-mono animate-pulse">Synchronizing Competitor Intel...</p>
          </div>
        </div>
      </div>
    }>
      <CompetitorDetailClient initialData={data} competitorId={id} />
    </Suspense>
  );
}
