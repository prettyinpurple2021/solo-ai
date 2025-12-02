
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Network, Info, MessageSquare, ListTodo, CheckCircle2, Clock, AlertCircle, Trash2, RefreshCcw } from 'lucide-react';
import { AgentId, ChatMessage, Task } from '../types';
import { AGENTS } from '../constants';
import { geminiService } from '../services/geminiService';
import { soundService } from '../services/soundService';
import { storageService } from '../services/storageService';
import { addXP, showToast } from '../services/gameService';

interface AgentChatProps {
    agentId: AgentId;
    initialMessage?: string | null;
    onMessageConsumed?: () => void;
}

type Tab = 'chat' | 'tasks';

export const AgentChat: React.FC<AgentChatProps> = ({ agentId, initialMessage, onMessageConsumed }) => {
    const [activeTab, setActiveTab] = useState<Tab>('chat');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // Task State
    const [tasks, setTasks] = useState<Task[]>([]);

    const scrollRef = useRef<HTMLDivElement>(null);
    const agent = AGENTS[agentId];

    // Handle incoming message from Scratchpad
    useEffect(() => {
        if (initialMessage) {
            setInput(initialMessage);
            if (onMessageConsumed) onMessageConsumed();
        }
    }, [initialMessage]);

    // LOAD HISTORY (Deep Memory)
    useEffect(() => {
        const init = async () => {
            try {
                const history = await storageService.getChatHistory(agentId);
                if (history && history.length > 0) {
                    setMessages(history);
                } else {
                    resetChat();
                }
            } catch (e) {
                console.error("Failed to load chat history", e);
                resetChat();
            }

            setActiveTab('chat');
            loadTasks();
        };
        init();
    }, [agentId]);

    // SAVE HISTORY
    useEffect(() => {
        const save = async () => {
            if (messages.length > 0) {
                await storageService.saveChatHistory(agentId, messages);
            }
        };
        save();
    }, [messages, agentId]);

    const resetChat = () => {
        setMessages([
            {
                role: 'model',
                text: `Online. I am ${agent.name}. ${agent.title}. ${agent.description} How can I assist?`,
                timestamp: Date.now()
            }
        ]);
    };

    const handlePurgeMemory = async () => {
        if (confirm(`Are you sure you want to wipe ${agent.name}'s memory? This cannot be undone.`)) {
            await storageService.clearChatHistory(agentId);
            resetChat();
            soundService.playError(); // Or a specific 'wipe' sound
            showToast("MEMORY PURGED", `${agent.name}'s context has been reset.`, "info");
        }
    };

    // Scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current && activeTab === 'chat') {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, activeTab, loading]);

    const loadTasks = async () => {
        const allTasks = await storageService.getTasks();
        // Filter for this agent
        const agentTasks = allTasks.filter(t => t.assignee === agentId && t.status !== 'done');
        setTasks(agentTasks);
    };

    const handleCompleteTask = async (taskId: string) => {
        await storageService.updateTask(taskId, { status: 'done', completedAt: new Date().toISOString() });

        // UI Updates
        setTasks(prev => prev.filter(t => t.id !== taskId));
        soundService.playSuccess();

        const { leveledUp } = await addXP(25);
        showToast("DIRECTIVE EXECUTED", "Task marked as complete.", "xp", 25);
        if (leveledUp) showToast("RANK UP!", "You have reached a new founder level.", "success");
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        soundService.playClick();
        const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        const history = messages.map(m => ({ role: m.role, text: m.text }));

        const responseText = await geminiService.getAgentResponse(agentId, history, userMsg.text);

        soundService.playTyping(); // Effect for received message
        const botMsg: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };
        setMessages(prev => [...prev, botMsg]);
        setLoading(false);
    };

    return (

        <div className="flex flex-col fixed inset-0 z-50 md:relative md:inset-auto md:z-auto md:h-[calc(100vh-4rem)] max-h-[100vh] md:max-h-[800px] glass-panel rounded-none md:rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 relative">

            {/* Agent Header & Tabs */}
            <div className="bg-white/5 border-b border-white/5 backdrop-blur-md relative z-20 shrink-0 safe-top">
                <div className="p-3 md:p-4 lg:p-6 flex items-center justify-between gap-3 md:gap-4">
                    <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                        <div className="relative shrink-0">
                            <img src={agent.avatar} alt={agent.name} className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full grayscale hover:grayscale-0 transition-all ring-2 ring-white/10" />
                            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5 rounded-full border-2 border-zinc-950 ${agent.color.replace('text-', 'bg-')} shadow-[0_0_10px_currentColor]`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className={`font-black text-lg md:text-xl lg:text-2xl tracking-tight ${agent.color} drop-shadow-md truncate`}>{agent.name.toUpperCase()}</h3>
                            <p className="text-[10px] md:text-xs text-zinc-400 font-mono uppercase tracking-widest truncate">{agent.title}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                        {/* Deep Mind Indicator */}
                        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-full border border-white/10 group relative cursor-help hover:border-emerald-500/50 transition-colors">
                            <Network size={14} className="text-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider group-hover:text-emerald-400 transition-colors">Deep Mind</span>
                            <div className="absolute top-full right-0 mt-2 w-64 bg-black/90 border border-zinc-700 p-3 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 backdrop-blur-xl">
                                <p className="text-xs text-zinc-300 leading-relaxed">
                                    <strong className="text-emerald-500 block mb-1">CONTEXT AWARENESS ACTIVE</strong>
                                    {agent.name} has read-access to your Tactical Roadmap and Competitor Intelligence.
                                </p>
                            </div>
                        </div>

                        {/* Purge Button */}
                        <button
                            onClick={handlePurgeMemory}
                            className="p-2 rounded hover:bg-red-500/10 text-zinc-500 hover:text-red-500 transition-colors border border-transparent hover:border-red-500/20 touch-target"
                            title="Purge Agent Memory (Reset)"
                            aria-label="Reset chat"
                        >
                            <Trash2 size={14} className="md:hidden" />
                            <Trash2 size={16} className="hidden md:inline" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex lg:hidden px-3 md:px-4 lg:px-6 gap-1 overflow-x-auto scrollbar-hide">
                    <button
                        onClick={() => { setActiveTab('chat'); soundService.playClick(); }}
                        className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest border-b-2 transition-colors relative shrink-0 touch-target
                    ${activeTab === 'chat' ? `border-${agent.color.split('-')[1]}-500 text-white` : 'border-transparent text-zinc-500 hover:text-zinc-300'}
                `}
                    >
                        <MessageSquare size={12} className="md:hidden" />
                        <MessageSquare size={14} className="hidden md:inline" />
                        <span className="hidden sm:inline">Uplink</span>
                        {activeTab === 'chat' && <span className={`absolute inset-0 bg-${agent.color.split('-')[1]}-500/5`} />}
                    </button>
                    <button
                        onClick={() => { setActiveTab('tasks'); loadTasks(); soundService.playClick(); }}
                        className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest border-b-2 transition-colors relative shrink-0 touch-target
                    ${activeTab === 'tasks' ? `border-${agent.color.split('-')[1]}-500 text-white` : 'border-transparent text-zinc-500 hover:text-zinc-300'}
                `}
                    >
                        <ListTodo size={12} className="md:hidden" />
                        <ListTodo size={14} className="hidden md:inline" />
                        <span className="hidden sm:inline">Directives</span>
                        {tasks.length > 0 && (
                            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] bg-zinc-800 ${agent.color}`}>
                                {tasks.length}
                            </span>
                        )}
                        {activeTab === 'tasks' && <span className={`absolute inset-0 bg-${agent.color.split('-')[1]}-500/5`} />}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                {/* CHAT COLUMN */}
                <div className={`flex-1 flex flex-col min-w-0 ${activeTab === 'chat' ? 'flex' : 'hidden lg:flex'}`}>
                    <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-3 md:space-y-6 relative custom-scrollbar z-10 momentum-scroll" ref={scrollRef}>
                        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                        {messages.map((msg, idx) => {
                            const isUser = msg.role === 'user';
                            return (
                                <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'} relative z-10 animate-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`max-w-[95%] sm:max-w-[90%] md:max-w-[80%] p-2.5 md:p-5 rounded-2xl shadow-lg backdrop-blur-sm ${isUser
                                        ? 'bg-zinc-800/80 text-white rounded-tr-none border border-white/5'
                                        : 'bg-black/40 border border-white/10 text-zinc-200 rounded-tl-none'
                                        }`}>
                                        <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2 text-[10px] font-mono uppercase opacity-50">
                                            {isUser ? <User size={9} className="md:hidden" /> : <Bot size={9} className="md:hidden" />}
                                            {isUser ? <User size={10} className="hidden md:inline" /> : <Bot size={10} className="hidden md:inline" />}
                                            <span className="font-bold tracking-wider text-[9px] md:text-[10px]">{isUser ? 'YOU' : agent.name}</span>
                                            <span className="ml-auto text-[9px] md:text-[10px]">{new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-xs md:text-sm whitespace-pre-wrap leading-relaxed font-normal">{msg.text}</p>
                                    </div>
                                </div>
                            );
                        })}
                        {loading && (
                            <div className="flex justify-start relative z-10">
                                <div className="bg-black/40 border border-white/10 p-3 md:p-4 rounded-2xl rounded-tl-none flex items-center gap-2 md:gap-3 backdrop-blur-sm">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                    <span className="text-[10px] font-mono text-emerald-500/70 uppercase animate-pulse tracking-wider">Processing...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-3 md:p-4 bg-black/20 border-t border-white/5 backdrop-blur-md relative z-20 safe-bottom shrink-0">
                        <div className="flex gap-2 md:gap-3">
                            <input
                                type="text"
                                className="flex-1 bg-black/40 border border-white/10 text-white rounded-xl px-3 md:px-4 py-2 md:py-3 text-sm md:text-base focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 font-medium placeholder-zinc-600 transition-all"
                                placeholder={`Ask ${agent.name}...`}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                autoFocus
                            />
                            <button
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="bg-white hover:bg-zinc-200 text-black p-2 md:p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] touch-target"
                                aria-label="Send message"
                            >
                                <Send size={18} className="md:hidden" />
                                <Send size={20} className="hidden md:inline" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* TASKS COLUMN */}
                <div className={`lg:w-80 xl:w-96 border-l border-white/5 bg-black/20 ${activeTab === 'tasks' ? 'flex flex-col flex-1' : 'hidden lg:flex flex-col'}`}>
                    <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6 custom-scrollbar momentum-scroll">
                        {tasks.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50">
                                <ListTodo size={48} className="md:hidden" strokeWidth={1} />
                                <ListTodo size={64} className="hidden md:block" strokeWidth={1} />
                                <p className="mt-4 font-mono text-xs md:text-sm uppercase tracking-widest text-center px-4">No Active Directives for {agent.name}</p>
                                <p className="text-xs mt-2 text-center px-4">Assign tasks in the Tactical Roadmap.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 md:space-y-4 max-w-2xl mx-auto">
                                <div className="flex items-center justify-between mb-4 md:mb-6">
                                    <h3 className="text-xs md:text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                        <AlertCircle size={14} className="md:hidden" />
                                        <AlertCircle size={16} className={`hidden md:inline ${agent.color}`} /> <span className="hidden sm:inline">Pending Directives</span>
                                    </h3>
                                    <span className="text-xs font-mono text-zinc-500">{tasks.length} ACTIVE</span>
                                </div>

                                {tasks.map(task => (
                                    <div key={task.id} className="glass-card p-4 md:p-6 rounded-xl group hover:border-emerald-500/30 transition-all relative overflow-hidden">
                                        <div className={`absolute top-0 left-0 w-1 h-full ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-emerald-500'}`} />

                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-sm md:text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{task.title}</h4>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded bg-black/40 border border-white/10 ${task.priority === 'high' ? 'text-red-400' : 'text-zinc-400'}`}>
                                                {task.priority}
                                            </span>
                                        </div>

                                        <p className="text-zinc-400 text-xs md:text-sm leading-relaxed mb-4 pr-12">{task.description}</p>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-2 text-[10px] md:text-xs text-zinc-500 font-mono">
                                                <Clock size={12} /> Est: {task.estimatedTime}
                                            </div>
                                            <button
                                                onClick={() => handleCompleteTask(task.id)}
                                                className="flex items-center gap-2 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-zinc-400 px-3 py-1.5 md:px-4 md:py-2 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all border border-white/5 hover:border-emerald-500/30"
                                            >
                                                <CheckCircle2 size={14} /> Complete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
