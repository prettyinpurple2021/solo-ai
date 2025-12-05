
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Activity, Radio, X, Volume2, Power } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { AGENTS, SYSTEM_INSTRUCTIONS } from '../constants';
import { AgentId } from '../types';
import { pcmToBase64, base64ToUint8Array, decodeAudioData } from '../utils/audioUtils';
import { soundService } from '../services/soundService';

const apiKey = process.env.API_KEY || '';

export const TheUplink: React.FC = () => {
    const [active, setActive] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<AgentId>(AgentId.ROXY);
    const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'speaking'>('disconnected');
    const [volume, setVolume] = useState(0); // For visualizer

    // Audio Context Refs
    const inputContextRef = useRef<AudioContext | null>(null);
    const outputContextRef = useRef<AudioContext | null>(null);
    const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sessionRef = useRef<any>(null); // Holds the active Gemini session

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, []);

    // Visualizer Loop
    useEffect(() => {
        if (status === 'disconnected') {
            setVolume(0);
            return;
        }

        const interval = setInterval(() => {
            if (status === 'speaking' || status === 'connected') {
                if (analyserRef.current) {
                    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
                    analyserRef.current.getByteFrequencyData(dataArray);
                    
                    // Calculate average volume
                    let sum = 0;
                    for (let i = 0; i < dataArray.length; i++) {
                        sum += dataArray[i];
                    }
                    const average = sum / dataArray.length;
                    
                    // Scale for visual effect (0-100 range roughly)
                    setVolume(Math.min(100, average * 2)); 
                } else {
                     // Fallback if analyser isn't ready yet
                     setVolume(Math.random() * 10);
                }
            } else {
                setVolume(5);
            }
        }, 50); // Faster update rate for smoother animation
        return () => clearInterval(interval);
    }, [status]);

    const connect = async () => {
        if (!apiKey) {
            alert("API Key missing");
            return;
        }

        setStatus('connecting');
        soundService.playClick();

        try {
            // 1. Setup Audio Contexts
            inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            // 2. Get Microphone Stream
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // 3. Init Gemini Client
            const ai = new GoogleGenAI({ apiKey });

            // 4. Prepare System Instruction (inject Context)
            const savedCtx = localStorage.getItem('solo_business_context');
            const businessContext = savedCtx ? JSON.parse(savedCtx).companyName : "the user's company";
            const instruction = `
                ${SYSTEM_INSTRUCTIONS[selectedAgent]}
                
                CONTEXT: You are speaking directly to the founder of ${businessContext} via a secure voice uplink.
                Keep responses concise, conversational, and sharp. Do not read out long lists.
                Act like a real executive on a call.
            `;

            // 5. Connect Live Session
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    systemInstruction: instruction,
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } // Using a generic good voice, map agents to voices if available
                    }
                },
                callbacks: {
                    onopen: async () => {
                        setStatus('connected');
                        soundService.playSuccess();

                        // Start Input Streaming
                        if (!inputContextRef.current) return;

                        inputSourceRef.current = inputContextRef.current.createMediaStreamSource(stream);
                        
                        // Setup Analyser
                        analyserRef.current = inputContextRef.current.createAnalyser();
                        analyserRef.current.fftSize = 256;
                        analyserRef.current.smoothingTimeConstant = 0.5;

                        processorRef.current = inputContextRef.current.createScriptProcessor(4096, 1, 1);

                        processorRef.current.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            const base64 = pcmToBase64(inputData);

                            // Send to Gemini
                            sessionPromise.then(session => {
                                session.sendRealtimeInput({
                                    media: {
                                        mimeType: 'audio/pcm;rate=16000',
                                        data: base64
                                    }
                                });
                            });
                        };

                        // Connect graph: Source -> Analyser -> Processor -> Destination
                        inputSourceRef.current.connect(analyserRef.current);
                        analyserRef.current.connect(processorRef.current);
                        processorRef.current.connect(inputContextRef.current.destination);
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;

                        if (audioData && outputContextRef.current) {
                            setStatus('speaking');
                            const ctx = outputContextRef.current;

                            // Decode
                            const buffer = await decodeAudioData(
                                base64ToUint8Array(audioData),
                                ctx,
                                24000,
                                1
                            );

                            // Schedule Playback
                            const source = ctx.createBufferSource();
                            source.buffer = buffer;
                            source.connect(ctx.destination);

                            // Seamless queuing
                            const now = ctx.currentTime;
                            const start = Math.max(now, nextStartTimeRef.current);
                            source.start(start);
                            nextStartTimeRef.current = start + buffer.duration;

                            source.onended = () => {
                                // Check if queue is empty to reset status, tricky in streaming.
                                // Just setting a timeout to idle if no new chunks come in
                                setTimeout(() => {
                                    if (ctx.currentTime >= nextStartTimeRef.current) {
                                        setStatus('connected');
                                    }
                                }, 100);
                            };
                        }

                        if (msg.serverContent?.interrupted) {
                            // Handle interruption (clear queue)
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onclose: () => {
                        disconnect();
                    },
                    onerror: (err) => {
                        console.error("Live API Error", err);
                        disconnect();
                    }
                }
            });

            sessionRef.current = sessionPromise;
            setActive(true);

        } catch (e) {
            console.error("Connection failed", e);
            disconnect();
            soundService.playError();
        }
    };

    const disconnect = () => {
        setActive(false);
        setStatus('disconnected');

        // Stop Tracks
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;

        // Disconnect Nodes
        inputSourceRef.current?.disconnect();
        processorRef.current?.disconnect();

        // Close Contexts
        inputContextRef.current?.close();
        outputContextRef.current?.close();

        // Close Session
        if (sessionRef.current) {
            sessionRef.current.then((session: any) => {
                try { session.close(); } catch (e) { console.warn("Session already closed"); }
            });
        }

        soundService.playClick();
    };

    return (
        <div className="min-h-[85vh] flex flex-col animate-in fade-in duration-500 relative overflow-hidden">
            {/* Ambient Background */}
            <div className={`absolute inset-0 transition-colors duration-1000 ${active ? 'bg-emerald-950/20' : 'bg-transparent'}`}></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            {/* Header */}
            <div className="relative z-10 mb-6 flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-800 pb-6 gap-4 md:gap-0">
                <div>
                    <div className="flex items-center gap-2 text-red-500 font-mono text-xs font-bold uppercase tracking-widest mb-2">
                        <Activity size={14} className={active ? 'animate-pulse' : ''} /> Secure Voice Line
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter">THE UPLINK</h2>
                    <p className="text-zinc-400 mt-2">Real-time, low-latency audio interface.</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    {active ? (
                        <button
                            onClick={disconnect}
                            className="flex items-center justify-center w-full md:w-auto gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-900/50 animate-pulse"
                        >
                            <Power size={16} /> Terminate Link
                        </button>
                    ) : (
                        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                            <select
                                value={selectedAgent}
                                onChange={(e) => setSelectedAgent(e.target.value as AgentId)}
                                className="bg-zinc-900 border border-zinc-800 text-white rounded px-4 py-2 text-xs font-bold uppercase tracking-wider focus:border-emerald-500 outline-none w-full md:w-auto"
                            >
                                {Object.values(AGENTS).map(a => (
                                    <option key={a.id} value={a.id}>{a.name} ({a.title})</option>
                                ))}
                            </select>
                            <button
                                onClick={connect}
                                className="flex items-center justify-center w-full md:w-auto gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20"
                            >
                                <Radio size={16} /> Initialize Uplink
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Visualizer Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10">

                {/* The Orb */}
                <div className="relative flex items-center justify-center mb-12">
                    {/* Outer Rings */}
                    <div className={`absolute border border-zinc-800 rounded-full transition-all duration-300 ${active ? 'w-96 h-96 opacity-50' : 'w-64 h-64 opacity-20'}`}></div>
                    <div className={`absolute border border-zinc-800 rounded-full transition-all duration-500 ${active ? 'w-[500px] h-[500px] opacity-30' : 'w-64 h-64 opacity-10'}`}></div>

                    {/* Core Pulse */}
                    <div
                        className={`relative rounded-full flex items-center justify-center transition-all duration-100 ease-out
                            ${status === 'speaking' ? 'bg-emerald-500 blur-2xl' : active ? 'bg-emerald-900/50 blur-xl' : 'bg-zinc-800 blur-md'}
                        `}
                        style={{
                            width: active ? `${150 + volume}px` : '100px',
                            height: active ? `${150 + volume}px` : '100px',
                            opacity: active ? 0.8 : 0.5
                        }}
                    >
                    </div>

                    {/* Sharp Center */}
                    <div className={`absolute w-32 h-32 rounded-full border-2 flex items-center justify-center transition-all
                        ${active ? 'border-emerald-500 bg-black' : 'border-zinc-700 bg-zinc-900'}
                    `}>
                        {active ? <Volume2 size={48} className="text-emerald-500" /> : <MicOff size={48} className="text-zinc-600" />}
                    </div>
                </div>

                {/* Status Text */}
                <div className="text-center space-y-2">
                    <h3 className={`text-2xl font-black uppercase tracking-tight ${active ? 'text-white' : 'text-zinc-600'}`}>
                        {status === 'disconnected' && "CHANNEL CLOSED"}
                        {status === 'connecting' && "ESTABLISHING HANDSHAKE..."}
                        {status === 'connected' && "LISTENING..."}
                        {status === 'speaking' && "INCOMING TRANSMISSION"}
                    </h3>

                    {active && (
                        <p className="text-emerald-500 font-mono text-xs uppercase tracking-widest animate-pulse">
                            Connected to {AGENTS[selectedAgent].name} {'//'} 24kHz Secure
                        </p>
                    )}
                </div>

            </div>

            {/* Footer Hints */}
            <div className="p-4 border-t border-zinc-800/50 text-center">
                <p className="text-[10px] text-zinc-600 font-mono uppercase">
                    Usage: Speak clearly. The agent can be interrupted at any time.
                </p>
            </div>
        </div>
    );
};
