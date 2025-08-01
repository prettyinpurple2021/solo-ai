'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { useTemplateSave } from '@/hooks/use-template-save';
import { Save, Plus, Trash2, Star } from 'lucide-react';

interface RoleModel {
  name: string;
  industry: string;
  keyStrength: string;
  strategy: string;
  lessons: string;
  actionItem: string;
}

export function ReverseEngineerRoleModels() {
  const [roleModels, setRoleModels] = useState<RoleModel[]>([
    { name: '', industry: '', keyStrength: '', strategy: '', lessons: '', actionItem: '' }
  ]);
  const [title, setTitle] = useState('');
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const addRoleModel = () => {
    setRoleModels([
      ...roleModels,
      { name: '', industry: '', keyStrength: '', strategy: '', lessons: '', actionItem: '' }
    ]);
  };

  const removeRoleModel = (index: number) => {
    setRoleModels(roleModels.filter((_, i) => i !== index));
  };

  const updateRoleModel = (index: number, field: keyof RoleModel, value: string) => {
    const newRoleModels = [...roleModels];
    newRoleModels[index][field] = value;
    setRoleModels(newRoleModels);
  };

  const handleSave = async () => {
    const templateData = {
      roleModels,
      totalRoleModels: roleModels.length,
    };

    const saveTitle = title || `Role Model Analysis (${roleModels.length} models)`;
    
    await saveTemplate(
      'reverse-engineer-role-models',
      templateData,
      saveTitle,
      `${roleModels.filter(rm => rm.name).length} role models analyzed`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Reverse Engineer Your Role Models</h3>
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

      <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
        <p className="text-sm text-primary">
          <Star className="w-4 h-4 inline mr-2" />
          Analyze successful people in your field to identify replicable patterns and strategies you can adapt for your own journey.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium">Role Model Analysis</h4>
          <Button onClick={addRoleModel} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Role Model
          </Button>
        </div>

        {roleModels.map((roleModel, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Role Model #{index + 1}</CardTitle>
                {roleModels.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRoleModel(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    placeholder="e.g., Sara Blakely"
                    value={roleModel.name}
                    onChange={(e) => updateRoleModel(index, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Industry/Field</Label>
                  <Input
                    placeholder="e.g., Fashion/Entrepreneurship"
                    value={roleModel.industry}
                    onChange={(e) => updateRoleModel(index, 'industry', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label>Key Strength/Advantage</Label>
                <Textarea
                  placeholder="What makes them stand out? What's their unique advantage?"
                  value={roleModel.keyStrength}
                  onChange={(e) => updateRoleModel(index, 'keyStrength', e.target.value)}
                />
              </div>
              
              <div>
                <Label>Strategy/Approach</Label>
                <Textarea
                  placeholder="How do they approach their business/career? What strategies do they use?"
                  value={roleModel.strategy}
                  onChange={(e) => updateRoleModel(index, 'strategy', e.target.value)}
                />
              </div>
              
              <div>
                <Label>Key Lessons</Label>
                <Textarea
                  placeholder="What can you learn from their journey? What patterns do you notice?"
                  value={roleModel.lessons}
                  onChange={(e) => updateRoleModel(index, 'lessons', e.target.value)}
                />
              </div>
              
              <div>
                <Label>Your Action Item</Label>
                <Textarea
                  placeholder="What specific action will you take based on this analysis?"
                  value={roleModel.actionItem}
                  onChange={(e) => updateRoleModel(index, 'actionItem', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4">
        <Button>Generate Success Patterns</Button>
        <Button variant="outline" onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          Save to Briefcase
        </Button>
      </div>
    </div>
  );
}