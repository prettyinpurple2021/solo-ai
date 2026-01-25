import { auth } from "@/lib/auth";
import { LearningEngine } from "@/lib/learning-engine";
import { PathViewer } from "@/components/learning/path-viewer";
import { redirect } from "next/navigation";

export default async function PathPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const path = await LearningEngine.getPathWithProgress(params.id, session.user.id);

  if (!path) {
    return <div>Learning path not found.</div>;
  }

  return (
    <div className="container py-6">
      <PathViewer path={path} userId={session.user.id} />
    </div>
  );
}
