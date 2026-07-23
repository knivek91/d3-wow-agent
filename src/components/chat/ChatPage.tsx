import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
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
import type { AgentType } from '#/types/agent.ts'
import { useSession } from '#/lib/auth-client.js'

interface ChatState {
  conversations: Conversation[]
  activeId: string | undefined
  messages: Message[]
  streaming: boolean
  loading: boolean
  sidebarCollapsed: boolean
  error: string | null
  errorRecoverable: boolean
}

const initialState: ChatState = {
  conversations: [],
  activeId: undefined,
  messages: [],
  streaming: false,
  loading: true,
  sidebarCollapsed: false,
  error: null,
  errorRecoverable: false,
}

export default function ChatPage() {
  const navigate = useNavigate()
  const { data: session, isPending: sessionLoading } = useSession()
  const [state, setState] = useState<ChatState>(initialState)
  const currentAgent = useRef<AgentType>('d3')

  useEffect(() => {
    if (!sessionLoading && !session) {
      navigate({ to: '/auth/login' })
    }
  }, [session, sessionLoading, navigate])

  const update = useCallback((patch: Partial<ChatState>) => {
    setState((prev) => ({ ...prev, ...patch }))
  }, [])

  const fetchConversations = useCallback(async () => {
    try {
      const data = await listConversations()
      update({ conversations: data })
    } catch (err) {
      console.error('[ChatPage] Failed to fetch conversations:', err)
      update({ error: 'No se pudieron cargar las conversaciones', errorRecoverable: true })
    }
  }, [update])

  useEffect(() => {
    async function init() {
      update({ loading: true })
      try {
        const data = await listConversations()
        update({
          conversations: data,
          activeId: data.length > 0 ? data[0].id : undefined,
        })
      } catch (err) {
        console.error('[ChatPage] Failed to initialize:', err)
        update({ error: 'No se pudieron cargar las conversaciones', errorRecoverable: true })
      } finally {
        update({ loading: false })
      }
    }
    init()
  }, [update])

  useEffect(() => {
    if (!state.activeId) {
      update({ messages: [] })
      return
    }
    async function load() {
      try {
        const data = await listMessages(state.activeId!)
        const conv = state.conversations.find((c) => c.id === state.activeId)
        if (conv) currentAgent.current = conv.agentType
        update({ messages: data })
      } catch (err) {
        console.error('[ChatPage] Failed to load messages:', err)
        update({ messages: [], error: 'No se pudieron cargar los mensajes', errorRecoverable: true })
      }
    }
    load()
  }, [state.activeId, state.conversations, update])

  const handleSelectConversation = useCallback((id: string) => {
    update({ activeId: id, error: null })
  }, [update])

  const handleNewChat = useCallback(async () => {
    try {
      const agent = currentAgent.current
      const conv = await createConversation(agent)
      update({
        conversations: [conv, ...state.conversations],
        activeId: conv.id,
        messages: [],
        error: null,
      })
    } catch (err) {
      console.error('[ChatPage] Failed to create conversation:', err)
      update({ error: 'No se pudo crear la conversación', errorRecoverable: true })
    }
  }, [state.conversations, update])

  const handleDeleteConversation = useCallback(async (id: string) => {
    try {
      await deleteConversation(id)
      const remaining = state.conversations.filter((c) => c.id !== id)
      update({
        conversations: remaining,
        activeId: state.activeId === id
          ? (remaining.length > 0 ? remaining[0].id : undefined)
          : state.activeId,
      })
    } catch (err) {
      console.error('[ChatPage] Failed to delete conversation:', err)
      update({ error: 'No se pudo eliminar la conversación', errorRecoverable: true })
    }
  }, [state.conversations, state.activeId, update])

  const handleSend = useCallback(async (message: string, agentType: AgentType) => {
    update({ error: null })
    currentAgent.current = agentType

    let convId = state.activeId

    if (!convId) {
      try {
        const conv = await createConversation(agentType)
        update({
          conversations: [conv, ...state.conversations],
          activeId: conv.id,
        })
        convId = conv.id
      } catch (err) {
        console.error('[ChatPage] Failed to create conversation:', err)
        update({ error: 'No se pudo crear la conversación', errorRecoverable: true })
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
    update({ messages: [...state.messages, tempUserMsg], streaming: true })

    try {
      const res = await sendMessage(convId, message, agentType)
      const assistantMsg: Message = {
        id: res.id,
        conversationId: res.conversationId,
        role: 'assistant',
        content: res.content,
        agentType,
      }
      update({
        messages: [
          ...state.messages.filter((m) => m.id !== tempUserMsg.id),
          { ...tempUserMsg, id: res.conversationId + '-user-' + Date.now() },
          assistantMsg,
        ],
        streaming: false,
      })
      await fetchConversations()
    } catch (err) {
      console.error('[ChatPage] Failed to send message:', err)
      const msg = err instanceof Error ? err.message : 'Error al procesar el mensaje'
      update({ streaming: false, error: msg, errorRecoverable: true })
    }
  }, [state.activeId, state.conversations, state.messages, fetchConversations, update])

  const handleRetry = useCallback(() => {
    update({ error: null })
  }, [update])

  const handleToggleCollapse = useCallback(() => {
    update({ sidebarCollapsed: !state.sidebarCollapsed })
  }, [state.sidebarCollapsed, update])

  const showEmptyState = !state.loading && !state.activeId && state.messages.length === 0 && !state.error

  const handleSelectAgent = useCallback((agent: AgentType) => {
    currentAgent.current = agent
    handleNewChat()
  }, [handleNewChat])

  return (
    <div className="fixed inset-0 grid grid-cols-[auto_1fr] grid-rows-[1fr] overflow-hidden bg-background">
      <Sidebar
        conversations={state.conversations}
        activeId={state.activeId}
        onSelect={handleSelectConversation}
        onNewChat={handleNewChat}
        onDelete={handleDeleteConversation}
        collapsed={state.sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      <div className="flex flex-col min-w-0 min-h-0">
        {/* Content area */}
        <div className="flex-1 overflow-auto min-h-0">
          {state.loading && (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">Cargando conversaciones...</span>
              </div>
            </div>
          )}

          {showEmptyState && (
            <EmptyState onSelectAgent={handleSelectAgent} />
          )}

          {state.error && (
            <ErrorMessage
              message={state.error}
              recoverable={state.errorRecoverable}
              onRetry={handleRetry}
            />
          )}

          {!state.loading && !state.error && state.activeId && (
            <MessageList
              messages={state.messages}
              streaming={state.streaming}
              currentAgent={currentAgent.current}
            />
          )}
        </div>

        {/* ChatInput */}
        <div className="shrink-0">
          {!state.loading && !state.error && (
            <ChatInput
              onSend={handleSend}
              disabled={state.streaming}
              defaultAgent={currentAgent.current}
            />
          )}
        </div>
      </div>
    </div>
  )
}
