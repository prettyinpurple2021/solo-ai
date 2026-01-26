'use client';

// @ts-nocheck
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
// import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useTemplateSave } from '@/hooks/use-template-save';
import { Save, Zap, Copy, Plus, Trash2 } from 'lucide-react';
import { logError } from '@/lib/logger';

interface HookOption {
  hook: string;
  platform: string;
  contentType: string;
  reasoning: string;
}

export function ViralHookGenerator() {
  const [contentIdea, setContentIdea] = (React as any).useState('');
  const [targetAudience, setTargetAudience] = (React as any).useState('');
  const [desiredVibe, setDesiredVibe] = (React as any).useState('');
  const [platform, setPlatform] = (React as any).useState('Instagram');
  const [contentType, setContentType] = (React as any).useState('Post');
  const [generatedHooks, setGeneratedHooks] = (React as any).useState([]);
  const [title, setTitle] = (React as any).useState('');
  const [ setIsGenerating] = (React as any).useState(false);
  const [ setGeneratedMetadata] = (React as any).useState(null);
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const platforms = ['Instagram', 'TikTok', 'LinkedIn', 'Twitter/X', 'YouTube', 'Facebook'];
  const contentTypes = ['Post', 'Video', 'Story', 'Reel', 'Thread', 'Carousel'];
  const vibes = ['Educational', 'Inspirational', 'Controversial', 'Behind-the-scenes', 'Personal', 'Trending'];

  const generateHooks = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/templates/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'generic',
          templateType: 'viral-hook',
          requirements: `Generate 5 viral hooks for ${contentType} on ${platform} targeting ${targetAudience}`,
          context: `Content idea: ${contentIdea}. Desired vibe: ${desiredVibe}`,
          tone: desiredVibe.toLowerCase(),
          length: 'short',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate hooks');
      }

      const result = await response.json();
      
      if (result.success && result.content) {
        // Transform generic response to hook format
        const generatedHooks = Array.isArray(result.content) 
          ? result.content.map((item: any, index: number) => ({
              hook: item.hook || item.content || `Generated hook ${index + 1}`,
              platform: platform,
              contentType: contentType,
              reasoning: item.reasoning || item.explanation || "AI-generated viral hook"
            }))
          : [
              {
                hook: result.content.hook || result.content.content || "AI-generated hook",
                platform: platform,
                contentType: contentType,
                reasoning: result.content.reasoning || result.content.explanation || "AI-generated viral hook"
              }
            ];
        
        setGeneratedHooks(generatedHooks);
        setGeneratedMetadata({
          ...result.metadata,
          templateType: result.templateType,
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      logError('Error generating viral hooks', {
        contentIdea,
        targetAudience,
        desiredVibe,
        platform,
        contentType
      }, error instanceof Error ? error : new Error(String(error)));
      
      // Fallback to sample hooks
      const fallbackHooks: HookOption[] = [
        {
          hook: `What nobody tells you about ${contentIdea || 'starting a business'}...`,
          platform: platform,
          contentType: contentType,
          reasoning: "Curiosity gap + insider knowledge positioning creates strong engagement"
        },
        {
          hook: `I made every beginner mistake so you don't have to`,
          platform: platform,
          contentType: contentType,
          reasoning: "Vulnerability + value promise builds trust and saves time for audience"
        },
        {
          hook: `Here's the truth about ${contentIdea || 'your topic'} that influencers won't tell you:`,
          platform: platform,
          contentType: contentType,
          reasoning: "Contrarian angle + authority positioning cuts through noise"
        },
        {
          hook: `Plot twist: Everything you think you know about ${contentIdea || 'this topic'} is wrong`,
          platform: platform,
          contentType: contentType,
          reasoning: "Pattern interrupt + bold claim stops scroll and demands attention"
        },
        {
          hook: `3 signs you're ready to ${contentIdea || 'achieve your goal'} (most people ignore #2)`,
          platform: platform,
          contentType: contentType,
          reasoning: "Specificity + curiosity about the 'missed' point drives engagement"
        }
      ];
      setGeneratedHooks(fallbackHooks);
    } finally {
      setIsGenerating(false);
    }
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
    setGeneratedHooks(generatedHooks.filter((_: HookOption, i: number) => i !== index));
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
        <h3 className="text-lg font-semibold font-orbitron text-white uppercase tracking-wider">Viral Hook Generator</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Save as..."
            value={title}
            onChange={(e: any) => setTitle(e.target.value)}
            className="w-48"
          />
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="bg-neon-magenta/10 p-4 rounded-sm border border-neon-magenta/30 shadow-[0_0_15px_rgba(255,0,110,0.1)]">
        <p className="text-sm text-neon-magenta font-mono">
          <Zap className="w-4 h-4 inline mr-2" />
          Create scroll-stopping hooks that grab attention and drive engagement. Perfect for breaking through the noise!
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="contentIdea" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Content Idea
            </label>
            <Textarea
              id="contentIdea"
              placeholder="What's your content about? What main point or story are you sharing?"
              value={contentIdea}
              onChange={(e: any) => setContentIdea(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <label htmlFor="targetAudience" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Target Audience
            </label>
            <Textarea
              id="targetAudience"
              placeholder="Who are you trying to reach? Entrepreneurs, parents, students, etc."
              value={targetAudience}
              onChange={(e: any) => setTargetAudience(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="platform-select" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Platform
            </label>
            <select
              id="platform-select"
              className="w-full p-2 border rounded-md"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              aria-label="Select platform"
            >
              {platforms.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="content-type-select" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Content Type
            </label>
            <select
              id="content-type-select"
              className="w-full p-2 border rounded-md"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              aria-label="Select content type"
            >
              {contentTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="vibe-select" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Desired Vibe
            </label>
            <select
              id="vibe-select"
              className="w-full p-2 border rounded-md"
              value={desiredVibe}
              onChange={(e) => setDesiredVibe(e.target.value)}
              aria-label="Select desired vibe"
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
              <h4 className="text-md font-medium font-orbitron text-white uppercase tracking-wider">Generated Hooks</h4>
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-secondary text-secondary-foreground">
                {generatedHooks.length} options
              </span>
            </div>

            {generatedHooks.map((hookOption: HookOption, index: number) => (
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
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Hook
                    </label>
                    <Textarea
                      placeholder="Enter your hook text..."
                      value={hookOption.hook}
                      onChange={(e: any) => updateHook(index, 'hook', e.target.value)}
                      rows={2}
                      className="font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor={`hook-platform-${index}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Platform
                      </label>
                      <select
                        id={`hook-platform-${index}`}
                        className="w-full p-2 border rounded-md"
                        value={hookOption.platform}
                        onChange={(e) => updateHook(index, 'platform', e.target.value)}
                        aria-label={`Select platform for hook ${index + 1}`}
                      >
                        {platforms.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`hook-content-type-${index}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Content Type
                      </label>
                      <select
                        id={`hook-content-type-${index}`}
                        className="w-full p-2 border rounded-md"
                        value={hookOption.contentType}
                        onChange={(e) => updateHook(index, 'contentType', e.target.value)}
                        aria-label={`Select content type for hook ${index + 1}`}
                      >
                        {contentTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Why This Works
                    </label>
                    <Textarea
                      placeholder="Explain the psychology behind this hook..."
                      value={hookOption.reasoning}
                      onChange={(e: any) => updateHook(index, 'reasoning', e.target.value)}
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