"use client"

import { usePitchDecks } from "@/hooks/use-pitch-decks"
import { NeuralNetworkCanvas } from "@/components/cyber/NeuralNetworkCanvas"
import { UIOverlayLines } from "@/components/cyber/UIOverlayLines"
import { HudBorder } from "@/components/cyber/HudBorder"
import { CyberButton } from "@/components/cyber/CyberButton"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Plus, Layout, Calendar, ArrowRight, Loader2, Trash2, Edit } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

export default function PitchDeckDashboard() {
  const { decks, loading, error, createDeck, deleteDeck } = usePitchDecks()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    try {
      setIsCreating(true)
      const title = `Untitled Deck ${new Date().toLocaleDateString()}`
      await createDeck(title)
    } catch (error) {
       // Error handled in hook
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault() // Prevent navigation if button is inside Link (though we structure it outside)
    if (confirm('Are you sure you want to delete this deck?')) {
        await deleteDeck(id)
    }
  }

  if (loading) {
     return (
        <div className="relative min-h-screen bg-cyber-black flex items-center justify-center">
             <NeuralNetworkCanvas />
             <UIOverlayLines />
             <HudBorder className="p-8 text-center bg-black/50 backdrop-blur-sm">
                <Loader2 className="w-8 h-8 text-neon-cyan animate-spin mx-auto mb-4" />
                <p className="text-neon-cyan font-mono">Initializing Deck Protocols...</p>
             </HudBorder>
        </div>
     )
  }

  if (error) {
    return (
        <div className="relative min-h-screen bg-cyber-black flex items-center justify-center">
            <NeuralNetworkCanvas />
            <HudBorder className="p-8 text-center border-neon-pink">
                <p className="text-neon-pink font-mono mb-4">Connection Failed: {error}</p>
                <CyberButton onClick={() => window.location.reload()}>Retry</CyberButton>
            </HudBorder>
        </div>
    )
  }

  return (
    <main className="relative min-h-screen bg-dark-bg text-white overflow-hidden p-6 md:p-10">
      <NeuralNetworkCanvas />
      <UIOverlayLines />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-neon-cyan/10 border border-neon-cyan/50 flex items-center justify-center shadow-[0_0_15px_rgba(11,228,236,0.3)]">
                        <Layout className="w-6 h-6 text-neon-cyan" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-orbitron font-bold text-white tracking-wide">
                        Pitch Deck Operations
                    </h1>
                </div>
                <p className="text-gray-400 font-mono text-sm max-w-xl">
                    Architect your vision using AI-powered presentation systems.
                </p>
            </div>
            <CyberButton 
                variant="primary" 
                onClick={handleCreate}
                disabled={isCreating}
                className="w-full md:w-auto"
            >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Initialize New Deck
            </CyberButton>
        </header>

        {/* Deck Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.length === 0 ? (
                <div className="col-span-full py-20 text-center">
                    <HudBorder className="inline-block p-10 bg-black/30">
                        <Layout className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-orbitron text-gray-300 mb-2">No Active Operations</h3>
                        <p className="text-gray-500 font-mono mb-6">Start a new pitch deck to begin.</p>
                        <CyberButton onClick={handleCreate} disabled={isCreating}>
                            Create First Deck
                        </CyberButton>
                    </HudBorder>
                </div>
            ) : (
                decks.map((deck, idx) => (
                    <motion.div
                        key={deck.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Link href={`/dashboard/pitch-builder/${deck.id}`}>
                            <HudBorder 
                                variant="hover" 
                                className="h-full flex flex-col justify-between group cursor-pointer bg-black/40 hover:bg-black/60 transition-colors"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <Badge variant="outline" className="font-mono text-xs border-neon-purple text-neon-purple rounded-sm">
                                            v1.0
                                        </Badge>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                className="p-1 hover:text-neon-pink transition-colors"
                                                onClick={(e) => handleDelete(e, deck.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-xl font-orbitron font-bold text-white mb-2 group-hover:text-neon-cyan transition-colors truncate">
                                        {deck.title}
                                    </h3>
                                    
                                    <div className="flex items-center gap-2 text-xs text-gray-400 font-mono mb-4">
                                        <Calendar className="w-3 h-3" />
                                        <span>{new Date(deck.updatedAt).toLocaleDateString()}</span>
                                        <span className="text-gray-600">|</span>
                                        <span>{deck.status}</span>
                                    </div>
                                </div>

                                <div className="px-6 py-4 border-t border-gray-800 bg-black/20 flex justify-between items-center">
                                    <span className="text-xs text-gray-500 font-mono">
                                        AUTO-SAVED
                                    </span>
                                    <div className="flex items-center text-neon-cyan text-sm font-bold opacity-70 group-hover:opacity-100 transition-opacity">
                                        ACCESS <ArrowRight className="w-4 h-4 ml-1" />
                                    </div>
                                </div>
                            </HudBorder>
                        </Link>
                    </motion.div>
                ))
            )}
        </div>
      </div>
    </main>
  )
}
