import React, { useState } from 'react';
import { Paintbrush, Image as ImageIcon, Loader2, Download, Sparkles, Palette, Layers, Save } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { addXP, showToast } from '../services/gameService';
import { soundService } from '../services/soundService';
import { CreativeAsset } from '../types';

/**
 * TheStudio component following Cyberpunk Design System v3
 * Generative branding and visual asset forge
 */

const STYLES = [
    { id: 'cyberpunk', label: 'Cyberpunk / High Tech', desc: 'Neon, dark, futuristic, glowing' },
    { id: 'minimal', label: 'Minimalist / SaaS', desc: 'Clean lines, whitespace, flat colors' },
    { id: 'cinematic', label: 'Cinematic / Dramatic', desc: 'High contrast, moody lighting, realistic' },
    { id: 'sketch', label: 'Hand-Drawn / Sketch', desc: 'Artistic, rough lines, human touch' },
    { id: 'corporate', label: 'Corporate / Professional', desc: 'Safe, blue tones, stock photo vibe' }
];

export const TheStudio: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const saveToVault = (imageBase64: string) => {
        const newAsset: CreativeAsset = {
            id: `img-${Date.now()}`,
            url: '',
            prompt: prompt,
            style: selectedStyle.label,
            imageBase64: imageBase64,
            type: 'image',

            generatedAt: new Date().toISOString()
        };

        const savedRaw = localStorage.getItem('solo_creative_assets');
        const savedAssets: CreativeAsset[] = savedRaw ? JSON.parse(savedRaw) : [];
        localStorage.setItem('solo_creative_assets', JSON.stringify([newAsset, ...savedAssets]));
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setGeneratedImage(null);
        soundService.playClick();

        const result = await geminiService.generateBrandImage(prompt, selectedStyle.desc);

        if (result) {
            setGeneratedImage(result);
            saveToVault(result);

            const { leveledUp } = await addXP(60);
            showToast("ASSET CREATED", "Saved to The Vault.", "xp", 60);
            if (leveledUp) showToast("RANK UP!", "You have reached a new founder level.", "success");
            soundService.playSuccess();
        } else {
            showToast("RENDER FAILED", "Could not generate image.", "error");
            soundService.playError();
        }

        setLoading(false);
    };

    const handleDownload = () => {
        if (!generatedImage) return;
        const a = document.createElement('a');
        a.href = generatedImage;
        a.download = `solo_studio_asset_${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast("DOWNLOADING", "Asset saved to device.", "info");
    };

    return (
        <div className="min-h-[85vh] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between border-b border-gray-700 pb-6 gap-4 md:gap-0">
                <div>
                    <div className="flex items-center gap-2 text-neon-magenta font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <Palette size={14} /> Creative Suite
                    </div>
                    <h2 className="font-orbitron text-3xl md:text-4xl font-bold uppercase tracking-wider text-white">THE STUDIO</h2>
                    <p className="font-mono text-gray-400 mt-2">Generative branding and visual asset forge.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">

                {/* Controls */}
                <div className="space-y-6">
                    <div className="bg-dark-card border-2 border-gray-700 rounded-sm p-6">
                        <h3 className="text-xs font-orbitron font-bold text-neon-cyan uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Layers size={14} /> Style Matrix
                        </h3>
                        <div className="space-y-2">
                            {STYLES.map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => setSelectedStyle(style)}
                                    className={`w-full p-3 rounded-sm text-left border-2 transition-all flex items-center justify-between group
                                        ${selectedStyle.id === style.id
                                            ? 'bg-neon-magenta/10 border-neon-magenta/50 shadow-[0_0_10px_rgba(255,0,110,0.3)]'
                                            : 'bg-dark-bg border-gray-700 hover:border-gray-600'}
                                    `}
                                >
                                    <div>
                                        <div className={`text-sm font-mono font-bold ${selectedStyle.id === style.id ? 'text-neon-magenta' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                            {style.label}
                                        </div>
                                        <div className="text-[10px] text-gray-600 font-mono">{style.desc}</div>
                                    </div>
                                    {selectedStyle.id === style.id && <div className="w-2 h-2 bg-neon-magenta rounded-sm animate-pulse" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-dark-card border-2 border-gray-700 rounded-sm p-6">
                        <h3 className="text-xs font-orbitron font-bold text-neon-purple uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Sparkles size={14} /> Prompt
                        </h3>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the image you need (e.g., 'A sleek modern logo for a coffee startup' or 'Abstract background with blue gradients')..."
                            className="w-full h-32 bg-dark-bg border-2 border-gray-700 rounded-sm p-3 text-white placeholder:text-gray-500 focus:border-neon-magenta focus:outline-none focus:shadow-[0_0_10px_rgba(255,0,110,0.3)] resize-none font-mono text-sm"
                        />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading || !prompt.trim()}
                        className="w-full py-4 border-2 border-neon-magenta bg-neon-magenta/10 text-neon-magenta hover:bg-neon-magenta/20 hover:shadow-[0_0_20px_rgba(255,0,110,0.5)] rounded-sm font-mono font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <><Paintbrush size={18} /> Generate Asset</>}
                    </button>
                </div>

                {/* Canvas / Result */}
                <div className="lg:col-span-2 bg-dark-bg border-2 border-gray-700 rounded-sm overflow-hidden flex flex-col relative min-h-[500px]">
                    {/* Scanlines overlay */}
                    <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)] opacity-20" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

                    {!generatedImage && !loading && (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-700">
                            <ImageIcon size={64} strokeWidth={1} />
                            <p className="mt-4 font-mono uppercase tracking-widest text-sm">Canvas Empty</p>
                        </div>
                    )}

                    {loading && (
                        <div className="flex-1 flex flex-col items-center justify-center text-neon-magenta">
                            <div className="relative mb-8">
                                <div className="w-20 h-20 border-4 border-neon-magenta/30 rounded-sm animate-spin-slow"></div>
                                <div className="absolute inset-0 border-t-4 border-neon-magenta rounded-sm animate-spin"></div>
                            </div>
                            <div className="font-mono text-xs uppercase tracking-widest space-y-2 text-center">
                                <p className="animate-pulse">Synthesizing Visuals...</p>
                                <p className="text-gray-600">Applying {selectedStyle.id} Filter...</p>
                            </div>
                        </div>
                    )}

                    {generatedImage && (
                        <div className="relative flex-1 flex items-center justify-center p-8 animate-in zoom-in duration-500">
                            <img
                                src={generatedImage}
                                alt="Generated Asset"
                                className="max-w-full max-h-full rounded-sm shadow-[0_0_30px_rgba(255,0,110,0.3)] border-2 border-gray-700"
                            />

                            <div className="absolute bottom-4 right-4">
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center gap-2 px-6 py-3 bg-dark-card hover:bg-neon-cyan hover:text-dark-bg text-neon-cyan border-2 border-neon-cyan rounded-sm font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-xl"
                                >
                                    <Download size={16} /> Download
                                </button>
                            </div>

                            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-neon-lime/90 rounded-sm text-dark-bg text-[10px] font-mono font-bold uppercase">
                                <Save size={12} /> Saved to Vault
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};