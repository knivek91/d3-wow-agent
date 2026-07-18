import { useRef, useEffect } from 'react'
import MessageBubble from './MessageBubble'
import StreamingIndicator from './StreamingIndicator'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  agentType?: 'd3' | 'wow'
  modelUsed?: string
  tokensUsed?: number
  createdAt?: string
}

interface MessageListProps {
  messages: Message[]
  streaming?: boolean
  currentAgent?: 'd3' | 'wow'
}

export default function MessageList({ messages, streaming, currentAgent = 'd3' }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  if (messages.length === 0) return null

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-1">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            agentType={msg.agentType}
            modelUsed={msg.modelUsed}
            tokensUsed={msg.tokensUsed}
            createdAt={msg.createdAt}
          />
        ))}
        {streaming && <StreamingIndicator agentType={currentAgent} />}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
