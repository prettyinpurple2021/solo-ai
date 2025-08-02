'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useTemplateSave } from '@/hooks/use-template-save';
import { Save, Sparkles, Plus, Trash2, Target, Heart, DollarSign, MapPin } from 'lucide-react';

interface VisionElement {
  id: string;
  category: 'business' | 'personal' | 'financial' | 'lifestyle';
  title: string;
  description: string;
  timeline: string;
  priority: 'high' | 'medium' | 'low';
}

export function VisionBoardGenerator() {
  const [visionStatement, setVisionStatement] = useState('');
  const [coreValues, setCoreValues] = useState('');
  const [elements, setElements] = useState<VisionElement[]>([]);
  const [title, setTitle] = useState('');
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const categories = [
    { value: 'business', label: 'Business Goals', icon: Target, color: 'text-blue-600' },
    { value: 'personal', label: 'Personal Growth', icon: Heart, color: 'text-pink-600' },
    { value: 'financial', label: 'Financial', icon: DollarSign, color: 'text-green-600' },
    { value: 'lifestyle', label: 'Lifestyle', icon: MapPin, color: 'text-purple-600' },
  ];

  const addElement = (category: VisionElement['category']) => {
    const newElement: VisionElement = {
      id: Date.now().toString(),
      category,
      title: '',
      description: '',
      timeline: '1 year',
      priority: 'medium'
    };
    setElements([...elements, newElement]);
  };

  const removeElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
  };

  const updateElement = (id: string, field: keyof VisionElement, value: string) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, [field]: value } : el
    ));
  };

  const generateSampleVision = () => {
    const sampleElements: VisionElement[] = [
      {
        id: '1',
        category: 'business',
        title: '6-Figure Business',
        description: 'Build a sustainable business generating $100k+ annually',
        timeline: '18 months',
        priority: 'high'
      },
      {
        id: '2',
        category: 'personal',
        title: 'Work-Life Balance',
        description: 'Maintain healthy boundaries and time for family',
        timeline: '6 months',
        priority: 'high'
      },
      {
        id: '3',
        category: 'financial',
        title: 'Emergency Fund',
        description: 'Save 6 months of expenses for security',
        timeline: '12 months',
        priority: 'medium'
      },
      {
        id: '4',
        category: 'lifestyle',
        title: 'Dream Vacation',
        description: 'Take a month-long trip to Europe',
        timeline: '2 years',
        priority: 'low'
      }
    ];
    setElements(sampleElements);
  };

  const handleSave = async () => {
    const templateData = {
      visionStatement,
      coreValues,
      elements,
      totalElements: elements.length,
      categoryCounts: {
        business: elements.filter(el => el.category === 'business').length,
        personal: elements.filter(el => el.category === 'personal').length,
        financial: elements.filter(el => el.category === 'financial').length,
        lifestyle: elements.filter(el => el.category === 'lifestyle').length,
      },
      dateCreated: new Date().toISOString(),
    };

    const saveTitle = title || 'My Vision Board';
    
    await saveTemplate('vision-board-generator', templateData, saveTitle, `${elements.length} vision elements across ${Object.keys(templateData.categoryCounts).length} categories`);
  };

  const getCategoryInfo = (category: VisionElement['category']) => {
    return categories.find(cat => cat.value === category);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Vision Board Generator</h3>
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
            {isSaving ? 'Saving...' : 'Save to Briefcase'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4">
          <div>
            <Label htmlFor="vision">Vision Statement</Label>
            <Textarea
              id="vision"
              placeholder="Describe your big picture vision for your life and business..."
              value={visionStatement}
              onChange={(e) => setVisionStatement(e.target.value)}
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="values">Core Values</Label>
            <Textarea
              id="values"
              placeholder="List your core values that will guide your decisions..."
              value={coreValues}
              onChange={(e) => setCoreValues(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Add Vision Elements</Label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(category => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.value}
                    variant="outline"
                    size="sm"
                    onClick={() => addElement(category.value as VisionElement['category'])}
                    className="justify-start"
                  >
                    <Icon className={`w-4 h-4 mr-2 ${category.color}`} />
                    {category.label}
                  </Button>
                );
              })}
            </div>
            <Button variant="outline" onClick={generateSampleVision} className="w-full">
              Generate Sample Vision
            </Button>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <h4 className="font-medium">Vision Elements</h4>
          
          {elements.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p>Start building your vision by adding elements from the categories on the left</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {elements.map((element) => {
                const categoryInfo = getCategoryInfo(element.category);
                const Icon = categoryInfo?.icon || Target;
                
                return (
                  <Card key={element.id} className="relative">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${categoryInfo?.color}`} />
                          <Badge variant="outline">{categoryInfo?.label}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(element.priority)}>
                            {element.priority}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeElement(element.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input
                        value={element.title}
                        onChange={(e) => updateElement(element.id, 'title', e.target.value)}
                        placeholder="Goal title..."
                        className="font-medium"
                      />
                      
                      <Textarea
                        value={element.description}
                        onChange={(e) => updateElement(element.id, 'description', e.target.value)}
                        placeholder="Describe this goal in detail..."
                        rows={2}
                      />
                      
                      <div className="flex gap-2">
                        <select
                          value={element.timeline}
                          onChange={(e) => updateElement(element.id, 'timeline', e.target.value)}
                          className="flex-1 px-3 py-2 border rounded-md text-sm"
                        >
                          <option value="3 months">3 months</option>
                          <option value="6 months">6 months</option>
                          <option value="1 year">1 year</option>
                          <option value="18 months">18 months</option>
                          <option value="2 years">2 years</option>
                          <option value="5 years">5 years</option>
                        </select>
                        
                        <select
                          value={element.priority}
                          onChange={(e) => updateElement(element.id, 'priority', e.target.value as VisionElement['priority'])}
                          className="px-3 py-2 border rounded-md text-sm"
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 