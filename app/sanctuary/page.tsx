import { SanctuaryDashboard } from "@/components/sanctuary/sanctuary-dashboard";

export const metadata = {
  title: "The Sanctuary | SoloSuccess AI",
  description: "Prevent burnout and maintain founder wellness.",
};

export default function SanctuaryPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">The Sanctuary</h1>
        <p className="text-muted-foreground">
             Your space for mental clarity and sustainable growth. Track your energy to protect your most valuable asset: yourself.
        </p>
      </div>
      <SanctuaryDashboard />
    </div>
  );
}
