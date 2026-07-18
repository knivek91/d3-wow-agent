import AgentBadge from './AgentBadge'
import { cn } from '../../lib/utils'

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  agentType?: 'd3' | 'wow'
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
  const formattedTime = createdAt
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
            ? 'bg-[#1c1e2e] text-[#f1f5f9] rounded-tr-md'
            : 'bg-[#141624] text-[#f1f5f9] rounded-tl-md',
        )}
      >
        {content}
      </div>
      <div className="flex items-center gap-2 mt-1 px-1">
        {!isUser && agentType && (
          <span className="text-[10px] text-[#475569]">
            {agentType === 'd3' ? '🐉 D3' : '🐻 WoW'}
          </span>
        )}
        {formattedTime && (
          <span className="text-[10px] text-[#475569]">{formattedTime}</span>
        )}
      </div>
    </div>
  )
}
