import { Metadata} from "next"
import { TrainingDashboard} from "@/components/custom-agents/training-dashboard"

export const metadata: Metadata = {
  title: "Agent Training Dashboard | SoloSuccess AI",
  description: "Monitor and optimize your custom AI agents' performance with advanced training analytics and fine-tuning capabilities.",
}

export default function TrainingPage() {
  return (
    <div className="container mx-auto py-6">
      <TrainingDashboard />
    </div>
  )
}
