'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function FreebieFunnelBuilder() {
  return (
    <div className="space-y-4">
      <div>
        <Label>Lead Magnet</Label>
        <Input placeholder="e.g., Free PDF Guide" />
      </div>
      <div>
        <Label>Email Series</Label>
        <Input placeholder="e.g., 5-day challenge" />
      </div>
      <div>
        <Label>Product Teaser</Label>
        <Input placeholder="e.g., Early-bird access to course" />
      </div>
      <Button>Build Funnel</Button>
    </div>
  );
} 