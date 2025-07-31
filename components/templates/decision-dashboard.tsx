'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';
import { useTemplateSave } from '@/hooks/use-template-save';
import { Save, Download } from 'lucide-react';

export function DecisionDashboard() {
  const [decision, setDecision] = useState('');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [impact, setImpact] = useState(5);
  const [confidence, setConfidence] = useState(5);
  const [title, setTitle] = useState('');
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const handleSave = async () => {
    const templateData = {
      decision,
      pros,
      cons,
      impact,
      confidence,
    };

    const saveTitle = title || `Decision: ${decision || 'Untitled Decision'}`;
    
    await saveTemplate('decision-dashboard', templateData, saveTitle, `Impact: ${impact}/10, Confidence: ${confidence}/10`);
  };

  const handleLoad = (savedData: any) => {
    setDecision(savedData.decision || '');
    setPros(savedData.pros || '');
    setCons(savedData.cons || '');
    setImpact(savedData.impact || 5);
    setConfidence(savedData.confidence || 5);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Decision Dashboard</h3>
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
      
      <div>
        <Label htmlFor="decision">Decision</Label>
        <Input
          id="decision"
          placeholder="e.g., Change app pricing from free to subscription"
          value={decision}
          onChange={(e) => setDecision(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="pros">Pros</Label>
        <Textarea
          id="pros"
          placeholder="List the potential upsides..."
          value={pros}
          onChange={(e) => setPros(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="cons">Cons</Label>
        <Textarea
          id="cons"
          placeholder="List the potential downsides..."
          value={cons}
          onChange={(e) => setCons(e.target.value)}
        />
      </div>
      <div>
        <Label>Impact (1-10)</Label>
        <Slider value={[impact]} onValueChange={(v) => setImpact(v[0])} max={10} step={1} />
        <div className="text-sm text-muted-foreground mt-1">Current: {impact}/10</div>
      </div>
      <div>
        <Label>Confidence (1-10)</Label>
        <Slider value={[confidence]} onValueChange={(v) => setConfidence(v[0])} max={10} step={1} />
        <div className="text-sm text-muted-foreground mt-1">Current: {confidence}/10</div>
      </div>
      
      <div className="flex gap-4">
        <Button>Make Decision</Button>
        <Button variant="outline" onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          Save to Briefcase
        </Button>
      </div>
    </div>
  );
} 