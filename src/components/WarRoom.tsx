import React, { useState, useEffect, useRef } from 'react';
import { Swords, Send, Terminal, CheckCircle2, Loader2, ArrowRight, KanbanSquare, Save, History, Archive, Trash2, Clock, Download } from 'lucide-react';
import { AGENTS } from '../constants';
import { geminiService } from '../services/geminiService';
import { WarRoomEntry, WarRoomResponse, AgentId, Task, SavedWarRoomSession } from '../types';
import { addXP, showToast } from '../services/gameService';
import { downloadMarkdown, generateWarRoomMarkdown } from '../services/exportService';
import { soundService } from '../services/soundService';
import { storageService } from '../services/storageService';

export const WarRoom: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [fullResponse, setFullResponse] = useState<WarRoomResponse | null>(null);
    const [displayedDialogue, setDisplayedDialogue] = useState<WarRoomEntry[]>([]);
    const [showConsensus, setShowConsensus] = useState(false);
    const [currentSpeaker, setCurrentSpeaker] = useState<AgentId | null>(null);
    const [deployed, setDeployed] = useState(false);
    const [sessions, setSessions] = useState<SavedWarRoomSession[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [justSaved, setJustSaved] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll effect
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [displayedDialogue, showConsensus]);

    // Load History & Check for Bridges
    useEffect(() => {
        const loadSessions = async () => {
            const saved = await storageService.getWarRoomSessions();
            setSessions(saved);
        };
        loadSessions();

        const draft = localStorage.getItem('solo_war_room_topic');
        if (draft) {
            setTopic(draft);
            localStorage.removeItem('solo_war_room_topic');
        }
    }, []);

    // Typing/Streaming Simulation
    useEffect(() => {
        if (!fullResponse) return;

        // If we are just loading a saved session, skip animation
        if (displayedDialogue.length === fullResponse.dialogue.length) {
            setShowConsensus(true);
            return;
        }

        let currentIndex = 0;
        const dialogue = fullResponse.dialogue;
        setDisplayedDialogue([]); // Reset

        const interval = setInterval(async () => {
            if (currentIndex < dialogue.length) {
                setDisplayedDialogue(prev => [...prev, dialogue[currentIndex]]);
                setCurrentSpeaker(dialogue[currentIndex].speaker);
                currentIndex++;
                soundService.playTyping();
            } else {
                clearInterval(interval);
                setCurrentSpeaker(null);
                setTimeout(async () => {
                    setShowConsensus(true);
                    // Gamification Hook - Award XP on completion
                    const { leveledUp } = await addXP(100);
                    showToast("STRATEGY FORMULATED", "War Room session completed.", "xp", 100);
                    if (leveledUp) showToast("RANK UP!", "You have reached a new founder level.", "success");
                    soundService.playSuccess();
                }, 1000);
            }
        }, 2000); // Speed of dialogue

        return () => clearInterval(interval);
    }, [fullResponse]);

    const handleConvene = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        setFullResponse(null);
        setDisplayedDialogue([]);
        setShowConsensus(false);
        setDeployed(false);
        soundService.playClick();

        try {
            const response = await geminiService.generateWarRoomDebate(topic);
            if (response) {
                setFullResponse(response);
            } else {
                showToast("ERROR", "Failed to convene War Room.", "error");
            }
        } catch (error) {
            showToast("ERROR", "Connection failed.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSession = async () => {
        if (!fullResponse) return;
        const newSession: SavedWarRoomSession = {
            ...fullResponse,
            id: `war-${Date.now()}`,
            topic: topic,
            timestamp: new Date().toISOString()
        };

        const updatedSessions = [newSession, ...sessions];
        setSessions(updatedSessions);
        // Save to Vault
        await storageService.saveWarRoomSession(newSession);
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 3000);
        showToast("ARCHIVED", "War Room session saved.", "success");
        soundService.playSuccess();
    };

    const handleExport = () => {
        if (!fullResponse) return;
        const md = generateWarRoomMarkdown(topic, fullResponse);
        downloadMarkdown(`WarRoom_${topic.substring(0, 15)}`, md);
        showToast("DOWNLOADING", "Transcript exported.", "info");
        soundService.playClick();
    };

    const loadSession = (session: SavedWarRoomSession) => {
        setTopic(session.topic);
        setFullResponse(session);
        setDisplayedDialogue(session.dialogue); // Instant load
        setShowConsensus(true);
        setDeployed(false);
        setJustSaved(true);
        setShowHistory(false);
        soundService.playClick();
    };

    const deleteSession = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Delete this session archive?")) {
            const updated = sessions.filter(s => s.id !== id);
            setSessions(updated);
            localStorage.setItem('solo_war_room_sessions', JSON.stringify(updated));
        }
    };

    const handleDeployToRoadmap = async () => {
        if (!fullResponse) return;
        const currentTasks = await storageService.getTasks();

        const newTasks: Task[] = fullResponse.actionPlan.map((action, i) => ({
            id: `task-war-${Date.now()}-${i}`,
            title: action.length > 50 ? action.substring(0, 47) + '...' : action,
            description: `Generated from War Room Consensus on: "${topic}". Full Action: ${action}`,
            assignee: AgentId.ROXY,
            status: 'todo',
            priority: 'high',
            estimatedTime: 'TBD',
            createdAt: new Date().toISOString()
        }));

        const updatedTasks = [...currentTasks, ...newTasks];
        await storageService.saveTasks(updatedTasks);
        setDeployed(true);

        const { leveledUp } = await addXP(50);
        showToast("OPS DEPLOYED", "Strategy converted to tactical tasks.", "xp", 50);
        if (leveledUp) showToast("RANK UP!", "You have reached a new founder level.", "success");
        soundService.playSuccess();
    };

    const getBubbleStyle = (agentId: AgentId): { container: string; bubble: string; text: string; name: string } => {
        const agent = AGENTS[agentId];
        const isLeft = agentId === AgentId.ROXY || agentId === AgentId.LEXI;

        return {
            container: `flex w-full mb-6 ${isLeft ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-4 duration-500`,
            bubble: `max-w-[85%] md:max-w-[70%] p-4 rounded-sm border-2 ${isLeft ? 'rounded-tl-none border-l-4' : 'rounded-tr-none border-r-4 text-right'} ${agentId === AgentId.ROXY ? 'bg-neon-lime/5 border-gray-700 border-l-neon-lime' :
                agentId === AgentId.ECHO ? 'bg-neon-magenta/5 border-gray-700 border-r-neon-magenta' :
                    agentId === AgentId.LEXI ? 'bg-neon-cyan/5 border-gray-700 border-l-neon-cyan' :
                        'bg-neon-orange/5 border-gray-700 border-r-neon-orange'
                }`,
            text: 'text-gray-300 font-mono text-sm leading-relaxed',
            name: `text-xs font-mono font-bold mb-1 uppercase tracking-wider ${agent.color}`
        };
    };

    return (
        <div className="h-[85vh] flex flex-col relative">

            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row justify-between md:items-end gap-4 md:gap-0">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-neon-purple/20 rounded-sm border-2 border-neon-purple/30">
                        <Swords className="text-neon-purple" size={24} />
                    </div>
                    <div>
                        <h2 className="font-orbitron text-2xl font-bold uppercase tracking-wider text-white">The War Room</h2>
                        <p className="text-xs font-mono text-neon-purple">Executive Roundtable Simulation</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className={`flex items-center justify-center w-full md:w-auto gap-2 px-3 py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition-all border-2 ${showHistory ? 'bg-dark-hover border-neon-cyan text-neon-cyan' : 'bg-dark-card border-gray-700 text-gray-500 hover:text-white hover:border-neon-cyan/50'}`}
                >
                    <History size={14} /> {showHistory ? 'Close Archives' : 'Strategy Archives'}
                </button>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden relative">

                {/* Main Interface */}
                <div className={`flex-1 flex flex-col bg-dark-bg border-2 border-gray-700 rounded-sm overflow-hidden shadow-[0_0_30px_rgba(11,228,236,0.1)] relative transition-all duration-500 ${showHistory ? 'mr-0 md:mr-80' : ''}`}>

                    {/* Grid Background */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(11,228,236,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(11,228,236,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

                    {/* Chat Area */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-6 md:p-10 space-y-4 relative z-10 scroll-smooth custom-scrollbar"
                    >
                        {!fullResponse && !loading && (
                            <div className="h-full flex flex-col items-center justify-center opacity-50">
                                <Swords size={64} className="text-gray-700 mb-4" />
                                <p className="text-gray-500 font-mono uppercase tracking-widest text-sm text-center max-w-md">
                                    The council is waiting.<br />Present your strategic dilemma to begin.
                                </p>
                            </div>
                        )}

                        {/* User Topic Bubble */}
                        {fullResponse && (
                            <div className="flex justify-center mb-12 animate-in zoom-in duration-500">
                                <div className="bg-dark-card border-2 border-gray-700 px-8 py-6 rounded-sm max-w-2xl text-center shadow-[0_0_20px_rgba(11,228,236,0.1)] relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-purple to-transparent"></div>
                                    <p className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Current Directive</p>
                                    <h3 className="font-orbitron text-xl md:text-2xl font-bold text-white">&quot;{topic}&quot;</h3>

                                    {/* Save Action (Floating) */}
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <button
                                            onClick={handleExport}
                                            className="p-2 rounded-sm text-gray-600 hover:text-neon-cyan hover:bg-neon-cyan/10 transition-all"
                                            title="Export Transcript"
                                        >
                                            <Download size={16} />
                                        </button>
                                        <button
                                            onClick={handleSaveSession}
                                            disabled={justSaved}
                                            className={`p-2 rounded-sm transition-all ${justSaved ? 'text-neon-lime bg-neon-lime/10' : 'text-gray-600 hover:text-neon-lime hover:bg-neon-lime/10'}`}
                                            title="Save to Archives"
                                        >
                                            {justSaved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Dialogue Stream */}
                        {displayedDialogue.map((entry, idx) => {
                            const styles = getBubbleStyle(entry.speaker);
                            const agent = AGENTS[entry.speaker];
                            const isLeft = entry.speaker === AgentId.ROXY || entry.speaker === AgentId.LEXI;

                            return (
                                <div key={idx} className={styles.container}>
                                    <div className={`flex gap-4 max-w-full ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                                        {/* Avatar */}
                                        <div className="shrink-0 mt-1 hidden md:block">
                                            <div className={`w-10 h-10 rounded-full border-2 overflow-hidden ${currentSpeaker === entry.speaker ? 'ring-2 ring-offset-2 ring-offset-dark-bg ring-neon-cyan' : 'border-gray-700 grayscale opacity-70'}`}>
                                                <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                                            </div>
                                        </div>

                                        {/* Bubble */}
                                        <div className={styles.bubble}>
                                            <div className={`flex items-center gap-2 ${isLeft ? '' : 'justify-end'}`}>
                                                <span className={styles.name}>{agent.name}</span>
                                                <span className="text-[10px] text-gray-600 font-mono uppercase mb-1">// {agent.title.split(' ')[0]}</span>
                                            </div>
                                            <p className={styles.text}>{entry.text}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Loading/Typing Indicator */}
                        {loading && (
                            <div className="flex justify-center py-12">
                                <div className="flex flex-col items-center gap-4">
                                    <Loader2 className="animate-spin text-neon-purple" size={32} />
                                    <p className="text-xs font-mono text-neon-purple animate-pulse uppercase tracking-widest">Summoning Executive Team...</p>
                                </div>
                            </div>
                        )}

                        {/* Consensus Card */}
                        {showConsensus && fullResponse && (
                            <div className="mt-12 pb-20 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                                <div className="bg-dark-card backdrop-blur-md border-2 border-neon-purple/50 rounded-sm p-1 overflow-hidden relative shadow-[0_0_30px_rgba(179,0,255,0.2)]">
                                    <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-neon-cyan/5 pointer-events-none"></div>

                                    <div className="bg-dark-bg/40 p-4 md:p-8 rounded-sm">
                                        <div className="flex items-center gap-3 mb-6 border-b-2 border-gray-700 pb-4">
                                            <div className="bg-neon-purple text-dark-bg px-3 py-1 rounded-sm text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-2">
                                                <CheckCircle2 size={14} /> Final Consensus
                                            </div>
                                            <span className="text-gray-500 text-xs font-mono ml-auto">{new Date().toLocaleTimeString()}</span>
                                        </div>

                                        <p className="text-lg text-gray-200 font-mono leading-relaxed mb-8">
                                            {fullResponse.consensus}
                                        </p>

                                        <div className="space-y-3 mb-8">
                                            <h4 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Recommended Action Plan</h4>
                                            {fullResponse.actionPlan.map((action, i) => (
                                                <div key={i} className="flex items-start gap-4 bg-dark-card p-4 rounded-sm border-2 border-gray-700">
                                                    <span className="flex items-center justify-center w-6 h-6 rounded-sm bg-neon-purple/20 text-neon-purple font-mono text-xs font-bold shrink-0">
                                                        {i + 1}
                                                    </span>
                                                    <span className="text-sm text-gray-300 font-mono">{action}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-end gap-4 border-t-2 border-gray-700 pt-4">
                                            <button
                                                onClick={handleExport}
                                                className="flex items-center gap-2 px-4 py-3 rounded-sm font-mono font-bold text-xs uppercase tracking-wider transition-all bg-transparent border-2 border-gray-700 text-gray-400 hover:border-neon-cyan hover:text-neon-cyan"
                                            >
                                                <Download size={16} /> Export Transcript
                                            </button>
                                            <button
                                                onClick={handleDeployToRoadmap}
                                                disabled={deployed}
                                                className={`flex items-center gap-2 px-6 py-3 rounded-sm font-mono font-bold text-xs uppercase tracking-wider transition-all
                                    ${deployed
                                                        ? 'bg-neon-lime text-dark-bg cursor-default'
                                                        : 'border-2 border-neon-cyan bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20 hover:shadow-[0_0_20px_rgba(11,228,236,0.4)]'
                                                    }`}
                                            >
                                                {deployed ? (
                                                    <><CheckCircle2 size={16} /> Deployment Complete</>
                                                ) : (
                                                    <><KanbanSquare size={16} /> Deploy to Roadmap</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-dark-bg border-t-2 border-gray-700 relative z-20">
                        <div className={`flex items-center bg-dark-card border-2 border-gray-700 rounded-sm focus-within:border-neon-purple focus-within:shadow-[0_0_15px_rgba(179,0,255,0.3)] transition-all ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div className="pl-4 text-gray-500">
                                <Terminal size={20} />
                            </div>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleConvene()}
                                placeholder="Enter a strategic dilemma (e.g., 'Should we pivot to Enterprise sales?')"
                                className="w-full bg-transparent border-none text-white placeholder-gray-600 px-4 py-4 focus:ring-0 font-mono"
                                disabled={loading}
                            />
                            <button
                                onClick={handleConvene}
                                disabled={loading || !topic.trim()}
                                className="mr-2 border-2 border-neon-purple bg-neon-purple/10 text-neon-purple hover:bg-neon-purple/20 px-6 py-2 rounded-sm text-sm font-mono font-bold tracking-wide uppercase transition-colors disabled:bg-dark-hover disabled:border-gray-700 disabled:text-gray-600 flex items-center gap-2"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <><Send size={16} /> Convene</>}
                            </button>
                        </div>
                    </div>

                </div>

                {/* History Drawer */}
                <div className={`absolute inset-y-0 right-0 w-full md:w-80 bg-dark-bg border-l-2 border-gray-700 transform transition-transform duration-300 ease-in-out z-30 ${showHistory ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-4 border-b-2 border-gray-700 flex items-center justify-between bg-dark-card">
                        <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Archive size={14} /> Strategy Archives
                        </h3>
                        <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-neon-cyan">
                            <ArrowRight size={16} />
                        </button>
                    </div>
                    <div className="overflow-y-auto h-full p-4 space-y-3 custom-scrollbar">
                        {sessions.length === 0 ? (
                            <div className="text-center text-gray-600 py-10 text-xs font-mono">NO ARCHIVED SESSIONS</div>
                        ) : (
                            sessions.map((session) => (
                                <div
                                    key={session.id}
                                    onClick={() => loadSession(session)}
                                    className="p-4 bg-dark-card border-2 border-gray-700 rounded-sm hover:bg-dark-hover hover:border-neon-cyan/50 cursor-pointer group relative"
                                >
                                    <h4 className="text-sm text-gray-300 font-mono mb-1 line-clamp-2 leading-tight group-hover:text-white">{session.topic}</h4>
                                    <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                                        <span className="flex items-center gap-1"><Clock size={10} /> {new Date(session.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <button
                                        onClick={(e) => deleteSession(e, session.id)}
                                        className="absolute top-2 right-2 p-1.5 text-gray-600 hover:text-neon-magenta opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};