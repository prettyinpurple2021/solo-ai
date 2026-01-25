
import React, { useState, useEffect } from 'react';
import { X, Copy, MessageSquare, Eraser, Check } from 'lucide-react';
import { soundService } from '../services/soundService';
import { showToast } from '../services/gameService';
import { AgentId } from '../types';

interface ScratchpadProps {
    isOpen: boolean;
    onClose: () => void;
    activeAgent: AgentId | null;
    onSendToAgent: (text: string) => void;
}

export const Scratchpad: React.FC<ScratchpadProps> = ({ isOpen, onClose, activeAgent, onSendToAgent }) => {
    const [content, setContent] = useState('');
    const [,] = useState(false);
    const [justCopied, setJustCopied] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('solo_scratchpad');
        if (saved) setContent(saved);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newVal = e.target.value;
        setContent(newVal);
        localStorage.setItem('solo_scratchpad', newVal);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setJustCopied(true);
        soundService.playClick();
        setTimeout(() => setJustCopied(false), 2000);
    };

    const handleClear = () => {
        if (confirm("Clear scratchpad?")) {
            setContent('');
            localStorage.removeItem('solo_scratchpad');
            soundService.playError();
        }
    };

    const handleSendToAgent = () => {
        if (!content.trim()) return;
        onSendToAgent(content);
        showToast("TRANSFERRED", "Note sent to agent uplink.", "success");
        soundService.playSuccess();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-0 md:bottom-8 right-0 md:right-8 z-40 w-full md:w-96 h-[50vh] md:h-96 bg-dark-card/95 backdrop-blur-xl border-t-2 md:border-2 border-neon-cyan/30 rounded-t-sm md:rounded-sm shadow-[0_0_30px_rgba(11,228,236,0.2)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b-2 border-gray-700 bg-dark-bg/50">
                <h3 className="text-xs font-mono font-bold text-neon-cyan uppercase tracking-widest flex items-center gap-2">
                    Founder&apos;s Log
                </h3>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleClear}
                        className="p-1.5 text-gray-500 hover:text-neon-magenta transition-colors rounded-sm hover:bg-neon-magenta/10"
                        title="Clear"
                    >
                        <Eraser size={14} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-500 hover:text-white transition-colors rounded-sm hover:bg-dark-hover"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Text Area */}
            <div className="flex-1 relative group">
                <textarea
                    value={content}
                    onChange={handleChange}
                    placeholder="Quick notes, ideas, or prompt drafts..."
                    className="w-full h-full bg-transparent text-gray-300 p-4 resize-none focus:outline-none font-mono text-sm leading-relaxed custom-scrollbar placeholder:text-gray-600"
                    spellCheck={false}
                    autoFocus
                />
                <div className="absolute bottom-2 right-2 text-[10px] text-gray-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {content.length} chars
                </div>
            </div>

            {/* Actions */}
            <div className="p-3 bg-dark-bg/50 border-t-2 border-gray-700 flex justify-between gap-2">
                <button
                    onClick={handleCopy}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-dark-card hover:bg-dark-hover border-2 border-gray-700 hover:border-neon-cyan/50 hover:text-neon-cyan rounded-sm text-xs font-mono font-bold uppercase tracking-wider text-gray-400 transition-all"
                >
                    {justCopied ? <Check size={14} /> : <Copy size={14} />} {justCopied ? 'Copied' : 'Copy'}
                </button>

                {activeAgent ? (
                    <button
                        onClick={handleSendToAgent}
                        disabled={!content.trim()}
                        className="flex-[2] flex items-center justify-center gap-2 px-3 py-2 bg-neon-lime/10 hover:bg-neon-lime/20 border-2 border-neon-lime/50 hover:border-neon-lime rounded-sm text-xs font-mono font-bold uppercase tracking-wider text-neon-lime transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-neon-lime/10 disabled:hover:border-neon-lime/50"
                    >
                        <MessageSquare size={14} /> Send to {activeAgent.toUpperCase()}
                    </button>
                ) : (
                    <div className="flex-[2] flex items-center justify-center gap-2 px-3 py-2 bg-dark-card border-2 border-gray-700 rounded-sm text-xs font-mono font-bold uppercase tracking-wider text-gray-600 cursor-not-allowed opacity-70">
                        Open Chat to Send
                    </div>
                )}
            </div>
        </div>
    );
};
