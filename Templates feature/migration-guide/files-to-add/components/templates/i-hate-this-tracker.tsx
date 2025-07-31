
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function IHateThisTracker() {
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (newItem.trim()) {
      setItems([...items, newItem]);
      setNewItem('');
    }
  };

  return (
    <div>
      <div className="flex space-x-2 mb-4">
        <Input
          placeholder="What's draining your energy?"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
        />
        <Button onClick={addItem}>Track It</Button>
      </div>
      <ul className="space-y-2 list-disc list-inside">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
