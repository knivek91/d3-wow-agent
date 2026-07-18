import { z } from "zod";
import { createDb } from "../db/index";
import { conversations, messages } from "../db/schema";
import { eq } from "drizzle-orm";
import { runAgent } from "../lib/agents/base";
import { createLogger } from "../lib/observability/logger";
import { buildContext } from "../lib/agents/context";
import { createSharedTools } from "../lib/tools/index";

const chatInputSchema = z.object({
  conversationId: z.string().min(1),
  message: z.string().min(1),
  agentType: z.enum(["d3", "wow"]),
});

export type ChatInput = z.infer<typeof chatInputSchema>;

export interface ChatResponse {
  id: string;
  content: string;
  conversationId: string;
}

export async function handleChat(
  env: Env,
  input: unknown,
  requestId: string,
): Promise<Response> {
  const logger = createLogger(requestId);
  const parsed = chatInputSchema.safeParse(input);

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.issues }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { conversationId, message, agentType } = parsed.data;
  const db = createDb(env);

  const conv = await db.query.conversations.findFirst({
    where: eq(conversations.id, conversationId),
  });

  if (!conv) {
    return new Response(JSON.stringify({ error: "Conversation not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const history = await db.query.messages.findMany({
    where: eq(messages.conversationId, conversationId),
    orderBy: (msgs, { asc }) => [asc(msgs.createdAt)],
  });

  const userMessage = {
    role: "user" as const,
    content: message,
    agentType,
  };

  const contextMessages = buildContext([...history.map((m) => ({ role: m.role as "user" | "assistant" | "system", content: m.content })), userMessage]);
  const tools = createSharedTools(env);

  try {
    const responseContent = await runAgent(contextMessages, agentType, tools, logger);

    const msgId = crypto.randomUUID();
    await db.insert(messages).values({
      id: msgId,
      conversationId,
      role: "user",
      content: message,
      agentType,
    });

    const assistantId = crypto.randomUUID();
    await db.insert(messages).values({
      id: assistantId,
      conversationId,
      role: "assistant",
      content: responseContent,
      agentType,
    });

    if (history.length === 0) {
      const title = message.length > 60 ? `${message.slice(0, 57)}...` : message;
      await db
        .update(conversations)
        .set({ title, updatedAt: "datetime('now')" })
        .where(eq(conversations.id, conversationId));
    } else {
      await db
        .update(conversations)
        .set({ updatedAt: "datetime('now')" })
        .where(eq(conversations.id, conversationId));
    }

    return new Response(
      JSON.stringify({ id: assistantId, content: responseContent, conversationId }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    logger?.error({ error }, "Chat handler failed");
    return new Response(JSON.stringify({ error: "Failed to process chat" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
