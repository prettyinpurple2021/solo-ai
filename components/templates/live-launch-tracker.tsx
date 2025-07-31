'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export function LiveLaunchTracker() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="day1" />
        <Label htmlFor="day1">Day 1: Announce the launch</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="day2" />
        <Label htmlFor="day2">Day 2: Share behind the scenes</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="day3" />
        <Label htmlFor="day3">Day 3: Post testimonials</Label>
      </div>
    </div>
  );
} 