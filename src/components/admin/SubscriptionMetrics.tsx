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
            change: 'Live',
            icon: <DollarSign className="text-emerald-500" size={24} />,
            color: 'bg-emerald-500/10 border-emerald-500/20'
        },
        {
            label: 'Active Subscribers',
            value: metrics?.activeSubscriptions || 0,
            change: 'Real-time',
            icon: <Users className="text-blue-500" size={24} />,
            color: 'bg-blue-500/10 border-blue-500/20'
        },
        {
            label: 'Total Users',
            value: metrics?.totalUsers || 0,
            change: 'Verified',
            icon: <TrendingUp className="text-purple-500" size={24} />,
            color: 'bg-purple-500/10 border-purple-500/20'
        },
        {
            label: 'Conversion Rate',
            value: metrics?.conversionRate || '0%',
            change: 'Actual',
            icon: <CreditCard className="text-orange-500" size={24} />,
            color: 'bg-orange-500/10 border-orange-500/20'
        }
    ];

    const chartData = metrics?.tierDistribution || [
        { name: 'Accelerator', value: 0, color: '#10b981' },
        { name: 'Dominator', value: 0, color: '#8b5cf6' },
        { name: 'Launch', value: 0, color: '#f59e0b' },
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
                            <span className="text-emerald-400 text-xs font-mono uppercase bg-emerald-500/10 px-2 py-1 rounded-full">
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
                    <h3 className="text-lg font-semibold text-white mb-6 font-orbitron uppercase tracking-wider">Subscription Tiers</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-6 font-orbitron uppercase tracking-wider">Recent Activity</h3>
                    <div className="space-y-4">
                        {metrics?.recentActivity?.length > 0 ? (
                            metrics.recentActivity.map((activity: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-neon-purple/10 flex items-center justify-center text-neon-purple text-xs font-bold border border-neon-purple/20">
                                            {activity.email?.substring(0, 2).toUpperCase() || '??'}
                                        </div>
                                        <div>
                                            <p className="text-sm text-white font-medium capitalize">{activity.tier} Subscription Update</p>
                                            <p className="text-xs text-zinc-500 font-mono">{activity.email}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-zinc-500 font-mono">
                                        {activity.time ? new Date(activity.time).toLocaleDateString() : 'Just now'}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-zinc-500 font-mono text-sm uppercase">No recent activity logged</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
