import { Wand2, Layout, Type, Image as ImageIcon, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Slide, SlideComponent } from "@/hooks/use-pitch-deck"

interface PropertiesPanelProps {
  activeSlide: Slide | null
  onUpdateComponent: (componentId: string, updates: Partial<SlideComponent>) => void
  onAddComponent: (type: SlideComponent['type'], content: any) => void
}

export function PropertiesPanel({ activeSlide, onUpdateComponent, onAddComponent }: PropertiesPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  if (!activeSlide) {
    return (
        <aside className="w-72 border-l border-gray-800 bg-black/40 flex items-center justify-center">
            <p className="text-gray-500 font-mono text-xs">No Slide Selected</p>
        </aside>
    )
  }

  const handleRewrite = async () => {
    // Find text components
    const textComp = activeSlide.components.find(c => c.type === 'text')
    if (!textComp) {
        toast.error("No text to rewrite on this slide")
        return
    }

    setIsGenerating(true)
    try {
        const token = localStorage.getItem('authToken');
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) (headers as any)['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/ai/presentation/rewrite', {
            method: 'POST',
            headers,
            body: JSON.stringify({ 
                text: textComp.content.text || textComp.content,
                tone: 'persuasive' 
            })
        })
        
        if (!res.ok) throw new Error("Failed to rewrite")
        const data = await res.json()
        
        onUpdateComponent(textComp.id, { content: { ...textComp.content, text: data.rewritten } })
        toast.success("Text rewritten successfully")
    } catch (e) {
        toast.error("Failed to rewrite text")
    } finally {
        setIsGenerating(false)
    }
  }

  const handleSuggestImage = async () => {
      // Logic to suggest image based on slide context
      toast.info("Image suggestion coming soon")
  }

  return (
    <aside className="w-72 border-l border-gray-800 bg-black/40 flex flex-col h-full">
      {/* Tab Header (AI vs Properties) */}
      <div className="flex border-b border-gray-800">
        <button className="flex-1 py-3 text-xs font-bold font-mono text-neon-purple border-b-2 border-neon-purple bg-neon-purple/5">
            AI ASSISTANT
        </button>
        <button className="flex-1 py-3 text-xs font-bold font-mono text-gray-500 hover:text-white transition-colors">
            PROPERTIES
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* AI Context */}
        <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-400 font-mono flex items-center gap-2">
                <Wand2 className="w-3 h-3 text-neon-purple" />
                CONTEXT AWARENESS
            </h4>
            <div className="p-3 bg-neon-purple/5 border border-neon-purple/20 rounded-md text-xs text-gray-300">
                <p className="mb-2">I can help you improve this slide.</p>
                <div className="flex flex-col gap-2">
                    <button 
                        disabled={isGenerating}
                        onClick={handleRewrite}
                        className="text-left hover:text-white hover:bg-white/5 p-1 rounded transition-colors flex items-center gap-2"
                    >
                        {isGenerating ? <Loader2 className="w-3 h-3 animate-spin"/> : <span>✨</span>}
                        Rewrite content for impact
                    </button>
                    <button 
                        onClick={handleSuggestImage}
                        className="text-left hover:text-white hover:bg-white/5 p-1 rounded transition-colors"
                    >
                        🎨 Suggest matching image
                    </button>
                    <button className="text-left hover:text-white hover:bg-white/5 p-1 rounded transition-colors">
                        📊 Convert text to chart
                    </button>
                </div>
            </div>
        </div>

         {/* Quick Actions */}
         <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-400 font-mono">LAYOUTS</h4>
            <div className="grid grid-cols-2 gap-2">
                <button className="p-2 border border-gray-700 rounded hover:border-gray-500 flex flex-col items-center gap-1">
                    <Layout className="w-4 h-4 text-gray-400" />
                    <span className="text-[10px] text-gray-500">Title Only</span>
                </button>
                <button className="p-2 border border-gray-700 rounded hover:border-gray-500 flex flex-col items-center gap-1">
                    <div className="flex gap-0.5">
                        <Type className="w-3 h-3 text-gray-400" />
                        <ImageIcon className="w-3 h-3 text-gray-400" />
                    </div>
                    <span className="text-[10px] text-gray-500">Split</span>
                </button>
            </div>
         </div>
      </div>
    </aside>
  )
}
