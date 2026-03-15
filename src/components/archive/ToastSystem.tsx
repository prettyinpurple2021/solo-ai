
import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, Info, Zap, Trophy } from 'lucide-react';
import { ToastMessage } from '../types';
import { subscribeToToasts } from '../services/gameService';

export const ToastSystem: React.FC = () => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        return subscribeToToasts((toast) => {
            setToasts(prev => [toast, ...prev].slice(0, 5)); // Keep max 5

            // Auto dismiss
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== toast.id));
            }, 4000);
        });
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-50 flex flex-col gap-3 pointer-events-none items-center md:items-end">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`pointer-events-auto w-full md:w-auto md:min-w-[300px] max-w-md bg-black border rounded-lg shadow-2xl p-4 relative overflow-hidden animate-in slide-in-from-bottom-full md:slide-in-from-right-full fade-in duration-300
                        ${toast.type === 'success' ? 'border-emerald-500/50' :
                            toast.type === 'error' ? 'border-red-500/50' :
                                toast.type === 'xp' ? 'border-amber-500/50 bg-amber-950/10' :
                                    'border-zinc-700'}
                    `}
                >
                    {/* Progress Bar Background for XP */}
                    {toast.type === 'xp' && (
                        <div className="absolute bottom-0 left-0 h-1 bg-amber-500 animate-[width_4s_linear_forwards]" style={{ width: '100%' }}></div>
                    )}

                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full shrink-0
                            ${toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                                toast.type === 'error' ? 'bg-red-500/10 text-red-500' :
                                    toast.type === 'xp' ? 'bg-amber-500/10 text-amber-500' :
                                        'bg-zinc-800 text-zinc-400'}
                        `}>
                            {toast.type === 'success' && <CheckCircle2 size={18} />}
                            {toast.type === 'error' && <AlertTriangle size={18} />}
                            {toast.type === 'xp' && <Trophy size={18} />}
                            {toast.type === 'info' && <Info size={18} />}
                        </div>

                        <div className="flex-1">
                            <h4 className={`text-xs font-bold uppercase tracking-widest mb-1
                                ${toast.type === 'xp' ? 'text-amber-500' : 'text-white'}
                            `}>
                                {toast.title}
                            </h4>
                            <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                                {toast.message}
                            </p>
                            {toast.type === 'xp' && toast.xpAmount && (
                                <div className="mt-2 text-xs font-bold text-amber-400 flex items-center gap-1">
                                    <Zap size={12} fill="currentColor" /> +{toast.xpAmount} XP
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-zinc-600 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
