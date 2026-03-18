import { Slide, SlideComponent } from "@/hooks/use-pitch-deck"
import { motion, PanInfo } from "framer-motion"
import { useState, useRef, useEffect } from "react"
import { GripHorizontal, Trash2 } from "lucide-react"

interface CanvasProps {
  slide: Slide | null
  scale?: number
  onUpdateComponent?: (componentId: string, updates: Partial<SlideComponent>) => void
  onDeleteComponent?: (componentId: string) => void
  selectedId?: string | null
  onSelectComponent?: (id: string | null) => void
}

export function Canvas({ slide, scale = 1, onUpdateComponent, onDeleteComponent, selectedId, onSelectComponent }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

  // Deselect on clicking background
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectComponent?.(null)
    }
  }

  // Handle Keyboard Delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!selectedId) return
        
        // Don't delete if editing text (handled in component) or if input focused
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA' || (document.activeElement as HTMLElement).isContentEditable) {
            return
        }

        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (selectedId) {
                onDeleteComponent?.(selectedId)
                onSelectComponent?.(null)
            }
        }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, onDeleteComponent, onSelectComponent])

  if (!slide) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 font-mono">
        Select a slide to edit
      </div>
    )
  }

  // 16:9 Aspect Ratio Base Size
  const BASE_WIDTH = 960
  const BASE_HEIGHT = 540

  return (
    <div 
        className="flex-1 overflow-auto flex items-center justify-center p-8 bg-black/20"
        onClick={handleBackgroundClick}
    >
      <div 
        ref={canvasRef}
        className="bg-white text-black shadow-2xl relative transition-transform duration-200"
        style={{
          width: BASE_WIDTH,
          height: BASE_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'center center' // Better zoom behavior
        }}
        onClick={handleBackgroundClick}
      >
        {/* Grid/Guides */}
        <div className="absolute inset-0 pointer-events-none opacity-10" 
             style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
        />

        {/* Components */}
        {slide.components && slide.components.length > 0 ? (
          slide.components.map((comp) => (
             <ComponentRenderer 
                key={comp.id} 
                component={comp} 
                isSelected={selectedId === comp.id}
                onSelect={() => onSelectComponent?.(comp.id)}
                onUpdate={(updates) => onUpdateComponent?.(comp.id, updates)}
                onDelete={() => {
                    onDeleteComponent?.(comp.id)
                    onSelectComponent?.(null)
                }}
                scale={scale}
             />
          ))
        ) : (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="text-gray-300 font-mono text-sm border-2 border-dashed border-gray-200 p-8 rounded">
                Empty Slide
             </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface ComponentRendererProps {
    component: SlideComponent
    isSelected: boolean
    onSelect: () => void
    onUpdate: (updates: Partial<SlideComponent>) => void
    onDelete: () => void
    scale: number
}

function ComponentRenderer({ component, isSelected, onSelect, onUpdate, onDelete, scale }: ComponentRendererProps) {
    const { position, style, type, content } = component
    const [isEditing, setIsEditing] = useState(false)
    const textRef = useRef<HTMLDivElement>(null)
    const renderedText = typeof content === 'object' && 'text' in content ? String(content.text ?? '') : ''
    
    // Convert 0-360 rotation to style
    const rotate = position.rotation || 0

    // Handle Drag End
    const onDragEnd = (event: any, info: PanInfo) => {
        onUpdate({
            position: {
                ...position,
                x: position.x + info.offset.x,
                y: position.y + info.offset.y
            }
        })
    }

    const handleDoubleClick = () => {
        if (type === 'text') {
            setIsEditing(true)
        }
    }

    // Effect to focus when editing starts
    useEffect(() => {
        if (isEditing && textRef.current) {
            textRef.current.focus()
        }
    }, [isEditing])

    const handleBlur = () => {
        if (isEditing) {
            setIsEditing(false)
            if (textRef.current) {
                // Determine if content is string or object structure
                // API expects { text: "string" } usually for text components based on addComponent usage in page.tsx
                const newText = textRef.current.innerText
                onUpdate({ content: { ...content, text: newText } })
            }
        }
    }

    return (
        <motion.div
            className={`absolute group ${isEditing ? 'cursor-text ring-2 ring-neon-purple z-50' : 'cursor-move'} ${isSelected && !isEditing ? 'ring-2 ring-neon-cyan z-50' : 'hover:ring-1 hover:ring-blue-300'}`}
            style={{
                left: position.x,
                top: position.y,
                width: position.width,
                height: position.height,
                rotate: rotate,
                zIndex: component.zIndex,
                ...style
            }}
            onClick={(e) => {
                e.stopPropagation()
                onSelect()
            }}
            onDoubleClick={handleDoubleClick}
            drag={!isEditing} // Disable drag when editing
            dragMomentum={false} 
            onDragEnd={onDragEnd}
            whileDrag={{ scale: 1.02, opacity: 0.8, cursor: 'grabbing' }}
        >
            {/* Visual Content */}
            <div className="w-full h-full overflow-hidden relative">
                {type === 'text' && (
                    isEditing ? (
                        <div 
                            ref={textRef}
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={handleBlur}
                            className="w-full h-full p-2 whitespace-pre-wrap outline-none select-text cursor-text bg-white text-black ring-2 ring-neon-purple rounded-sm"
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    e.currentTarget.blur()
                                }
                            }}
                        >
                            {typeof content === 'object' && 'text' in content ? content.text : ''}
                        </div>
                    ) : (
                        <div 
                            className="w-full h-full p-2 whitespace-pre-wrap outline-none pointer-events-none"
                        >
                            {renderedText}
                        </div>
                    )
                )}
                {type === 'image' && (
                    <img src={typeof content === 'object' && 'url' in content ? content.url : ''} alt="Slide element" className="w-full h-full object-cover pointer-events-none" />
                )}
                {type === 'shape' && (
                    <div className="w-full h-full" style={{ backgroundColor: style.fill || '#ccc' }} />
                )}
            </div>

            {/* Selection/Resize Handles (Only when selected AND NOT editing) */}
            {isSelected && !isEditing && (
                <>
                    {/* Visual Handles */}
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-neon-cyan" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-neon-cyan" />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-neon-cyan" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-neon-cyan" />
                    
                    {/* Rotation Handle */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border border-neon-cyan rounded-full flex items-center justify-center cursor-ew-resize">
                        <div className="w-1 h-1 bg-neon-cyan rounded-full" />
                    </div>

                    {/* Delete Action (Floating above) */}
                    <div 
                        onMouseDown={(e) => {
                            e.stopPropagation() // Prevent dragging
                            onDelete()
                        }}
                        className="absolute -top-8 right-0 bg-red-500 text-white p-1 rounded cursor-pointer hover:bg-red-600 shadow-md transform hover:scale-110 transition-all"
                        title="Delete (Backspace)"
                    >
                        <Trash2 className="w-3 h-3" />
                    </div>
                </>
            )}
        </motion.div>
    )
}
