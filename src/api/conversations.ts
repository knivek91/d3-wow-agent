import { z } from "zod";
import { createDb } from "../db/index";
import { conversations } from "../db/schema";
import { eq, desc } from "drizzle-orm";

const createConversationSchema = z.object({
  title: z.string().min(1).default("New Conversation"),
  agentType: z.enum(["d3", "wow"]),
});

const updateConversationSchema = z.object({
  title: z.string().min(1).optional(),
  agentType: z.enum(["d3", "wow"]).optional(),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;

export interface ConversationResponse {
  id: string;
  title: string;
  agentType: string;
  createdAt: string;
  updatedAt: string;
}

export async function listConversations(env: Env): Promise<ConversationResponse[]> {
  const db = createDb(env);
  const all = await db.query.conversations.findMany({
    orderBy: desc(conversations.updatedAt),
  });
  return all.map((c) => ({
    id: c.id,
    title: c.title,
    agentType: c.agentType,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));
}

export async function getConversation(env: Env, id: string): Promise<ConversationResponse | null> {
  const db = createDb(env);
  const conv = await db.query.conversations.findFirst({
    where: eq(conversations.id, id),
  });
  if (!conv) return null;
  return {
    id: conv.id,
    title: conv.title,
    agentType: conv.agentType,
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt,
  };
}

export async function createConversation(
  env: Env,
  input: CreateConversationInput,
): Promise<ConversationResponse> {
  const db = createDb(env);
  const id = crypto.randomUUID();
  await db.insert(conversations).values({
    id,
    title: input.title,
    agentType: input.agentType,
  });
  const conv = await db.query.conversations.findFirst({
    where: eq(conversations.id, id),
  })!;
  return {
    id: conv!.id,
    title: conv!.title,
    agentType: conv!.agentType,
    createdAt: conv!.createdAt,
    updatedAt: conv!.updatedAt,
  };
}

export async function updateConversation(
  env: Env,
  id: string,
  input: UpdateConversationInput,
): Promise<ConversationResponse | null> {
  const db = createDb(env);
  await db
    .update(conversations)
    .set({ ...input, updatedAt: "datetime('now')" })
    .where(eq(conversations.id, id));
  return getConversation(env, id);
}

export async function deleteConversation(env: Env, id: string): Promise<boolean> {
  const db = createDb(env);
  const result = await db.delete(conversations).where(eq(conversations.id, id));
  return (result as { meta: { changes: number } }).meta.changes > 0;
}
