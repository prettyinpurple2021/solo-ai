import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TemplateRenderer } from '@/components/templates/template-renderer'
import { getTemplateBySlug, type TemplateSummary } from '@/lib/template-catalog'

// Force dynamic rendering to prevent auth issues during static generation
export const dynamic = 'force-dynamic'

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
  const template: TemplateSummary | undefined = getTemplateBySlug(templateSlug) || undefined;

  if (!template) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#b300ff22,transparent_35%),radial-gradient(circle_at_bottom,#ff006e22,transparent_35%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none" />
      <div className="relative z-10 container mx-auto py-8 px-4">
        <Card className="bg-dark-card border-neon-purple/30 shadow-[0_0_30px_rgba(179,0,255,0.2)] mb-6">
          <CardContent className="p-6">
            <div className="rounded-sm p-[2px] bg-gradient-to-r from-neon-purple via-neon-magenta to-neon-cyan mb-6">
              <div className="rounded-sm bg-dark-card/90 backdrop-blur-md border-2 border-neon-purple/30 px-6 py-4">
                <h1 className="text-4xl font-bold font-orbitron bg-gradient-to-r from-neon-purple to-neon-magenta bg-clip-text text-transparent uppercase tracking-wider">
                  {template.title}
                </h1>
                <p className="text-lg text-gray-400 font-mono mt-2">{template.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-neon-cyan/40 text-gray-300 font-mono">
                    Role: {template.requiredRole}
                  </Badge>
                  <Badge 
                    variant={template.isInteractive ? 'default' : 'secondary'}
                    className={template.isInteractive ? 'bg-neon-purple/20 text-neon-purple border-neon-purple/30 font-mono' : 'bg-gray-700/50 text-gray-400 border-gray-600 font-mono'}
                  >
                    {template.isInteractive ? 'Interactive' : 'Static'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <TemplateRenderer slug={template.slug} />
      </div>
    </div>
  );
}