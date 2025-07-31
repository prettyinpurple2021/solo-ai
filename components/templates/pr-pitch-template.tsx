'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useTemplateSave } from '@/hooks/use-template-save';
import { Save, Megaphone, Copy, Plus, Trash2 } from 'lucide-react';

interface PitchTemplate {
  outlet: string;
  contactName: string;
  contactEmail: string;
  storyAngle: string;
  headline: string;
  personalStory: string;
  credentials: string;
  whyNow: string;
  callToAction: string;
}

export function PrPitchTemplate() {
  const [pitches, setPitches] = useState<PitchTemplate[]>([
    {
      outlet: '',
      contactName: '',
      contactEmail: '',
      storyAngle: '',
      headline: '',
      personalStory: '',
      credentials: '',
      whyNow: '',
      callToAction: ''
    }
  ]);
  const [founderBio, setFounderBio] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [title, setTitle] = useState('');
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const storyAngles = [
    'Founder Journey', 'Industry Disruption', 'Social Impact', 'Innovation', 
    'Against the Odds', 'Market Trends', 'Expert Commentary', 'Behind the Scenes'
  ];

  const addPitch = () => {
    setPitches([...pitches, {
      outlet: '',
      contactName: '',
      contactEmail: '',
      storyAngle: '',
      headline: '',
      personalStory: '',
      credentials: '',
      whyNow: '',
      callToAction: ''
    }]);
  };

  const removePitch = (index: number) => {
    setPitches(pitches.filter((_, i) => i !== index));
  };

  const updatePitch = (index: number, field: keyof PitchTemplate, value: string) => {
    const newPitches = [...pitches];
    newPitches[index][field] = value;
    setPitches(newPitches);
  };

  const generateEmailTemplate = (pitch: PitchTemplate) => {
    return `Subject: ${pitch.headline}

Hi ${pitch.contactName || '[Name]'},

I hope this email finds you well. I'm reaching out because I believe I have a story that would resonate strongly with ${pitch.outlet}'s audience.

${pitch.personalStory}

Here's why this story matters right now:
${pitch.whyNow}

A bit about my background:
${pitch.credentials}

${founderBio}

I'd love to discuss how we can bring this story to your audience. ${pitch.callToAction}

Looking forward to hearing from you!

Best regards,
[Your Name]
[Your Contact Information]

---
Business: ${businessDescription}`;
  };

  const copyEmailTemplate = (pitch: PitchTemplate) => {
    const emailTemplate = generateEmailTemplate(pitch);
    navigator.clipboard.writeText(emailTemplate);
  };

  const handleSave = async () => {
    const templateData = {
      pitches,
      founderBio,
      businessDescription,
      totalPitches: pitches.length,
    };

    const saveTitle = title || `PR Pitches (${pitches.length} outlets)`;
    
    await saveTemplate('pr-pitch-template', templateData, saveTitle, `${pitches.filter(p => p.outlet).length} PR pitches prepared`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">PR Pitch Template</h3>
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

      <div className="bg-chart-2/10 p-4 rounded-lg border border-chart-2/20">
        <p className="text-sm text-chart-2">
          <Megaphone className="w-4 h-4 inline mr-2" />
          Craft compelling PR pitches that get media attention. Include your story, credibility, and clear value for their audience.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="founderBio">Your Bio Boilerplate</Label>
            <Textarea
              id="founderBio"
              placeholder="Write a 2-3 sentence bio about yourself that you can reuse in pitches..."
              value={founderBio}
              onChange={(e) => setFounderBio(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="businessDescription">Business Description</Label>
            <Textarea
              id="businessDescription"
              placeholder="Quick description of your business for email signatures..."
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium">PR Pitches</h4>
            <Button onClick={addPitch} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Pitch
            </Button>
          </div>

          {pitches.map((pitch, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Pitch #{index + 1}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyEmailTemplate(pitch)}
                      title="Copy email template"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    {pitches.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePitch(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Media Outlet</Label>
                    <Input
                      placeholder="e.g., Entrepreneur, Forbes, TechCrunch"
                      value={pitch.outlet}
                      onChange={(e) => updatePitch(index, 'outlet', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Contact Name</Label>
                    <Input
                      placeholder="e.g., Jane Smith"
                      value={pitch.contactName}
                      onChange={(e) => updatePitch(index, 'contactName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Contact Email</Label>
                    <Input
                      placeholder="editor@publication.com"
                      value={pitch.contactEmail}
                      onChange={(e) => updatePitch(index, 'contactEmail', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>Story Angle</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {storyAngles.map((angle) => (
                      <Badge
                        key={angle}
                        variant={pitch.storyAngle === angle ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => updatePitch(index, 'storyAngle', angle)}
                      >
                        {angle}
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Or write your own angle..."
                    value={pitch.storyAngle}
                    onChange={(e) => updatePitch(index, 'storyAngle', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Headline/Hook</Label>
                  <Input
                    placeholder="e.g., How I Built a 6-Figure Business While Traveling the World"
                    value={pitch.headline}
                    onChange={(e) => updatePitch(index, 'headline', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Personal Story</Label>
                  <Textarea
                    placeholder="Tell your compelling story in 2-3 sentences. What's your journey?"
                    value={pitch.personalStory}
                    onChange={(e) => updatePitch(index, 'personalStory', e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Credentials/Proof</Label>
                  <Textarea
                    placeholder="Why should they listen to you? Awards, results, unique experiences..."
                    value={pitch.credentials}
                    onChange={(e) => updatePitch(index, 'credentials', e.target.value)}
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Why Now?</Label>
                  <Textarea
                    placeholder="Why is this story relevant right now? Tie to current events, trends, seasons..."
                    value={pitch.whyNow}
                    onChange={(e) => updatePitch(index, 'whyNow', e.target.value)}
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Call to Action</Label>
                  <Textarea
                    placeholder="What do you want them to do? Interview, feature, quote you?"
                    value={pitch.callToAction}
                    onChange={(e) => updatePitch(index, 'callToAction', e.target.value)}
                    rows={2}
                  />
                </div>

                {pitch.outlet && (
                  <div className="pt-4 border-t">
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <strong>Email Preview:</strong>
                      <div className="mt-2 whitespace-pre-line">
                        {generateEmailTemplate(pitch)}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <Button>Find Media Contacts</Button>
        <Button variant="outline" onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          Save to Briefcase
        </Button>
      </div>
    </div>
  );
}