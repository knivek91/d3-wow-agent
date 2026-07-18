import { useState } from 'react'
import { cn } from '../../lib/utils'

interface ConversationItemProps {
  id: string
  title: string
  agentType: 'd3' | 'wow'
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
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm group',
        isActive
          ? 'bg-[#1c1e2e] text-[#f1f5f9]'
          : 'text-[#94a3b8] hover:bg-[#141624] hover:text-[#f1f5f9]',
      )}
    >
      <span className="flex-shrink-0 text-xs">{icon}</span>
      <span className="flex-1 truncate">{title}</span>
      {hovered && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-[#475569] hover:text-red-400 hover:bg-[#2a1b1b] transition-colors"
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
