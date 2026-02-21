import { SubscriptionManager} from '@/components/subscription/subscription-manager'

export const dynamic = 'force-dynamic'

export default function SubscriptionPage() {
  return (
    <div className="container mx-auto py-6">
      <SubscriptionManager />
    </div>
  )
}
