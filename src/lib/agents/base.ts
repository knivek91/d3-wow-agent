import { D3_SYSTEM_PROMPT } from "./d3-specialist";
import { WOW_SYSTEM_PROMPT } from "./wow-specialist";
import { callWithFallback } from "../llm/fallback";
import type { Logger } from "../observability/logger";
import type { AgentType } from "#/types/agent.ts";
import type { MessageRole, ChatMessage } from "#/types/message.ts";

export type { AgentType } from "#/types/agent.ts";

export interface AgentMessage {
  role: MessageRole
  content: string
}

export function buildSystemPrompt(agentType: AgentType): string {
  return agentType === "d3" ? D3_SYSTEM_PROMPT : WOW_SYSTEM_PROMPT;
}

export async function runAgent(
  messages: AgentMessage[],
  agentType: AgentType,
  groqApiKey: string,
  tools?: unknown[],
  logger?: Logger,
): Promise<string> {
  const systemPrompt = buildSystemPrompt(agentType);
  const fullMessages: AgentMessage[] = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  return callWithFallback(fullMessages, groqApiKey, logger);
}
