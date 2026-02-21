import { AcademyDashboard } from "@/components/academy/academy-dashboard";

export const metadata = {
  title: "Academy | SoloSuccess AI",
  description: "Level up your skills with personalized learning paths.",
};

export default function AcademyPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <AcademyDashboard />
    </div>
  );
}
