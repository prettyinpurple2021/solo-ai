import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp, DollarSign, Calculator, AlertTriangle, Lightbulb, Loader2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { FinancialContext, FinancialAudit, BusinessContext } from '../types';
import { geminiService } from '../services/geminiService';
import { addXP, showToast } from '../services/gameService';
import { soundService } from '../services/soundService';
import { storageService } from '../services/storageService';
import { logError } from '../lib/logger';

export const Treasury: React.FC = () => {
    const [financials, setFinancials] = useState<FinancialContext>({
        currentCash: 50000,
        monthlyBurn: 5000,
        monthlyRevenue: 1000,
        growthRate: 10
    });

    const [projection, setProjection] = useState<any[]>([]);
    const [audit, setAudit] = useState<FinancialAudit | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async (): Promise<void> => {
            try {
                const ctx = await storageService.getContext();
                if (ctx) {
                    setFinancials({
                        currentCash: ctx.currentCash ?? 50000,
                        monthlyBurn: ctx.monthlyBurn ?? 5000,
                        monthlyRevenue: ctx.monthlyRevenue ?? 1000,
                        growthRate: ctx.growthRate ?? 10
                    });
                }
            } catch (e) { logError("Failed to load financial context", e); }
        };
        load();
    }, []);

    useEffect(() => {
        const timeout = setTimeout(async () => {
            const current = await storageService.getContext() || {} as Record<string, unknown>;
            storageService.saveContext({ ...current, ...financials } as BusinessContext).catch((e) => logError("Failed to save financial context", e));
        }, 1000);

        calculateProjection();
        return () => clearTimeout(timeout);
    }, [financials]);

    const calculateProjection = () => {
        let cash = financials.currentCash;
        let revenue = financials.monthlyRevenue;
        const burn = financials.monthlyBurn;
        const growth = financials.growthRate / 100;

        const data: { month: string; cash: number; revenue: number; burn: number }[] = [];
        let zeroCashMonth = -1;

        for (let i = 0; i <= 18; i++) {
            const profit = revenue - burn;
            cash += profit;

            if (cash <= 0 && zeroCashMonth === -1) {
                zeroCashMonth = i;
                cash = 0; // Floor at 0 for visual
            }

            data.push({
                month: `M${i}`,
                cash: Math.round(cash),
                revenue: Math.round(revenue),
                burn: burn
            });

            revenue = revenue * (1 + growth);
        }
        setProjection(data);
    };

    const handleAudit = async () => {
        setLoading(true);
        setAudit(null);
        soundService.playClick();

        const result = await geminiService.conductFinancialAudit(financials);
        if (result) {
            setAudit(result);
            const { leveledUp } = await addXP(75);
            showToast("AUDIT COMPLETE", "Financial analysis received.", "xp", 75);
            if (leveledUp) showToast("RANK UP!", "You have reached a new founder level.", "success");
            soundService.playSuccess();
        }
        setLoading(false);
    };

    const getRunwayMonths = () => {
        if (financials.monthlyRevenue >= financials.monthlyBurn) return "infinite";
        const netBurn = financials.monthlyBurn - financials.monthlyRevenue;
        const months = financials.currentCash / netBurn;
        return months < 0 ? 0 : months.toFixed(1);
    };

    const runway = getRunwayMonths();
    const isProfitable = runway === "infinite";

    return (
        <div className="min-h-[85vh] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6 flex items-end justify-between border-b-2 border-gray-700 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-neon-orange font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <Coins size={14} /> CFO Module
                    </div>
                    <h2 className="font-orbitron text-4xl font-bold uppercase tracking-wider text-white">THE TREASURY</h2>
                    <p className="text-gray-400 mt-2 font-mono">Financial modeling and runway analysis.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Controls */}
                <div className="space-y-6">
                    <div className="bg-dark-card border-2 border-gray-700 rounded-sm p-6">
                        <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Calculator size={14} /> Core Assumptions
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className="flex justify-between text-sm font-mono font-bold text-gray-300 mb-2">
                                    <span>Current Cash</span>
                                    <span className="text-neon-lime font-mono">${financials.currentCash.toLocaleString()}</span>
                                </label>
                                <input
                                    type="range" min="0" max="500000" step="1000"
                                    value={financials.currentCash}
                                    onChange={(e) => setFinancials({ ...financials, currentCash: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-dark-bg rounded-sm appearance-none cursor-pointer accent-neon-lime"
                                />
                            </div>

                            <div>
                                <label className="flex justify-between text-sm font-mono font-bold text-gray-300 mb-2">
                                    <span>Monthly Burn</span>
                                    <span className="text-neon-magenta font-mono">${financials.monthlyBurn.toLocaleString()}</span>
                                </label>
                                <input
                                    type="range" min="500" max="50000" step="100"
                                    value={financials.monthlyBurn}
                                    onChange={(e) => setFinancials({ ...financials, monthlyBurn: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-dark-bg rounded-sm appearance-none cursor-pointer accent-neon-magenta"
                                />
                            </div>

                            <div>
                                <label className="flex justify-between text-sm font-mono font-bold text-gray-300 mb-2">
                                    <span>Monthly Revenue (MRR)</span>
                                    <span className="text-neon-cyan font-mono">${financials.monthlyRevenue.toLocaleString()}</span>
                                </label>
                                <input
                                    type="range" min="0" max="50000" step="100"
                                    value={financials.monthlyRevenue}
                                    onChange={(e) => setFinancials({ ...financials, monthlyRevenue: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-dark-bg rounded-sm appearance-none cursor-pointer accent-neon-cyan"
                                />
                            </div>

                            <div>
                                <label className="flex justify-between text-sm font-mono font-bold text-gray-300 mb-2">
                                    <span>MoM Growth Rate</span>
                                    <span className="text-neon-orange font-mono">{financials.growthRate}%</span>
                                </label>
                                <input
                                    type="range" min="0" max="50" step="1"
                                    value={financials.growthRate}
                                    onChange={(e) => setFinancials({ ...financials, growthRate: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-dark-bg rounded-sm appearance-none cursor-pointer accent-neon-orange"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className={`bg-dark-card border-2 border-gray-700 p-4 rounded-sm flex flex-col items-center justify-center text-center
                            ${isProfitable ? 'border-neon-lime/50 bg-neon-lime/5' : parseFloat(runway as string) < 6 ? 'border-neon-magenta/50 bg-neon-magenta/5' : ''}
                        `}>
                            <div className="text-xs font-mono font-bold uppercase tracking-widest text-gray-500 mb-1">Runway</div>
                            <div className={`text-3xl font-mono font-bold ${isProfitable ? 'text-neon-lime' : parseFloat(runway as string) < 6 ? 'text-neon-magenta' : 'text-white'}`}>
                                {isProfitable ? '∞' : runway}
                            </div>
                            <div className="text-[10px] font-mono text-gray-500 uppercase">Months</div>
                        </div>
                        <div className="bg-dark-card border-2 border-gray-700 p-4 rounded-sm flex flex-col items-center justify-center text-center">
                            <div className="text-xs font-mono font-bold uppercase tracking-widest text-gray-500 mb-1">Net Burn</div>
                            <div className={`text-xl font-mono font-bold ${financials.monthlyRevenue >= financials.monthlyBurn ? 'text-neon-lime' : 'text-neon-magenta'}`}>
                                ${(financials.monthlyRevenue - financials.monthlyBurn).toLocaleString()}
                            </div>
                            <div className="text-[10px] font-mono text-gray-500 uppercase">Per Month</div>
                        </div>
                    </div>

                    <button
                        onClick={handleAudit}
                        disabled={loading}
                        className="w-full py-4 border-2 border-neon-cyan bg-neon-cyan/10 text-neon-cyan rounded-sm font-mono font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(11,228,236,0.2)] hover:bg-neon-cyan/20 hover:shadow-[0_0_30px_rgba(11,228,236,0.4)] disabled:opacity-50 disabled:cursor-not-allowed touch-target md:w-auto md:px-8"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <><DollarSign size={18} /> Audit Financials</>}
                    </button>
                </div>

                {/* Main Visualization */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Chart */}
                    <div className="bg-dark-card border-2 border-gray-700 rounded-sm p-6 flex-1 min-h-[400px] flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <TrendingUp size={14} /> 18-Month Forecast
                            </h3>
                            <div className="flex gap-4 text-[10px] font-mono font-bold uppercase tracking-wider">
                                <div className="flex items-center gap-2 text-neon-lime"><div className="w-2 h-2 bg-neon-lime rounded-full"></div> Cash on Hand</div>
                                <div className="flex items-center gap-2 text-neon-cyan"><div className="w-2 h-2 bg-neon-cyan rounded-full"></div> Revenue</div>
                            </div>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={projection}>
                                    <defs>
                                        <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#39ff14" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#39ff14" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0be4ec" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#0be4ec" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#6b7280" tick={{ fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f1535', borderColor: '#374151', color: '#fff', borderRadius: '2px', fontSize: '12px', fontFamily: 'monospace' }}
                                    />
                                    <ReferenceLine y={0} stroke="#ff006e" strokeDasharray="3 3" />
                                    <Area type="monotone" dataKey="cash" stroke="#39ff14" fillOpacity={1} fill="url(#colorCash)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="revenue" stroke="#0be4ec" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* AI Audit Results */}
                    {audit && (
                        <div className="bg-dark-bg border-2 border-neon-cyan/30 rounded-sm p-6 animate-in slide-in-from-bottom-8 fade-in duration-500 relative overflow-hidden shadow-[0_0_20px_rgba(11,228,236,0.1)]">
                            <div className="absolute inset-0 bg-neon-cyan/5 pointer-events-none"></div>

                            <div className="flex items-start justify-between mb-6 relative z-10">
                                <div>
                                    <h3 className="font-orbitron text-neon-cyan font-bold text-lg uppercase tracking-wider mb-1">CFO Verdict</h3>
                                    <p className="text-gray-300 italic font-mono text-lg">&quot;{audit.verdict}&quot;</p>
                                </div>
                                <div className="flex flex-col items-center bg-dark-card p-3 rounded-sm border-2 border-gray-700">
                                    <span className="text-[10px] text-gray-500 uppercase font-mono font-bold">Health Score</span>
                                    <span className={`text-3xl font-mono font-bold ${audit.runwayScore > 75 ? 'text-neon-lime' :
                                        audit.runwayScore > 40 ? 'text-neon-orange' : 'text-neon-magenta'
                                        }`}>
                                        {audit.runwayScore}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                <div>
                                    <h4 className="text-xs font-mono font-bold text-neon-lime uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Lightbulb size={14} /> Strategic Recommendations
                                    </h4>
                                    <ul className="space-y-2">
                                        {audit.strategicMoves.map((move, i) => (
                                            <li key={i} className="text-sm text-gray-400 font-mono flex items-start gap-2">
                                                <span className="text-neon-lime/50 mt-1">›</span> {move}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-xs font-mono font-bold text-neon-magenta uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <AlertTriangle size={14} /> Detected Risks
                                    </h4>
                                    <ul className="space-y-2">
                                        {audit.riskFactors.map((risk, i) => (
                                            <li key={i} className="text-sm text-gray-400 font-mono flex items-start gap-2">
                                                <span className="text-neon-magenta/50 mt-1">›</span> {risk}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};