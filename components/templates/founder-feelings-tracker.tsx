'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';
import { useTemplateSave } from '@/hooks/use-template-save';
import { Save, Heart, Brain, Zap, TrendingDown } from 'lucide-react';

interface FeelingEntry {
  date: string;
  energyLevel: number;
  focusLevel: number;
  motivationLevel: number;
  mood: string;
  triggers: string;
  notes: string;
}

export function FounderFeelingsTracker() {
  const [entries, setEntries] = useState<FeelingEntry[]>([
    {
      date: new Date().toISOString().split('T')[0],
      energyLevel: 5,
      focusLevel: 5,
      motivationLevel: 5,
      mood: '',
      triggers: '',
      notes: ''
    }
  ]);
  const [title, setTitle] = useState('');
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const addEntry = () => {
    setEntries([...entries, {
      date: new Date().toISOString().split('T')[0],
      energyLevel: 5,
      focusLevel: 5,
      motivationLevel: 5,
      mood: '',
      triggers: '',
      notes: ''
    }]);
  };

  const updateEntry = (index: number, field: keyof FeelingEntry, value: string | number) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const getAverageScores = () => {
    if (entries.length === 0) return { energy: 0, focus: 0, motivation: 0 };
    
    const totals = entries.reduce(
      (acc, entry) => ({
        energy: acc.energy + entry.energyLevel,
        focus: acc.focus + entry.focusLevel,
        motivation: acc.motivation + entry.motivationLevel,
      }),
      { energy: 0, focus: 0, motivation: 0 }
    );

    return {
      energy: Math.round(totals.energy / entries.length),
      focus: Math.round(totals.focus / entries.length),
      motivation: Math.round(totals.motivation / entries.length),
    };
  };

  const handleSave = async () => {
    const averages = getAverageScores();
    const templateData = {
      entries,
      totalEntries: entries.length,
      averageScores: averages,
    };

    const saveTitle = title || `Feelings Tracker (${entries.length} entries)`;
    
    await saveTemplate('founder-feelings-tracker', templateData, saveTitle, `Avg - Energy: ${averages.energy}/10, Focus: ${averages.focus}/10, Motivation: ${averages.motivation}/10`);
  };

  const averages = getAverageScores();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Founder Feelings Tracker</h3>
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

      <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
        <p className="text-sm text-accent-foreground">
          <Heart className="w-4 h-4 inline mr-2" />
          Track your emotional patterns to understand what energizes you and what drains you. Self-awareness is your superpower!
        </p>
      </div>

      {entries.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Zap className="w-4 h-4 mr-2 text-chart-4" />
                Avg Energy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averages.energy}/10</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Brain className="w-4 h-4 mr-2 text-primary" />
                Avg Focus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averages.focus}/10</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <TrendingDown className="w-4 h-4 mr-2 text-chart-2" />
                Avg Motivation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averages.motivation}/10</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium">Feeling Entries</h4>
          <Button onClick={addEntry} variant="outline" size="sm">
            <Heart className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </div>

        {entries.map((entry, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Entry #{index + 1}</CardTitle>
                {entries.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEntry(index)}
                  >
                    ×
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={entry.date}
                  onChange={(e) => updateEntry(index, 'date', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Energy Level (1-10)</Label>
                  <Slider
                    value={[entry.energyLevel]}
                    onValueChange={(value) => updateEntry(index, 'energyLevel', value[0])}
                    max={10}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-sm text-muted-foreground mt-1">{entry.energyLevel}/10</div>
                </div>
                
                <div>
                  <Label>Focus Level (1-10)</Label>
                  <Slider
                    value={[entry.focusLevel]}
                    onValueChange={(value) => updateEntry(index, 'focusLevel', value[0])}
                    max={10}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-sm text-muted-foreground mt-1">{entry.focusLevel}/10</div>
                </div>
                
                <div>
                  <Label>Motivation Level (1-10)</Label>
                  <Slider
                    value={[entry.motivationLevel]}
                    onValueChange={(value) => updateEntry(index, 'motivationLevel', value[0])}
                    max={10}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-sm text-muted-foreground mt-1">{entry.motivationLevel}/10</div>
                </div>
              </div>

              <div>
                <Label>Mood/Energy Description</Label>
                <Input
                  placeholder="e.g., Excited, Overwhelmed, Focused, Scattered, Confident..."
                  value={entry.mood}
                  onChange={(e) => updateEntry(index, 'mood', e.target.value)}
                />
              </div>

              <div>
                <Label>Motivation Triggers</Label>
                <Textarea
                  placeholder="What boosted or drained your motivation today? Wins, setbacks, interactions, etc."
                  value={entry.triggers}
                  onChange={(e) => updateEntry(index, 'triggers', e.target.value)}
                  rows={2}
                />
              </div>

              <div>
                <Label>Notes & Insights</Label>
                <Textarea
                  placeholder="Any patterns you notice? Things to remember? Insights about what works for you?"
                  value={entry.notes}
                  onChange={(e) => updateEntry(index, 'notes', e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4">
        <Button>Generate Pattern Insights</Button>
        <Button variant="outline" onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          Save to Briefcase
        </Button>
      </div>
    </div>
  );
}