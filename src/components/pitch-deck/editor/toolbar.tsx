import { Type, Image, Square, PieChart, Wand2, MonitorPlay, Save } from "lucide-react"

interface ToolbarProps {
  onAddText: () => void
  onAddImage: () => void
  onAddShape: () => void
  onGenerateAI: () => void
  onSave: () => void
  onPresent: () => void
}

export function Toolbar({ 
  onAddText, 
  onAddImage, 
  onAddShape, 
  onGenerateAI,
  onSave,
  onPresent
}: ToolbarProps) {
  return (
    <div className="h-12 border-b border-gray-800 bg-[#0a0a0a] flex items-center px-4 justify-between">
      
      {/* Insert Tools */}
      <div className="flex items-center gap-1">
        <ToolButton icon={Type} label="Text" onClick={onAddText} />
        <ToolButton icon={Image} label="Image" onClick={onAddImage} />
        <ToolButton icon={Square} label="Shape" onClick={onAddShape} />
        <ToolButton icon={PieChart} label="Chart" onClick={() => {}} disabled />
      </div>

      {/* AI Tools */}
      <div className="flex items-center gap-2 px-4 border-l border-r border-gray-800">
         <button 
           onClick={onGenerateAI}
           className="flex items-center gap-2 px-3 py-1.5 rounded bg-neon-purple/10 text-neon-purple hover:bg-neon-purple/20 transition-colors text-xs font-bold font-mono border border-neon-purple/30"
         >
            <Wand2 className="w-3 h-3" />
            AI GENERATE
         </button>
      </div>

      {/* Action Tools */}
      <div className="flex items-center gap-1">
        <ToolButton icon={Save} label="Save" onClick={onSave} shortcut="Cmd+S" />
        <ToolButton icon={MonitorPlay} label="Present" onClick={onPresent} variant="primary" />
      </div>

    </div>
  )
}

function ToolButton({ 
  icon: Icon, 
  label, 
  onClick, 
  disabled = false, 
  variant = 'default',
  shortcut
}: { 
  icon: any, 
  label: string, 
  onClick: () => void, 
  disabled?: boolean,
  variant?: 'default' | 'primary'
  shortcut?: string
}) {
  const baseClasses = "flex flex-col items-center justify-center w-14 h-full gap-1 p-1 hover:bg-gray-800 transition-colors text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
  const primaryClasses = "bg-neon-cyan/10 text-neon-cyan hover:bg-neon-cyan/20 border-l border-r border-neon-cyan/20"

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={variant === 'primary' ? `${baseClasses} ${primaryClasses}` : baseClasses}
      title={shortcut ? `${label} (${shortcut})` : label}
    >
      <Icon className="w-4 h-4" />
      {/* <span className="text-[9px] font-mono uppercase">{label}</span> */}
    </button>
  )
}
