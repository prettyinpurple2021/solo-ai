
"use client"

import React, { useState } from 'react';
import { Target, Users, ShieldAlert, Swords, Terminal, MessageSquare, Play, Trash2, History } from 'lucide-react';
import { WarRoomSession } from '@/lib/services/war-room-service';
import { simulateWarRoom, deleteWarRoomSession } from '@/lib/actions/war-room-actions';
import { toast } from 'sonner';
import { FeatureGate } from '@/components/subscription/FeatureGate';
import { CyberButton } from '@/components/cyber/CyberButton';
import { HudBorder } from '@/components/cyber/HudBorder';
import { cn } from '@/lib/utils';

interface WarRoomClientProps {
  initialSessions: WarRoomSession[];
  user: any;
}

const AGENTS_META: Record<string, { name: string, title: string, color: string, avatar: string }> = {
  'ROXY': { name: 'Roxy', title: 'Chief Product Officer', color: 'text-neon-cyan', avatar: '/avatars/roxy.png' },
  'ECHO': { name: 'Echo', title: 'Chief Marketing Officer', color: 'text-neon-purple', avatar: '/avatars/echo.png' },
  'LEXI': { name: 'Lexi', title: 'Chief Legal/Ops', color: 'text-neon-orange', avatar: '/avatars/lexi.png' },
  'GLITCH': { name: 'Glitch', title: 'CTO', color: 'text-neon-lime', avatar: '/avatars/glitch.png' },
  'LUMI': { name: 'Lumi', title: 'CFO', color: 'text-neon-magenta', avatar: '/avatars/lumi.png' }
};

export function WarRoomClient({ initialSessions, user }: WarRoomClientProps) {
    const [topic, setTopic] = useState('');
    const [sessions, setSessions] = useState<WarRoomSession[]>(initialSessions);
    const [activeSession, setActiveSession] = useState<WarRoomSession | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'brief' | 'debate' | 'execution' | 'history'>('brief');

    const handleSimulate = async () => {
        if (topic.length < 5) {
            toast.error("Mission topic must be more descriptive.");
            return;
        }
        
        setLoading(true);
        setActiveTab('debate'); 

        try {
            const result = await simulateWarRoom({ topic });
            if (result.success) {
                const newSession = result.session as WarRoomSession;
                setSessions([newSession, ...sessions]);
                setActiveSession(newSession);
                toast.success("Consensus reached. Tactical directives generated.");
            }
        } catch (error) {
            toast.error("Simulation sequence interrupted.");
            setActiveTab('brief');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Terminate session record?")) return;
        try {
            await deleteWarRoomSession(id);
            setSessions(sessions.filter(s => s.id !== id));
            if (activeSession?.id === id) setActiveSession(null);
            toast.success("Record purged.");
        } catch (error) {
            toast.error("Failed to purge record.");
        }
    };

    return (
        <FeatureGate feature="war-room">
            <div className="min-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-neon-magenta font-mono text-[10px] font-bold uppercase tracking-[0.3em] mb-2">
                            <Swords size={14} /> Tactical Command Center
                        </div>
                        <h2 className="font-orbitron text-4xl font-bold uppercase tracking-wider text-white">THE WAR ROOM</h2>
                        <p className="font-mono text-xs text-gray-500 mt-2 uppercase tracking-widest">Autonomous Strategic Intelligence // C-Suite Simulation</p>
                    </div>
                    
                    {/* Mode Switcher */}
                    <div className="flex bg-black/40 border border-white/10 p-1">
                        <button 
                            onClick={() => setActiveTab('brief')}
                            className={`px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'brief' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Target size={14} /> Briefing
                        </button>
                        <button 
                            onClick={() => setActiveTab('debate')}
                            disabled={!activeSession && !loading}
                            className={`px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'debate' ? 'bg-neon-magenta/20 text-neon-magenta border border-neon-magenta/30' : 'text-gray-500 hover:text-gray-300 disabled:opacity-20'}`}
                        >
                            <MessageSquare size={14} /> Debate
                        </button>
                        <button 
                            onClick={() => setActiveTab('execution')}
                            disabled={!activeSession && !loading}
                            className={`px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'execution' ? 'bg-neon-lime/20 text-neon-lime border border-neon-lime/30' : 'text-gray-500 hover:text-gray-300 disabled:opacity-20'}`}
                        >
                            <Terminal size={14} /> Directives
                        </button>
                        <button 
                            onClick={() => setActiveTab('history')}
                            className={`px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <History size={14} /> Archives
                        </button>
                    </div>
                </div>

                <div className="flex-1">
                    {/* BRIEFING MODE */}
                    {activeTab === 'brief' && (
                        <div className="max-w-2xl mx-auto mt-12">
                            <HudBorder className="bg-dark-card/80 backdrop-blur-sm">
                                <div className="p-8 space-y-6">
                                    <h3 className="font-orbitron text-xl font-bold text-white uppercase flex items-center gap-2 tracking-tighter">
                                        <ShieldAlert className="text-neon-magenta" /> Define Mission Parameters
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest">Strategic Dilemma / Objective</label>
                                            <textarea 
                                                value={topic}
                                                onChange={(e) => setTopic(e.target.value)}
                                                className="w-full bg-black/50 border border-white/10 rounded-none p-4 font-mono text-sm text-white placeholder:text-gray-700 focus:border-neon-magenta focus:outline-none h-32 resize-none"
                                                placeholder="e.g. Should we prioritize market share via aggressive pricing, or maintain premium positioning with higher margins?"
                                            />
                                        </div>
                                        
                                        <CyberButton 
                                            onClick={handleSimulate}
                                            disabled={loading || topic.length < 5}
                                            className="w-full font-orbitron font-bold uppercase tracking-widest"
                                            variant="magenta"
                                        >
                                            {loading ? "INITIALIZING SIMULATION..." : "INITIATE WAR ROOM"}
                                        </CyberButton>
                                    </div>
                                </div>
                            </HudBorder>
                        </div>
                    )}

                    {/* LOADING STATE */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center h-96 space-y-6">
                            <div className="relative w-24 h-24">
                                <div className="absolute inset-0 border-2 border-white/5 rounded-full"></div>
                                <div className="absolute inset-0 border-2 border-t-neon-magenta border-transparent rounded-full animate-spin"></div>
                                <div className="absolute inset-4 border-2 border-white/5 rounded-full"></div>
                                <div className="absolute inset-4 border-2 border-b-neon-cyan border-transparent rounded-full animate-spin direction-reverse"></div>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="font-orbitron text-xl font-bold text-white uppercase tracking-tighter animate-pulse">Running Strategic Permutations</h3>
                                <p className="font-mono text-neon-magenta text-[10px] uppercase tracking-[0.4em]">
                                     Assembling C-Suite Operatives...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* DEBATE MODE */}
                    {activeSession && activeTab === 'debate' && !loading && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6 pb-20">
                                {activeSession.dialogue.map((entry, i) => {
                                    const meta = AGENTS_META[entry.speaker.toUpperCase()];
                                    return (
                                        <div key={i} className="flex gap-4 animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                            <div className="shrink-0 flex flex-col items-center">
                                                <div className={`w-10 h-10 border border-white/10 bg-black flex items-center justify-center font-bold text-xs ${meta?.color || 'text-gray-500'}`}>
                                                    {entry.speaker.charAt(0)}
                                                </div>
                                                <div className="h-full w-px bg-white/5 mt-2"></div>
                                            </div>
                                            
                                            <div className="pb-4 flex-1">
                                                <div className={`text-[10px] font-orbitron font-bold uppercase mb-1 tracking-widest ${meta?.color || 'text-gray-400'}`}>
                                                    {meta?.name || entry.speaker} <span className="text-gray-700 mx-1">//</span> <span className="text-gray-600 font-mono">{meta?.title}</span>
                                                </div>
                                                <div className="bg-black/20 border border-white/5 p-4 rounded-none border-l-2 border-l-current">
                                                    <p className="font-mono text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                                        {entry.text}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="hidden lg:block">
                                <div className="bg-black/40 border border-white/10 p-6 sticky top-6">
                                    <h4 className="font-orbitron text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                        <Users size={14} /> ACTIVE OPERATIVES
                                    </h4>
                                    <div className="space-y-6">
                                        {Object.entries(AGENTS_META).map(([id, agent]) => (
                                            <div key={id} className="flex items-center gap-3 group">
                                                <div className={`w-1.5 h-1.5 rounded-none rotate-45 ${agent.color.replace('text-', 'bg-')}`}></div>
                                                <div>
                                                    <p className={`font-mono text-xs font-bold uppercase tracking-tighter ${agent.color}`}>{agent.name}</p>
                                                    <p className="text-[9px] text-gray-600 uppercase font-mono tracking-widest">{agent.title}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* EXECUTION MODE */}
                    {activeSession && activeTab === 'execution' && !loading && (
                        <div className="max-w-4xl mx-auto space-y-8">
                            <HudBorder className="bg-neon-lime/5 border-neon-lime/20">
                                <div className="p-8">
                                    <h3 className="font-orbitron text-2xl font-bold text-white mb-4 uppercase tracking-tighter flex items-center gap-3">
                                        <Target className="text-neon-lime" /> Strategic Consensus
                                    </h3>
                                    <p className="font-mono text-lg text-gray-300 leading-relaxed border-l-2 border-neon-lime/50 pl-6 py-2">
                                        {activeSession.consensus}
                                    </p>
                                </div>
                            </HudBorder>

                            <div className="space-y-4">
                                <h4 className="font-orbitron text-[10px] font-bold text-neon-cyan uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                                    <Terminal size={16} /> TACTICAL DIRECTIVES
                                </h4>
                                {activeSession.actionPlan.map((action, i) => (
                                    <div key={i} className="flex items-start gap-4 bg-black/40 border border-white/5 p-4 hover:border-neon-cyan/30 transition-colors group font-mono">
                                        <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-white/5 text-neon-cyan text-xs font-bold border border-white/10 group-hover:bg-neon-cyan group-hover:text-black transition-colors">
                                            {i + 1}
                                        </div>
                                        <p className="text-gray-400 text-sm mt-1.5 leading-relaxed">{action}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* HISTORY MODE */}
                    {activeTab === 'history' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sessions.length === 0 ? (
                                <div className="col-span-full py-20 text-center border border-dashed border-white/10 font-mono text-gray-600 uppercase text-xs tracking-widest">
                                    Archive Frequency Clear // No Past Simulations
                                </div>
                            ) : (
                                sessions.map(session => (
                                    <Card key={session.id} className="bg-black/40 border-white/10 p-4 hover:border-neon-cyan/30 transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 bg-white/5 border border-white/10">
                                                <History size={16} className="text-neon-cyan" />
                                            </div>
                                            <button onClick={() => handleDelete(session.id)} className="text-gray-700 hover:text-neon-magenta transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <h4 className="font-bold text-white uppercase tracking-tight line-clamp-2 min-h-[3rem]">{session.topic}</h4>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-[9px] font-mono text-gray-600 uppercase">{new Date(session.createdAt).toLocaleDateString()}</span>
                                            <button 
                                                onClick={() => {
                                                    setActiveSession(session);
                                                    setActiveTab('debate');
                                                }}
                                                className="text-[10px] font-mono font-bold text-neon-cyan uppercase tracking-widest hover:text-white transition-colors"
                                            >
                                                Load Data
                                            </button>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </FeatureGate>
    );
}

function Card({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <div className={cn("bg-dark-card border border-gray-800 rounded-none", className)}>
            {children}
        </div>
    );
}
