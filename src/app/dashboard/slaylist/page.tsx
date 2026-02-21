
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getGoals, getTasks } from '@/lib/services/slaylist-service';
import SlaylistClient from './SlaylistClient';

export const dynamic = 'force-dynamic';

export default async function SlaylistPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const [goals, tasks] = await Promise.all([
    getGoals(session.user.id),
    getTasks(session.user.id)
  ]);

  return (
    <SlaylistClient 
      initialGoals={goals} 
      initialTasks={tasks} 
    />
  );
}
