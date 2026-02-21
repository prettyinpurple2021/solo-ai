
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDashboardData } from '@/lib/services/dashboard-service';
import DashboardClient from './DashboardClient';
import { logInfo } from '@/lib/logger';

// Force dynamic rendering since we are fetching live user data
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/login');
  }

  logInfo('RSC: Fetching dashboard data', { email: session.user.email });
  const data = await getDashboardData(session.user.email);

  if (!data) {
    // This could happen if the user record is missing but session is active
    // The service handles JIT creation but if it returns null, we should show a friendly error
    // or redirect to a profile completion page.
    return (
      <div className="flex items-center justify-center min-h-screen bg-cyber-black text-white p-8">
        <div className="text-center">
          <h1 className="text-2xl font-orbitron mb-4">Identity Verification Required</h1>
          <p className="font-mono text-gray-400 mb-6">We couldn't initialize your command center.</p>
          <a href="/login" className="text-neon-cyan hover:underline font-mono">Return to Base</a>
        </div>
      </div>
    );
  }

  return <DashboardClient initialData={data} />;
}
