import { Slide } from "@/hooks/use-pitch-deck"
import { Plus, Trash2, GripVertical } from "lucide-react"

interface SlideSidebarProps {
  slides: Slide[]
  activeSlideId: string | null
  onSelectSlide: (id: string) => void
  onAddSlide: () => void
  onDeleteSlide?: (id: string) => void
}

export function SlideSidebar({ 
  slides, 
  activeSlideId, 
  onSelectSlide, 
  onAddSlide,
  onDeleteSlide 
}: SlideSidebarProps) {
  return (
    <aside className="w-64 border-r border-gray-800 bg-black/40 flex flex-col h-full">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/60 backdrop-blur-sm">
        <span className="font-mono text-sm text-gray-400 font-bold tracking-wider">SLIDES</span>
        <button 
          onClick={onAddSlide}
          className="p-1.5 rounded bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20 hover:text-white transition-all border border-neon-cyan/30"
          title="Add New Slide"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {slides.map((slide, idx) => {
          const isActive = activeSlideId === slide.id
          
          return (
            <div 
              key={slide.id}
              onClick={() => onSelectSlide(slide.id)}
              className={`
                group relative p-3 rounded-lg cursor-pointer border transition-all duration-200
                hover:shadow-[0_0_15px_rgba(0,0,0,0.5)]
                ${isActive 
                  ? 'bg-neon-cyan/5 border-neon-cyan shadow-[0_0_10px_rgba(11,228,236,0.1)]' 
                  : 'bg-[#0f1115] border-gray-800 hover:border-gray-600'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1 min-w-[20px]">
                   <span className={`font-mono text-xs ${isActive ? 'text-neon-cyan' : 'text-gray-600'}`}>
                     {(idx + 1).toString().padStart(2, '0')}
                   </span>
                   <GripVertical className="w-3 h-3 text-gray-700 opacity-0 group-hover:opacity-100 cursor-grab" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium truncate mb-1 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
                    {slide.title || 'Untitled Slide'}
                  </h4>
                  {slide.layout && (
                    <span className="text-[10px] text-gray-600 uppercase tracking-widest bg-black/40 px-1.5 py-0.5 rounded">
                      {slide.layout}
                    </span>
                  )}
                </div>

                {isActive && onDeleteSlide && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteSlide(slide.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              
              {/* Active Indicator Line */}
              {isActive && (
                <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-neon-cyan rounded-r-full shadow-[0_0_8px_rgba(11,228,236,0.8)]" />
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
