'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useTemplateSave } from '@/hooks/use-template-save';
import { Save, Zap, Copy, Plus, Trash2 } from 'lucide-react';

interface HookOption {
  hook: string;
  platform: string;
  contentType: string;
  reasoning: string;
}

export function ViralHookGenerator() {
  const [contentIdea, setContentIdea] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [desiredVibe, setDesiredVibe] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [contentType, setContentType] = useState('Post');
  const [generatedHooks, setGeneratedHooks] = useState<HookOption[]>([]);
  const [title, setTitle] = useState('');
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const platforms = ['Instagram', 'TikTok', 'LinkedIn', 'Twitter/X', 'YouTube', 'Facebook'];
  const contentTypes = ['Post', 'Video', 'Story', 'Reel', 'Thread', 'Carousel'];
  const vibes = ['Educational', 'Inspirational', 'Controversial', 'Behind-the-scenes', 'Personal', 'Trending'];

  const generateHooks = () => {
    // Simulate AI-generated hooks
    const sampleHooks: HookOption[] = [
      {
        hook: "What nobody tells you about starting a business...",
        platform: platform,
        contentType: contentType,
        reasoning: "Curiosity gap + insider knowledge positioning creates strong engagement"
      },
      {
        hook: "I made every beginner mistake so you don't have to",
        platform: platform,
        contentType: contentType,
        reasoning: "Vulnerability + value promise builds trust and saves time for audience"
      },
      {
        hook: "Here's the truth about [your topic] that influencers won't tell you:",
        platform: platform,
        contentType: contentType,
        reasoning: "Contrarian angle + authority positioning cuts through noise"
      },
      {
        hook: "Plot twist: Everything you think you know about [topic] is wrong",
        platform: platform,
        contentType: contentType,
        reasoning: "Pattern interrupt + bold claim stops scroll and demands attention"
      },
      {
        hook: "3 signs you're ready to [achieve goal] (most people ignore #2)",
        platform: platform,
        contentType: contentType,
        reasoning: "Specificity + curiosity about the 'missed' point drives engagement"
      }
    ];
    setGeneratedHooks(sampleHooks);
  };

  const addCustomHook = () => {
    setGeneratedHooks([...generatedHooks, { 
      hook: '', 
      platform: platform, 
      contentType: contentType, 
      reasoning: '' 
    }]);
  };

  const updateHook = (index: number, field: keyof HookOption, value: string) => {
    const newHooks = [...generatedHooks];
    newHooks[index][field] = value;
    setGeneratedHooks(newHooks);
  };

  const removeHook = (index: number) => {
    setGeneratedHooks(generatedHooks.filter((_, i) => i !== index));
  };

  const copyHook = (hook: string) => {
    navigator.clipboard.writeText(hook);
  };

  const handleSave = async () => {
    const templateData = {
      contentIdea,
      targetAudience,
      desiredVibe,
      platform,
      contentType,
      generatedHooks,
      totalHooks: generatedHooks.length,
    };

    const saveTitle = title || `Viral Hooks (${generatedHooks.length} options)`;
    
    await saveTemplate('viral-hook-generator', templateData, saveTitle, `${generatedHooks.length} hooks for ${platform} ${contentType.toLowerCase()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Viral Hook Generator</h3>
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

      <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg">
        <p className="text-sm text-purple-800">
          <Zap className="w-4 h-4 inline mr-2" />
          Create scroll-stopping hooks that grab attention and drive engagement. Perfect for breaking through the noise!
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="contentIdea">Content Idea</Label>
            <Textarea
              id="contentIdea"
              placeholder="What's your content about? What main point or story are you sharing?"
              value={contentIdea}
              onChange={(e) => setContentIdea(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Textarea
              id="targetAudience"
              placeholder="Who are you trying to reach? Entrepreneurs, parents, students, etc."
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Platform</Label>
            <select
              className="w-full p-2 border rounded-md"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              {platforms.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Content Type</Label>
            <select
              className="w-full p-2 border rounded-md"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
            >
              {contentTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Desired Vibe</Label>
            <select
              className="w-full p-2 border rounded-md"
              value={desiredVibe}
              onChange={(e) => setDesiredVibe(e.target.value)}
            >
              <option value="">Select vibe...</option>
              {vibes.map((vibe) => (
                <option key={vibe} value={vibe}>{vibe}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={generateHooks}>
            <Zap className="w-4 h-4 mr-2" />
            Generate Viral Hooks
          </Button>
          <Button onClick={addCustomHook} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Hook
          </Button>
        </div>

        {generatedHooks.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-medium">Generated Hooks</h4>
              <Badge variant="secondary">{generatedHooks.length} options</Badge>
            </div>

            {generatedHooks.map((hookOption, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Hook #{index + 1}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyHook(hookOption.hook)}
                        title="Copy hook"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeHook(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Hook</Label>
                    <Textarea
                      placeholder="Enter your hook text..."
                      value={hookOption.hook}
                      onChange={(e) => updateHook(index, 'hook', e.target.value)}
                      rows={2}
                      className="font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Platform</Label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={hookOption.platform}
                        onChange={(e) => updateHook(index, 'platform', e.target.value)}
                      >
                        {platforms.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Content Type</Label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={hookOption.contentType}
                        onChange={(e) => updateHook(index, 'contentType', e.target.value)}
                      >
                        {contentTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label>Why This Works</Label>
                    <Textarea
                      placeholder="Explain the psychology behind this hook..."
                      value={hookOption.reasoning}
                      onChange={(e) => updateHook(index, 'reasoning', e.target.value)}
                      rows={2}
                    />
                  </div>

                  {hookOption.hook && (
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <strong>Preview:</strong>
                      <div className="mt-1 font-medium text-lg">{hookOption.hook}</div>
                      <div className="mt-2 text-xs text-gray-600">
                        {hookOption.platform} • {hookOption.contentType}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button>Analyze Engagement Potential</Button>
        <Button variant="outline" onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          Save to Briefcase
        </Button>
      </div>
    </div>
  );
}