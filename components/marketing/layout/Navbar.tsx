import React from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function Navbar() {
    const router = useRouter();
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
            <div
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => router.push('/')}
            >
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                    <span className="font-bold text-black text-lg">S</span>
                </div>
                <span className="font-bold text-xl tracking-tight text-white">SOLO_SUCCESS<span className="text-emerald-400">_AI</span></span>
            </div>

            <div className="hidden md:flex items-center gap-8">
                <NavLink label="Features" path="/features" isActive={isActive('/features')} onClick={() => router.push('/features')} />
                <NavLink label="Pricing" path="/pricing" isActive={isActive('/pricing')} onClick={() => router.push('/pricing')} />
                <NavLink label="About" path="/about" isActive={isActive('/about')} onClick={() => router.push('/about')} />
                <NavLink label="Contact" path="/contact" isActive={isActive('/contact')} onClick={() => router.push('/contact')} />
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push('/login')}
                    className="hidden sm:block px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                    Log In
                </button>
                <button
                    onClick={() => router.push('/signup')}
                    className="px-4 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95"
                >
                    Get Started
                </button>
            </div>
        </nav>
    );
}

function NavLink({ label, path, isActive, onClick }: { label: string, path: string, isActive: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`text-sm font-medium transition-colors ${isActive ? 'text-emerald-400' : 'text-zinc-400 hover:text-white'
                }`}
        >
            {label}
        </button>
    );
}
