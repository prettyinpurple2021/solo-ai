
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTemplates } from '@/lib/services/template-service';
import TemplatesClient from './TemplatesClient';

export const dynamic = 'force-dynamic';

export default async function TemplatesDashboard() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const templates = await getTemplates(session.user.id);

  return (
    <TemplatesClient 
      initialTemplates={templates} 
      userTier={session.user.subscription_tier || 'launch'} 
      userId={session.user.id}
    />
  );
}
