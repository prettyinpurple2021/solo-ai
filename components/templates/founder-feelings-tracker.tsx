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
        <div className="flex items-center gap-2">
          <Input
            placeholder="Template title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-48"
          />
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            Save to Briefcase
          </Button>
        </div>
      </div>

      {/* Average Scores Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Overall Averages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">Energy</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{averages.energy}/10</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Focus</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{averages.focus}/10</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="font-medium">Motivation</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{averages.motivation}/10</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entries */}
      <div className="space-y-4">
        {entries.map((entry, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Entry {index + 1}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeEntry(index)}
                  disabled={entries.length === 1}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor={`date-${index}`}>Date</Label>
                <Input
                  id={`date-${index}`}
                  type="date"
                  value={entry.date}
                  onChange={(e) => updateEntry(index, 'date', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Energy Level: {entry.energyLevel}/10</Label>
                  <Slider
                    value={[entry.energyLevel]}
                    onValueChange={(value) => updateEntry(index, 'energyLevel', value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Focus Level: {entry.focusLevel}/10</Label>
                  <Slider
                    value={[entry.focusLevel]}
                    onValueChange={(value) => updateEntry(index, 'focusLevel', value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Motivation Level: {entry.motivationLevel}/10</Label>
                  <Slider
                    value={[entry.motivationLevel]}
                    onValueChange={(value) => updateEntry(index, 'motivationLevel', value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor={`mood-${index}`}>Current Mood</Label>
                <Input
                  id={`mood-${index}`}
                  placeholder="How are you feeling today?"
                  value={entry.mood}
                  onChange={(e) => updateEntry(index, 'mood', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor={`triggers-${index}`}>Triggers/Events</Label>
                <Input
                  id={`triggers-${index}`}
                  placeholder="What influenced your feelings today?"
                  value={entry.triggers}
                  onChange={(e) => updateEntry(index, 'triggers', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor={`notes-${index}`}>Notes</Label>
                <Textarea
                  id={`notes-${index}`}
                  placeholder="Additional thoughts, reflections, or patterns you've noticed..."
                  value={entry.notes}
                  onChange={(e) => updateEntry(index, 'notes', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={addEntry} variant="outline" className="w-full">
        <Heart className="w-4 h-4 mr-2" />
        Add New Entry
      </Button>
    </div>
  );
}
