'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useTemplateSave } from '@/hooks/use-template-save';
import { Save, TrendingUp, Plus, ArrowRight, DollarSign } from 'lucide-react';

interface UpsellStep {
  type: 'initial-offer' | 'upsell' | 'downsell' | 'loyalty';
  title: string;
  description: string;
  price: string;
  conversionGoal: string;
}

export function UpsellFlowBuilder() {
  const [businessType, setBusinessType] = useState('');
  const [initialOffer, setInitialOffer] = useState('');
  const [initialPrice, setInitialPrice] = useState('');
  const [targetCustomer, setTargetCustomer] = useState('');
  const [steps, setSteps] = useState<UpsellStep[]>([
    {
      type: 'initial-offer',
      title: 'Initial Offer',
      description: 'Your main product or service',
      price: '',
      conversionGoal: '30%'
    }
  ]);
  const [title, setTitle] = useState('');
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const addUpsellStep = (type: UpsellStep['type']) => {
    const stepTitles: Record<UpsellStep['type'], string> = {
      'initial-offer': 'Initial Offer',
      'upsell': 'Upsell Offer',
      'downsell': 'Downsell Alternative', 
      'loyalty': 'Loyalty Program'
    };
    
    const newStep: UpsellStep = {
      type,
      title: stepTitles[type] || 'New Step',
      description: 'Add description for this step',
      price: '',
      conversionGoal: '15%'
    };
    
    setSteps([...steps, newStep]);
  };

  const updateStep = (index: number, field: keyof UpsellStep, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const generateSuggestedFlow = () => {
    const suggestedSteps: UpsellStep[] = [
      {
        type: 'initial-offer',
        title: initialOffer || 'Main Product',
        description: 'Your core product or service offering',
        price: initialPrice || '$97',
        conversionGoal: '30%'
      },
      {
        type: 'upsell',
        title: `${initialOffer} Premium Bundle`,
        description: 'Enhanced version with additional features and bonuses',
        price: '$197',
        conversionGoal: '20%'
      },
      {
        type: 'upsell',
        title: 'One-on-One Consultation',
        description: 'Personal 60-minute strategy session',
        price: '$297',
        conversionGoal: '10%'
      },
      {
        type: 'downsell',
        title: `${initialOffer} Lite`,
        description: 'Simplified version for budget-conscious customers',
        price: '$47',
        conversionGoal: '25%'
      },
      {
        type: 'loyalty',
        title: 'VIP Member Program',
        description: 'Ongoing access to exclusive content and discounts',
        price: '$27/month',
        conversionGoal: '40%'
      }
    ];
    
    setSteps(suggestedSteps);
  };

  const handleSave = async () => {
    const templateData = {
      businessType,
      initialOffer,
      initialPrice,
      targetCustomer,
      steps,
      totalSteps: steps.length,
      dateCreated: new Date().toISOString(),
    };

    const saveTitle = title || `${initialOffer || 'Product'} Upsell Flow`;
    
    await saveTemplate('upsell-flow-builder', templateData, saveTitle, `${steps.length} step customer journey`);
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'initial-offer': return <DollarSign className="w-4 h-4 text-blue-600" />;
      case 'upsell': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'downsell': return <ArrowRight className="w-4 h-4 text-orange-600" />;
      case 'loyalty': return <Badge className="w-4 h-4 text-purple-600" />;
      default: return <Plus className="w-4 h-4" />;
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'initial-offer': return 'bg-blue-50 border-blue-200';
      case 'upsell': return 'bg-green-50 border-green-200';
      case 'downsell': return 'bg-orange-50 border-orange-200';
      case 'loyalty': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Upsell Flow Builder</h3>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Save as..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-48"
          />
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save to Briefcase'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4">
          <div>
            <Label htmlFor="businessType">Business Type</Label>
            <Input
              id="businessType"
              placeholder="e.g., Online course, Coaching, SaaS"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="initialOffer">Initial Offer</Label>
            <Input
              id="initialOffer"
              placeholder="e.g., Digital Marketing Course"
              value={initialOffer}
              onChange={(e) => setInitialOffer(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="initialPrice">Initial Price</Label>
            <Input
              id="initialPrice"
              placeholder="e.g., $97"
              value={initialPrice}
              onChange={(e) => setInitialPrice(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="targetCustomer">Target Customer</Label>
            <Textarea
              id="targetCustomer"
              placeholder="Describe your ideal customer"
              value={targetCustomer}
              onChange={(e) => setTargetCustomer(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Button onClick={generateSuggestedFlow} className="w-full">
              Generate Suggested Flow
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => addUpsellStep('upsell')}>
                <Plus className="w-4 h-4 mr-1" />
                Upsell
              </Button>
              <Button variant="outline" size="sm" onClick={() => addUpsellStep('downsell')}>
                <Plus className="w-4 h-4 mr-1" />
                Downsell
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => addUpsellStep('loyalty')} className="w-full">
              <Plus className="w-4 h-4 mr-1" />
              Loyalty Program
            </Button>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <h4 className="font-medium">Customer Journey Flow</h4>
          
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className={getStepColor(step.type)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      {getStepIcon(step.type)}
                      <Input
                        value={step.title}
                        onChange={(e) => updateStep(index, 'title', e.target.value)}
                        className="font-medium border-none p-0 h-auto bg-transparent"
                      />
                      <Badge variant="outline" className="ml-auto">
                        {step.conversionGoal}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Textarea
                      value={step.description}
                      onChange={(e) => updateStep(index, 'description', e.target.value)}
                      className="text-sm border-none p-0 resize-none bg-transparent"
                      rows={2}
                      placeholder="Describe this offer..."
                    />
                    <div className="flex gap-2">
                      <Input
                        value={step.price}
                        onChange={(e) => updateStep(index, 'price', e.target.value)}
                        placeholder="Price"
                        className="flex-1"
                      />
                      <Input
                        value={step.conversionGoal}
                        onChange={(e) => updateStep(index, 'conversionGoal', e.target.value)}
                        placeholder="Conv. Goal"
                        className="w-24"
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {index < steps.length - 1 && (
                  <div className="flex justify-center my-2">
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {steps.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Add your business details and click "Generate Suggested Flow" to create your upsell sequence
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 