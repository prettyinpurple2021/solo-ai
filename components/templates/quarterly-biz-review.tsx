'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useTemplateSave } from '@/hooks/use-template-save';
import { Save, Calendar } from 'lucide-react';

export function QuarterlyBizReview() {
  const [wins, setWins] = useState('');
  const [misses, setMisses] = useState('');
  const [growth, setGrowth] = useState('');
  const [lessons, setLessons] = useState('');
  const [title, setTitle] = useState('');
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const handleSave = async () => {
    const templateData = {
      wins,
      misses,
      growth,
      lessons,
      quarter: getCurrentQuarter(),
      date: new Date().toISOString(),
    };

    const saveTitle = title || `Q${getCurrentQuarter()} Business Review`;
    
    await saveTemplate('quarterly-biz-review', templateData, saveTitle, `Quarter ${getCurrentQuarter()} business review`);
  };

  const getCurrentQuarter = () => {
    const month = new Date().getMonth();
    if (month < 3) return 1;
    if (month < 6) return 2;
    if (month < 9) return 3;
    return 4;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Quarterly Business Review</h3>
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
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <div>
          <Label>Wins</Label>
          <Textarea 
            placeholder="What went well this quarter?" 
            value={wins}
            onChange={(e) => setWins(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <div>
          <Label>Misses</Label>
          <Textarea 
            placeholder="What didn't go as planned?" 
            value={misses}
            onChange={(e) => setMisses(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <div>
          <Label>Growth</Label>
          <Textarea 
            placeholder="How did the business grow?" 
            value={growth}
            onChange={(e) => setGrowth(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <div>
          <Label>Lessons</Label>
          <Textarea 
            placeholder="What did you learn?" 
            value={lessons}
            onChange={(e) => setLessons(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-sm text-muted-foreground">
          Quarter {getCurrentQuarter()} Review
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          Save Review to Briefcase
        </Button>
      </div>
    </div>
  );
} 