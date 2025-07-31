
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';

export function DecisionDashboard() {
  const [decision, setDecision] = useState('');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [impact, setImpact] = useState(5);
  const [confidence, setConfidence] = useState(5);

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="decision">Decision</Label>
        <Input
          id="decision"
          placeholder="e.g., Change app pricing from free to subscription"
          value={decision}
          onChange={(e) => setDecision(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="pros">Pros</Label>
        <Textarea
          id="pros"
          placeholder="List the potential upsides..."
          value={pros}
          onChange={(e) => setPros(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="cons">Cons</Label>
        <Textarea
          id="cons"
          placeholder="List the potential downsides..."
          value={cons}
          onChange={(e) => setCons(e.target.value)}
        />
      </div>
      <div>
        <Label>Impact (1-10)</Label>
        <Slider value={[impact]} onValueChange={(v) => setImpact(v[0])} max={10} step={1} />
      </div>
      <div>
        <Label>Confidence (1-10)</Label>
        <Slider value={[confidence]} onValueChange={(v) => setConfidence(v[0])} max={10} step={1} />
      </div>
      <Button>Make Decision</Button>
    </div>
  );
}
