'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useTemplateSave } from '@/hooks/use-template-save';
import { Save, Megaphone, Edit, User, FileText } from 'lucide-react';

export function PrPitchTemplate() {
  const [storyHeadline, setStoryHeadline] = useState('');
  const [newsAngle, setNewsAngle] = useState('');
  const [whyNow, setWhyNow] = useState('');
  const [founderBio, setFounderBio] = useState('');
  const [companyInfo, setCompanyInfo] = useState('');
  const [targetMedia, setTargetMedia] = useState('');
  const [keyMessages, setKeyMessages] = useState('');
  const [pitchEmail, setPitchEmail] = useState('');
  const [title, setTitle] = useState('');
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const generatePitchEmail = () => {
    const email = `Subject: ${storyHeadline}

Hi [JOURNALIST NAME],

I hope this email finds you well. I'm reaching out because I believe I have a story that would resonate with [PUBLICATION] readers.

${newsAngle}

${whyNow}

About me: ${founderBio}

Company background: ${companyInfo}

Key points for the story:
${keyMessages}

I'd be happy to provide additional information, data, or arrange an interview at your convenience.

Best regards,
[YOUR NAME]
[YOUR CONTACT INFO]`;

    setPitchEmail(email);
  };

  const handleSave = async () => {
    const templateData = {
      storyHeadline,
      newsAngle,
      whyNow,
      founderBio,
      companyInfo,
      targetMedia,
      keyMessages,
      pitchEmail,
    };

    const saveTitle = title || `PR Pitch: ${storyHeadline || 'Untitled Story'}`;
    
    await saveTemplate('pr-pitch-template', templateData, saveTitle, `Media pitch for ${targetMedia || 'various outlets'}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold">PR Pitch Template</h3>
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
          <Label htmlFor="storyHeadline">Story Headline/Hook</Label>
          <Input
            id="storyHeadline"
            placeholder="What's your compelling headline? (e.g., 'Solo Entrepreneur Builds $1M Business in 18 Months')"
            value={storyHeadline}
            onChange={(e) => setStoryHeadline(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="newsAngle">News Angle/Story Pitch</Label>
          <Textarea
            id="newsAngle"
            placeholder="What's newsworthy about your story? What makes it interesting now?"
            value={newsAngle}
            onChange={(e) => setNewsAngle(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="whyNow">Why Now? (Timeliness)</Label>
          <Textarea
            id="whyNow"
            placeholder="Why is this story relevant right now? Any trends, events, or timing factors?"
            value={whyNow}
            onChange={(e) => setWhyNow(e.target.value)}
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="targetMedia">Target Media Outlets</Label>
          <Input
            id="targetMedia"
            placeholder="Which publications, podcasts, or blogs are you targeting?"
            value={targetMedia}
            onChange={(e) => setTargetMedia(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="founderBio">Founder Bio (Boilerplate)</Label>
          <Textarea
            id="founderBio"
            placeholder="Brief founder bio with credentials, background, and relevant experience..."
            value={founderBio}
            onChange={(e) => setFounderBio(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="companyInfo">Company Background</Label>
          <Textarea
            id="companyInfo"
            placeholder="Brief company description, what you do, key achievements, metrics..."
            value={companyInfo}
            onChange={(e) => setCompanyInfo(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="keyMessages">Key Messages/Talking Points</Label>
          <Textarea
            id="keyMessages"
            placeholder="List your key messages, quotes, data points, or story angles (one per line)..."
            value={keyMessages}
            onChange={(e) => setKeyMessages(e.target.value)}
            rows={4}
          />
        </div>

        <Button onClick={generatePitchEmail} className="self-start">
          <Edit className="w-4 h-4 mr-2" />
          Generate Pitch Email
        </Button>

        {pitchEmail && (
          <div>
            <Label htmlFor="pitchEmail">Generated Pitch Email</Label>
            <Textarea
              id="pitchEmail"
              value={pitchEmail}
              onChange={(e) => setPitchEmail(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
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