import { Wand2, Layout, Type, Image as ImageIcon, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Slide, SlideComponent } from "@/hooks/use-pitch-deck"

interface PropertiesPanelProps {
  activeSlide: Slide | null
  selectedComponentId?: string | null
  onUpdateComponent: (componentId: string, updates: Partial<SlideComponent>) => void
  onAddComponent: (type: SlideComponent['type'], content: any) => void
}

export function PropertiesPanel({ activeSlide, selectedComponentId, onUpdateComponent, onAddComponent }: PropertiesPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'AI' | 'PROPERTIES'>('AI')

  // Switch to Properties tab automatically when a component is selected
  // usage of useEffect to react to selection changes
  // useEffect(() => {
  //   if (selectedComponentId) setActiveTab('PROPERTIES')
  // }, [selectedComponentId]) 
  // actually let's keep it manual or user preference for now, or maybe just default to properties if selected?

  if (!activeSlide) {
    return (
        <aside className="w-72 border-l border-gray-800 bg-black/40 flex items-center justify-center">
            <p className="text-gray-500 font-mono text-xs">No Slide Selected</p>
        </aside>
    )
  }

  const selectedComponent = activeSlide.components.find(c => c.id === selectedComponentId)

  const handleRewrite = async () => {
    // specific logic for rewrite
    const textComp = selectedComponent?.type === 'text' ? selectedComponent : activeSlide.components.find(c => c.type === 'text')
    
    if (!textComp) {
        toast.error("Select a text component to rewrite")
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
      toast.info("Image suggestion coming soon")
  }

  return (
    <aside className="w-72 border-l border-gray-800 bg-black/40 flex flex-col h-full">
      {/* Tab Header */}
      <div className="flex border-b border-gray-800">
        <button 
            onClick={() => setActiveTab('AI')}
            className={`flex-1 py-3 text-xs font-bold font-mono transition-colors ${activeTab === 'AI' ? 'text-neon-purple border-b-2 border-neon-purple bg-neon-purple/5' : 'text-gray-500 hover:text-white'}`}
        >
            AI ASSISTANT
        </button>
        <button 
            onClick={() => setActiveTab('PROPERTIES')}
            className={`flex-1 py-3 text-xs font-bold font-mono transition-colors ${activeTab === 'PROPERTIES' ? 'text-neon-cyan border-b-2 border-neon-cyan bg-neon-cyan/5' : 'text-gray-500 hover:text-white'}`}
        >
            PROPERTIES
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === 'AI' ? (
            <>
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
                                Rewrite selected text
                            </button>
                            <button 
                                onClick={handleSuggestImage}
                                className="text-left hover:text-white hover:bg-white/5 p-1 rounded transition-colors"
                            >
                                🎨 Suggest matching image
                            </button>
                        </div>
                    </div>
                </div>

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
            </>
        ) : (
            <>
                {selectedComponent ? (
                    <div className="space-y-4">
                        <div className="pb-2 border-b border-gray-800">
                            <p className="text-xs text-neon-cyan font-mono uppercase">{selectedComponent.type} PROPERTIES</p>
                        </div>

                        {selectedComponent.type === 'text' && (
                            <>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-400">Color</label>
                                    <input 
                                        type="color" 
                                        value={selectedComponent.style?.color || '#ffffff'}
                                        onChange={(e) => onUpdateComponent(selectedComponent.id, { style: { ...selectedComponent.style, color: e.target.value } })}
                                        className="w-full h-8 bg-transparent border border-gray-700 rounded cursor-pointer"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-400">Font Size</label>
                                    <input 
                                        type="range" 
                                        min="12" 
                                        max="72" 
                                        value={parseInt(selectedComponent.style?.fontSize) || 16}
                                        onChange={(e) => onUpdateComponent(selectedComponent.id, { style: { ...selectedComponent.style, fontSize: `${e.target.value}px` } })}
                                        className="w-fullaccent-neon-cyan"
                                    />
                                    <div className="text-right text-[10px] text-gray-500">{selectedComponent.style?.fontSize || '16px'}</div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-400">Background</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="color" 
                                            value={selectedComponent.style?.backgroundColor || '#000000'}
                                            onChange={(e) => onUpdateComponent(selectedComponent.id, { style: { ...selectedComponent.style, backgroundColor: e.target.value } })}
                                            className="w-8 h-8 rounded border border-gray-700 bg-transparent p-0"
                                        />
                                        <button 
                                            onClick={() => onUpdateComponent(selectedComponent.id, { style: { ...selectedComponent.style, backgroundColor: 'transparent' } })}
                                            className="text-[10px] text-gray-400 hover:text-white border border-gray-700 px-2 rounded"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {selectedComponent.type === 'shape' && (
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-400">Fill Color</label>
                                <input 
                                    type="color" 
                                    value={selectedComponent.style?.fill || '#cccccc'}
                                    onChange={(e) => onUpdateComponent(selectedComponent.id, { style: { ...selectedComponent.style, fill: e.target.value } })}
                                    className="w-full h-8 bg-transparent border border-gray-700 rounded cursor-pointer"
                                />
                            </div>
                        )}

                        <div className="pt-4 border-t border-gray-800">
                           <p className="text-[10px] text-gray-500 font-mono">
                                ID: {selectedComponent.id.slice(0, 8)}...
                                <br/>
                                X: {Math.round(selectedComponent.position.x)}, Y: {Math.round(selectedComponent.position.y)}
                           </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-center">
                        <Type className="w-8 h-8 opacity-20 mb-2" />
                        <p className="text-xs">Select an element on the canvas to edit its properties.</p>
                    </div>
                )}
            </>
        )}
      </div>
    </aside>
  )
}
