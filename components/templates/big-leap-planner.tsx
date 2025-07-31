'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useTemplateSave } from '@/hooks/use-template-save';
import { Save, Zap } from 'lucide-react';

export function BigLeapPlanner() {
  const [leapDescription, setLeapDescription] = useState('');
  const [whyNow, setWhyNow] = useState('');
  const [worstCase, setWorstCase] = useState('');
  const [bestCase, setBestCase] = useState('');
  const [preparationSteps, setPreparationSteps] = useState('');
  const [supportNeeded, setSupportNeeded] = useState('');
  const [title, setTitle] = useState('');
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const handleSave = async () => {
    const templateData = {
      leapDescription,
      whyNow,
      worstCase,
      bestCase,
      preparationSteps,
      supportNeeded,
    };

    const saveTitle = title || `Big Leap: ${leapDescription?.substring(0, 30) || 'Untitled Leap'}`;
    
    await saveTemplate('big-leap-planner', templateData, saveTitle, 'Bold move planning and preparation');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">"Big Leap" Planner</h3>
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
          <Label htmlFor="leapDescription">The Big Leap</Label>
          <Textarea
            id="leapDescription"
            placeholder="Describe the bold move, pivot, or risk you're considering..."
            value={leapDescription}
            onChange={(e) => setLeapDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="whyNow">Why Now?</Label>
          <Textarea
            id="whyNow"
            placeholder="What makes this the right time? What's driving this decision?"
            value={whyNow}
            onChange={(e) => setWhyNow(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="worstCase">Worst Case Scenario</Label>
            <Textarea
              id="worstCase"
              placeholder="What's the worst that could happen?"
              value={worstCase}
              onChange={(e) => setWorstCase(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="bestCase">Best Case Scenario</Label>
            <Textarea
              id="bestCase"
              placeholder="What's the best possible outcome?"
              value={bestCase}
              onChange={(e) => setBestCase(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="preparationSteps">Preparation Steps</Label>
          <Textarea
            id="preparationSteps"
            placeholder="What do you need to do to prepare? What resources do you need?"
            value={preparationSteps}
            onChange={(e) => setPreparationSteps(e.target.value)}
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="supportNeeded">Support Needed</Label>
          <Textarea
            id="supportNeeded"
            placeholder="Who can help you? What kind of support do you need?"
            value={supportNeeded}
            onChange={(e) => setSupportNeeded(e.target.value)}
            rows={3}
          />
        </div>

        <Button onClick={handleSave} className="self-start" disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          Save to Briefcase
        </Button>
      </div>
    </div>
  );
}