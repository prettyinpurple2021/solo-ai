'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';
import { useTemplateSave } from '@/hooks/use-template-save';
import { Save, Heart, Plus, Trash2 } from 'lucide-react';

interface BragEntry {
  id: string;
  title: string;
  description: string;
  type: 'win' | 'testimonial' | 'achievement' | 'praise';
}

export function BragBankTemplate() {
  const [entries, setEntries] = useState<BragEntry[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState<BragEntry['type']>('win');
  const [title, setTitle] = useState('');
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const addEntry = () => {
    if (newTitle && newDescription) {
      const entry: BragEntry = {
        id: Date.now().toString(),
        title: newTitle,
        description: newDescription,
        type: newType,
      };
      setEntries([...entries, entry]);
      setNewTitle('');
      setNewDescription('');
    }
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const getTypeEmoji = (type: BragEntry['type']) => {
    switch (type) {
      case 'win': return '🏆';
      case 'testimonial': return '💬';
      case 'achievement': return '🎯';
      case 'praise': return '⭐';
      default: return '📝';
    }
  };

  const handleSave = async () => {
    const templateData = {
      entries,
    };

    const saveTitle = title || `Brag Bank (${entries.length} entries)`;
    
    await saveTemplate('brag-bank-template', templateData, saveTitle, `${entries.length} accomplishments tracked`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-semibold">Brag Bank Template</h3>
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
        <div className="p-4 border rounded-lg bg-blue-50">
          <h4 className="font-medium mb-3">Add New Entry</h4>
          <div className="space-y-3">
            <div>
              <Label htmlFor="entryTitle">Title/Summary</Label>
              <Input
                id="entryTitle"
                placeholder="Brief title for this accomplishment..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="entryDescription">Details</Label>
              <Textarea
                id="entryDescription"
                placeholder="Full description, testimonial text, or achievement details..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="entryType">Type</Label>
              <select 
                id="entryType"
                value={newType}
                onChange={(e) => setNewType(e.target.value as BragEntry['type'])}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="win">🏆 Win/Success</option>
                <option value="testimonial">💬 Testimonial</option>
                <option value="achievement">🎯 Achievement</option>
                <option value="praise">⭐ Praise/Recognition</option>
              </select>
            </div>

            <Button onClick={addEntry} disabled={!newTitle || !newDescription}>
              <Plus className="w-4 h-4 mr-2" />
              Add to Brag Bank
            </Button>
          </div>
        </div>

        {entries.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold">Your Brag Bank ({entries.length} entries):</h4>
            {entries.map((entry) => (
              <div key={entry.id} className="p-3 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{getTypeEmoji(entry.type)}</span>
                      <h5 className="font-medium">{entry.title}</h5>
                    </div>
                    <p className="text-sm text-gray-600">{entry.description}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeEntry(entry.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {entries.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Your brag bank is empty. Add your first win above!</p>
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