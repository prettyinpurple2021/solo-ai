'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';
import { useTemplateSave } from '@/hooks/use-template-save';
import { Save, Heart, Calendar, Battery, Focus } from 'lucide-react';

export function FounderFeelingsTracker() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [energyLevel, setEnergyLevel] = useState([7]);
  const [focusLevel, setFocusLevel] = useState([7]);
  const [motivationLevel, setMotivationLevel] = useState([7]);
  const [keyActivities, setKeyActivities] = useState('');
  const [triggers, setTriggers] = useState('');
  const [reflections, setReflections] = useState('');
  const [title, setTitle] = useState('');
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const handleSave = async () => {
    const templateData = {
      date,
      energyLevel: energyLevel[0],
      focusLevel: focusLevel[0],
      motivationLevel: motivationLevel[0],
      keyActivities,
      triggers,
      reflections,
    };

    const saveTitle = title || `Feelings Check-in: ${date}`;
    
    await saveTemplate('founder-feelings-tracker', templateData, saveTitle, `Energy: ${energyLevel[0]}/10, Focus: ${focusLevel[0]}/10`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-500" />
          <h3 className="text-lg font-semibold">Founder Feelings Tracker</h3>
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
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label className="flex items-center gap-2">
              <Battery className="w-4 h-4" />
              Energy Level
            </Label>
            <div className="mt-2 space-y-2">
              <Slider
                value={energyLevel}
                onValueChange={setEnergyLevel}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="text-sm text-center text-muted-foreground">
                Current: {energyLevel[0]}/10
              </div>
            </div>
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <Focus className="w-4 h-4" />
              Focus Level
            </Label>
            <div className="mt-2 space-y-2">
              <Slider
                value={focusLevel}
                onValueChange={setFocusLevel}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="text-sm text-center text-muted-foreground">
                Current: {focusLevel[0]}/10
              </div>
            </div>
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Motivation Level
            </Label>
            <div className="mt-2 space-y-2">
              <Slider
                value={motivationLevel}
                onValueChange={setMotivationLevel}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="text-sm text-center text-muted-foreground">
                Current: {motivationLevel[0]}/10
              </div>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="keyActivities">Key Activities Today</Label>
          <Textarea
            id="keyActivities"
            placeholder="What did you work on today? What were your main activities?"
            value={keyActivities}
            onChange={(e) => setKeyActivities(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="triggers">Energy & Motivation Triggers</Label>
          <Textarea
            id="triggers"
            placeholder="What boosted or drained your energy today? What motivated or demotivated you?"
            value={triggers}
            onChange={(e) => setTriggers(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="reflections">Daily Reflections</Label>
          <Textarea
            id="reflections"
            placeholder="Any insights, learnings, or thoughts about today?"
            value={reflections}
            onChange={(e) => setReflections(e.target.value)}
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