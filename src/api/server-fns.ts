import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { env } from 'cloudflare:workers'
import { createDb } from '../db/index'
import { conversations, messages } from '../db/schema'
import { eq, desc } from 'drizzle-orm'
import { runAgent } from '../lib/agents/base'
import { createLogger } from '../lib/observability/logger'
import { buildContext } from '../lib/agents/context'
import { createSharedTools } from '../lib/tools/index'

// DB binding from Cloudflare Workers environment
function getDb() {
  return createDb(env as { d3_wow_db: import('drizzle-orm/d1').DrizzleD1Database })
}

export const listConversationsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    try {
      const db = getDb()
      const all = await db.query.conversations.findMany({
        orderBy: [desc(conversations.updatedAt)],
      })
      return { data: all as any[], error: null }
    } catch (e) {
      console.error('[listConversationsFn error]', e)
      return { data: [], error: 'Failed to list conversations' }
    }
  })

export const createConversationFn = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      agentType: z.enum(['d3', 'wow']),
      title: z.string().default('New Conversation'),
    })
  )
  .handler(async ({ data }) => {
    try {
      const db = getDb()
      const id = crypto.randomUUID()
      await db.insert(conversations).values({
        id,
        title: data.title,
        agentType: data.agentType,
      })
      const conv = await db.query.conversations.findFirst({
        where: eq(conversations.id, id),
      })
      return { data: conv as any, error: null }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      console.error('[createConversationFn error]', msg)
      return { data: null, error: msg }
    }
  })

export const deleteConversationFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = getDb()
      await db.delete(conversations).where(eq(conversations.id, data.id))
      return { data: true, error: null }
    } catch (e) {
      return { data: false, error: 'Failed to delete conversation' }
    }
  })

export const listMessagesFn = createServerFn({ method: 'GET' })
  .validator(z.object({ conversationId: z.string() }))
  .handler(async ({ data }) => {
    try {
      const db = getDb()
      const msgs = await db.query.messages.findMany({
        where: eq(messages.conversationId, data.conversationId),
        orderBy: [messages.createdAt],
      })
      return { data: msgs as any[], error: null }
    } catch (e) {
      return { data: [], error: 'Failed to list messages' }
    }
  })

export const sendMessageFn = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      conversationId: z.string(),
      message: z.string().min(1),
      agentType: z.enum(['d3', 'wow']),
    })
  )
  .handler(async ({ data }) => {
    const { conversationId, message, agentType } = data
    const db = getDb()
    const requestId = crypto.randomUUID()
    const logger = createLogger(requestId)

    logger?.info({ agentType, conversationId, messageLength: message.length }, 'Processing chat message')

    try {
      const conv = await db.query.conversations.findFirst({
        where: eq(conversations.id, conversationId),
      })
      if (!conv) {
        return { data: null, error: 'Conversation not found' }
      }

      const history = await db.query.messages.findMany({
        where: eq(messages.conversationId, conversationId),
        orderBy: [messages.createdAt],
      })

      const userMessage = { role: 'user' as const, content: message }
      const contextMessages = buildContext([
        ...history.map((m: any) => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        })),
        userMessage,
      ])
      const tools = createSharedTools(env as any)

      const responseContent = await runAgent(contextMessages, agentType, tools, logger)

      const userMsgId = crypto.randomUUID()
      await db.insert(messages).values({
        id: userMsgId,
        conversationId,
        role: 'user',
        content: message,
        agentType,
      })

      const assistantId = crypto.randomUUID()
      await db.insert(messages).values({
        id: assistantId,
        conversationId,
        role: 'assistant',
        content: responseContent,
        agentType,
      })

      if (history.length === 0) {
        const title = message.length > 60 ? `${message.slice(0, 57)}...` : message
        await db
          .update(conversations)
          .set({ title, updatedAt: new Date().toISOString() })
          .where(eq(conversations.id, conversationId))
      } else {
        await db
          .update(conversations)
          .set({ updatedAt: new Date().toISOString() })
          .where(eq(conversations.id, conversationId))
      }

      return {
        data: { id: assistantId, content: responseContent, conversationId },
        error: null,
      }
    } catch (error) {
      logger?.error({ error }, 'Chat handler failed')
      return { data: null, error: 'Failed to process chat' }
    }
  })
