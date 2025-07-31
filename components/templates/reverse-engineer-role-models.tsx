'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useTemplateSave } from '@/hooks/use-template-save';
import { Save, Search } from 'lucide-react';

export function ReverseEngineerRoleModels() {
  const [roleModelName, setRoleModelName] = useState('');
  const [whySuccessful, setWhySuccessful] = useState('');
  const [keyStrategies, setKeyStrategies] = useState('');
  const [applicableElements, setApplicableElements] = useState('');
  const [actionPlan, setActionPlan] = useState('');
  const [title, setTitle] = useState('');
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const handleSave = async () => {
    const templateData = {
      roleModelName,
      whySuccessful,
      keyStrategies,
      applicableElements,
      actionPlan,
    };

    const saveTitle = title || `Role Model Analysis: ${roleModelName || 'Untitled'}`;
    
    await saveTemplate('reverse-engineer-role-models', templateData, saveTitle, 'Success pattern analysis');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Reverse Engineer Your Role Models</h3>
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
          <Label htmlFor="roleModelName">Role Model Name</Label>
          <Input
            id="roleModelName"
            placeholder="Who is your role model or inspiration?"
            value={roleModelName}
            onChange={(e) => setRoleModelName(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="whySuccessful">Why Are They Successful?</Label>
          <Textarea
            id="whySuccessful"
            placeholder="What makes them successful? What are their key achievements?"
            value={whySuccessful}
            onChange={(e) => setWhySuccessful(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="keyStrategies">Key Strategies & Patterns</Label>
          <Textarea
            id="keyStrategies"
            placeholder="What specific strategies, patterns, or approaches do they use?"
            value={keyStrategies}
            onChange={(e) => setKeyStrategies(e.target.value)}
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="applicableElements">What Can You Apply?</Label>
          <Textarea
            id="applicableElements"
            placeholder="Which elements can you adapt for your own business or situation?"
            value={applicableElements}
            onChange={(e) => setApplicableElements(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="actionPlan">Action Plan</Label>
          <Textarea
            id="actionPlan"
            placeholder="What specific actions will you take to implement these insights?"
            value={actionPlan}
            onChange={(e) => setActionPlan(e.target.value)}
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