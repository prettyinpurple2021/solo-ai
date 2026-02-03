import React, { useState } from 'react';
import { Target, Users, ShieldAlert, Swords, Terminal, MessageSquare, ChevronRight, Play } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { WarRoomResponse, AgentId } from '../types';
import { AGENTS } from '../constants';
import { addXP, showToast } from '../services/gameService';
import { soundService } from '../services/soundService';

/**
 * TheWarRoom component following Cyberpunk Design System v3
 * Strategic Debate & Wargaming Center
 */

export const TheWarRoom: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [result, setResult] = useState<WarRoomResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'brief' | 'debate' | 'execution'>('brief');

    const handleSimulate = async () => {
        if (!topic.trim()) return;
        
        setLoading(true);
        setResult(null);
        setActiveTab('debate'); // Switch to view result
        soundService.playClick();

        const response = await geminiService.generateWarRoomDebate(topic);

        if (response) {
            setResult(response);
            const { leveledUp } = await addXP(100);
            showToast("WARGAMING COMPLETE", "Strategy consensus reached.", "xp", 100);
            if (leveledUp) showToast("RANK UP!", "New command level granted.", "success");
            soundService.playSuccess();
        } else {
            showToast("SIMULATION FAILED", "Could not initialize war room.", "error");
            soundService.playError();
            setActiveTab('brief');
        }
        setLoading(false);
    };

    const getAgentColor = (id: AgentId) => {
        const agent = AGENTS[id];
        return agent ? agent.color : 'text-gray-400';
    };

    return (
        <div className="min-h-[85vh] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6 flex items-end justify-between border-b border-gray-700 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-neon-magenta font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <Swords size={14} /> Tactical Command
                    </div>
                    <h2 className="font-orbitron text-4xl font-bold uppercase tracking-wider text-white">THE WAR ROOM</h2>
                    <p className="font-mono text-gray-400 mt-2">Strategic debates and high-stakes decision modeling.</p>
                </div>
                
                {/* Navigation / Mode Switcher */}
                <div className="flex bg-dark-card border border-gray-700 rounded-sm p-1">
                    <button 
                        onClick={() => setActiveTab('brief')}
                        className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all rounded-sm flex items-center gap-2 ${activeTab === 'brief' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Target size={14} /> Briefing
                    </button>
                    <button 
                        onClick={() => setActiveTab('debate')}
                        disabled={!result && !loading}
                        className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all rounded-sm flex items-center gap-2 ${activeTab === 'debate' ? 'bg-neon-magenta text-dark-bg' : 'text-gray-500 hover:text-gray-300 disabled:opacity-30'}`}
                    >
                        <MessageSquare size={14} /> Debate
                    </button>
                    <button 
                        onClick={() => setActiveTab('execution')}
                        disabled={!result && !loading}
                        className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all rounded-sm flex items-center gap-2 ${activeTab === 'execution' ? 'bg-neon-lime text-dark-bg' : 'text-gray-500 hover:text-gray-300 disabled:opacity-30'}`}
                    >
                        <Terminal size={14} /> Execution
                    </button>
                </div>
            </div>

            <div className="flex-1">
                {/* BRIEFING MODE */}
                {activeTab === 'brief' && (
                    <div className="max-w-2xl mx-auto mt-12 animate-in slide-in-from-bottom-8 duration-500">
                        <div className="bg-dark-card border-2 border-gray-700 rounded-sm p-8 relative overflow-hidden group hover:border-neon-magenta/50 transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Swords size={120} />
                            </div>
                            
                            <h3 className="font-orbitron text-xl font-bold text-white mb-6 uppercase flex items-center gap-2">
                                <ShieldAlert className="text-neon-magenta" /> Define Mission Parameters
                            </h3>
                            
                            <div className="space-y-4 relative z-10">
                                <div>
                                    <label className="block text-xs font-mono text-gray-400 font-bold mb-2">Strategic Dilemma / Topic</label>
                                    <textarea 
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        className="w-full bg-dark-bg border-2 border-gray-700 rounded-sm p-4 font-mono text-white placeholder:text-gray-600 focus:border-neon-magenta focus:outline-none focus:shadow-[0_0_15px_rgba(255,0,110,0.3)] h-32"
                                        placeholder="e.g. Should we pivot to B2B enterprise sales or double down on PLG?"
                                    />
                                </div>
                                
                                <button 
                                    onClick={handleSimulate}
                                    disabled={loading || !topic.trim()}
                                    className="w-full py-4 bg-neon-magenta text-white font-orbitron font-bold uppercase tracking-widest hover:bg-neon-magenta/90 shadow-[0_0_20px_rgba(255,0,110,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>Initializing War Room...</> 
                                    ) : (
                                        <><Play size={18} fill="currentColor" /> Initiate Simulation</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* LOADING STATE */}
                {loading && activeTab === 'debate' && (
                    <div className="flex flex-col items-center justify-center h-96">
                        <div className="relative w-24 h-24 mb-8">
                            <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-t-neon-magenta border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                            <div className="absolute inset-4 border-4 border-gray-800 rounded-full"></div>
                            <div className="absolute inset-4 border-4 border-b-neon-cyan border-t-transparent border-l-transparent border-r-transparent rounded-full animate-spin direction-reverse"></div>
                        </div>
                        <h3 className="font-orbitron text-xl font-bold text-white mb-2 animate-pulse">Running Simulations</h3>
                        <p className="font-mono text-neon-magenta text-sm uppercase tracking-widest">
                             Analyzing {Math.floor(Math.random() * 1000) + 500} strategic permutations...
                        </p>
                    </div>
                )}

                {/* DEBATE MODE (RESULTS) */}
                {result && activeTab === 'debate' && !loading && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full animate-in fade-in duration-500">
                        {/* Discussion Feed */}
                        <div className="lg:col-span-2 space-y-4 pb-20">
                            {result.dialogue.map((entry, i) => {
                                const agent = AGENTS[entry.speaker];
                                const isUser = false; // Prepare for future user intervention

                                return (
                                    <div key={i} className="flex gap-4 animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                        <div className="shrink-0 flex flex-col items-center">
                                            <img 
                                                src={agent?.avatar || '/avatars/default.png'} 
                                                alt={entry.speaker} 
                                                className={`w-10 h-10 rounded-sm border-2 ${agent?.color.replace('text-', 'border-') || 'border-gray-500'}`}
                                            />
                                            <div className="h-full w-0.5 bg-gray-800 mt-2"></div>
                                        </div>
                                        
                                        <div className="pb-8 max-w-2xl">
                                            <div className={`text-xs font-orbitron font-bold uppercase mb-1 ${agent?.color || 'text-gray-400'}`}>
                                                {agent?.name || entry.speaker} <span className="text-gray-600 mx-1">//</span> <span className="text-gray-500">{agent?.title}</span>
                                            </div>
                                            <div className="bg-dark-card border border-gray-700 p-4 rounded-sm rounded-tl-none relative">
                                                <p className="font-mono text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                                    {entry.text}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Sidebar - Agents Present */}
                        <div className="hidden lg:block">
                            <div className="bg-dark-card border-2 border-gray-700 rounded-sm p-6 sticky top-6">
                                <h4 className="font-orbitron text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Users size={14} /> Present at Table
                                </h4>
                                <div className="space-y-4">
                                    {Object.values(AGENTS).map(agent => (
                                        <div key={agent.id} className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
                                            <div className={`w-2 h-2 rounded-full ${agent.color.replace('text-', 'bg-')}`}></div>
                                            <span className={`font-mono text-sm font-bold ${agent.color}`}>{agent.name}</span>
                                            <span className="text-xs text-gray-600 truncate flex-1 text-right">{agent.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* EXECUTION MODE (Consensus & Actions) */}
                {result && activeTab === 'execution' && !loading && (
                    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
                        {/* Consensus Card */}
                        <div className="bg-dark-card border-2 border-neon-lime rounded-sm p-8 mb-8 shadow-[0_0_30px_rgba(57,255,20,0.15)] relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Target size={150} />
                            </div>
                            <h3 className="font-orbitron text-2xl font-bold text-white mb-4 uppercase tracking-wide flex items-center gap-3">
                                <Target className="text-neon-lime" /> Strategic Consensus
                            </h3>
                            <p className="font-mono text-lg text-gray-300 leading-relaxed border-l-4 border-neon-lime pl-6 py-2">
                                {result.consensus}
                            </p>
                        </div>

                        {/* Action Plan */}
                        <div className="space-y-4">
                            <h4 className="font-orbitron text-sm font-bold text-neon-cyan uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Terminal size={16} /> Directive Queue
                            </h4>
                            {result.actionPlan.map((action, i) => (
                                <div key={i} className="flex items-start gap-4 bg-dark-bg border border-gray-700 p-4 rounded-sm hover:border-neon-cyan/50 transition-colors group">
                                    <div className="w-8 h-8 flex items-center justify-center bg-gray-800 text-neon-cyan font-mono font-bold rounded-sm border border-gray-600 group-hover:bg-neon-cyan group-hover:text-black transition-colors">
                                        {i + 1}
                                    </div>
                                    <p className="text-gray-300 font-mono text-sm mt-1.5">{action}</p>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-12 flex justify-center">
                            <button 
                                onClick={() => {
                                    setTopic('');
                                    setResult(null);
                                    setActiveTab('brief');
                                }}
                                className="text-gray-500 font-mono text-xs uppercase tracking-widest hover:text-white transition-colors"
                            >
                                - Dismiss Session & Return to Briefing -
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
