import React, { useState, useRef, useEffect } from 'react';
import { GraduationCap, Trophy, User, Bot, ArrowRight, Swords, AlertTriangle } from 'lucide-react';
import { RoleplayScenario, RoleplayTurn, RoleplayFeedback } from '../types';
import { geminiService } from '../services/geminiService';
import { addXP, showToast } from '../services/gameService';
import { soundService } from '../services/soundService';
import { storageService } from '../services/storageService';

/**
 * TheAcademy component following Cyberpunk Design System v3
 * Interactive roleplay simulations to sharpen founder skills
 */

const SCENARIOS: RoleplayScenario[] = [
    {
        id: 'pitch-vc',
        title: 'The Skeptical VC',
        description: 'You have 2 minutes to hook a busy venture capitalist who has heard it all before.',
        difficulty: 'VETERAN',
        opponentRole: 'Venture Capitalist',
        opponentPersona: 'Impatient, numbers-focused, skeptical of buzzwords, checks phone constantly.',
        objective: 'Get a commitment for a follow-up meeting.'
    },
    {
        id: 'sales-cold',
        title: 'Cold Call Challenge',
        description: 'Get past the gatekeeper and pitch your product to a busy decision maker.',
        difficulty: 'ROOKIE',
        opponentRole: 'Small Business Owner',
        opponentPersona: 'Stressed, tight budget, wary of salespeople, but needs a solution.',
        objective: 'Book a demo.'
    },
    {
        id: 'negotiate-salary',
        title: 'Rate Negotiation',
        description: 'A client wants to hire you but thinks your rates are too high.',
        difficulty: 'VETERAN',
        opponentRole: 'Procurement Manager',
        opponentPersona: 'Professional negotiator, uses silence as a weapon, anchoring low.',
        objective: 'Close the deal without discounting more than 10%.'
    },
    {
        id: 'angry-customer',
        title: 'Crisis Management',
        description: 'A key client is furious about a bug that cost them money.',
        difficulty: 'NIGHTMARE',
        opponentRole: 'Enterprise Client',
        opponentPersona: 'Furious, shouting, threatening to cancel contract and sue.',
        objective: 'De-escalate the situation and retain the account.'
    }
];

export const TheAcademy: React.FC = () => {
    const [activeScenario, setActiveScenario] = useState<RoleplayScenario (null);
    const [history, setHistory] = useState<RoleplayTurn[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<RoleplayFeedback (null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, loading]);

    const startScenario = (scenario: RoleplayScenario) => {
        setActiveScenario(scenario);
        setHistory([]);
        setFeedback(null);
        setLoading(false);
        soundService.playClick();
    };

    const handleSend = async () => {
        if (!input.trim() || !activeScenario) return;

        const userMsg: RoleplayTurn = { role: 'user', text: input };
        const newHistory = [...history, userMsg];
        setHistory(newHistory);
        setInput('');
        setLoading(true);
        soundService.playClick();

        const reply = await geminiService.getRoleplayReply(activeScenario, newHistory, input);

        setHistory([...newHistory, { role: 'opponent', text: reply }]);
        setLoading(false);
        soundService.playTyping();
    };

    const handleFinish = async () => {
        if (!activeScenario || history.length < 2) return;
        setLoading(true);
        const result = await geminiService.evaluateRoleplaySession(activeScenario, history);
        if (result) {
            setFeedback(result);
            await storageService.saveTrainingResult(result);

            const { leveledUp } = await addXP(result.score); // XP based on performance
            showToast("SIMULATION ENDED", `Score: ${result.score}/100`, "xp", result.score);
            if (leveledUp) showToast("RANK UP!", "New founder level reached.", "success");
            soundService.playSuccess();
        }
        setLoading(false);
    };

    return (
        <div className="min-h-[85vh] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6 flex items-end justify-between border-b border-gray-700 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-neon-orange font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <GraduationCap size={14} /> Skill Acquisition
                    </div>
                    <h2 className="font-orbitron text-4xl font-bold uppercase tracking-wider text-white">THE ACADEMY</h2>
                    <p className="font-mono text-gray-400 mt-2">Interactive roleplay simulations to sharpen your edge.</p>
                </div>
                {activeScenario && !feedback && (
                    <button
                        onClick={handleFinish}
                        className="flex items-center gap-2 px-6 py-3 border-2 border-gray-600 bg-dark-card hover:border-neon-magenta hover:text-neon-magenta text-gray-400 rounded-sm font-mono font-bold text-xs uppercase tracking-widest transition-all"
                    >
                        End Simulation
                    </button>
                )}
            </div>

            {!activeScenario ? (
                // Scenario Selection
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                    {SCENARIOS.map(scenario => (
                        <div
                            key={scenario.id}
                            onClick={() => startScenario(scenario)}
                            className="bg-dark-card border-2 border-gray-700 hover:border-neon-cyan hover:shadow-[0_0_15px_rgba(11,228,236,0.2)] p-6 rounded-sm cursor-pointer group transition-all flex flex-col h-full relative overflow-hidden"
                        >
                            <div className={`absolute top-0 left-0 w-full h-1 ${scenario.difficulty === 'ROOKIE' ? 'bg-neon-lime' :
                                scenario.difficulty === 'VETERAN' ? 'bg-neon-orange' :
                                    'bg-neon-magenta'
                                }`} />

                            <div className="flex justify-between items-start mb-4">
                                <div className={`text-[10px] font-mono font-bold px-2 py-1 rounded-sm uppercase ${scenario.difficulty === 'ROOKIE' ? 'bg-neon-lime/10 text-neon-lime' :
                                    scenario.difficulty === 'VETERAN' ? 'bg-neon-orange/10 text-neon-orange' :
                                        'bg-neon-magenta/10 text-neon-magenta'
                                    }`}>
                                    {scenario.difficulty}
                                </div>
                                <Swords size={16} className="text-gray-600 group-hover:text-neon-cyan transition-colors" />
                            </div>

                            <h3 className="font-orbitron text-lg font-bold text-white mb-2 group-hover:text-neon-cyan transition-colors">{scenario.title}</h3>
                            <p className="text-sm font-mono text-gray-400 mb-6 flex-1">{scenario.description}</p>

                            <div className="mt-auto pt-4 border-t border-gray-700">
                                <p className="text-xs font-orbitron font-bold text-neon-purple uppercase tracking-widest mb-1">Objective</p>
                                <p className="text-xs font-mono text-gray-300">{scenario.objective}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // Simulation Interface
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-250px)] min-h-[500px]">

                    {/* Chat Area */}
                    <div className="lg:col-span-2 flex flex-col bg-dark-bg border-2 border-gray-700 rounded-sm overflow-hidden">
                        <div className="bg-dark-card p-4 border-b border-gray-700 flex justify-between items-center">
                            <div>
                                <h3 className="font-orbitron font-bold text-white">{activeScenario.title}</h3>
                                <p className="text-xs text-gray-500 font-mono uppercase">Opponent: {activeScenario.opponentRole}</p>
                            </div>
                            <button onClick={() => setActiveScenario(null)} className="text-xs font-mono text-gray-500 hover:text-neon-magenta uppercase font-bold transition-colors">Abort</button>
                        </div>

                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {history.length === 0 && (
                                <div className="text-center text-gray-600 py-10 font-mono text-sm uppercase tracking-widest">
                                    Simulation Ready. Make your opening move.
                                </div>
                            )}
                            {history.map((turn, i) => (
                                <div key={i} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-4 rounded-sm ${turn.role === 'user'
                                        ? 'bg-neon-cyan/10 border-2 border-neon-cyan/30 text-white'
                                        : 'bg-dark-card border-2 border-gray-700 text-gray-300'
                                        }`}>
                                        <div className="flex items-center gap-2 mb-1 text-[10px] font-mono font-bold uppercase opacity-70">
                                            {turn.role === 'user' ? <User size={10} className="text-neon-cyan" /> : <Bot size={10} className="text-neon-magenta" />}
                                            <span className={turn.role === 'user' ? 'text-neon-cyan' : 'text-neon-magenta'}>{turn.role === 'user' ? 'You' : activeScenario.opponentRole}</span>
                                        </div>
                                        <p className="text-sm font-mono leading-relaxed">{turn.text}</p>
                                    </div>
                                </div>
                            ))}
                            {loading && !feedback && (
                                <div className="flex justify-start">
                                    <div className="bg-dark-card border-2 border-gray-700 p-4 rounded-sm">
                                        <div className="flex gap-1 h-4 items-center">
                                            <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-bounce"></span>
                                            <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                                            <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {!feedback && (
                            <div className="p-4 bg-dark-card border-t border-gray-700">
                                <div className="flex gap-2">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Type your response..."
                                        className="flex-1 bg-dark-bg border-2 border-gray-700 rounded-sm px-4 py-3 font-mono text-white placeholder:text-gray-500 focus:border-neon-cyan focus:outline-none focus:shadow-[0_0_10px_rgba(11,228,236,0.3)]"
                                        disabled={loading}
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!input.trim() || loading}
                                        className="bg-neon-cyan text-dark-bg px-4 rounded-sm hover:shadow-[0_0_15px_rgba(11,228,236,0.5)] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Feedback / Info Panel */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-dark-card border-2 border-gray-700 rounded-sm p-6">
                            <h4 className="text-xs font-orbitron font-bold text-neon-purple uppercase tracking-widest mb-4">Mission Intel</h4>
                            <div className="space-y-4 text-sm font-mono">
                                <div>
                                    <span className="block text-neon-cyan font-bold mb-1">Objective</span>
                                    <p className="text-gray-300">{activeScenario.objective}</p>
                                </div>
                                <div>
                                    <span className="block text-neon-orange font-bold mb-1">Opponent Profile</span>
                                    <p className="text-gray-300">{activeScenario.opponentPersona}</p>
                                </div>
                            </div>
                        </div>

                        {feedback && (
                            <div className="bg-dark-bg border-2 border-neon-lime/30 rounded-sm p-6 flex-1 animate-in slide-in-from-right-4 duration-500 shadow-[0_0_20px_rgba(57,255,20,0.2)]">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700">
                                    <Trophy className="text-neon-orange" size={24} />
                                    <div>
                                        <h3 className="font-orbitron font-bold text-xl text-white uppercase">Performance Review</h3>
                                        <p className="text-xs font-mono text-gray-500 uppercase">Session Complete</p>
                                    </div>
                                    <div className="ml-auto text-3xl font-orbitron font-bold text-neon-cyan">{feedback.score}</div>
                                </div>

                                <div className="space-y-6 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                                    <div>
                                        <h5 className="text-xs font-orbitron font-bold text-neon-lime uppercase tracking-widest mb-2">Strengths</h5>
                                        <ul className="space-y-2">
                                            {feedback.strengths.map((s, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm font-mono text-gray-300">
                                                    <span className="text-neon-lime">+</span> {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-orbitron font-bold text-neon-magenta uppercase tracking-widest mb-2">Weaknesses</h5>
                                        <ul className="space-y-2">
                                            {feedback.weaknesses.map((w, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm font-mono text-gray-300">
                                                    <span className="text-neon-magenta">-</span> {w}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-dark-card p-4 rounded-sm border-2 border-gray-700">
                                        <h5 className="text-xs font-orbitron font-bold text-neon-orange uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <AlertTriangle size={12} /> Pro Tip
                                        </h5>
                                        <p className="text-sm font-mono text-gray-300 leading-relaxed">{feedback.proTip}</p>
                                    </div>

                                    <button
                                        onClick={() => setActiveScenario(null)}
                                        className="w-full py-3 border-2 border-neon-lime bg-neon-lime/10 text-neon-lime hover:bg-neon-lime/20 hover:shadow-[0_0_15px_rgba(57,255,20,0.5)] rounded-sm font-mono font-bold uppercase tracking-widest text-xs transition-all"
                                    >
                                        Start New Simulation
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
};
