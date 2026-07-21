import { useState } from 'react'
import { Button } from '#/components/ui/button.tsx'
import { cn } from '#/lib/utils.ts'
import type { AgentType } from '#/types/agent.ts'

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
  const [hovered, setHovered] = useState(false)
  const isD3 = agentType === 'd3'
  const icon = isD3 ? '🐉' : '🐻'

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm w-full justify-start font-normal',
        isActive
          ? 'bg-secondary text-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <span className="flex-shrink-0 text-xs">{icon}</span>
      <span className="flex-1 truncate text-left">{title}</span>
      {hovered && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Eliminar conversación"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  )
}
