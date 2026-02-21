
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getCompetitors, getCompetitorStats, getIntelligenceActivities } from '@/lib/services/competitor-service';
import CompetitorsClient from './CompetitorsClient';

export const dynamic = 'force-dynamic';

export default async function CompetitorDashboardPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const [competitors, stats, activities] = await Promise.all([
    getCompetitors(session.user.id),
    getCompetitorStats(session.user.id),
    getIntelligenceActivities(session.user.id)
  ]);

  return (
    <CompetitorsClient 
      initialCompetitors={competitors} 
      initialStats={stats} 
      initialActivities={activities}
    />
  );
}
