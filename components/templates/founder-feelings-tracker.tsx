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
        <h3 className="text-lg font-semibold">Founder Feelings Tracker</h
