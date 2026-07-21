import { cn } from '#/lib/utils.ts'
import { Badge } from '#/components/ui/badge.tsx'
import { type AgentType, AGENT_OPTIONS } from '#/types/agent.ts'

interface AgentBadgeProps {
  agentType: AgentType
  model?: string
  tokens?: number
  duration?: string
}

export default function AgentBadge({ agentType, model, tokens, duration }: AgentBadgeProps) {
  const option = AGENT_OPTIONS.find((o) => o.value === agentType)
  if (!option) return null

  return (
    <Badge
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full',
        agentType === 'd3'
          ? 'bg-(--accent-d3-bg) text-(--accent-d3)'
          : 'bg-(--accent-wow-bg) text-(--accent-wow)'
      )}
    >
      <span>{option.icon}</span>
      <span>{option.label}</span>
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
