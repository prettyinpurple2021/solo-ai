
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp, ShieldAlert, Activity, Zap, Eye, CheckCircle2, FileText, X, Quote, Sparkles, AlertTriangle } from 'lucide-react';
import { AGENTS } from '../constants';
import { AgentId, Task } from '../types';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { logError } from '../lib/logger';

interface StatCardProps {
    label: string;
    value: string | number;
    subValue?: string;
    icon: React.ReactNode;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, icon, color }) => (
    <div className="bg-dark-card border-2 border-gray-700 p-4 md:p-6 rounded-sm hover:border-neon-cyan/50 transition-all group relative overflow-hidden touch-none">
        <div className={`absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity ${color} blur-xl`}>
            {icon}
        </div>
        <div className="flex justify-between items-start mb-3 md:mb-4 relative z-10">
            <div className={`p-1.5 md:p-2 bg-dark-bg rounded-sm border-2 border-gray-700 ${color} shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                {icon}
            </div>
        </div>
        <div className="relative z-10">
            <div className="font-orbitron text-2xl md:text-3xl font-bold text-white tracking-tighter mb-1 drop-shadow-md">{value}</div>
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="text-xs text-gray-400 font-mono uppercase tracking-wide font-bold">{label}</div>
                {subValue && <div className={`text-[10px] px-2 py-0.5 rounded-sm bg-dark-bg border-2 border-gray-700 font-mono ${color}`}>{subValue}</div>}
            </div>
        </div>
    </div>
);

export const Dashboard: React.FC = () => {
    const [stats, setStats] = useState({
        intelCount: 0,
        activeTasks: 0,
        completedTasks: 0,
        totalTasks: 0,
        completionRate: 0,
        systemHealth: 98
    });
    const [feed, setFeed] = useState<any[]>([]);
    const [founderName, setFounderName] = useState('COMMANDER');
    const [chartData, setChartData] = useState<any[]>([]);

    // Briefing State
    const [briefing, setBriefing] = useState<any>(null);
    const [loadingBriefing, setLoadingBriefing] = useState(false);
    const [showBriefingModal, setShowBriefingModal] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            // Load Context
            try {
                const ctx = await storageService.getContext();
                if (ctx) {
                    setFounderName(ctx.founderName.toUpperCase());
                }
            } catch (e) { logError("Failed to load context", e); }

            // Load Reports
            let reports: any[] = [];
            try {
                reports = await storageService.getCompetitorReports();
            } catch (e) { logError("Failed to load reports", e); }

            // Load Tasks
            let tasks: Task[] = [];
            try {
                tasks = await storageService.getTasks();
            } catch (e) { logError("Failed to load tasks", e); }

            // Calc Stats
            const active = tasks.filter((t) => t.status === 'in-progress').length;
            const done = tasks.filter((t) => t.status === 'done').length;
            const total = tasks.length;
            const rate = total > 0 ? Math.round((done / total) * 100) : 0;

            setStats(prev => ({
                ...prev,
                intelCount: reports.length,
                activeTasks: active,
                completedTasks: done,
                totalTasks: total,
                completionRate: rate
            }));

            // Build Feed
            const reportItems = reports.map((r: any) => ({
                id: `rep-${r.competitorName}-${r.generatedAt}`,
                type: 'INTEL',
                title: 'COMPETITOR ANALYZED',
                details: r.competitorName,
                agentId: AgentId.LEXI,
                time: new Date(r.generatedAt).getTime(),
                rawTime: r.generatedAt
            }));

            const taskItems = tasks.map((t: any) => {
                let ts = Date.now();
                if (t.createdAt) {
                    ts = new Date(t.createdAt).getTime();
                } else {
                    const parts = t.id.split('-');
                    if (parts.length > 1) ts = parseInt(parts[1]) || Date.now();
                }

                return {
                    id: t.id,
                    type: 'OPS',
                    title: t.status === 'done' ? 'TASK COMPLETED' : 'TASK CREATED',
                    details: t.title,
                    agentId: t.assignee,
                    time: ts,
                    rawTime: new Date(ts).toISOString()
                };
            });

            const combined = [...reportItems, ...taskItems]
                .sort((a, b) => b.time - a.time)
                .slice(0, 15); // Top 15 events

            setFeed(combined);

            // === GENERATE REAL CHART DATA (Burn-up) ===
            const generateChartData = () => {
                const days = 7;
                const data: { name: string; value: number }[] = [];
                const now = new Date();

                // Initialize last 7 days
                for (let i = days - 1; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(now.getDate() - i);
                    const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

                    // Filter tasks completed on or before this date
                    const completedCount = tasks.filter(t => {
                        if (t.status !== 'done') return false;
                        // If completedAt exists, use it. Otherwise assume it was done today (fallback)
                        const doneDate = t.completedAt ? new Date(t.completedAt) : new Date();
                        // Set to end of day for comparison
                        doneDate.setHours(0, 0, 0, 0);
                        const compareDate = new Date(d);
                        compareDate.setHours(0, 0, 0, 0);
                        return doneDate <= compareDate;
                    }).length;

                    data.push({ name: dateStr, value: completedCount });
                }
                setChartData(data);
            };

            generateChartData();

            // Check for existing briefing
            try {
                setLoadingBriefing(true);
                const data = await geminiService.generateDailyBriefing();
                if (data) setBriefing(data);
                setLoadingBriefing(false);
            } catch (e) {
                logError("Failed to generate briefing", e);
                setLoadingBriefing(false);
            }
        };

        loadData();
    }, []);

    const handleGenerateBriefing = async () => {
        setLoadingBriefing(true);
        setBriefing(null);
        const data = await geminiService.generateDailyBriefing();
        if (data) {
            setBriefing(data);
            setShowBriefingModal(true);
        }
        setLoadingBriefing(false);
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700 relative">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-gray-700 pb-4 md:pb-6 gap-3 md:gap-4">
                <div className="w-full md:w-auto">
                    <div className="flex items-center gap-2 text-neon-lime font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <span className="w-2 h-2 bg-neon-lime rounded-full animate-pulse shadow-[0_0_10px_#39ff14]" />
                        <span className="text-[10px] md:text-xs">Live Feed // Connection Established</span>
                    </div>
                    <h2 className="font-orbitron text-2xl md:text-4xl font-bold uppercase tracking-wider text-white drop-shadow-glow">MISSION CONTROL</h2>
                    <p className="text-sm md:text-base text-gray-400 font-mono mt-1">Welcome back, {founderName}. Systems operational.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={handleGenerateBriefing}
                        disabled={loadingBriefing}
                        className="flex-1 md:flex-initial px-3 md:px-4 py-2 border-2 border-neon-lime/50 bg-neon-lime/10 hover:bg-neon-lime/20 text-neon-lime rounded-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(57,255,20,0.1)] touch-target"
                    >
                        {loadingBriefing ? <Activity className="animate-spin" size={16} /> : <FileText size={16} />}
                        <span className="text-xs font-mono font-bold uppercase tracking-wider">
                            {loadingBriefing ? 'Compiling...' : 'Morning Brief'}
                        </span>
                    </button>
                    <div className="hidden md:flex px-4 py-2 bg-dark-card rounded-sm border-2 border-gray-700 flex-col items-end">
                        <span className="text-[10px] text-gray-500 font-mono font-bold uppercase">Current Date</span>
                        <span className="text-xs font-mono text-white">{new Date().toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* Daily Intelligence Card */}
            {briefing && (
                <div className="mb-8 bg-gradient-to-r from-neon-purple/10 to-neon-cyan/10 border-2 border-neon-purple/30 rounded-sm p-6 backdrop-blur-sm shadow-[0_0_30px_rgba(179,0,255,0.1)]">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="font-orbitron text-xl font-bold uppercase tracking-wider text-white mb-2 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-neon-orange" />
                                Today&apos;s Focus
                            </h2>
                            <p className="text-neon-purple/80 italic font-mono mb-4">&quot;{briefing.motivationalQuote}&quot;</p>
                        </div>
                        <button
                            onClick={() => setShowBriefingModal(true)}
                            className="text-sm font-mono text-neon-cyan hover:text-white underline"
                        >
                            View Full Briefing
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h3 className="text-sm font-mono font-bold text-neon-cyan uppercase tracking-wider">Priority Actions</h3>
                            <ul className="space-y-2">
                                {briefing.focusPoints?.slice(0, 3).map((point: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-300 text-sm font-mono">
                                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-neon-cyan flex-shrink-0" />
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {briefing.threatAlerts?.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-mono font-bold text-neon-magenta uppercase tracking-wider">Threat Alerts</h3>
                                <ul className="space-y-2">
                                    {briefing.threatAlerts?.slice(0, 2).map((alert: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-neon-magenta/80 text-sm font-mono bg-neon-magenta/10 p-2 rounded-sm border-2 border-neon-magenta/30">
                                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            {alert}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Briefing Modal Overlay */}
            {showBriefingModal && briefing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 safe-top safe-bottom">
                    <div className="mobile-fullscreen bg-dark-bg border-0 md:border-2 md:border-neon-cyan w-full rounded-none md:rounded-sm shadow-[0_0_30px_rgba(11,228,236,0.3)] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="p-4 md:p-6 border-b-2 border-gray-700 flex justify-between items-center bg-dark-card shrink-0">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 text-neon-lime font-mono text-xs font-bold uppercase tracking-widest mb-1">
                                    <Zap size={12} fill="currentColor" /> <span className="truncate">Executive Summary</span>
                                </div>
                                <h3 className="font-orbitron text-lg md:text-xl font-bold uppercase tracking-wider text-white truncate">DAILY BRIEFING // {briefing.date}</h3>
                            </div>
                            <button
                                onClick={() => setShowBriefingModal(false)}
                                className="ml-4 p-2 text-gray-500 hover:text-neon-magenta hover:bg-neon-magenta/10 rounded-sm transition-all touch-target shrink-0"
                                aria-label="Close briefing"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">

                            {/* Quote */}
                            <div className="flex gap-4 items-start">
                                <Quote className="text-neon-purple/50 shrink-0 rotate-180" size={24} />
                                <p className="text-lg italic text-gray-300 font-mono leading-relaxed">&quot;{briefing.motivationalQuote}&quot;</p>
                            </div>

                            {/* Summary */}
                            <div className="bg-dark-card p-4 rounded-sm border-2 border-gray-700">
                                <h4 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Situation Report</h4>
                                <p className="text-gray-200 font-mono leading-relaxed">{briefing.summary}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Focus Points */}
                                <div>
                                    <h4 className="text-xs font-mono font-bold text-neon-lime uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <CheckCircle2 size={14} /> Primary Objectives
                                    </h4>
                                    <ul className="space-y-3">
                                        {briefing.focusPoints.map((pt: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-300 font-mono">
                                                <span className="text-neon-lime/50 mt-1">›</span> {pt}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Threats */}
                                <div>
                                    <h4 className="text-xs font-mono font-bold text-neon-magenta uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <ShieldAlert size={14} /> Threat Matrix
                                    </h4>
                                    {briefing.threatAlerts.length > 0 ? (
                                        <ul className="space-y-3">
                                            {briefing.threatAlerts.map((pt: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-300 font-mono">
                                                    <span className="text-neon-magenta/50 mt-1">›</span> {pt}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500 font-mono italic">No immediate threats detected.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t-2 border-gray-700 bg-dark-card text-center">
                            <button onClick={() => setShowBriefingModal(false)} className="text-xs font-mono font-bold uppercase tracking-widest text-gray-500 hover:text-neon-cyan transition-colors">
                                Dismiss Briefing
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Intel Gathered"
                    value={stats.intelCount}
                    subValue="Dossiers"
                    color="text-neon-cyan"
                    icon={<Eye size={20} />}
                />
                <StatCard
                    label="Active Ops"
                    value={stats.activeTasks}
                    subValue="In Progress"
                    color="text-neon-orange"
                    icon={<Activity size={20} />}
                />
                <StatCard
                    label="Ops Velocity"
                    value={`${stats.completionRate}%`}
                    subValue="Completion Rate"
                    color="text-neon-lime"
                    icon={<Zap size={20} />}
                />
                <StatCard
                    label="System Health"
                    value={`${stats.systemHealth}%`}
                    color="text-neon-purple"
                    icon={<ShieldAlert size={20} />}
                />
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 min-h-[300px] md:min-h-[400px]">

                {/* Left Column: Chart */}
                <div className="lg:col-span-2 glass-panel rounded-xl p-4 md:p-6 flex flex-col shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
                    <div className="flex justify-between items-center mb-4 md:mb-8 relative z-10">
                        <h3 className="text-xs md:text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp size={14} className="md:hidden text-emerald-500" />
                            <TrendingUp size={16} className="hidden md:inline text-emerald-500" />
                            <span className="hidden sm:inline">Productivity Velocity (7 Days)</span>
                            <span className="sm:hidden">Velocity</span>
                        </h3>
                        <div className="flex gap-2">
                            <span className="w-2 h-2 md:w-3 md:h-3 bg-emerald-500/20 border border-emerald-500/50 rounded-full shadow-[0_0_5px_#10b981]"></span>
                            <span className="w-2 h-2 md:w-3 md:h-3 bg-zinc-800 rounded-full"></span>
                        </div>
                    </div>

                    <div className="flex-1 w-full min-h-[200px] md:min-h-0 relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="#52525b" tick={{ fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
                                <YAxis stroke="#52525b" tick={{ fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: '#10b981' }}
                                    cursor={{ stroke: '#27272a', strokeWidth: 2 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Column: Activity Pulse */}
                <div className="glass-panel rounded-xl flex flex-col overflow-hidden shadow-2xl max-h-[400px] lg:max-h-full">
                    <div className="p-4 md:p-6 border-b border-white/5 bg-white/5 shrink-0">
                        <h3 className="text-xs md:text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <Activity size={14} className="md:hidden text-amber-500" />
                            <Activity size={16} className="hidden md:inline text-amber-500" /> The Pulse
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 md:p-4 custom-scrollbar bg-black/20 momentum-scroll">
                        {feed.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50">
                                <Activity size={36} className="md:hidden" strokeWidth={1} />
                                <Activity size={48} className="hidden md:block" strokeWidth={1} />
                                <p className="mt-4 text-xs font-mono uppercase">No Activity Detected</p>
                            </div>
                        ) : (
                            <div className="space-y-4 md:space-y-6 relative">
                                {/* Timeline Line */}
                                <div className="absolute left-3 md:left-4 top-2 bottom-2 w-0.5 bg-white/5"></div>

                                {feed.map((item) => {
                                    const agent = AGENTS[item.agentId as AgentId] || AGENTS[AgentId.ROXY];
                                    return (
                                        <div key={item.id} className="relative pl-8 md:pl-10 group touch-none">
                                            {/* Timeline Dot */}
                                            <div className={`absolute left-[9px] md:left-[11px] top-1 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full border-2 border-zinc-950 transition-all
                                    ${item.type === 'INTEL' ? 'bg-blue-500 group-hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-emerald-500 group-hover:shadow-[0_0_10px_rgba(16,185,129,0.5)]'}
                                `}></div>

                                            <div className="flex items-start justify-between gap-2 md:gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5
                                            ${item.type === 'INTEL' ? 'text-blue-400' : 'text-emerald-400'}
                                        `}>
                                                        {item.title}
                                                    </div>
                                                    <div className="text-xs md:text-sm text-zinc-300 font-medium leading-tight mb-1 group-hover:text-white transition-colors line-clamp-2">
                                                        {item.details}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <img src={agent.avatar} className="w-3 h-3 md:w-4 md:h-4 rounded-full grayscale opacity-70" alt="avatar" />
                                                        <span className="text-[10px] text-zinc-500 font-mono uppercase">{agent.name}</span>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] text-zinc-600 font-mono shrink-0">
                                                    {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <div className="p-2 md:p-3 border-t border-white/5 bg-white/5 text-center shrink-0">
                        <p className="text-[10px] text-zinc-500 font-mono uppercase animate-pulse">System Monitoring Active</p>
                    </div>
                </div>
            </div>
        </div>

    );
};
