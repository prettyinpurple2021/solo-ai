
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getWorkflowDashboardData } from '@/lib/services/workflow-service';
import { WorkflowDashboard } from '@/components/workflow/workflow-dashboard';
import { Suspense } from 'react';
import { FeatureGate } from '@/components/subscription/FeatureGate';

export const dynamic = 'force-dynamic';

export default async function WorkflowPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { stats, workflows } = await getWorkflowDashboardData(session.user.id);

  return (
    <div className="flex-1 h-full overflow-hidden">
      <FeatureGate feature="custom-agent-builder">
        <Suspense fallback={
          <div className="h-full flex items-center justify-center bg-dark-bg">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-neon-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400 font-mono animate-pulse uppercase tracking-widest">Initializing Workflow Engine...</p>
            </div>
          </div>
        }>
          <WorkflowDashboard 
            initialStats={stats} 
            initialWorkflows={workflows}
            className="h-full"
          />
        </Suspense>
      </FeatureGate>
    </div>
  );
}
