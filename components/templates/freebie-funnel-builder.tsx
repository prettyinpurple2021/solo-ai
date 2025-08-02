'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useTemplateSave } from '@/hooks/use-template-save';
import { Save, Zap, ArrowRight, Mail, Gift } from 'lucide-react';

interface FunnelStep {
  type: 'lead-magnet' | 'email' | 'product-teaser';
  title: string;
  description: string;
  timing: string;
}

export function FreebieFunnelBuilder() {
  const [leadMagnet, setLeadMagnet] = useState('');
  const [leadMagnetDescription, setLeadMagnetDescription] = useState('');
  const [emailSeries, setEmailSeries] = useState('');
  const [emailCount, setEmailCount] = useState('5');
  const [productTeaser, setProductTeaser] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [funnel, setFunnel] = useState<FunnelStep[]>([]);
  const [title, setTitle] = useState('');
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const handleBuildFunnel = () => {
    const generatedFunnel: FunnelStep[] = [
      {
        type: 'lead-magnet',
        title: leadMagnet || 'Free Resource',
        description: leadMagnetDescription || 'A valuable resource to attract your ideal audience',
        timing: 'Day 0 - Immediate delivery'
      },
      {
        type: 'email',
        title: `Welcome Email - ${leadMagnet} Delivery`,
        description: 'Deliver the promised resource and set expectations',
        timing: 'Day 0 - Immediate'
      },
      {
        type: 'email',
        title: 'Value Email #1',
        description: 'Share helpful tips related to your niche',
        timing: 'Day 1'
      },
      {
        type: 'email',
        title: 'Story Email',
        description: 'Share your personal story or case study',
        timing: 'Day 3'
      },
      {
        type: 'email',
        title: 'Value Email #2',
        description: 'More actionable content and tips',
        timing: 'Day 5'
      },
      {
        type: 'product-teaser',
        title: productTeaser || 'Special Offer',
        description: productDescription || 'Your main product or service offer',
        timing: 'Day 7 - Soft pitch'
      }
    ];
    setFunnel(generatedFunnel);
  };

  const handleSave = async () => {
    const templateData = {
      leadMagnet,
      leadMagnetDescription,
      emailSeries,
      emailCount,
      productTeaser,
      productDescription,
      targetAudience,
      funnel,
      dateCreated: new Date().toISOString(),
    };

    const saveTitle = title || `${leadMagnet || 'Freebie'} Funnel`;
    
    await saveTemplate('freebie-funnel-builder', templateData, saveTitle, `${funnel.length} step funnel with ${emailCount} emails`);
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'lead-magnet': return <Gift className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'product-teaser': return <Zap className="w-4 h-4" />;
      default: return <ArrowRight className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Freebie Funnel Builder</h3>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Save as..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-48"
          />
          <Button onClick={handleSave} disabled={isSaving || funnel.length === 0}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save to Briefcase'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label htmlFor="audience">Target Audience</Label>
            <Input
              id="audience"
              placeholder="Who is this funnel for?"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="leadMagnet">Lead Magnet Title</Label>
            <Input
              id="leadMagnet"
              placeholder="e.g., Free PDF Guide, Checklist, Mini-Course"
              value={leadMagnet}
              onChange={(e) => setLeadMagnet(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="leadDescription">Lead Magnet Description</Label>
            <Textarea
              id="leadDescription"
              placeholder="What value does this resource provide? What problem does it solve?"
              value={leadMagnetDescription}
              onChange={(e) => setLeadMagnetDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="emailSeries">Email Series Theme</Label>
            <Input
              id="emailSeries"
              placeholder="e.g., 5-day challenge, Weekly tips, Course preview"
              value={emailSeries}
              onChange={(e) => setEmailSeries(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="emailCount">Number of Emails</Label>
            <Input
              id="emailCount"
              type="number"
              placeholder="5"
              value={emailCount}
              onChange={(e) => setEmailCount(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="productTeaser">Product/Service Offer</Label>
            <Input
              id="productTeaser"
              placeholder="e.g., Course, Coaching, Service"
              value={productTeaser}
              onChange={(e) => setProductTeaser(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="productDescription">Offer Description</Label>
            <Textarea
              id="productDescription"
              placeholder="What are you selling? What's the main benefit?"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={handleBuildFunnel} className="w-full">
            Build Funnel
          </Button>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Funnel Flow</h4>
          {funnel.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Fill out the form and click "Build Funnel" to see your complete funnel flow
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {funnel.map((step, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {getStepIcon(step.type)}
                      {step.title}
                      <Badge variant="outline" className="ml-auto">
                        {step.timing}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 