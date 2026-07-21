import AgentBadge from './AgentBadge'
import { cn } from '#/lib/utils.ts'
import { type AgentType, AGENT_OPTIONS } from '#/types/agent.ts'

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  agentType?: AgentType
  modelUsed?: string
  tokensUsed?: number
  createdAt?: string
}

export default function MessageBubble({
  role,
  content,
  agentType,
  modelUsed,
  tokensUsed,
  createdAt,
}: MessageBubbleProps) {
  const isUser = role === 'user'
  const agentOption = agentType ? AGENT_OPTIONS.find((o) => o.value === agentType) : undefined
  const formattedTime = createdAt && !isNaN(new Date(createdAt).getTime())
    ? new Date(createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    : undefined

  return (
    <div className={cn('flex flex-col w-full mb-4', isUser ? 'items-end' : 'items-start')}>
      {!isUser && agentType && (
        <div className="mb-1.5 ml-1">
          <AgentBadge
            agentType={agentType}
            model={modelUsed}
            tokens={tokensUsed}
          />
        </div>
      )}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3 whitespace-pre-wrap text-sm leading-relaxed',
          isUser
            ? 'bg-secondary text-foreground rounded-tr-md'
            : 'bg-card text-foreground rounded-tl-md',
        )}
      >
        {content}
      </div>
      <div className="flex items-center gap-2 mt-1 px-1">
        {!isUser && agentType && (
          <span className="text-[10px] text-muted-foreground">
            {agentOption?.icon} {agentOption?.label}
          </span>
        )}
        {formattedTime && (
          <span className="text-[10px] text-muted-foreground">{formattedTime}</span>
        )}
      </div>
    </div>
  )
}
