import { useState, useEffect, useCallback, useRef } from 'react'
import Sidebar from '../sidebar/Sidebar'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import EmptyState from './EmptyState'
import ErrorMessage from './ErrorMessage'
import {
  listConversations,
  createConversation,
  deleteConversation,
  listMessages,
  sendMessage,
  type Conversation,
  type Message,
} from '../../lib/api'

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | undefined>()
  const [messages, setMessages] = useState<Message[]>([])
  const [streaming, setStreaming] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorRecoverable, setErrorRecoverable] = useState(false)
  const currentAgent = useRef<'d3' | 'wow'>('d3')

  const fetchConversations = useCallback(async () => {
    try {
      const data = await listConversations()
      setConversations(data)
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    async function init() {
      setLoading(true)
      try {
        const data = await listConversations()
        setConversations(data)
        if (data.length > 0) {
          setActiveId(data[0].id)
        }
      } catch {
        // no conversations yet
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (!activeId) {
      setMessages([])
      return
    }
    async function load() {
      try {
        const data = await listMessages(activeId)
        setMessages(data)
        const conv = conversations.find((c) => c.id === activeId)
        if (conv) currentAgent.current = conv.agentType
      } catch {
        setMessages([])
      }
    }
    load()
  }, [activeId, conversations])

  const handleSelectConversation = useCallback((id: string) => {
    setActiveId(id)
    setError(null)
  }, [])

  const handleNewChat = useCallback(async () => {
    try {
      const agent = currentAgent.current
      const conv = await createConversation(agent)
      setConversations((prev) => [conv, ...prev])
      setActiveId(conv.id)
      setMessages([])
      setError(null)
    } catch (err) {
      console.error('handleNewChat error:', err)
      setError('No se pudo crear la conversación')
      setErrorRecoverable(true)
    }
  }, [])

  const handleDeleteConversation = useCallback(async (id: string) => {
    try {
      await deleteConversation(id)
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (activeId === id) {
        setConversations((prev) => {
          if (prev.length > 0) {
            setActiveId(prev[0].id)
          } else {
            setActiveId(undefined)
          }
          return prev
        })
      }
    } catch {
      setError('No se pudo eliminar la conversación')
      setErrorRecoverable(true)
    }
  }, [activeId])

  const handleSend = useCallback(async (message: string, agentType: 'd3' | 'wow') => {
    console.log('[ChatPage] handleSend', { message, agentType, activeId, error })
    setError(null)
    currentAgent.current = agentType

    let convId = activeId

    if (!convId) {
      try {
        const conv = await createConversation(agentType)
        setConversations((prev) => [conv, ...prev])
        convId = conv.id
        setActiveId(conv.id)
      } catch {
        setError('No se pudo crear la conversación')
        setErrorRecoverable(true)
        return
      }
    }

    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      conversationId: convId,
      role: 'user',
      content: message,
      agentType,
    }
    setMessages((prev) => [...prev, tempUserMsg])
    setStreaming(true)

    try {
      const res = await sendMessage(convId, message, agentType)
      console.log('[ChatPage] sendMessage response', { res, streaming })
      const assistantMsg: Message = {
        id: res.id,
        conversationId: res.conversationId,
        role: 'assistant',
        content: res.content,
        agentType,
      }
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== tempUserMsg.id)
          .concat([
            { ...tempUserMsg, id: res.conversationId + '-user-' + Date.now() },
            assistantMsg,
          ]),
      )
      setStreaming(false)
      await fetchConversations()
    } catch (err) {
      setStreaming(false)
      const msg = err instanceof Error ? err.message : 'Error al procesar el mensaje'
      setError(msg)
      setErrorRecoverable(true)
    }
  }, [activeId, fetchConversations])

  const handleRetry = useCallback(() => {
    setError(null)
  }, [])

  const handleToggleCollapse = useCallback(() => {
    setSidebarCollapsed((prev) => !prev)
  }, [])

  const showEmptyState = !loading && !activeId && messages.length === 0 && !error

  const handleSelectAgent = useCallback((agent: 'd3' | 'wow') => {
    currentAgent.current = agent
    handleNewChat()
  }, [handleNewChat])

  return (
    <div className="flex h-full w-full bg-[#0f1117]">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelectConversation}
        onNewChat={handleNewChat}
        onDelete={handleDeleteConversation}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#00cc66] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-[#475569]">Cargando conversaciones...</span>
            </div>
          </div>
        )}

        {showEmptyState && (
          <EmptyState onSelectAgent={handleSelectAgent} />
        )}

        {error && (
          <ErrorMessage
            message={error}
            recoverable={errorRecoverable}
            onRetry={handleRetry}
          />
        )}

        {!loading && !error && activeId && (
          <MessageList
            messages={messages}
            streaming={streaming}
            currentAgent={currentAgent.current}
          />
        )}

        {!loading && !error && (
          <ChatInput
            onSend={handleSend}
            disabled={streaming}
            defaultAgent={currentAgent.current}
          />
        )}
      </div>
    </div>
  )
}
