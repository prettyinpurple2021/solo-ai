import { IntegrationHub } from '@/components/integrations/integration-hub';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Integrations Hub | SoloBoss AI',
  description: 'Connect your favorite tools and supercharge your empire!',
};

export default function IntegrationsPage() {
  return (
    <div className="container mx-auto py-8">
      <IntegrationHub />
    </div>
  );
}
