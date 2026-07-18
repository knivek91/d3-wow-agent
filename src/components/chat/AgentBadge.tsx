import { cn } from '../../lib/utils'

interface AgentBadgeProps {
  agentType: 'd3' | 'wow'
  model?: string
  tokens?: number
  duration?: string
}

export default function AgentBadge({ agentType, model, tokens, duration }: AgentBadgeProps) {
  const isD3 = agentType === 'd3'
  const icon = isD3 ? '🐉' : '🐻'
  const name = isD3 ? 'Diablo III' : 'World of Warcraft'
  const accentColor = isD3 ? '#ff6600' : '#00ff88'
  const bgOpacity = isD3 ? 'rgba(255,102,0,0.1)' : 'rgba(0,255,136,0.1)'

  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
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
    </div>
  )
}
