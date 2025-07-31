
'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export function DmSalesScriptGenerator() {
  return (
    <div className="space-y-4">
      <div>
        <Label>Target Persona</Label>
        <Textarea placeholder="Describe your ideal customer..." />
      </div>
      <div>
        <Label>Offer Details</Label>
        <Textarea placeholder="What are you selling?" />
      </div>
      <Button>Generate Scripts</Button>
    </div>
  );
}
