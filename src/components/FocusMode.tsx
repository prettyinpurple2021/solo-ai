
import React, { useState, useEffect } from 'react';
import { Play, Pause, CheckCircle2, BrainCircuit, Volume2, VolumeX, X } from 'lucide-react';
import { Task } from '../types';
import { soundService } from '../services/soundService';
import { addXP, showToast } from '../services/gameService';

interface FocusModeProps {
    activeTask?: Task | null;
    onExit: () => void;
    onComplete?: (taskId: string) => void;
}

export const FocusMode: React.FC<FocusModeProps> = ({ activeTask, onExit, onComplete }) => {
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        // Start sound on mount if enabled
        if (soundEnabled) soundService.startFocusDrone();

        return () => {
            soundService.stopFocusDrone();
        };
    }, []);

    useEffect(() => {
        let interval: any;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            soundService.playSuccess();
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    // Breathing effect loop
    useEffect(() => {
        const interval = setInterval(() => setPulse(p => !p), 4000);
        return () => clearInterval(interval);
    }, []);

    const toggleTimer = () => {
        setIsActive(!isActive);
        soundService.playClick();
    };

    const toggleSound = () => {
        const newState = !soundEnabled;
        setSoundEnabled(newState);
        if (newState) soundService.startFocusDrone();
        else soundService.stopFocusDrone();
    };

    const handleComplete = async () => {
        soundService.stopFocusDrone();
        // Bonus XP for using Focus Mode
        const { leveledUp } = await addXP(50);
        showToast("HYPERFOCUS COMPLETE", "Neural synchronization achieved.", "xp", 50);
        if (leveledUp) showToast("RANK UP!", "You have reached a new founder level.", "success");

        if (activeTask && onComplete) {
            onComplete(activeTask.id);
        } else {
            onExit();
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

    const displayTitle = activeTask?.title || "DEEP WORK SESSION";
    const displayDesc = activeTask?.description || "High-intensity focus block. Eliminate all distractions.";

    return (
        <div className="fixed inset-0 z-[100] bg-dark-bg flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-700">

            {/* Background Effects */}
            <div className={`absolute inset-0 bg-gradient-to-b from-neon-cyan/10 to-dark-bg pointer-events-none transition-opacity duration-[4s] ${pulse ? 'opacity-50' : 'opacity-20'}`} />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-4xl p-8 flex flex-col items-center text-center">

                {/* Header */}
                <div className="mb-12 animate-in slide-in-from-top-10 duration-700">
                    <div className="flex items-center justify-center gap-3 mb-4 text-neon-cyan font-mono text-sm font-bold uppercase tracking-[0.3em]">
                        <BrainCircuit size={18} className="animate-pulse" />
                        Neural Link Established
                    </div>
                    <h1 className="font-orbitron text-3xl md:text-5xl font-bold uppercase tracking-wider text-white leading-tight max-w-2xl">
                        {displayTitle}
                    </h1>
                    <p className="text-gray-500 mt-4 text-lg max-w-xl mx-auto font-mono">
                        {displayDesc.length > 100 ? displayDesc.substring(0, 100) + '...' : displayDesc}
                    </p>
                </div>

                {/* Timer Ring */}
                <div className="relative mb-12 group">
                    <div className={`absolute inset-0 rounded-full bg-neon-cyan/20 blur-3xl transition-all duration-[4s] ${pulse ? 'scale-110 opacity-40' : 'scale-90 opacity-10'}`}></div>

                    <div className="w-72 h-72 md:w-96 md:h-96 rounded-full border-8 border-gray-800 flex items-center justify-center relative bg-dark-bg">
                        {/* Progress Circle */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle
                                cx="50" cy="50" r="45"
                                fill="none"
                                stroke="#0be4ec"
                                strokeWidth="2"
                                strokeDasharray="283"
                                strokeDashoffset={283 - (283 * progress) / 100}
                                className="transition-all duration-1000 ease-linear"
                            />
                        </svg>

                        <div className="text-center">
                            <div className={`text-7xl md:text-8xl font-bold font-mono tracking-tighter transition-colors ${isActive ? 'text-white' : 'text-gray-500'}`}>
                                {formatTime(timeLeft)}
                            </div>
                            <div className="text-xs font-mono font-bold uppercase tracking-widest text-neon-cyan mt-2">
                                {isActive ? 'Focus Active' : 'Session Paused'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={onExit}
                        className="p-4 rounded-full border-2 border-gray-700 text-gray-500 hover:text-neon-magenta hover:border-neon-magenta hover:shadow-[0_0_15px_rgba(255,0,110,0.3)] transition-all group bg-dark-card"
                        title="Abort Session"
                    >
                        <X size={24} />
                    </button>

                    <button
                        onClick={toggleTimer}
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl
                            ${isActive
                                ? 'bg-dark-card text-white border-2 border-neon-cyan hover:border-neon-cyan hover:shadow-[0_0_20px_rgba(11,228,236,0.3)]'
                                : 'bg-neon-cyan text-dark-bg hover:scale-105 shadow-[0_0_30px_rgba(11,228,236,0.4)] border-2 border-neon-cyan'
                            }`}
                    >
                        {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                    </button>

                    <button
                        onClick={handleComplete}
                        className="p-4 rounded-full border-2 border-gray-700 text-neon-lime hover:bg-neon-lime/10 hover:border-neon-lime hover:shadow-[0_0_15px_rgba(57,255,20,0.3)] transition-all bg-dark-card"
                        title="Mark Session Complete"
                    >
                        <CheckCircle2 size={24} />
                    </button>
                </div>

                {/* Footer Controls */}
                <div className="absolute bottom-8 flex gap-4">
                    <button
                        onClick={toggleSound}
                        className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider border-2 transition-all
                            ${soundEnabled ? 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10' : 'border-gray-700 text-gray-600'}
                        `}
                    >
                        {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                        {soundEnabled ? 'Neural Drive: ON' : 'Neural Drive: OFF'}
                    </button>
                </div>

            </div>
        </div>
    );
};
