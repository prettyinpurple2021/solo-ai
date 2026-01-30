
import React, { useState, useEffect } from 'react';
import { Moon, Zap, Wind,} from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { MentalCoaching } from '../types';
import { addXP, showToast } from '../services/gameService';
import { soundService } from '../services/soundService';

export const TheSanctuary: React.FC = () => {
    const [mood, setMood] = useState('Stressed');
    const [stress, setStress] = useState(50);
    const [blocker, setBlocker] = useState('');
    const [loading, setLoading] = useState(false);
    const [coaching, setCoaching] = useState<MentalCoaching | null>(null);
    const [breathing, setBreathing] = useState(false);

    const handleReflect = async () => {
        if (!blocker.trim()) return;
        setLoading(true);
        setCoaching(null);
        soundService.playClick();

        const result = await geminiService.generateStoicCoaching(mood, stress, blocker);

        if (result) {
            setCoaching(result);
            const { leveledUp } = await addXP(50); // High reward for self-care
            showToast("MENTAL CLARITY RESTORED", "Perspective reformatted.", "xp", 50);
            if (leveledUp) showToast("RANK UP!", "New founder level reached.", "success");
            soundService.playSuccess();

            if (result.breathingExercise) {
                setBreathing(true);
            }
        }
        setLoading(false);
    };

    // Breathing Animation Logic
    const [breathScale, setBreathScale] = useState(1);
    useEffect(() => {
        if (!breathing) return;
        const interval = setInterval(() => {
            setBreathScale(prev => prev === 1 ? 1.5 : 1);
        }, 4000); // 4 in 4 out
        return () => clearInterval(interval);
    }, [breathing]);

    return (
        <div className="min-h-[85vh] flex flex-col animate-in fade-in duration-1000 bg-dark-bg text-gray-300">
            {/* Header - Different Vibe (Minimal) */}
            <div className="mb-12 pt-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-neon-purple/50 mb-4 text-neon-purple">
                    <Moon size={20} />
                </div>
                <h2 className="font-orbitron text-3xl font-bold uppercase tracking-wider text-white mb-2">The Sanctuary</h2>
                <p className="text-sm text-gray-500 font-mono uppercase tracking-widest">Psychological Ops & Resilience</p>
            </div>

            <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">

                {!coaching && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                        {/* Input Form */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-2 block">Current State</label>
                                    <select
                                        value={mood}
                                        onChange={(e) => setMood(e.target.value)}
                                        className="w-full bg-dark-card border-2 border-gray-700 rounded-sm p-3 text-white font-mono focus:border-neon-purple focus:ring-0 focus:shadow-[0_0_10px_rgba(179,0,255,0.3)] transition-all"
                                    >
                                        <option>Stressed</option>
                                        <option>Anxious</option>
                                        <option>Overwhelmed</option>
                                        <option>Imposter Syndrome</option>
                                        <option>Burned Out</option>
                                        <option>Angry</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-2 block">Intensity ({stress}%)</label>
                                    <input
                                        type="range" min="0" max="100"
                                        value={stress}
                                        onChange={(e) => setStress(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-700 rounded-sm appearance-none cursor-pointer accent-neon-purple mt-3"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-2 block">What is burdening you?</label>
                                <textarea
                                    value={blocker}
                                    onChange={(e) => setBlocker(e.target.value)}
                                    placeholder="I feel like I'm failing because..."
                                    className="w-full h-32 bg-dark-card border-2 border-gray-700 rounded-sm p-4 text-white font-mono focus:border-neon-purple focus:ring-0 focus:shadow-[0_0_10px_rgba(179,0,255,0.3)] resize-none transition-all placeholder:text-gray-600"
                                />
                            </div>

                            <button
                                onClick={handleReflect}
                                disabled={loading || !blocker.trim()}
                                className="w-full py-4 bg-neon-purple text-white hover:bg-neon-purple/80 rounded-sm font-mono font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(179,0,255,0.3)]"
                            >
                                {loading ? 'Communing with Logic...' : 'Seek Clarity'}
                            </button>
                        </div>
                    </div>
                )}

                {coaching && (
                    <div className="flex-1 flex flex-col items-center animate-in fade-in duration-1000">

                        {breathing && (
                            <div className="mb-12 relative">
                                <div
                                    className="w-48 h-48 rounded-full border-2 border-neon-purple/50 bg-dark-card backdrop-blur-sm flex items-center justify-center transition-transform duration-[4s] ease-in-out shadow-[0_0_30px_rgba(179,0,255,0.2)]"
                                    style={{ transform: `scale(${breathScale})` }}
                                >
                                    <span className="text-xs font-mono uppercase tracking-widest text-neon-purple">
                                        {breathScale > 1.2 ? 'Exhale' : 'Inhale'}
                                    </span>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <Wind size={24} className="text-neon-purple/30 opacity-50" />
                                </div>
                            </div>
                        )}

                        <div className="text-center space-y-8 max-w-lg">

                            {/* Quote */}
                            <div className="relative py-8">
                                <span className="absolute top-0 left-0 text-4xl text-neon-purple/30">&quot;</span>
                                <p className="text-xl text-white font-mono italic leading-relaxed">
                                    {coaching.stoicQuote}
                                </p>
                                <span className="absolute bottom-0 right-0 text-4xl text-neon-purple/30">&quot;</span>
                            </div>

                            {/* Reframe */}
                            <div className="bg-dark-card border-l-4 border-neon-purple p-6 text-left rounded-sm">
                                <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">The Perspective Shift</h3>
                                <p className="text-gray-300 font-mono leading-relaxed">{coaching.reframing}</p>
                            </div>

                            {/* Action */}
                            <div>
                                <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
                                    <Zap size={12} className="text-neon-lime" /> One Small Step
                                </h3>
                                <div className="inline-block border-2 border-gray-700 px-8 py-4 rounded-sm text-white font-mono hover:bg-dark-card hover:border-neon-cyan/50 transition-colors cursor-default">
                                    {coaching.actionableStep}
                                </div>
                            </div>

                            <button
                                onClick={() => { setCoaching(null); setBreathing(false); setBlocker(''); }}
                                className="text-xs font-mono text-gray-500 hover:text-neon-cyan uppercase tracking-widest mt-12 block mx-auto transition-colors"
                            >
                                Clear Mind & Return
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
