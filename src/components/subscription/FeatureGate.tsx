'use client';

import React from 'react';
import { useSubscription } from '@/hooks/use-subscription';
import {
    normalizeSubscriptionTierLabel,
    TIER_HIERARCHY,
    type SubscriptionTier,
} from '@/lib/subscription-gating';
import { UpgradePrompt } from './UpgradePrompt';

/** Tiers used in upgrade CTAs (paid ladder); `free` users see the accelerator/dominator prompts. */
export type Tier = 'launch' | 'accelerator' | 'dominator';

export type FeatureKey = 
    | 'war-room'
    | 'competitor-stalker'
    | 'legal-tools'
    | 'advanced-incinerator'
    | 'multi-agent-collaboration'
    | 'strategy-nexus'
    | 'unlimited-agents'
    | 'pro-agents'
    | 'elite-agents'
    | 'custom-agent-builder';

const FEATURE_REQUIREMENTS: Record<FeatureKey, SubscriptionTier> = {
    'war-room': 'dominator',
    'competitor-stalker': 'accelerator',
    'legal-tools': 'dominator',
    'advanced-incinerator': 'accelerator',
    'multi-agent-collaboration': 'dominator',
    'strategy-nexus': 'dominator',
    'unlimited-agents': 'accelerator',
    'pro-agents': 'accelerator',
    'elite-agents': 'dominator',
    'custom-agent-builder': 'accelerator'
};

function upgradePromptTier(required: SubscriptionTier): Tier {
    if (required === 'free' || required === 'launch') return 'launch';
    return required;
}

interface FeatureGateProps {
    feature: FeatureKey;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
    const { subscription, isLoading } = useSubscription();

    if (isLoading) {
        return <div className="w-full h-32 flex items-center justify-center text-muted-foreground animate-pulse font-mono">Verifying authentication...</div>;
    }

    const requiredTier = FEATURE_REQUIREMENTS[feature];
    const currentTier = normalizeSubscriptionTierLabel(subscription?.plan);

    if (TIER_HIERARCHY[currentTier] >= TIER_HIERARCHY[requiredTier]) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    return (
        <div className="w-full py-12 flex justify-center items-center p-4">
            <UpgradePrompt 
                requiredTier={upgradePromptTier(requiredTier)} 
                featureName={formatFeatureName(feature)} 
            />
        </div>
    );
}

function formatFeatureName(key: string): string {
    return key.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
