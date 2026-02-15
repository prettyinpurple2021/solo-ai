import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/use-subscription';
import { Rocket, Shield, Zap, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Tier = 'free' | 'launchpad' | 'accelerator' | 'dominator';

interface UpgradePromptProps {
    requiredTier: Tier;
    featureName: string;
    className?: string;
}

const TIER_DETAILS: Record<Tier, { name: string; icon: any; color: string; benefits: string[] }> = {
    free: { name: 'Free', icon:  Shield, color: 'text-gray-500', benefits: [] },
    launchpad: { 
        name: 'Launchpad', 
        icon: Rocket, 
        color: 'text-blue-500',
        benefits: ['100 Conversations/day', '3 AI Agents', '50MB Storage']
    },
    accelerator: { 
        name: 'Accelerator', 
        icon: Zap, 
        color: 'text-purple-500',
        benefits: ['Unlimited Conversations', '8 AI Agents', 'Advanced Incinerator', '1GB Storage']
    },
    dominator: { 
        name: 'Dominator', 
        icon: Shield, 
        color: 'text-red-500',
        benefits: ['Unlimited Everything', 'War Room Access', 'Competitor Stalker', 'Legal Tools', '100GB Storage']
    }
};

export function UpgradePrompt({ requiredTier, featureName, className }: UpgradePromptProps) {
    const { upgradePlan, isLoading } = useSubscription();
    const tier = TIER_DETAILS[requiredTier];

    if (!tier) return null;

    const handleUpgrade = () => {
        // Cast to match the literal type expected by upgradePlan
        if (requiredTier === 'launchpad' || requiredTier === 'accelerator' || requiredTier === 'dominator') {
            upgradePlan(requiredTier);
        }
    };

    return (
        <Card className={cn("w-full max-w-md mx-auto border-2 border-dashed bg-muted/30", className)}>
            <CardHeader className="text-center pb-2">
                <div className={cn("w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center mb-4", tier.color)}>
                    <Lock className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl font-bold">Unlock {featureName}</CardTitle>
                <CardDescription>
                    This is a premium feature available on the <span className={cn("font-semibold", tier.color)}>{tier.name}</span> plan.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="text-sm font-medium text-muted-foreground text-center mb-2">
                        Get access to:
                    </div>
                    <ul className="grid gap-2">
                        {tier.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                                <tier.icon className={cn("w-4 h-4", tier.color)} />
                                <span>{benefit}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </CardContent>
            <CardFooter>
                <Button 
                    onClick={handleUpgrade} 
                    className="w-full font-semibold" 
                    size="lg"
                    disabled={isLoading}
                >
                    {isLoading ? 'Processing...' : `Upgrade to ${tier.name}`}
                </Button>
            </CardFooter>
        </Card>
    );
}
