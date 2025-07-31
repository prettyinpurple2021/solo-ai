'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useTemplateSave } from '@/hooks/use-template-save';
import { Save, Star, Plus, Trash2, Copy } from 'lucide-react';

interface BragEntry {
  type: string;
  title: string;
  description: string;
  date: string;
  source: string;
  tags: string[];
}

export function BragBankTemplate() {
  const [entries, setEntries] = useState<BragEntry[]>([
    {
      type: 'Win',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      source: '',
      tags: []
    }
  ]);
  const [title, setTitle] = useState('');
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const entryTypes = ['Win', 'Testimonial', 'Achievement', 'Praise', 'Milestone', 'Media Mention'];

  const addEntry = () => {
    setEntries([...entries, {
      type: 'Win',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      source: '',
      tags: []
    }]);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof BragEntry, value: string | string[]) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
  };

  const addTag = (index: number, tag: string) => {
    if (tag.trim()) {
      const newEntries = [...entries];
      newEntries[index].tags = [...newEntries[index].tags, tag.trim()];
      setEntries(newEntries);
    }
  };

  const removeTag = (entryIndex: number, tagIndex: number) => {
    const newEntries = [...entries];
    newEntries[entryIndex].tags = newEntries[entryIndex].tags.filter((_, i) => i !== tagIndex);
    setEntries(newEntries);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSave = async () => {
    const templateData = {
      entries,
      totalEntries: entries.length,
      entryTypes: entryTypes,
    };

    const saveTitle = title || `Brag Bank (${entries.length} entries)`;
    
    await saveTemplate('brag-bank-template', templateData, saveTitle, `${entries.filter(e => e.title).length} accomplishments stored`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Brag Bank Template</h3>
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

      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-lg">
        <p className="text-sm text-amber-800">
          <Star className="w-4 h-4 inline mr-2" />
          Store your wins, praise, and accomplishments here. Perfect for updating your portfolio, pitch decks, or when you need a confidence boost!
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium">Your Accomplishments</h4>
          <Button onClick={addEntry} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </div>

        {entries.map((entry, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Entry #{index + 1}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(entry.description)}
                    title="Copy description"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  {entries.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEntry(index)}
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
                  <Label>Type</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={entry.type}
                    onChange={(e) => updateEntry(index, 'type', e.target.value)}
                  >
                    {entryTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={entry.date}
                    onChange={(e) => updateEntry(index, 'date', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Source</Label>
                  <Input
                    placeholder="e.g., Client email, LinkedIn, Conference"
                    value={entry.source}
                    onChange={(e) => updateEntry(index, 'source', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Title/Summary</Label>
                <Input
                  placeholder="e.g., Landed $50K client, Featured in Forbes, Hit 10K followers"
                  value={entry.title}
                  onChange={(e) => updateEntry(index, 'title', e.target.value)}
                />
              </div>

              <div>
                <Label>Full Description</Label>
                <Textarea
                  placeholder="Write the full details - testimonial quote, achievement details, praise received. Make it ready to copy-paste!"
                  value={entry.description}
                  onChange={(e) => updateEntry(index, 'description', e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {entry.tags.map((tag, tagIndex) => (
                    <Badge key={tagIndex} variant="secondary">
                      {tag}
                      <button
                        onClick={() => removeTag(index, tagIndex)}
                        className="ml-1 text-xs"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Add tags (press Enter)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addTag(index, e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Suggested: client-work, social-media, speaking, awards, revenue, team, product
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entries.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {entries.filter(e => {
                const entryDate = new Date(e.date);
                const now = new Date();
                return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(entries.map(e => e.type)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button>Export for Portfolio</Button>
        <Button variant="outline" onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          Save to Briefcase
        </Button>
      </div>
    </div>
  );
}