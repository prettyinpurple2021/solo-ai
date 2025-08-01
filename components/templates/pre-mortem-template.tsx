'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { useTemplateSave } from '@/hooks/use-template-save';
import { Save, Plus, Trash2 } from 'lucide-react';

interface RiskItem {
  risk: string;
  probability: string;
  impact: string;
  mitigation: string;
}

export function PreMortemTemplate() {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [risks, setRisks] = useState<RiskItem[]>([
    { risk: '', probability: '', impact: '', mitigation: '' }
  ]);
  const [title, setTitle] = useState('');
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const addRisk = () => {
    setRisks([...risks, { risk: '', probability: '', impact: '', mitigation: '' }]);
  };

  const removeRisk = (index: number) => {
    setRisks(risks.filter((_, i) => i !== index));
  };

  const updateRisk = (index: number, field: keyof RiskItem, value: string) => {
    const newRisks = [...risks];
    newRisks[index][field] = value;
    setRisks(newRisks);
  };

  const handleSave = async () => {
    const templateData = {
      projectName,
      projectDescription,
      risks,
      totalRisks: risks.length,
    };

    const saveTitle = title || `Pre-Mortem: ${projectName || 'Untitled Project'}`;
    
    await saveTemplate('pre-mortem-template', templateData, saveTitle, `${risks.length} potential risks identified`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Pre-Mortem Template</h3>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="projectName">Project Name</Label>
          <Input
            id="projectName"
            placeholder="e.g., New Product Launch"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="projectDescription">Project Description</Label>
          <Textarea
            id="projectDescription"
            placeholder="Briefly describe your project and its goals..."
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium">Potential Risks & Mitigations</h4>
          <Button onClick={addRisk} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Risk
          </Button>
        </div>

        {risks.map((risk, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Risk #{index + 1}</CardTitle>
                {risks.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRisk(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>What could go wrong?</Label>
                <Textarea
                  placeholder="Describe the potential risk or failure..."
                  value={risk.risk}
                  onChange={(e) => updateRisk(index, 'risk', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Probability</Label>
                  <Input
                    placeholder="e.g., High, Medium, Low"
                    value={risk.probability}
                    onChange={(e) => updateRisk(index, 'probability', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Impact</Label>
                  <Input
                    placeholder="e.g., Critical, Major, Minor"
                    value={risk.impact}
                    onChange={(e) => updateRisk(index, 'impact', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Mitigation Strategy</Label>
                <Textarea
                  placeholder="How can you prevent or minimize this risk?"
                  value={risk.mitigation}
                  onChange={(e) => updateRisk(index, 'mitigation', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4">
        <Button>Generate AI Insights</Button>
        <Button variant="outline" onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          Save to Briefcase
        </Button>
      </div>
    </div>
  );
}