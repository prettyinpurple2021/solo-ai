import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import templateData from '@/data/templates.json';

// Helper function to find template in JSON data
function findTemplateInJson(slug: string) {
  for (const category of templateData) {
    const template = category.templates.find(t => t.slug === slug);
    if (template) {
      return {
        ...template,
        category: category.category,
        icon: category.icon,
        description: category.description
      };
    }
  }
  return null;
}

// Static params for all available templates
export function generateStaticParams() {
  const templateSlugs = [
    'decision-dashboard',
    'vision-board-generator',
    'quarterly-biz-review',
    'delegation-list-builder',
    'i-hate-this-tracker',
    'freebie-funnel-builder',
    'dm-sales-script-generator',
    'offer-comparison-matrix',
    'live-launch-tracker',
    'upsell-flow-builder',
    'pre-mortem-template',
    'reverse-engineer-role-models',
    'big-leap-planner',
    'offer-naming-generator',
    'founder-feelings-tracker',
    'brag-bank-template',
    'ai-collab-planner',
    'pr-pitch-template',
    'viral-hook-generator',
    'values-aligned-biz-filter'
  ];

  return templateSlugs.map((slug) => ({
    templateSlug: slug,
  }));
}

type TemplatePageProps = {
  params: Promise<{
    templateSlug: string;
  }>;
};

/**
 * Template page component that renders dynamic templates
 * Includes proper error handling and environment validation
 */
export default async function TemplatePage({ params }: TemplatePageProps) {
  const { templateSlug } = await params;

  // Get template information from JSON data
  const template = findTemplateInJson(templateSlug);

  if (!template) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="rounded-xl p-[2px] soloboss-gradient animate-gradient mb-6">
        <div className="rounded-xl bg-background/70 backdrop-blur-md border-2 border-purple-200 px-6 py-4">
          <h1 className="text-4xl font-bold boss-text-gradient">{template.title}</h1>
          <p className="text-lg text-muted-foreground mt-2">{template.description}</p>
          <div className="mt-4 flex space-x-2">
            <Badge variant="outline">Role: {template.requiredRole}</Badge>
            <Badge variant={template.isInteractive ? 'default' : 'secondary'}>
              {template.isInteractive ? 'Interactive' : 'Static'}
            </Badge>
          </div>
        </div>
      </div>

      <Card className="boss-card">
        <CardContent className="p-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 gradient-text-secondary">Template Preview</h3>
            <p className="text-muted-foreground">
              This template is currently in development. The interactive component will be available soon.
            </p>
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <h4 className="font-medium mb-2">Template Details:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><strong>Title:</strong> {template.title}</li>
                <li><strong>Category:</strong> {template.category}</li>
                <li><strong>Required Role:</strong> {template.requiredRole}</li>
                <li><strong>Interactive:</strong> {template.isInteractive ? 'Yes' : 'No'}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}