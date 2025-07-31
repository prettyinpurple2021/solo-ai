'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useTemplateSave } from '@/hooks/use-template-save';
import { Save, Scale, CheckCircle, XCircle } from 'lucide-react';

interface Criterion {
  id: string;
  name: string;
  weight: number;
  score: number;
}

export function ValuesAlignedBizFilter() {
  const [opportunityName, setOpportunityName] = useState('');
  const [description, setDescription] = useState('');
  const [coreValues, setCoreValues] = useState('');
  const [criteria, setCriteria] = useState<Criterion[]>([
    { id: '1', name: 'Aligns with personal values', weight: 10, score: 5 },
    { id: '2', name: 'Supports long-term vision', weight: 9, score: 5 },
    { id: '3', name: 'Financial viability', weight: 8, score: 5 },
    { id: '4', name: 'Time commitment manageable', weight: 7, score: 5 },
    { id: '5', name: 'Excites and energizes me', weight: 8, score: 5 },
  ]);
  const [notes, setNotes] = useState('');
  const [title, setTitle] = useState('');
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const updateCriterionScore = (id: string, score: number) => {
    setCriteria(criteria.map(c => c.id === id ? { ...c, score } : c));
  };

  const calculateTotalScore = () => {
    const totalWeightedScore = criteria.reduce((sum, c) => sum + (c.weight * c.score), 0);
    const maxPossibleScore = criteria.reduce((sum, c) => sum + (c.weight * 10), 0);
    return Math.round((totalWeightedScore / maxPossibleScore) * 100);
  };

  const getRecommendation = () => {
    const score = calculateTotalScore();
    if (score >= 80) return { text: 'Strong Alignment - Highly Recommended', color: 'text-green-600', icon: CheckCircle };
    if (score >= 60) return { text: 'Moderate Alignment - Consider Carefully', color: 'text-yellow-600', icon: Scale };
    return { text: 'Poor Alignment - Not Recommended', color: 'text-red-600', icon: XCircle };
  };

  const recommendation = getRecommendation();
  const RecommendationIcon = recommendation.icon;

  const handleSave = async () => {
    const templateData = {
      opportunityName,
      description,
      coreValues,
      criteria,
      notes,
      totalScore: calculateTotalScore(),
      recommendation: recommendation.text,
    };

    const saveTitle = title || `Values Filter: ${opportunityName || 'Untitled Opportunity'}`;
    
    await saveTemplate('values-aligned-biz-filter', templateData, saveTitle, `Score: ${calculateTotalScore()}% - ${recommendation.text}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Values-Aligned Biz Filter</h3>
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
        <div>
          <Label htmlFor="opportunityName">Opportunity/Decision Name</Label>
          <Input
            id="opportunityName"
            placeholder="What opportunity or decision are you evaluating?"
            value={opportunityName}
            onChange={(e) => setOpportunityName(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Briefly describe the opportunity, partnership, or business decision..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="coreValues">Your Core Values</Label>
          <Textarea
            id="coreValues"
            placeholder="List your core values and what matters most to you in business..."
            value={coreValues}
            onChange={(e) => setCoreValues(e.target.value)}
            rows={2}
          />
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold">Evaluation Criteria (1-10 scale):</h4>
          {criteria.map((criterion) => (
            <div key={criterion.id} className="p-3 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{criterion.name}</span>
                <span className="text-sm text-gray-500">Weight: {criterion.weight}/10</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm">Score:</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={criterion.score}
                  onChange={(e) => updateCriterionScore(criterion.id, parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="font-medium w-8">{criterion.score}/10</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border rounded-lg bg-blue-50">
          <div className="flex items-center gap-3">
            <RecommendationIcon className={`w-6 h-6 ${recommendation.color}`} />
            <div>
              <div className="text-2xl font-bold">{calculateTotalScore()}%</div>
              <div className={`font-medium ${recommendation.color}`}>
                {recommendation.text}
              </div>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Additional Notes & Reflections</Label>
          <Textarea
            id="notes"
            placeholder="Any additional thoughts, concerns, or considerations?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <Button onClick={handleSave} className="self-start" disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          Save to Briefcase
        </Button>
      </div>
    </div>
  );
}