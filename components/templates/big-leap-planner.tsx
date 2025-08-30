'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';
import { useTemplateSave } from '@/hooks/use-template-save';
import { Save, TrendingUp, AlertTriangle } from 'lucide-react';

export function BigLeapPlanner() {
  const [leapDescription, setLeapDescription] = useState('');
  const [currentSituation, setCurrentSituation] = useState('');
  const [desiredOutcome, setDesiredOutcome] = useState('');
  const [fears, setFears] = useState('');
  const [opportunities, setOpportunities] = useState('');
  const [preparation, setPreparation] = useState('');
  const [timeline, setTimeline] = useState('');
  const [support, setSupport] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState([5]);
  const [riskLevel, setRiskLevel] = useState([5]);
  const [title, setTitle] = useState('');
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const handleSave = async () => {
    const templateData = {
      leapDescription,
      currentSituation,
      desiredOutcome,
      fears,
      opportunities,
      preparation,
      timeline,
      support,
      confidenceLevel: confidenceLevel[0],
      riskLevel: riskLevel[0],
    };

    const saveTitle = title || `Big Leap: ${leapDescription || 'Untitled Leap'}`;
    
    await saveTemplate('big-leap-planner', templateData, saveTitle, `Confidence: ${confidenceLevel[0]}/10, Risk: ${riskLevel[0]}/10`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">&quot;Big Leap&quot; Planner</h3>
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

      <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
        <p className="text-sm text-accent-foreground">
          <TrendingUp className="w-4 h-4 inline mr-2" />
          Plan your bold pivot or scary move with confidence. This template helps you prepare for big decisions that could transform your business.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="leapDescription">Your Big Leap</Label>
          <Textarea
            id="leapDescription"
            placeholder="e.g., Quitting my day job to go full-time on my business, Pivoting to a new business model, Moving to a new market..."
            value={leapDescription}
            onChange={(e) => setLeapDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Current Situation</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Where are you right now? What's your current setup, income, resources, etc.?"
                value={currentSituation}
                onChange={(e) => setCurrentSituation(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Desired Outcome</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="What will success look like after you take this leap? Be specific about the results you want."
                value={desiredOutcome}
                onChange={(e) => setDesiredOutcome(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-chart-5" />
                Fears & Concerns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="What scares you about this leap? What could go wrong?"
                value={fears}
                onChange={(e) => setFears(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-chart-2" />
                Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="What amazing things could happen? What doors might this open?"
                value={opportunities}
                onChange={(e) => setOpportunities(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Label htmlFor="preparation">Preparation Steps</Label>
          <Textarea
            id="preparation"
            placeholder="What do you need to do to prepare for this leap? List the concrete steps you'll take before making the move."
            value={preparation}
            onChange={(e) => setPreparation(e.target.value)}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="timeline">Timeline</Label>
            <Input
              id="timeline"
              placeholder="e.g., 3 months, By Q2 2024, When I reach $10k MRR"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="support">Support System</Label>
            <Input
              id="support"
              placeholder="Who will support you through this? Mentors, family, community..."
              value={support}
              onChange={(e) => setSupport(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Confidence Level (1-10)</Label>
            <Slider 
              value={confidenceLevel} 
              onValueChange={setConfidenceLevel} 
              max={10} 
              step={1} 
              className="mt-2"
            />
            <div className="text-sm text-muted-foreground mt-1">Current: {confidenceLevel[0]}/10</div>
          </div>
          <div>
            <Label>Risk Level (1-10)</Label>
            <Slider 
              value={riskLevel} 
              onValueChange={setRiskLevel} 
              max={10} 
              step={1} 
              className="mt-2"
            />
            <div className="text-sm text-muted-foreground mt-1">Current: {riskLevel[0]}/10</div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button>Get Blaze Coaching</Button>
        <Button variant="outline" onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          Save to Briefcase
        </Button>
      </div>
    </div>
  );
}