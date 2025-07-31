'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useTemplateSave } from '@/hooks/use-template-save';
import { Save, AlertTriangle } from 'lucide-react';

export function PreMortemTemplate() {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [potentialFailures, setPotentialFailures] = useState('');
  const [preventionPlans, setPreventionPlans] = useState('');
  const [title, setTitle] = useState('');
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const handleSave = async () => {
    const templateData = {
      projectName,
      projectDescription,
      potentialFailures,
      preventionPlans,
    };

    const saveTitle = title || `Pre-Mortem: ${projectName || 'Untitled Project'}`;
    
    await saveTemplate('pre-mortem-template', templateData, saveTitle, 'Risk assessment and prevention planning');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold">Pre-Mortem Template</h3>
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
          <Label htmlFor="projectName">Project Name</Label>
          <Input
            id="projectName"
            placeholder="What project are you planning?"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="projectDescription">Project Description</Label>
          <Textarea
            id="projectDescription"
            placeholder="Describe your project goals, timeline, and key components..."
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="potentialFailures">Potential Failures & Risks</Label>
          <Textarea
            id="potentialFailures"
            placeholder="What could go wrong? List potential failures, roadblocks, and risks..."
            value={potentialFailures}
            onChange={(e) => setPotentialFailures(e.target.value)}
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="preventionPlans">Prevention & Mitigation Plans</Label>
          <Textarea
            id="preventionPlans"
            placeholder="How will you prevent or mitigate each risk? What's your backup plan?"
            value={preventionPlans}
            onChange={(e) => setPreventionPlans(e.target.value)}
            rows={4}
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