import { useState, useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { CreditCard, TrendingUp, Check, Zap, Crown, Rocket, ExternalLink, AlertCircle } from 'lucide-react';
import { apiService } from '../services/apiService';
import { logError } from '../lib/logger';

interface Subscription {
    tier: string;
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
}

interface Usage {
    aiGenerations: number;
    competitorsTracked: number;
    businessProfiles: number;
}

const TIER_INFO = {
    free: {
        name: 'Free',
        price: 0,
        icon: Zap,
        color: 'text-zinc-400',
        bgColor: 'bg-zinc-800/50',
        features: ['1 Business Profile', '5 Saved Items', 'Limited AI Credits', 'View-Only Advanced Tools', 'Community Support'],
        limits: { aiGenerations: 10, competitorsTracked: 0, businessProfiles: 1 }
    },
    solo: {
        name: 'Solo',
        price: 29,
        icon: Rocket,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        features: ['1 Business Profile', '50 Saved Items', 'Unlimited AI Text', '5 Competitors Tracked', '50 Research Credits', 'Full Tool Access'],
        limits: { aiGenerations: Infinity, competitorsTracked: 5, businessProfiles: 1 }
    },
    pro: {
        name: 'Professional',
        price: 49,
        icon: TrendingUp,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        features: ['3 Business Profiles', 'Unlimited Storage', 'Unlimited AI Text', '15 Competitors Tracked', '200 Research Credits', 'Priority Support'],
        limits: { aiGenerations: Infinity, competitorsTracked: 15, businessProfiles: 3 }
    },
    agency: {
        name: 'Agency',
        price: 99,
        icon: Crown,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
        features: ['Unlimited Businesses', 'Unlimited Storage', 'Unlimited Everything', '50 Competitors Tracked', '1000 Research Credits', 'API Access'],
        limits: { aiGenerations: Infinity, competitorsTracked: 50, businessProfiles: Infinity }
    }
};

export function Billing() {
    const user = useUser();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [usage, setUsage] = useState<Usage | null>(null);
    const [loading, setLoading] = useState(true);
    const [managingBilling, setManagingBilling] = useState(false);

    useEffect(() => {
        loadSubscriptionData();
    }, []);

    const loadSubscriptionData = async () => {
        try {
            setLoading(true);
            // Fetch subscription and usage data from backend
            const [subData, usageData] = await Promise.all([
                apiService.get<Subscription>('/stripe/subscription').catch(() => null),
                apiService.get<Usage>('/stripe/usage').catch(() => null)
            ]);

            setSubscription(subData);
            setUsage(usageData || { aiGenerations: 0, competitorsTracked: 0, businessProfiles: 1 });
        } catch (error) {
            logError('Failed to load subscription data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleManageBilling = async () => {
        try {
            setManagingBilling(true);
            // Create Stripe Customer Portal session
            const response = await apiService.post<{ url: string }>('/stripe/customer-portal', {
                userId: user?.id
            });

            if (response.url) {
                window.location.href = response.url;
            }
        } catch (error) {
            logError('Failed to open billing portal:', error);
            alert('Failed to open billing management. Please try again.');
        } finally {
            setManagingBilling(false);
        }
    };

    const handleUpgrade = async (tier: string) => {
        try {
            const response = await apiService.post<{ url: string }>('/stripe/create-checkout-session', {
                tier,
                userId: user?.id
            });

            if (response.url) {
                window.location.href = response.url;
            }
        } catch (error) {
            logError('Upgrade failed:', error);
            alert('Failed to start upgrade process. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-zinc-400">Loading subscription data...</p>
                </div>
            </div>
        );
    }

    const currentTier = subscription?.tier || 'free';
    const tierInfo = TIER_INFO[currentTier as keyof typeof TIER_INFO];
    const Icon = tierInfo.icon;

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Billing & Subscription</h1>
                    <p className="text-zinc-400 mt-1">Manage your plan and billing settings</p>
                </div>
                {subscription && subscription.tier !== 'free' && (
                    <button
                        onClick={handleManageBilling}
                        disabled={managingBilling}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all"
                    >
                        <CreditCard size={18} />
                        {managingBilling ? 'Opening...' : 'Manage Billing'}
                        <ExternalLink size={14} />
                    </button>
                )}
            </div>

            {/* Current Plan Card */}
            <div className={`p-6 rounded-2xl border ${tierInfo.bgColor} border-white/10`}>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${tierInfo.bgColor} ${tierInfo.color}`}>
                            <Icon size={32} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-white">{tierInfo.name} Plan</h2>
                                {subscription?.status && (
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${subscription.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                                            subscription.status === 'trialing' ? 'bg-blue-500/20 text-blue-400' :
                                                'bg-red-500/20 text-red-400'
                                        }`}>
                                        {subscription.status.toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <p className="text-3xl font-black text-white mt-1">
                                ${tierInfo.price}
                                <span className="text-lg text-zinc-400 font-normal">/month</span>
                            </p>
                        </div>
                    </div>
                </div>

                {subscription?.currentPeriodEnd && (
                    <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
                        {subscription.cancelAtPeriodEnd ? (
                            <div className="flex items-center gap-2 text-amber-400">
                                <AlertCircle size={16} />
                                <span>Subscription ends on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                            </div>
                        ) : (
                            <span>Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {tierInfo.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <Check className={`w-4 h-4 mt-0.5 ${tierInfo.color}`} />
                            <span className="text-sm text-zinc-300">{feature}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Usage Stats */}
            {usage && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <UsageCard
                        title="AI Generations"
                        current={usage.aiGenerations}
                        limit={tierInfo.limits.aiGenerations}
                        color="emerald"
                    />
                    <UsageCard
                        title="Competitors Tracked"
                        current={usage.competitorsTracked}
                        limit={tierInfo.limits.competitorsTracked}
                        color="blue"
                    />
                    <UsageCard
                        title="Business Profiles"
                        current={usage.businessProfiles}
                        limit={tierInfo.limits.businessProfiles}
                        color="purple"
                    />
                </div>
            )}

            {/* Upgrade Options */}
            {currentTier !== 'agency' && (
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">Upgrade Your Plan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(TIER_INFO).map(([key, info]) => {
                            if (key === 'free' || key === currentTier) return null;

                            const TierIcon = info.icon;
                            const isUpgrade = ['free', 'solo', 'pro', 'agency'].indexOf(key) > ['free', 'solo', 'pro', 'agency'].indexOf(currentTier);

                            return (
                                <div key={key} className={`p-6 rounded-xl border ${info.bgColor} border-white/10 flex flex-col`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <TierIcon className={`${info.color}`} size={24} />
                                        <div>
                                            <h4 className="font-bold text-white">{info.name}</h4>
                                            <p className="text-2xl font-black text-white">
                                                ${info.price}
                                                <span className="text-sm text-zinc-400 font-normal">/mo</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mb-4 flex-1">
                                        {info.features.slice(0, 3).map((feature, i) => (
                                            <div key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                                                <Check className={`w-4 h-4 mt-0.5 ${info.color}`} />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => handleUpgrade(key)}
                                        className={`w-full py-3 rounded-lg font-bold transition-all ${isUpgrade
                                                ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                                                : 'bg-white/10 hover:bg-white/20 text-white'
                                            }`}
                                    >
                                        {isUpgrade ? 'Upgrade' : 'Switch Plan'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

function UsageCard({ title, current, limit, color }: { title: string; current: number; limit: number; color: string }) {
    const percentage = limit === Infinity ? 0 : (current / limit) * 100;
    const isUnlimited = limit === Infinity;

    return (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">{title}</span>
                <span className="text-sm font-bold text-white">
                    {current} {!isUnlimited && `/ ${limit}`}
                </span>
            </div>
            {!isUnlimited && (
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className={`h-full bg-${color}-500 transition-all duration-500`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>
            )}
            {isUnlimited && (
                <div className={`text-xs text-${color}-400 font-bold`}>UNLIMITED</div>
            )}
        </div>
    );
}
