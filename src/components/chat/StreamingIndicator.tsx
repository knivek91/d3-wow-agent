import { Badge } from '#/components/ui/badge.tsx'
import type { AgentType } from '#/types/agent.ts'

interface StreamingIndicatorProps {
  agentType: AgentType
}

export default function StreamingIndicator({ agentType }: StreamingIndicatorProps) {
  const isD3 = agentType === 'd3'
  const icon = isD3 ? '🐉' : '🐻'
  const name = isD3 ? 'D3' : 'WoW'
  const accentColor = isD3 ? '#ff6600' : '#00ff88'

  return (
    <div className="flex items-start w-full mb-4">
      <div className="flex flex-col">
        <div className="mb-1.5 ml-1">
          <Badge
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full"
            style={{
              backgroundColor: isD3 ? 'rgba(255,102,0,0.1)' : 'rgba(0,255,136,0.1)',
              color: accentColor,
            }}
          >
            {icon} {name} Agent
          </Badge>
        </div>
        <div className="rounded-2xl rounded-tl-md px-5 py-3 bg-card">
          <div className="flex items-center gap-1.5" style={{ color: accentColor }}>
            <span className="text-sm">{icon}</span>
            <span className="text-sm text-muted-foreground">
              {name} está pensando
            </span>
            <span className="flex items-center gap-1 ml-1">
              <span className="streaming-dot w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: accentColor }} />
              <span className="streaming-dot w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: accentColor }} />
              <span className="streaming-dot w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: accentColor }} />
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
