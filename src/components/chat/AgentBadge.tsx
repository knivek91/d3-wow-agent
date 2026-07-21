import { cn } from '#/lib/utils.ts'
import { Badge } from '#/components/ui/badge.tsx'
import type { AgentType } from '#/types/agent.ts'

interface AgentBadgeProps {
  agentType: AgentType
  model?: string
  tokens?: number
  duration?: string
}

export default function AgentBadge({ agentType, model, tokens, duration }: AgentBadgeProps) {
  const isD3 = agentType === 'd3'
  const icon = isD3 ? '🐉' : '🐻'
  const name = isD3 ? 'Diablo III' : 'World of Warcraft'
  const accentColor = isD3 ? 'var(--accent-d3)' : 'var(--accent-wow)'
  const bgOpacity = isD3 ? 'var(--accent-d3-bg)' : 'var(--accent-wow-bg)'

  return (
    <Badge
      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full"
      style={{ backgroundColor: bgOpacity, color: accentColor }}
    >
      <span>{icon}</span>
      <span>{name}</span>
      {model && (
        <span className="opacity-60 ml-1 text-[10px]">· {model}</span>
      )}
      {tokens !== undefined && (
        <span className="opacity-60 text-[10px]">· {tokens} tok</span>
      )}
      {duration && (
        <span className="opacity-60 text-[10px]">· {duration}</span>
      )}
    </Badge>
  )
}
