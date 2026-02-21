import { Metadata} from 'next'
import { SecurityDashboard} from '@/components/custom-agents/security-dashboard'

export const metadata: Metadata = {
  title: 'Agent Security Dashboard | SoloSuccess AI',
  description: 'Monitor and manage security for your AI agents',
}

export default function SecurityPage() {
  return (
    <div className="container mx-auto py-8">
      <SecurityDashboard />
    </div>
  )
}
