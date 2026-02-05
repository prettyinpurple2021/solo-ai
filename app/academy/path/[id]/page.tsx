import { CoursePlayer } from "@/components/academy/course-player";
import { authenticateRequest } from '@/lib/auth-server';
import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{
    id: string
  }>
}

export const metadata = {
  title: "Course | SoloSuccess AI",
};

export default async function PathPage({ params }: Props) {
  const { user } = await authenticateRequest();
  
  if (!user) {
    redirect('/auth/signin');
  }

  // Await params for Next.js 16+ compatibility
  const { id } = await params;
  
  return (
    <div className="bg-background min-h-screen">
      <CoursePlayer pathId={id} />
    </div>
  );
}
