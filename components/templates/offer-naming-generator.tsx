'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useTemplateSave } from '@/hooks/use-template-save';
import { Save, Lightbulb, Plus, Trash2 } from 'lucide-react';

interface OfferName {
  id: string;
  name: string;
  reasoning: string;
}

export function OfferNamingGenerator() {
  const [productDetails, setProductDetails] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [vibe, setVibe] = useState('');
  const [generatedNames, setGeneratedNames] = useState<OfferName[]>([]);
  const [title, setTitle] = useState('');
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const generateNames = () => {
    // Simple name generation based on inputs
    const names = [
      { id: '1', name: `${targetAudience} ${productDetails} Pro`, reasoning: 'Professional, target-focused naming' },
      { id: '2', name: `The ${vibe} ${productDetails}`, reasoning: 'Emphasizes brand vibe and product' },
      { id: '3', name: `${productDetails} Accelerator`, reasoning: 'Implies speed and results' },
      { id: '4', name: `${vibe} ${targetAudience} Blueprint`, reasoning: 'Suggests proven system' },
      { id: '5', name: `Ultimate ${productDetails} Toolkit`, reasoning: 'Comprehensive solution positioning' },
    ];
    setGeneratedNames(names);
  };

  const removeNameOption = (id: string) => {
    setGeneratedNames(names => names.filter(name => name.id !== id));
  };

  const handleSave = async () => {
    const templateData = {
      productDetails,
      targetAudience,
      vibe,
      generatedNames,
    };

    const saveTitle = title || `Offer Names: ${productDetails || 'Untitled Product'}`;
    
    await saveTemplate('offer-naming-generator', templateData, saveTitle, `${generatedNames.length} name options`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold">Offer Naming Generator</h3>
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
            Save
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          <Label htmlFor="productDetails">Product Details</Label>
          <Textarea
            id="productDetails"
            placeholder="Describe your product or service..."
            value={productDetails}
            onChange={(e) => setProductDetails(e.target.value)}
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="targetAudience">Target Audience</Label>
          <Input
            id="targetAudience"
            placeholder="Who is this for? (e.g., Solo Entrepreneurs, Coaches, etc.)"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="vibe">Brand Vibe & Tone</Label>
          <Input
            id="vibe"
            placeholder="What vibe are you going for? (e.g., Premium, Playful, Professional)"
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
          />
        </div>

        <Button onClick={generateNames} className="self-start">
          <Plus className="w-4 h-4 mr-2" />
          Generate Name Ideas
        </Button>

        {generatedNames.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold">Generated Names:</h4>
            {generatedNames.map((nameOption) => (
              <div key={nameOption.id} className="p-3 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium">{nameOption.name}</h5>
                    <p className="text-sm text-gray-600">{nameOption.reasoning}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeNameOption(nameOption.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button onClick={handleSave} className="self-start" disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          Save to Briefcase
        </Button>
      </div>
    </div>
  );
}