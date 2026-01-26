import React, { useState, useEffect } from 'react';
import { Flag, Users, Flame, Scroll, ArrowRight, Loader2, HeartHandshake, Trash2 } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { TribeBlueprint } from '../types';
import { addXP, showToast } from '../services/gameService';
import { soundService } from '../services/soundService';

export const TheTribe: React.FC = () => {
    const [audience, setAudience] = useState('');
    const [enemy, setEnemy] = useState('');
    const [loading, setLoading] = useState(false);
    const [blueprint, setBlueprint] = useState<TribeBlueprint (null);

    useEffect(() => {
        const saved = localStorage.getItem('solo_tribe_blueprint');
        if (saved) {
            try { setBlueprint(JSON.parse(saved)); } catch (e) { }
        }
    }, []);

    const handleGenerate = async () => {
        if (!audience.trim() || !enemy.trim()) return;
        setLoading(true);
        soundService.playClick();

        const result = await geminiService.generateTribeBlueprint(audience, enemy);
        if (result) {
            setBlueprint(result);
            localStorage.setItem('solo_tribe_blueprint', JSON.stringify(result));

            const { leveledUp } = await addXP(100);
            showToast("TRIBE FOUNDED", "Community architecture defined.", "xp", 100);
            if (leveledUp) showToast("RANK UP!", "New founder level reached.", "success");
            soundService.playSuccess();
        } else {
            showToast("GEN FAILED", "Could not forge tribe.", "error");
            soundService.playError();
        }
        setLoading(false);
    };

    const handleReset = () => {
        if (confirm("Dissolve existing tribe strategy?")) {
            setBlueprint(null);
            localStorage.removeItem('solo_tribe_blueprint');
        }
    };

    return (
        <div className="min-h-[85vh] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between border-b-2 border-gray-700 pb-6 gap-4 md:gap-0">
                <div>
                    <div className="flex items-center gap-2 text-neon-magenta font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <Flag size={14} /> Community Architecture
                    </div>
                    <h2 className="font-orbitron text-3xl md:text-4xl font-bold uppercase tracking-wider text-white">THE TRIBE</h2>
                    <p className="text-gray-400 font-mono mt-2">Design a cult brand, define your manifesto, and build true believers.</p>
                </div>
                {blueprint && (
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 text-xs font-mono font-bold text-neon-magenta border-2 border-neon-magenta/30 hover:bg-neon-magenta/10 rounded-sm transition-colors uppercase tracking-wider flex items-center justify-center w-full md:w-auto gap-2"
                    >
                        <Trash2 size={14} /> Reset Strategy
                    </button>
                )}
            </div>

            <div className="flex-1 flex flex-col">

                {!blueprint ? (
                    <div className="max-w-2xl mx-auto w-full mt-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-dark-card border-2 border-neon-magenta/30 p-8 rounded-sm shadow-[0_0_20px_rgba(255,0,110,0.15)]">
                            <h3 className="font-orbitron text-lg font-bold uppercase tracking-wider text-white mb-6 border-b-2 border-gray-700 pb-4">Founding Principles</h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-2 block">Who are your people?</label>
                                    <input
                                        type="text"
                                        value={audience}
                                        onChange={(e) => setAudience(e.target.value)}
                                        placeholder="e.g., 'Burned out corporate designers seeking freedom'"
                                        className="w-full bg-dark-bg border-2 border-gray-700 rounded-sm p-4 text-white font-mono focus:border-neon-magenta focus:ring-0 focus:shadow-[0_0_10px_rgba(255,0,110,0.3)] transition-all placeholder:text-gray-600"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-2 block">Who is the enemy?</label>
                                    <input
                                        type="text"
                                        value={enemy}
                                        onChange={(e) => setEnemy(e.target.value)}
                                        placeholder="e.g., 'Soulless agency grind', 'Mediocrity', 'Gatekeepers'"
                                        className="w-full bg-dark-bg border-2 border-gray-700 rounded-sm p-4 text-white font-mono focus:border-neon-magenta focus:ring-0 focus:shadow-[0_0_10px_rgba(255,0,110,0.3)] transition-all placeholder:text-gray-600"
                                    />
                                    <p className="text-[10px] text-gray-500 font-mono mt-2">* Every great tribe unites against a common enemy or status quo.</p>
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    disabled={loading || !audience.trim() || !enemy.trim()}
                                    className="w-full py-4 bg-neon-magenta hover:bg-neon-magenta/80 text-white rounded-sm font-mono font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,0,110,0.3)]"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <><Flame size={18} /> Ignite The Tribe</>}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in zoom-in-95 duration-500">

                        {/* Manifesto Card */}
                        <div className="bg-dark-bg border-2 border-neon-magenta/30 rounded-sm p-8 relative overflow-hidden flex flex-col shadow-[0_0_20px_rgba(255,0,110,0.15)]">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-magenta to-neon-purple"></div>

                            <div className="relative z-10 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 text-neon-magenta mb-6">
                                    <Scroll size={20} />
                                    <span className="font-mono font-bold text-xs uppercase tracking-widest">The Manifesto</span>
                                </div>

                                <h1 className="font-orbitron text-3xl font-bold uppercase tracking-wider text-white mb-4 leading-none">
                                    {blueprint.manifesto.title}
                                </h1>

                                <div className="space-y-6 flex-1">
                                    <div className="bg-dark-card p-4 rounded-sm border-l-4 border-neon-magenta">
                                        <span className="text-[10px] text-neon-magenta font-mono font-bold uppercase tracking-wider block mb-1">We Fight Against</span>
                                        <p className="text-lg text-gray-200 font-mono">&quot;{blueprint.manifesto.enemy}&quot;</p>
                                    </div>

                                    <div className="bg-dark-card p-4 rounded-sm border-l-4 border-neon-lime">
                                        <span className="text-[10px] text-neon-lime font-mono font-bold uppercase tracking-wider block mb-1">We Believe In</span>
                                        <p className="text-lg text-gray-200 font-mono">&quot;{blueprint.manifesto.belief}&quot;</p>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t-2 border-gray-700 text-center">
                                    <p className="text-xl font-mono italic text-gray-400">&quot;{blueprint.manifesto.tagline}&quot;</p>
                                </div>
                            </div>
                        </div>

                        {/* Rituals & Loops */}
                        <div className="space-y-6">
                            <div className="bg-dark-card border-2 border-gray-700 rounded-sm p-6">
                                <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Users size={14} /> Sacred Rituals
                                </h3>
                                <div className="space-y-4">
                                    {blueprint.rituals.map((ritual, i) => (
                                        <div key={i} className="bg-dark-bg border-2 border-gray-700 p-4 rounded-sm group hover:border-neon-cyan/50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-mono font-bold text-white text-sm">{ritual.name}</h4>
                                                <span className="text-[10px] font-mono bg-dark-card px-2 py-1 rounded-sm text-gray-400 uppercase">{ritual.frequency}</span>
                                            </div>
                                            <p className="text-xs text-gray-400 font-mono mb-3">{ritual.description}</p>
                                            <div className="flex items-center gap-2 text-xs text-neon-magenta font-mono font-medium bg-neon-magenta/10 p-2 rounded-sm">
                                                <ArrowRight size={12} /> {ritual.action}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-dark-card border-2 border-gray-700 rounded-sm p-6">
                                <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <HeartHandshake size={14} /> Engagement Loops
                                </h3>
                                <ul className="space-y-3">
                                    {blueprint.engagementLoops.map((loop, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-gray-300 font-mono">
                                            <span className="text-neon-magenta font-bold">0{i + 1}</span>
                                            {loop}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};