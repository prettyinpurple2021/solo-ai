'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { useTemplateSave } from '@/hooks/use-template-save';
import { Save, Users, Calendar, Target } from 'lucide-react';

interface CollabIdea {
  type: string;
  topic: string;
  angle: string;
  value: string;
}

export function AiCollabPlanner() {
  const [partnerName, setPartnerName] = useState('');
  const [partnerAudience, setPartnerAudience] = useState('');
  const [partnerStrengths, setPartnerStrengths] = useState('');
  const [yourStrengths, setYourStrengths] = useState('');
  const [sharedValues, setSharedValues] = useState('');
  const [goals, setGoals] = useState('');
  const [timeline, setTimeline] = useState('');
  const [collabIdeas, setCollabIdeas] = useState<CollabIdea[]>([
    { type: 'Guest Post', topic: '', angle: '', value: '' }
  ]);
  const [title, setTitle] = useState('');
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const collabTypes = [
    'Guest Post', 'Podcast Interview', 'Instagram Live', 'Joint Webinar', 
    'Course Collaboration', 'Summit Speaking', 'Newsletter Swap', 'Social Media Takeover'
  ];

  const addCollabIdea = () => {
    setCollabIdeas([...collabIdeas, { type: 'Guest Post', topic: '', angle: '', value: '' }]);
  };

  const updateCollabIdea = (index: number, field: keyof CollabIdea, value: string) => {
    const newIdeas = [...collabIdeas];
    newIdeas[index][field] = value;
    setCollabIdeas(newIdeas);
  };

  const removeCollabIdea = (index: number) => {
    setCollabIdeas(collabIdeas.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const templateData = {
      partnerName,
      partnerAudience,
      partnerStrengths,
      yourStrengths,
      sharedValues,
      goals,
      timeline,
      collabIdeas,
      totalIdeas: collabIdeas.length,
    };

    const saveTitle = title || `Collab Plan: ${partnerName || 'Untitled Partner'}`;
    
    await saveTemplate('ai-collab-planner', templateData, saveTitle, `${collabIdeas.length} collaboration ideas planned`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI Collab Planner</h3>
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

      <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
        <p className="text-sm text-primary">
          <Users className="w-4 h-4 inline mr-2" />
          Plan strategic collaborations that benefit both audiences. Create win-win partnerships with clear value propositions.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Partner Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Partner Name/Brand</Label>
                <Input
                  placeholder="e.g., Sarah Johnson, @businessbabe"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                />
              </div>
              <div>
                <Label>Their Audience</Label>
                <Textarea
                  placeholder="Who follows them? Demographics, interests, pain points..."
                  value={partnerAudience}
                  onChange={(e) => setPartnerAudience(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label>Their Strengths</Label>
                <Textarea
                  placeholder="What are they known for? Their expertise, platform, audience size..."
                  value={partnerStrengths}
                  onChange={(e) => setPartnerStrengths(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Your Strengths</Label>
                <Textarea
                  placeholder="What unique value do you bring? Your expertise, audience, resources..."
                  value={yourStrengths}
                  onChange={(e) => setYourStrengths(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label>Shared Values/Mission</Label>
                <Textarea
                  placeholder="What do you both care about? Common causes, beliefs, business philosophies..."
                  value={sharedValues}
                  onChange={(e) => setSharedValues(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label>Your Goals</Label>
                <Textarea
                  placeholder="What do you want to achieve from this collaboration?"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="timeline">Timeline</Label>
            <Input
              id="timeline"
              placeholder="e.g., Next 2 months, Q2 2024, Before summer launch"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium">Collaboration Ideas</h4>
            <Button onClick={addCollabIdea} variant="outline" size="sm">
              <Target className="w-4 h-4 mr-2" />
              Add Idea
            </Button>
          </div>

          {collabIdeas.map((idea, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Idea #{index + 1}</CardTitle>
                  {collabIdeas.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCollabIdea(index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Collaboration Type</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={idea.type}
                    onChange={(e) => updateCollabIdea(index, 'type', e.target.value)}
                  >
                    {collabTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label>Topic/Theme</Label>
                  <Input
                    placeholder="e.g., Building a 6-figure business while traveling"
                    value={idea.topic}
                    onChange={(e) => updateCollabIdea(index, 'topic', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Your Unique Angle</Label>
                  <Textarea
                    placeholder="What perspective or story will you share? What makes this different?"
                    value={idea.angle}
                    onChange={(e) => updateCollabIdea(index, 'angle', e.target.value)}
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label>Value for Their Audience</Label>
                  <Textarea
                    placeholder="What will their audience learn/gain? How does this benefit them specifically?"
                    value={idea.value}
                    onChange={(e) => updateCollabIdea(index, 'value', e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <Button>
          <Calendar className="w-4 h-4 mr-2" />
          Generate Pitch Template
        </Button>
        <Button variant="outline" onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          Save to Briefcase
        </Button>
      </div>
    </div>
  );
}