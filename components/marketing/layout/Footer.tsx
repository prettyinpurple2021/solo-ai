import React from 'react';
import { useRouter } from 'next/navigation';

export function Footer() {
    const router = useRouter();

    return (
        <footer className="border-t border-white/5 bg-black/50 backdrop-blur-sm relative z-10 mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded flex items-center justify-center">
                                <span className="font-bold text-black text-xs">S</span>
                            </div>
                            <span className="font-bold text-lg tracking-tight text-white">SOLO_SUCCESS<span className="text-emerald-400">_AI</span></span>
                        </div>
                        <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
                            The complete operating system for solopreneurs.
                            Automate, execute, and scale your business with AI-powered tools designed for one-person empires.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-zinc-400">
                            <li><button onClick={() => router.push('/features')} className="hover:text-emerald-400 transition-colors">Features</button></li>
                            <li><button onClick={() => router.push('/pricing')} className="hover:text-emerald-400 transition-colors">Pricing</button></li>
                            <li><button onClick={() => router.push('/signup')} className="hover:text-emerald-400 transition-colors">Get Started</button></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-zinc-400">
                            <li><button onClick={() => router.push('/about')} className="hover:text-emerald-400 transition-colors">About Us</button></li>
                            <li><button onClick={() => router.push('/contact')} className="hover:text-emerald-400 transition-colors">Contact</button></li>
                            <li><button onClick={() => router.push('/privacy')} className="hover:text-emerald-400 transition-colors">Privacy Policy</button></li>
                            <li><button onClick={() => router.push('/terms')} className="hover:text-emerald-400 transition-colors">Terms of Service</button></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-zinc-500 text-sm">
                        © {new Date().getFullYear()} SoloSuccess AI. All rights reserved.
                    </div>
                    <div className="flex gap-6 text-sm text-zinc-500">
                        <button onClick={() => router.push('/privacy')} className="hover:text-zinc-300 transition-colors">Privacy</button>
                        <button onClick={() => router.push('/terms')} className="hover:text-zinc-300 transition-colors">Terms</button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
