import { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, CreditCard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { logError } from '@/lib/logger';

export function SubscriptionMetrics() {
    const [metrics, setMetrics] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        try {
            const token = localStorage.getItem('token');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            const res = await fetch(`${API_URL}/api/admin/analytics`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setMetrics(data);
        } catch (error) {
            logError('Failed to fetch subscription metrics', error instanceof Error ? error : new Error(String(error)));
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="text-zinc-500">Loading metrics...</div>;

    const stats = [
        {
            label: 'Total MRR',
            value: `$${metrics?.mrr || 0}`,
            change: '+12%',
            icon: <DollarSign className="text-emerald-500" size={24} />,
            color: 'bg-emerald-500/10 border-emerald-500/20'
        },
        {
            label: 'Active Subscribers',
            value: metrics?.activeSubscriptions || 0,
            change: '+5%',
            icon: <Users className="text-blue-500" size={24} />,
            color: 'bg-blue-500/10 border-blue-500/20'
        },
        {
            label: 'Total Users',
            value: metrics?.totalUsers || 0,
            change: '+8%',
            icon: <TrendingUp className="text-purple-500" size={24} />,
            color: 'bg-purple-500/10 border-purple-500/20'
        },
        {
            label: 'Conversion Rate',
            value: '3.2%',
            change: '+0.4%',
            icon: <CreditCard className="text-orange-500" size={24} />,
            color: 'bg-orange-500/10 border-orange-500/20'
        }
    ];

    const data = [
        { name: 'Starter', value: 45, color: '#10b981' },
        { name: 'Professional', value: 28, color: '#8b5cf6' },
        { name: 'Empire', value: 12, color: '#f59e0b' },
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className={`glass-card p-6 rounded-2xl border ${stat.color}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.color.split(' ')[0]}`}>
                                {stat.icon}
                            </div>
                            <span className="text-emerald-400 text-sm font-medium bg-emerald-500/10 px-2 py-1 rounded-full">
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-zinc-400 text-sm font-medium mb-1">{stat.label}</h3>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-6">Subscription Tiers</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-xs font-bold">
                                        JD
                                    </div>
                                    <div>
                                        <p className="text-sm text-white font-medium">New subscription started</p>
                                        <p className="text-xs text-zinc-500">john.doe@example.com • Starter Plan</p>
                                    </div>
                                </div>
                                <span className="text-xs text-zinc-500">2m ago</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
