import { cn } from '#/lib/utils.ts'
import { Badge } from '#/components/ui/badge.tsx'
import { type AgentType, AGENT_OPTIONS } from '#/types/agent.ts'

interface StreamingIndicatorProps {
  agentType: AgentType
}

export default function StreamingIndicator({ agentType }: StreamingIndicatorProps) {
  const option = AGENT_OPTIONS.find((o) => o.value === agentType)
  if (!option) return null

  return (
    <div className="flex items-start w-full mb-4">
      <div className="flex flex-col">
        <div className="mb-1.5 ml-1">
          <Badge
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full',
              agentType === 'd3'
                ? 'bg-(--accent-d3-bg) text-(--accent-d3)'
                : 'bg-(--accent-wow-bg) text-(--accent-wow)'
            )}
          >
            {option.icon} {option.label} Agent
          </Badge>
        </div>
        <div className="rounded-2xl rounded-tl-md px-5 py-3 bg-card">
          <div className={cn('flex items-center gap-1.5', agentType === 'd3' ? 'text-(--accent-d3)' : 'text-(--accent-wow)')}>
            <span className="text-sm">{option.icon}</span>
            <span className="text-sm text-muted-foreground">
              {option.label} está pensando
            </span>
            <span className="flex items-center gap-1 ml-1">
              <span className={cn('streaming-dot w-1.5 h-1.5 rounded-full inline-block', agentType === 'd3' ? 'bg-(--accent-d3)' : 'bg-(--accent-wow)')} />
              <span className={cn('streaming-dot w-1.5 h-1.5 rounded-full inline-block', agentType === 'd3' ? 'bg-(--accent-d3)' : 'bg-(--accent-wow)')} />
              <span className={cn('streaming-dot w-1.5 h-1.5 rounded-full inline-block', agentType === 'd3' ? 'bg-(--accent-d3)' : 'bg-(--accent-wow)')} />
            </span>
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground/60">
            groq · llama-3.3
          </div>
        </div>
      </div>
    </div>
  )
}
