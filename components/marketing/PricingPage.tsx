import React, { useState } from 'react';
import { MarketingLayout } from './layout/MarketingLayout';
import { Check, Loader2 } from 'lucide-react';
import { useUser } from '@stackframe/stack';
import { apiService } from '../../services/apiService';

export function PricingPage() {
    const user = useUser();
    const [loadingTier, setLoadingTier] = useState<string | null>(null);

    const handleUpgrade = async (tier: string, priceId: string) => {
        if (!user) {
            // Redirect to login if not logged in
            window.location.href = '/sign-in';
            return;
        }

        if (!priceId) {
            console.error('Price ID missing for tier:', tier);
            return;
        }

        try {
            setLoadingTier(tier);
            const response = await apiService.post('/stripe/create-checkout-session', {
                priceId,
                userId: user.id
            });

            if (response.url) {
                window.location.href = response.url;
            }
        } catch (error) {
            console.error('Upgrade failed:', error);
            alert('Failed to start checkout. Please try again.');
        } finally {
            setLoadingTier(null);
        }
    };

    const PRICE_IDS = {
        solo: process.env.NEXT_PUBLIC_STRIPE_SOLO_PRICE_ID || '',
        pro: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '',
        agency: process.env.NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID || '',
    };

    return (
        <MarketingLayout>
            <div className="max-w-7xl mx-auto px-6 py-20">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-xl text-zinc-400">
                        Start for free, upgrade as you scale. No hidden fees.
                    </p>
                </div>

                <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {/* Free Plan */}
                    <PricingCard
                        title="Free"
                        price="$0"
                        description="For the curious explorer."
                        features={[
                            "1 Business Profile",
                            "5 Saved Items (Storage)",
                            "Limited AI Credits",
                            "View-Only Advanced Tools",
                            "Community Support"
                        ]}
                        buttonText="Current Plan"
                        disabled
                    />

                    {/* Solo Plan */}
                    <PricingCard
                        title="Solo"
                        price="$29"
                        period="/month"
                        description="For the side-hustler."
                        isPopular
                        features={[
                            "1 Business Profile",
                            "50 Saved Items",
                            "Unlimited AI Text",
                            "5 Competitors Tracked",
                            "50 Research Credits",
                            "Full Tool Access"
                        ]}
                        onUpgrade={() => handleUpgrade('solo', PRICE_IDS.solo)}
                        isLoading={loadingTier === 'solo'}
                    />

                    {/* Pro Plan */}
                    <PricingCard
                        title="Pro"
                        price="$49"
                        period="/month"
                        description="For the full-time founder."
                        features={[
                            "3 Business Profiles",
                            "Unlimited Storage",
                            "Unlimited AI Text",
                            "15 Competitors Tracked",
                            "200 Research Credits",
                            "Priority Support"
                        ]}
                        onUpgrade={() => handleUpgrade('pro', PRICE_IDS.pro)}
                        isLoading={loadingTier === 'pro'}
                    />

                    {/* Agency Plan */}
                    <PricingCard
                        title="Agency"
                        price="$99"
                        period="/month"
                        description="For power users & teams."
                        features={[
                            "Unlimited Businesses",
                            "Unlimited Storage",
                            "Unlimited Everything",
                            "50 Competitors Tracked",
                            "1000 Research Credits",
                            "API Access"
                        ]}
                        onUpgrade={() => handleUpgrade('agency', PRICE_IDS.agency)}
                        isLoading={loadingTier === 'agency'}
                    />
                </div>
            </div>
        </MarketingLayout>
    );
}

function PricingCard({ title, price, period, description, features, isPopular, onUpgrade, isLoading, disabled, buttonText }: {
    title: string,
    price: string,
    period?: string,
    description: string,
    features: string[],
    isPopular?: boolean,
    onUpgrade?: () => void,
    isLoading?: boolean,
    disabled?: boolean,
    buttonText?: string
}) {
    return (
        <div className={`relative p-6 rounded-2xl border ${isPopular ? 'bg-white/10 border-emerald-500 shadow-2xl shadow-emerald-500/20' : 'bg-white/5 border-white/10'} flex flex-col`}>
            {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-black text-xs font-bold rounded-full uppercase tracking-wide">
                    Most Popular
                </div>
            )}

            <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-white">{price}</span>
                    {period && <span className="text-zinc-400 text-sm">{period}</span>}
                </div>
                <p className="text-zinc-400 text-sm h-10">{description}</p>
            </div>

            <div className="space-y-3 mb-8 flex-1">
                {features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <div className={`mt-0.5 p-0.5 rounded-full ${isPopular ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-zinc-400'}`}>
                            <Check className="w-3 h-3" />
                        </div>
                        <span className="text-zinc-300 text-sm leading-tight">{feature}</span>
                    </div>
                ))}
            </div>

            <button
                onClick={onUpgrade}
                disabled={disabled || isLoading}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${disabled
                    ? 'bg-white/5 text-zinc-500 cursor-not-allowed'
                    : isPopular
                        ? 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-white text-black hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
            >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (buttonText || `Choose ${title}`)}
            </button>
        </div>
    );
}


