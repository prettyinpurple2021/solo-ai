
import { getTemplateBySlug } from '@/lib/supabase-client';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import * as TemplateComponents from '@/components/templates';

type TemplatePageProps = {
  params: {
    templateSlug: string;
  };
};

export default async function TemplatePage({ params }: TemplatePageProps) {
  const template = await getTemplateBySlug(params.templateSlug);

  if (!template) {
    notFound();
  }

  const TemplateComponent = TemplateComponents[template.slug as keyof typeof TemplateComponents];

  return (
    <div>
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
          {TemplateComponent ? <TemplateComponent /> : <p>This template is not interactive.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
