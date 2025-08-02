'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useTemplateSave } from '@/hooks/use-template-save';
import { Save, Grid3X3, Plus, Trash2, Check, X } from 'lucide-react';

interface Offer {
  name: string;
  price: string;
  description: string;
}

interface Feature {
  name: string;
  values: string[];
}

export function OfferComparisonMatrix() {
  const [offers, setOffers] = useState<Offer[]>([
    { name: 'Basic', price: '$10', description: 'Starter package' },
    { name: 'Pro', price: '$25', description: 'Most popular' },
    { name: 'Enterprise', price: '$50', description: 'Full service' },
  ]);
  const [features, setFeatures] = useState<Feature[]>([
    { name: 'Price', values: ['$10', '$25', '$50'] },
    { name: 'Support', values: ['Email', 'Email + Chat', 'Priority Support'] },
    { name: 'Features', values: ['Basic', 'Advanced', 'Everything'] },
  ]);
  const [title, setTitle] = useState('');
  
  const { saveTemplate, isSaving } = useTemplateSave();

  const addOffer = () => {
    const newOffer: Offer = {
      name: `Package ${offers.length + 1}`,
      price: '$0',
      description: 'New package'
    };
    setOffers([...offers, newOffer]);
    
    // Add empty values for new offer in all features
    const newFeatures = features.map(feature => ({
      ...feature,
      values: [...feature.values, '']
    }));
    setFeatures(newFeatures);
  };

  const removeOffer = (index: number) => {
    if (offers.length <= 1) return;
    setOffers(offers.filter((_, i) => i !== index));
    
    // Remove values for this offer from all features
    const newFeatures = features.map(feature => ({
      ...feature,
      values: feature.values.filter((_, i) => i !== index)
    }));
    setFeatures(newFeatures);
  };

  const updateOffer = (index: number, field: keyof Offer, value: string) => {
    const newOffers = [...offers];
    newOffers[index] = { ...newOffers[index], [field]: value };
    setOffers(newOffers);
  };

  const addFeature = () => {
    const newFeature: Feature = {
      name: 'New Feature',
      values: offers.map(() => '')
    };
    setFeatures([...features, newFeature]);
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const updateFeature = (featureIndex: number, field: 'name', value: string) => {
    const newFeatures = [...features];
    newFeatures[featureIndex] = { ...newFeatures[featureIndex], [field]: value };
    setFeatures(newFeatures);
  };

  const updateFeatureValue = (featureIndex: number, valueIndex: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[featureIndex].values[valueIndex] = value;
    setFeatures(newFeatures);
  };

  const isCheckValue = (value: string) => {
    return ['✓', 'yes', 'included', 'true'].includes(value.toLowerCase());
  };

  const isXValue = (value: string) => {
    return ['✗', 'no', 'not included', 'false'].includes(value.toLowerCase());
  };

  const handleSave = async () => {
    const templateData = {
      offers,
      features,
      offerCount: offers.length,
      featureCount: features.length,
      dateCreated: new Date().toISOString(),
    };

    const saveTitle = title || `${offers.length} Package Comparison`;
    
    await saveTemplate('offer-comparison-matrix', templateData, saveTitle, `Comparing ${offers.length} packages with ${features.length} features`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Offer Comparison Matrix</h3>
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

      <div className="space-y-4">
        <div className="flex gap-2">
          <Button variant="outline" onClick={addOffer}>
            <Plus className="w-4 h-4 mr-2" />
            Add Package
          </Button>
          <Button variant="outline" onClick={addFeature}>
            <Plus className="w-4 h-4 mr-2" />
            Add Feature
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Package Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {offers.map((offer, index) => (
                <div key={index} className="space-y-2 p-3 border rounded">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Package {index + 1}</Badge>
                    {offers.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOffer(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="Package name"
                    value={offer.name}
                    onChange={(e) => updateOffer(index, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="Price"
                    value={offer.price}
                    onChange={(e) => updateOffer(index, 'price', e.target.value)}
                  />
                  <Input
                    placeholder="Description"
                    value={offer.description}
                    onChange={(e) => updateOffer(index, 'description', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comparison Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Feature</TableHead>
                    {offers.map((offer, index) => (
                      <TableHead key={index} className="text-center">
                        <div className="font-medium">{offer.name}</div>
                        <div className="text-sm text-muted-foreground">{offer.price}</div>
                      </TableHead>
                    ))}
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {features.map((feature, featureIndex) => (
                    <TableRow key={featureIndex}>
                      <TableCell>
                        <Input
                          value={feature.name}
                          onChange={(e) => updateFeature(featureIndex, 'name', e.target.value)}
                          className="border-none p-0 font-medium"
                        />
                      </TableCell>
                      {feature.values.map((value, valueIndex) => (
                        <TableCell key={valueIndex} className="text-center">
                          <div className="flex items-center justify-center">
                            {isCheckValue(value) ? (
                              <Check className="w-5 h-5 text-green-600" />
                            ) : isXValue(value) ? (
                              <X className="w-5 h-5 text-red-600" />
                            ) : (
                              <Input
                                value={value}
                                onChange={(e) => updateFeatureValue(featureIndex, valueIndex, e.target.value)}
                                className="text-center border-none p-1 h-8"
                                placeholder="Enter value"
                              />
                            )}
                          </div>
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFeature(featureIndex)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-4 text-sm text-muted-foreground">
              <p><strong>Tip:</strong> Type "✓", "yes", or "included" for checkmarks. Type "✗", "no", or "not included" for X marks.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 