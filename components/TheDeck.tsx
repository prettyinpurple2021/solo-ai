import React, { useState } from 'react';
import { Presentation, RefreshCcw, Download, Layout, ChevronRight, ChevronLeft, FileText, MonitorPlay, Save } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { PitchDeck, Slide } from '../types';
import { addXP, showToast } from '../services/gameService';
import { soundService } from '../services/soundService';
import { downloadMarkdown } from '../services/exportService';
import { storageService } from '../services/storageService';

export const TheDeck: React.FC = () => {
    const [deck, setDeck] = useState<PitchDeck | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(false);

    const saveToVault = async (newDeck: PitchDeck) => {

        const deckWithId = { ...newDeck, id: newDeck.id || `deck-${Date.now()}` };
        await storageService.savePitchDeck(deckWithId);
    };

    const handleGenerate = async () => {
        setLoading(true);
        soundService.playClick();
        const result = await geminiService.generatePitchDeck();
        if (result) {
            // Assign ID
            result.id = `deck-${Date.now()}`;

            setDeck(result);
            await saveToVault(result);
            setCurrentSlide(0);

            const { leveledUp } = await addXP(100);
            showToast("DECK GENERATED", "Saved to The Vault.", "xp", 100);
            if (leveledUp) showToast("RANK UP!", "You have reached a new founder level.", "success");
            soundService.playSuccess();
        } else {
            showToast("GENERATION FAILED", "Could not create deck.", "error");
            soundService.playError();
        }
        setLoading(false);
    };

    const handleNext = () => {
        if (!deck) return;
        if (currentSlide < deck.slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
            soundService.playClick();
        }
    };

    const handlePrev = () => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
            soundService.playClick();
        }
    };

    const handleExport = () => {
        if (!deck) return;
        let content = `# ${deck.title}\nGenerated: ${new Date(deck.generatedAt).toLocaleDateString()}\n\n`;
        deck.slides.forEach((slide, i) => {
            content += `## Slide ${i + 1}: ${slide.title}\n`;
            content += `**Key Takeaway:** ${slide.keyPoint}\n\n`;
            content += `**Content:**\n${slide.content.map(c => `- ${c}`).join('\n')}\n\n`;
            content += `**Visual:** [${slide.visualIdea}]\n\n---\n\n`;
        });
        downloadMarkdown('Pitch_Deck_Outline', content);
        showToast("EXPORT COMPLETE", "Deck downloaded as Markdown.", "info");
    };

    return (
        <div className="min-h-[85vh] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-800 pb-6 gap-4 md:gap-0">
                <div>
                    <div className="flex items-center gap-2 text-purple-500 font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <Presentation size={14} /> Investor Relations
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter">THE DECK</h2>
                    <p className="text-zinc-400 mt-2">AI-generated pitch deck outlines and narrative flow.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    {deck && (
                        <button
                            onClick={handleExport}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white rounded font-bold text-xs uppercase tracking-wider transition-all flex-1 md:flex-initial"
                        >
                            <Download size={16} /> Export
                        </button>
                    )}
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-900/20 hover:bg-purple-900/40 border border-purple-500/50 text-purple-400 rounded font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-1 md:flex-initial"
                    >
                        {loading ? <RefreshCcw size={16} className="animate-spin" /> : <Layout size={16} />}
                        {loading ? 'Drafting...' : 'Generate Deck'}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col justify-center items-center relative">

                {!deck && !loading && (
                    <div className="text-center opacity-50 text-zinc-500">
                        <MonitorPlay size={64} strokeWidth={1} className="mx-auto mb-4" />
                        <p className="font-mono uppercase tracking-widest">No Deck Loaded</p>
                    </div>
                )}

                {loading && (
                    <div className="text-center text-purple-500">
                        <div className="w-16 h-16 border-4 border-purple-900/30 rounded-full border-t-purple-500 animate-spin mx-auto mb-4"></div>
                        <p className="font-mono uppercase tracking-widest animate-pulse">Architecting Narrative...</p>
                    </div>
                )}

                {deck && (
                    <div className="w-full max-w-4xl relative">
                        {/* Save Indicator */}
                        <div className="absolute -top-8 right-0 flex items-center gap-2 text-[10px] font-bold uppercase text-emerald-500 animate-in fade-in slide-in-from-bottom-2">
                            <Save size={12} /> Auto-Saved to Vault
                        </div>

                        {/* Controls */}
                        <div className="flex justify-between absolute top-1/2 -translate-y-1/2 w-full -ml-4 md:-ml-16 px-2 md:px-0 z-20 pointer-events-none">
                            <button
                                onClick={handlePrev}
                                disabled={currentSlide === 0}
                                className="pointer-events-auto p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-purple-500 disabled:opacity-30 disabled:hover:border-zinc-800 transition-all shadow-xl"
                            >
                                <ChevronLeft size={24} />
                            </button>

                            <button
                                onClick={handleNext}
                                disabled={currentSlide === deck.slides.length - 1}
                                className="pointer-events-auto p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-purple-500 disabled:opacity-30 disabled:hover:border-zinc-800 transition-all shadow-xl translate-x-8 md:translate-x-0"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        {/* Slide Card */}
                        <div className="bg-white text-black aspect-auto md:aspect-video rounded-xl p-6 md:p-12 shadow-2xl flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-500 key={currentSlide}">

                            <div className="absolute top-0 left-0 w-2 h-full bg-purple-600"></div>
                            <div className="absolute bottom-6 right-8 text-zinc-400 font-mono text-xs uppercase">
                                Slide {currentSlide + 1}/{deck.slides.length} {'//'} {deck.title}
                            </div>

                            <h1 className="text-4xl font-black tracking-tight mb-2 text-zinc-900">
                                {deck.slides[currentSlide].title}
                            </h1>
                            <p className="text-purple-600 font-bold text-lg mb-8 uppercase tracking-wider flex items-center gap-2">
                                <Layout size={18} /> {deck.slides[currentSlide].keyPoint}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 flex-1">
                                <div className="space-y-4">
                                    {deck.slides[currentSlide].content.map((point, i) => (
                                        <div key={i} className="flex items-start gap-3 text-lg text-zinc-700 leading-relaxed">
                                            <span className="mt-1.5 w-2 h-2 bg-zinc-900 rounded-full shrink-0"></span>
                                            {point}
                                        </div>
                                    ))}
                                </div>

                                {/* Visual Placeholder */}
                                <div className="bg-zinc-100 border-2 border-dashed border-zinc-300 rounded-lg flex flex-col items-center justify-center p-6 text-center text-zinc-400">
                                    <FileText size={32} className="mb-2 opacity-50" />
                                    <p className="text-xs font-bold uppercase tracking-widest mb-2 text-zinc-500">Visual Concept</p>
                                    <p className="text-sm italic">"{deck.slides[currentSlide].visualIdea}"</p>
                                </div>
                            </div>
                        </div>

                        {/* Slide Strip Navigation */}
                        <div className="flex justify-center gap-2 mt-8">
                            {deck.slides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentSlide(i)}
                                    className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-purple-500' : 'bg-zinc-800 hover:bg-zinc-600'}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};