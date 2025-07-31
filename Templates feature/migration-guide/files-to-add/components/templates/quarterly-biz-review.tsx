
'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export function QuarterlyBizReview() {
  return (
    <div className="space-y-4">
      <div>
        <Label>Wins</Label>
        <Textarea placeholder="What went well this quarter?" />
      </div>
      <div>
        <Label>Misses</Label>
        <Textarea placeholder="What didn't go as planned?" />
      </div>
      <div>
        <Label>Growth</Label>
        <Textarea placeholder="How did the business grow?" />
      </div>
      <div>
        <Label>Lessons</Label>
        <Textarea placeholder="What did you learn?" />
      </div>
      <Button>Save Review</Button>
    </div>
  );
}
