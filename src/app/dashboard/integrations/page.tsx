import { IntegrationHub} from '@/components/integrations/integration-hub';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Integrations Hub | SoloSuccess AI',
  description: 'Connect your favorite tools and supercharge your empire!',
};

export default function IntegrationsPage() {
  return (
    <div className="container mx-auto py-8">
      <IntegrationHub />
    </div>
  );
}
