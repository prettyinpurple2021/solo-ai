'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';
import { useTemplateSave } from '@/hooks/use-template-save';
import { Save, Heart, Shield, AlertTriangle } from 'lucide-react';

interface Opportunity {
  description: string;
  alignment: number;
  pros: string;
  cons: string;
  decision: string;
}

export function ValuesAlignedBizFilter() {
  const [coreValues, setCoreValues] = useState<string[]>(['']);
  const [longTermVision, setLongTermVision] = useState('');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([
    {
      description: '',
      alignment: 5,
      pros: '',
      cons: '',
      decision: ''
    }
  ]);
  const [title, setTitle] = useState('');
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const addValue = () => {
    setCoreValues([...coreValues, '']);
  };

  const updateValue = (index: number, value: string) => {
    const newValues = [...coreValues];
    newValues[index] = value;
    setCoreValues(newValues);
  };

  const removeValue = (index: number) => {
    setCoreValues(coreValues.filter((_, i) => i !== index));
  };

  const addOpportunity = () => {
    setOpportunities([...opportunities, {
      description: '',
      alignment: 5,
      pros: '',
      cons: '',
      decision: ''
    }]);
  };

  const updateOpportunity = (index: number, field: keyof Opportunity, value: string | number) => {
    const newOpportunities = [...opportunities];
    newOpportunities[index] = { ...newOpportunities[index], [field]: value };
    setOpportunities(newOpportunities);
  };

  const removeOpportunity = (index: number) => {
    setOpportunities(opportunities.filter((_, i) => i !== index));
  };

  const getAlignmentColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAlignmentLabel = (score: number) => {
    if (score >= 8) return 'Strong Alignment';
    if (score >= 6) return 'Moderate Alignment';
    return 'Poor Alignment';
  };

  const handleSave = async () => {
    const templateData = {
      coreValues: coreValues.filter(v => v.trim()),
      longTermVision,
      opportunities,
      totalOpportunities: opportunities.length,
      averageAlignment: opportunities.length > 0 
        ? Math.round(opportunities.reduce((sum, opp) => sum + opp.alignment, 0) / opportunities.length) 
        : 0,
    };

    const saveTitle = title || `Values Filter (${opportunities.length} opportunities)`;
    
    await saveTemplate('values-aligned-biz-filter', templateData, saveTitle, `${opportunities.filter(o => o.alignment >= 7).length} well-aligned opportunities`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Values-Aligned Biz Filter</h3>
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

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <Heart className="w-4 h-4 inline mr-2" />
          Filter business opportunities through your values and long-term vision. Build a business that feels authentic and sustainable.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-md flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Your Foundation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Core Values</Label>
              <p className="text-sm text-muted-foreground mb-2">
                What principles guide your decisions? What matters most to you?
              </p>
              {coreValues.map((value, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    placeholder={`Value ${index + 1}`}
                    value={value}
                    onChange={(e) => updateValue(index, e.target.value)}
                  />
                  {coreValues.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeValue(index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              <Button onClick={addValue} variant="outline" size="sm">
                Add Value
              </Button>
            </div>

            <div>
              <Label htmlFor="longTermVision">Long-term Vision</Label>
              <Textarea
                id="longTermVision"
                placeholder="Where do you see yourself and your business in 5-10 years? What legacy do you want to create?"
                value={longTermVision}
                onChange={(e) => setLongTermVision(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium">Opportunity Evaluation</h4>
            <Button onClick={addOpportunity} variant="outline" size="sm">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Add Opportunity
            </Button>
          </div>

          {opportunities.map((opportunity, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Opportunity #{index + 1}</CardTitle>
                  {opportunities.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOpportunity(index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Opportunity Description</Label>
                  <Textarea
                    placeholder="Describe the business opportunity, partnership, or decision you're considering..."
                    value={opportunity.description}
                    onChange={(e) => updateOpportunity(index, 'description', e.target.value)}
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Values Alignment (1-10)</Label>
                  <Slider
                    value={[opportunity.alignment]}
                    onValueChange={(value) => updateOpportunity(index, 'alignment', value[0])}
                    max={10}
                    step={1}
                    className="mt-2"
                  />
                  <div className={`text-sm mt-1 font-medium ${getAlignmentColor(opportunity.alignment)}`}>
                    {opportunity.alignment}/10 - {getAlignmentLabel(opportunity.alignment)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Pros</Label>
                    <Textarea
                      placeholder="What are the benefits? How does this serve your goals and values?"
                      value={opportunity.pros}
                      onChange={(e) => updateOpportunity(index, 'pros', e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Cons</Label>
                    <Textarea
                      placeholder="What concerns you? Where might this conflict with your values?"
                      value={opportunity.cons}
                      onChange={(e) => updateOpportunity(index, 'cons', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <div>
                  <Label>Decision</Label>
                  <Textarea
                    placeholder="Based on your values analysis, what's your decision? Any conditions or modifications needed?"
                    value={opportunity.decision}
                    onChange={(e) => updateOpportunity(index, 'decision', e.target.value)}
                    rows={2}
                  />
                </div>

                {opportunity.alignment >= 8 && (
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <div className="flex items-center text-green-800">
                      <Shield className="w-4 h-4 mr-2" />
                      <strong>Strong Values Match!</strong>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      This opportunity aligns well with your core values and vision.
                    </p>
                  </div>
                )}

                {opportunity.alignment <= 4 && (
                  <div className="bg-red-50 p-3 rounded border border-red-200">
                    <div className="flex items-center text-red-800">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      <strong>Values Conflict Alert</strong>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                      Consider if the benefits outweigh the misalignment with your values.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {opportunities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold">{opportunities.length}</div>
                  <div className="text-sm text-muted-foreground">Total Opportunities</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {opportunities.filter(o => o.alignment >= 7).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Well Aligned</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {opportunities.length > 0 
                      ? Math.round(opportunities.reduce((sum, opp) => sum + opp.alignment, 0) / opportunities.length) 
                      : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Alignment</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex gap-4">
        <Button>Generate Values Statement</Button>
        <Button variant="outline" onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          Save to Briefcase
        </Button>
      </div>
    </div>
  );
}