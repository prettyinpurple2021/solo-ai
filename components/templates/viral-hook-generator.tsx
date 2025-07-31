'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useTemplateSave } from '@/hooks/use-template-save';
import { Save, Users, Plus, Trash2 } from 'lucide-react';

interface Hook {
  id: string;
  text: string;
  format: 'text' | 'video';
  vibe: string;
}

export function ViralHookGenerator() {
  const [contentIdea, setContentIdea] = useState('');
  const [targetVibe, setTargetVibe] = useState('');
  const [format, setFormat] = useState<'text' | 'video'>('text');
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [title, setTitle] = useState('');
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const generateHooks = () => {
    const hookTemplates = [
      `What nobody tells you about ${contentIdea}`,
      `The ${targetVibe} truth about ${contentIdea}`,
      `I wish I knew this about ${contentIdea} before starting`,
      `Stop doing ${contentIdea} wrong (here's how)`,
      `The ${contentIdea} mistake that's costing you money`,
      `Why everyone gets ${contentIdea} backwards`,
      `The ${contentIdea} secret that changed everything`,
      `${contentIdea}: expectation vs reality`,
    ];

    const generatedHooks = hookTemplates.map((template, index) => ({
      id: (Date.now() + index).toString(),
      text: template,
      format,
      vibe: targetVibe,
    }));

    setHooks(generatedHooks);
  };

  const removeHook = (id: string) => {
    setHooks(hooks.filter(hook => hook.id !== id));
  };

  const handleSave = async () => {
    const templateData = {
      contentIdea,
      targetVibe,
      format,
      hooks,
    };

    const saveTitle = title || `Viral Hooks: ${contentIdea || 'Untitled Content'}`;
    
    await saveTemplate('viral-hook-generator', templateData, saveTitle, `${hooks.length} hook ideas generated`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-green-500" />
          <h3 className="text-lg font-semibold">Viral Hook Generator</h3>
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
          <Label htmlFor="contentIdea">Content Idea/Topic</Label>
          <Input
            id="contentIdea"
            placeholder="What's your content about? (e.g., email marketing, productivity, etc.)"
            value={contentIdea}
            onChange={(e) => setContentIdea(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="targetVibe">Target Vibe</Label>
          <Input
            id="targetVibe"
            placeholder="What vibe are you going for? (e.g., controversial, helpful, surprising)"
            value={targetVibe}
            onChange={(e) => setTargetVibe(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="format">Content Format</Label>
          <select 
            id="format"
            value={format}
            onChange={(e) => setFormat(e.target.value as 'text' | 'video')}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="text">📝 Text Post</option>
            <option value="video">🎥 Video Content</option>
          </select>
        </div>

        <Button onClick={generateHooks} disabled={!contentIdea || !targetVibe}>
          <Plus className="w-4 h-4 mr-2" />
          Generate Hook Ideas
        </Button>

        {hooks.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold">Generated Hooks:</h4>
            {hooks.map((hook) => (
              <div key={hook.id} className="p-3 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{hook.format === 'video' ? '🎥' : '📝'}</span>
                      <span className="text-sm text-gray-500">{hook.vibe} vibe</span>
                    </div>
                    <p className="font-medium">{hook.text}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeHook(hook.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
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