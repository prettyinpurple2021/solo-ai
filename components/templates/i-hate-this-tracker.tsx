'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useTemplateSave } from '@/hooks/use-template-save';
import { Save, Trash2, AlertTriangle } from 'lucide-react';

export function IHateThisTracker() {
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  const [title, setTitle] = useState('');
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const addItem = () => {
    if (newItem.trim()) {
      setItems([...items, newItem]);
      setNewItem('');
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const templateData = {
      items,
      totalItems: items.length,
      date: new Date().toISOString(),
    };

    const saveTitle = title || `Energy Drainers (${items.length} items)`;
    
    await saveTemplate('i-hate-this-tracker', templateData, saveTitle, `Tracked ${items.length} energy-draining activities`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold">"I Hate This" Tracker</h3>
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

      <div className="flex space-x-2">
        <Input
          placeholder="What's draining your energy?"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addItem()}
        />
        <Button onClick={addItem}>Track It</Button>
      </div>
      
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No energy drainers tracked yet. Add your first one above!</p>
        ) : (
          items.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 p-2 border rounded bg-orange-50">
              <span className="flex-1">{item}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                className="text-orange-600 hover:text-orange-800"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {items.length} energy-draining activities tracked
          </div>
          <Button variant="outline" onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            Save to Briefcase
          </Button>
        </div>
      )}
    </div>
  );
} 