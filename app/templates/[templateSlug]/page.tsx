import { getTemplateBySlug } from '@/lib/templates-client';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import * as TemplateComponents from '@/components/templates';
import { checkRequiredEnvVars } from '@/lib/env-validation';

// Make this page dynamic to avoid static generation issues
export const dynamic = 'force-dynamic';

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

    if (!hasRequiredEnv) {
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

    const template = await getTemplateBySlug(templateSlug);

    if (!template) {
      notFound();
    }

    const TemplateComponent = TemplateComponents[template.slug as keyof typeof TemplateComponents];

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