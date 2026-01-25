import, { useState, useEffect } from 'react';
import { Server, Database, Activity, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { logError } from '@/lib/logger';

export function SystemHealth() {
    const [health, setHealth] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const token = localStorage.getItem('token');
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
                const res = await fetch(`${API_URL}/api/admin/system-health`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                setHealth(data);
            } catch (error) {
                logError('Failed to fetch system health', error instanceof Error ? error : new Error(String(error)));
            } finally {
                setIsLoading(false);
            }
        };

        fetchHealth();
        const interval = setInterval(fetchHealth, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    if (isLoading) return <div className="text-zinc-500">Checking system vitals...</div>;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
            case 'connected':
                return 'text-emerald-500';
            case 'degraded':
                return 'text-yellow-500';
            case 'down':
            case 'disabled':
                return 'text-red-500';
            default:
                return 'text-zinc-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy':
            case 'connected':
                return <CheckCircle size={18} className="text-emerald-500" />;
            case 'degraded':
                return <AlertTriangle size={18} className="text-yellow-500" />;
            case 'down':
            case 'disabled':
                return <XCircle size={18} className="text-red-500" />;
            default:
                return <Activity size={18} className="text-zinc-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Overall Status */}
                <div className="glass-card p-6 rounded-2xl border border-white/10 flex items-center gap-4">
                    <div className={`p-4 rounded-full bg-opacity-10 ${health?.status === 'healthy' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                        <Activity size={32} className={health?.status === 'healthy' ? 'text-emerald-500' : 'text-red-500'} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white capitalize">{health?.status || 'Unknown'}</h3>
                        <p className="text-sm text-zinc-400">Overall System Status</p>
                    </div>
                </div>

                {/* Database */}
                <div className="glass-card p-6 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Database size={20} className="text-blue-500" />
                            <h3 className="font-medium text-white">Database</h3>
                        </div>
                        {getStatusIcon(health?.database?.status)}
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Status</span>
                            <span className={`font-medium ${getStatusColor(health?.database?.status)} capitalize`}>
                                {health?.database?.status}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Latency</span>
                            <span className="text-white font-mono">{health?.database?.latency || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Redis */}
                <div className="glass-card p-6 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Server size={20} className="text-purple-500" />
                            <h3 className="font-medium text-white">Redis Cache</h3>
                        </div>
                        {getStatusIcon(health?.redis?.status)}
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Status</span>
                            <span className={`font-medium ${getStatusColor(health?.redis?.status)} capitalize`}>
                                {health?.redis?.status}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Uptime</span>
                            <span className="text-white font-mono">{Math.floor(health?.uptime || 0)}s</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
