import { CoursePlayer } from "@/components/academy/course-player";
import { authenticateRequest } from '@/lib/auth-server';
import { redirect } from 'next/navigation';

interface Props {
  params: {
    id: string
  }
}

export const metadata = {
  title: "Course | SoloSuccess AI",
};

export default async function PathPage({ params }: Props) {
  const { user } = await authenticateRequest();
  
  if (!user) {
    redirect('/auth/signin');
  }

  // We are assuming the ID is passed via params properly.
  // In Next.js 13+, params might need to be awaited in some versions, but standard valid props are { params }
  
  return (
    <div className="bg-background min-h-screen">
      <CoursePlayer pathId={params.id} />
    </div>
  );
}
