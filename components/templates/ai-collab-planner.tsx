'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useTemplateSave } from '@/hooks/use-template-save';
import { Save, Users, Calendar, Target } from 'lucide-react';

export function AiCollabPlanner() {
  const [collaborationType, setCollaborationType] = useState('');
  const [targetOutlet, setTargetOutlet] = useState('');
  const [audienceOverlap, setAudienceOverlap] = useState('');
  const [proposedTopics, setProposedTopics] = useState('');
  const [uniqueAngle, setUniqueAngle] = useState('');
  const [valueProposition, setValueProposition] = useState('');
  const [timeline, setTimeline] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [title, setTitle] = useState('');
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const handleSave = async () => {
    const templateData = {
      collaborationType,
      targetOutlet,
      audienceOverlap,
      proposedTopics,
      uniqueAngle,
      valueProposition,
      timeline,
      deliverables,
    };

    const saveTitle = title || `Collab Plan: ${targetOutlet || 'Untitled Collaboration'}`;
    
    await saveTemplate('ai-collab-planner', templateData, saveTitle, `${collaborationType} collaboration strategy`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold">AI Collab Planner</h3>
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
          <Label htmlFor="collaborationType">Collaboration Type</Label>
          <select 
            id="collaborationType"
            value={collaborationType}
            onChange={(e) => setCollaborationType(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select collaboration type...</option>
            <option value="Guest Post">📝 Guest Post</option>
            <option value="Podcast Appearance">🎙️ Podcast Appearance</option>
            <option value="Joint Webinar">💻 Joint Webinar</option>
            <option value="Social Media Collab">📱 Social Media Collaboration</option>
            <option value="Content Series">📚 Content Series</option>
            <option value="Product Partnership">🤝 Product Partnership</option>
          </select>
        </div>

        <div>
          <Label htmlFor="targetOutlet">Target Publication/Host</Label>
          <Input
            id="targetOutlet"
            placeholder="Which publication, podcast, or person are you targeting?"
            value={targetOutlet}
            onChange={(e) => setTargetOutlet(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="audienceOverlap">Audience Overlap Analysis</Label>
          <Textarea
            id="audienceOverlap"
            placeholder="How does your audience overlap? Why would their audience care about your content?"
            value={audienceOverlap}
            onChange={(e) => setAudienceOverlap(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="proposedTopics">Proposed Topics/Angles</Label>
          <Textarea
            id="proposedTopics"
            placeholder="What topics or angles could you discuss? List 3-5 specific ideas..."
            value={proposedTopics}
            onChange={(e) => setProposedTopics(e.target.value)}
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="uniqueAngle">Your Unique Angle</Label>
          <Textarea
            id="uniqueAngle"
            placeholder="What unique perspective, experience, or insight do you bring?"
            value={uniqueAngle}
            onChange={(e) => setUniqueAngle(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="valueProposition">Value Proposition</Label>
          <Textarea
            id="valueProposition"
            placeholder="What value will you provide to their audience? What will they learn or gain?"
            value={valueProposition}
            onChange={(e) => setValueProposition(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="timeline">Proposed Timeline</Label>
            <Input
              id="timeline"
              placeholder="When would you like this to happen?"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="deliverables">Deliverables</Label>
            <Input
              id="deliverables"
              placeholder="What will you provide? (word count, format, etc.)"
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={handleSave} className="self-start" disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          Save to Briefcase
        </Button>
      </div>
    </div>
  );
}