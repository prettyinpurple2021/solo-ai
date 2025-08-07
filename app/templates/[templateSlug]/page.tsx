import { getTemplateBySlug } from '@/lib/templates-client';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { templateComponents } from '@/components/templates';
import { checkRequiredEnvVars } from '@/lib/env-validation';
import templateData from '@/data/templates.json';

// Helper function to find template in JSON data
function findTemplateInJson(slug: string) {
  for (const category of templateData) {
    const template = category.templates.find(t => t.slug === slug);
    if (template) {
      return template;
    }
  }
  return null;
}

// Static params for all available templates
export async function generateStaticParams() {
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
  try {
    // Await the params in Next.js 15+
    const { templateSlug } = await params;

    // Check if required environment variables are available
    const hasRequiredEnv = checkRequiredEnvVars([
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ]);

    // In development mode or build time, use fallback data to avoid database issues
    const isDev = process.env.NODE_ENV === 'development';
    const isBuildTime = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';

    // During build time, always use fallback data to avoid database connection issues
    if (isBuildTime) {
      const template = findTemplateInJson(templateSlug);
      if (!template) {
        notFound();
      }
      
      const TemplateComponent = templateComponents[template.slug];
      
      return (
        <div className="container mx-auto py-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold">{template.title}</h1>
            <p className="text-lg text-muted-foreground mt-2">{template.description}</p>
            <div className="mt-4 flex space-x-2">
              <Badge variant="outline">Role: {template.requiredRole}</Badge>
              <Badge variant={template.isInteractive ? 'default' : 'secondary'}>
                {template.isInteractive ? 'Interactive' : 'Static'}
              </Badge>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              {TemplateComponent ? (
                <TemplateComponent />
              ) : (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Template Preview</h3>
                  <p className="text-muted-foreground">
                    This template is currently in development. The interactive component will be available soon.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    if (!hasRequiredEnv && !isDev) {
      return (
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="p-6">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
              <p className="text-muted-foreground">
                This template requires database connectivity. Please ensure all environment variables are properly configured.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Get template information (will fallback to JSON if database not available)
    const template = await getTemplateBySlug(templateSlug);

    if (!template) {
      notFound();
    }

    // Map kebab-case slug to PascalCase component name if needed
    // If your templateComponents map uses PascalCase keys, use this:
    // const getComponentName = (slug: string): string =>
    //   slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    // const componentName = getComponentName(template.slug);
    // const TemplateComponent = templateComponents[componentName as keyof typeof templateComponents];
    // Otherwise, if using slug as key directly (recommended):
    const TemplateComponent = templateComponents[template.slug];

    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold">{template.title}</h1>
          <p className="text-lg text-muted-foreground mt-2">{template.description}</p>
          <div className="mt-4 flex space-x-2">
            <Badge variant="outline">Role: {template.requiredRole}</Badge>
            <Badge variant={template.isInteractive ? 'default' : 'secondary'}>
              {template.isInteractive ? 'Interactive' : 'Static'}
            </Badge>
          </div>
        </div>

        {/* Show environment warning if database features unavailable */}
        {!hasRequiredEnv && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <span className="text-yellow-600">⚠️</span>
                <p className="text-yellow-800">
                  Template save functionality is currently unavailable. You can still use the template, but changes won't be saved.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            {TemplateComponent ? (
              <TemplateComponent />
            ) : (
              <div>
                <h3 className="text-lg font-semibold mb-2">Template Preview</h3>
                <p className="text-muted-foreground">
                  This template is currently in development. The interactive component will be available soon.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Error loading template:', error);
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Template</h1>
            <p className="text-muted-foreground">
              There was an error loading this template. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
}