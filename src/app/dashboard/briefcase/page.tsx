
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getBriefcaseFiles, getBriefcaseFolders } from '@/lib/services/briefcase-service';
import BriefcaseClient from './BriefcaseClient';

export const dynamic = 'force-dynamic';

export default async function BriefcasePage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const [files, folders] = await Promise.all([
    getBriefcaseFiles(session.user.id),
    getBriefcaseFolders(session.user.id)
  ]);

  return (
    <BriefcaseClient 
      initialDocuments={files} 
      initialFolders={folders} 
    />
  );
}
