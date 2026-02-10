"use client"

import { usePitchDeck } from "@/hooks/use-pitch-deck"
import { NeuralNetworkCanvas } from "@/components/cyber/NeuralNetworkCanvas"
import { UIOverlayLines } from "@/components/cyber/UIOverlayLines"
import { HudBorder } from "@/components/cyber/HudBorder"
import { CyberButton } from "@/components/cyber/CyberButton"
import { Loader2, Save, Play, ChevronLeft, Plus } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { toast } from "sonner"

import { SlideSidebar } from "@/components/pitch-deck/editor/slide-sidebar"
import { Canvas } from "@/components/pitch-deck/editor/canvas"
import { Toolbar } from "@/components/pitch-deck/editor/toolbar"
import { PropertiesPanel } from "@/components/pitch-deck/editor/properties-panel"

interface EditorPageProps {
  params: Promise<{ id: string }>
}

export default function PitchDeckEditor({ params }: EditorPageProps) {
  const [deckId, setDeckId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    // Unwrap params
    params.then(p => setDeckId(p.id))
    setMounted(true)
  }, [params])

  // Only invoke hook if we have an ID, otherwise pass empty string to avoid errors/maximize defined behavior
  const { deck, loading, error, updateSlide, addSlide, addComponent, updateComponent } = usePitchDeck(deckId || '')
  const [activeSlideId, setActiveSlideId] = useState<string | null>(null)

  // Set first slide as active when deck loads
  useEffect(() => {
    if (deck?.slides.length && !activeSlideId) {
        setActiveSlideId(deck.slides[0].id)
    }
  }, [deck, activeSlideId])

  if (!mounted || !deckId || loading) {
     return (
        <div className="relative min-h-[calc(100vh-4rem)] bg-cyber-black flex items-center justify-center">
             <NeuralNetworkCanvas />
             <UIOverlayLines />
             <HudBorder className="p-8 text-center bg-black/50 backdrop-blur-sm">
                <Loader2 className="w-8 h-8 text-neon-cyan animate-spin mx-auto mb-4" />
                <p className="text-neon-cyan font-mono">Loading Editor...</p>
             </HudBorder>
        </div>
     )
  }

  if (error || !deck) {
    return (
        <div className="relative min-h-[calc(100vh-4rem)] bg-cyber-black flex items-center justify-center">
            <NeuralNetworkCanvas />
            <HudBorder className="p-8 text-center border-neon-pink">
                <p className="text-neon-pink font-mono mb-4">Error: {error || 'Deck not found'}</p>
                <div className="flex gap-4 justify-center">
                    <Link href="/dashboard/pitch-builder">
                         <CyberButton>Return to Operations</CyberButton>
                    </Link>
                </div>
            </HudBorder>
        </div>
    )
  }

  // Find active slide object
  const activeSlide = deck.slides.find(s => s.id === activeSlideId) || deck.slides[0]

  return (
    <div className="relative h-[calc(100vh-0rem)] lg:h-[calc(100vh-0rem)] flex flex-col bg-dark-bg text-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          <NeuralNetworkCanvas />
          <div className="absolute inset-0 bg-black/40" /> {/* Dimmer */}
      </div>
      
      {/* Top Bar */}
      <header className="h-14 border-b border-gray-800 bg-black/80 backdrop-blur-md flex items-center justify-between px-4 z-20 shrink-0">
        <div className="flex items-center gap-4">
            <Link href="/dashboard/pitch-builder">
                <button className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded">
                    <ChevronLeft className="w-5 h-5" />
                </button>
            </Link>
            <div>
                <h1 className="font-orbitron font-bold text-sm md:text-base text-gray-200">{deck.title}</h1>
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${deck.status === 'draft' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                        {deck.status} • {deck.slides.length} Slides
                    </p>
                </div>
            </div>
        </div>

        <div className="flex items-center gap-2">
             {/* Future: Add collaborative cursors here */}
            <CyberButton size="sm" variant="outline" onClick={() => toast.info('Saving...')} className="h-8 text-xs">
                <Save className="w-3 h-3 mr-2" />
                Save
            </CyberButton>
            <CyberButton size="sm" variant="primary" onClick={() => toast.success('Presenting (Demo)')} className="h-8 text-xs">
                <Play className="w-3 h-3 mr-2" />
                Present
            </CyberButton>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden z-10">
        
        {/* Left Sidebar */}
        <SlideSidebar 
            slides={deck.slides}
            activeSlideId={activeSlideId}
            onSelectSlide={setActiveSlideId}
            onAddSlide={() => addSlide()}
            onDeleteSlide={(id) => toast.error("Delete not implemented yet")}
        />

        {/* Center Canvas Area */}
        <main className="flex-1 bg-[#1a1a1a] relative flex flex-col shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
            <Toolbar 
                onAddText={() => addComponent(activeSlide.id, 'text', { text: 'Double click to edit' })}
                onAddImage={() => addComponent(activeSlide.id, 'image', { src: '/placeholder-image.jpg' })}
                onAddShape={() => addComponent(activeSlide.id, 'shape', { type: 'rectangle' })}
                onGenerateAI={() => toast.info("AI Generate")}
                onSave={() => toast.success("Saved")}
                onPresent={() => {}}
            />

            <Canvas 
                slide={activeSlide} 
                scale={0.8} // Default zoom
                onUpdateComponent={(compId, updates) => updateComponent(activeSlide.id, compId, updates)}
            />
            
            {/* Zoom Controls (Floating) */}
            <div className="absolute bottom-4 right-4 bg-black/80 border border-gray-700 rounded-md p-1 flex gap-2 text-xs font-mono text-gray-400">
                <button className="px-2 hover:text-white">-</button>
                <span>80%</span>
                <button className="px-2 hover:text-white">+</button>
            </div>
        </main>

        {/* Right Sidebar */}
        {/* Right Sidebar */}
        <PropertiesPanel 
            activeSlide={activeSlide} 
            onUpdateComponent={(compId, updates) => updateComponent(activeSlide.id, compId, updates)}
            onAddComponent={(type, content) => addComponent(activeSlide.id, type, content)}
        />

      </div>
    </div>
  )
}
