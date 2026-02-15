"use client";

import { TheWarRoom } from '@/components/TheWarRoom';

export default function WarRoomPage() {
    return (
        <div className="min-h-screen bg-black/90 p-6 relative">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none" />
            <div className="max-w-7xl mx-auto relative z-10">
                <TheWarRoom />
            </div>
        </div>
    );
}
