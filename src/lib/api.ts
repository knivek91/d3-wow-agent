import {
  listConversationsFn,
  createConversationFn,
  deleteConversationFn,
  listMessagesFn,
  sendMessageFn,
} from '../api/server-fns'
import type { AgentType } from '#/types/agent.ts'

export interface Conversation {
  id: string
  title: string
  agentType: AgentType
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  agentType: AgentType
  modelUsed?: string
  tokensUsed?: number
  createdAt?: string
}

export async function listConversations(): Promise<Conversation[]> {
  const result = await listConversationsFn()
  if (result.error) throw new Error(result.error)
  return result.data ?? []
}

export async function getConversation(id: string): Promise<Conversation> {
  const result = await listConversationsFn()
  if (result.error) throw new Error(result.error)
  const conv = result.data?.find((c: Conversation) => c.id === id)
  if (!conv) throw new Error('Conversation not found')
  return conv
}

export async function createConversation(agentType: AgentType, title?: string): Promise<Conversation> {
  const result = await createConversationFn({ data: { agentType, title: title || 'Nueva conversación' } })
  if (result.error) {
    console.error('createConversation server error:', result.error)
    throw new Error(result.error)
  }
  return result.data!
}

export async function deleteConversation(id: string): Promise<void> {
  const result = await deleteConversationFn({ data: { id } })
  if (result.error) throw new Error(result.error)
}

export async function listMessages(conversationId: string): Promise<Message[]> {
  const result = await listMessagesFn({ data: { conversationId } })
  if (result.error) throw new Error(result.error)
  return result.data ?? []
}

export async function sendMessage(
  conversationId: string,
  message: string,
  agentType: AgentType,
): Promise<{ id: string; content: string; conversationId: string }> {
  const result = await sendMessageFn({ data: { conversationId, message, agentType } })
  if (result.error) {
    console.error('sendMessage server error:', result.error)
    throw new Error(result.error)
  }
  return result.data!
}
