// @ts-nocheck
'use client';

import { Button} from '@/components/ui/button';
import { Input} from '@/components/ui/input';
import { Textarea} from '@/components/ui/textarea';
import { Label} from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import { Badge} from '@/components/ui/badge';
import { useState} from 'react';
import { useTemplateSave} from '@/hooks/use-template-save';
import { Save, Sparkles, Plus, Trash2} from 'lucide-react';
import { logError } from '@/lib/logger';

interface NameOption {
  name: string;
  reason: string;
  vibe: string;
  tone: string;
}

export function OfferNamingGenerator() {
  const [productDescription, setProductDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useState('');
  const [pricePoint, setPricePoint] = useState('');
  const [industry, setIndustry] = useState('');
  const [keyBenefits, setKeyBenefits] = useState<string[]>([]);
  const [generatedNames, setGeneratedNames] = useState<NameOption[]>([]);
  const [title, setTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMetadata, setGeneratedMetadata] = useState<any>(null);
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const generateNames = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/templates/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'offer-naming',
          productDescription,
          targetAudience,
          pricePoint: pricePoint || undefined,
          industry: industry || undefined,
          keyBenefits: keyBenefits.length > 0 ? keyBenefits : undefined,
          tone: tone || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate names');
      }

      const result = await response.json();
      
      if (result.success && result.content) {
        setGeneratedNames(result.content);
        setGeneratedMetadata({
          ...result.metadata,
          templateType: result.templateType,
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      logError('Error generating offer names', {
        productDescription,
        targetAudience,
        tone,
        pricePoint,
        industry
      }, error instanceof Error ? error : new Error(String(error)));
      
      // Fallback to sample names
      const fallbackNames: NameOption[] = [
        {
          name: `${productDescription} Pro`,
          reason: "Simple, professional, and clear about the product",
          vibe: "Professional",
          tone: "Confident"
        },
        {
          name: `${targetAudience} Success System`, 
          reason: "Targets the audience with clear benefit",
          vibe: "Results-focused",
          tone: "Direct"
        },
        {
          name: `${productDescription} Mastery Program`,
          reason: "Suggests expertise and comprehensive learning",
          vibe: "Educational",
          tone: "Authoritative"
        }
      ];
      setGeneratedNames(fallbackNames);
    } finally {
      setIsGenerating(false);
    }
  };

  const addCustomName = () => {
    setGeneratedNames([...generatedNames, { name: '', reason: '', vibe: '', tone: '' }]);
  };

  const updateName = (index: number, field: keyof NameOption, value: string) => {
    const newNames = [...generatedNames];
    newNames[index][field] = value;
    setGeneratedNames(newNames);
  };

  const removeName = (index: number) => {
    setGeneratedNames(generatedNames.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const templateData = {
      productDetails,
      targetAudience,
      desiredVibe,
      keywords,
      generatedNames,
      totalNames: generatedNames.length,
    };

    const saveTitle = title || `Offer Names (${generatedNames.length} options)`;
    
    await saveTemplate('offer-naming-generator', templateData, saveTitle, `${generatedNames.length} name options generated`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold font-orbitron text-white uppercase tracking-wider">Offer Naming Generator</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Save as..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-48"
          />
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="bg-chart-5/10 p-4 rounded-lg border border-chart-5/20">
        <p className="text-sm text-chart-5">
          <Sparkles className="w-4 h-4 inline mr-2" />
          Create compelling names for your offers with AI-generated options that match your vibe and target audience.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="productDetails">Product/Service Details</Label>
            <Textarea
              id="productDetails"
              placeholder="Describe what you're offering. What problem does it solve? What transformation does it provide?"
              value={productDetails}
              onChange={(e) => setProductDetails(e.target.value)}
              rows={4}
            />
          </div>
          <div>
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Textarea
              id="targetAudience"
              placeholder="Who is this for? Solo entrepreneurs, busy moms, tech founders, etc."
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="desiredVibe">Desired Vibe</Label>
            <Input
              id="desiredVibe"
              placeholder="e.g., Bold & Confident, Warm & Approachable, Elite & Exclusive"
              value={desiredVibe}
              onChange={(e) => setDesiredVibe(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="keywords">Keywords to Include (Optional)</Label>
            <Input
              id="keywords"
              placeholder="e.g., founder, accelerator, system, blueprint, mastery"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={generateNames}>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate AI Names
          </Button>
          <Button onClick={addCustomName} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Name
          </Button>
        </div>

        {generatedNames.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-medium font-orbitron text-white uppercase tracking-wider">Generated Name Options</h4>
              <Badge variant="secondary">{generatedNames.length} options</Badge>
            </div>

            {generatedNames.map((nameOption, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{nameOption.name || `Option ${index + 1}`}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeName(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      placeholder="Enter the offer name..."
                      value={nameOption.name}
                      onChange={(e) => updateName(index, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Why This Works</Label>
                    <Textarea
                      placeholder="Explain why this name is effective for your audience and goals..."
                      value={nameOption.reason}
                      onChange={(e) => updateName(index, 'reason', e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Vibe</Label>
                      <Input
                        placeholder="e.g., Professional, Fun, Exclusive"
                        value={nameOption.vibe}
                        onChange={(e) => updateName(index, 'vibe', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Tone</Label>
                      <Input
                        placeholder="e.g., Confident, Approachable, Authority"
                        value={nameOption.tone}
                        onChange={(e) => updateName(index, 'tone', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          Save to Briefcase
        </Button>
      </div>
    </div>
  );
}
