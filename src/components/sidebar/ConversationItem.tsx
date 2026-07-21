import { cn } from '#/lib/utils.ts'
import { type AgentType, AGENT_OPTIONS } from '#/types/agent.ts'
import { Trash2 } from 'lucide-react'

interface ConversationItemProps {
  id: string
  title: string
  agentType: AgentType
  isActive: boolean
  onClick: () => void
  onDelete: () => void
}

export default function ConversationItem({
  id,
  title,
  agentType,
  isActive,
  onClick,
  onDelete,
}: ConversationItemProps) {
  const option = AGENT_OPTIONS.find((o) => o.value === agentType)

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm w-full justify-start font-normal',
        isActive
          ? 'bg-secondary text-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      )}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      onClick={onClick}
    >
      <span className="flex-shrink-0 text-xs">{option?.icon}</span>
      <span className="flex-1 truncate text-left">{title}</span>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        className="hidden group-hover:flex group-focus-within:flex flex-shrink-0 w-6 h-6 rounded items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        title="Eliminar conversación"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
