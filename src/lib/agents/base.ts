import { D3_SYSTEM_PROMPT } from "./d3-specialist";
import { WOW_SYSTEM_PROMPT } from "./wow-specialist";
import { callWithFallback } from "../llm/fallback";
import type { Logger } from "../observability/logger";
import type { AgentType } from "#/types/agent.ts";
import type { MessageRole, ChatMessage } from "#/types/message.ts";

export type { AgentType } from "#/types/agent.ts";

export interface AgentMessage {
	role: MessageRole;
	content: string;
}

/**
 * Returns the system prompt for the given agent type.
 * @param agentType - "d3" for D3 specialist, "wow" for WoW specialist.
 */
export function buildSystemPrompt(agentType: AgentType): string {
	return agentType === "d3" ? D3_SYSTEM_PROMPT : WOW_SYSTEM_PROMPT;
}

/**
 * Run an AI agent (D3 specialist or WoW specialist) with the given messages.
 * Builds the system prompt, prepends it, and delegates to callWithFallback.
 * @param messages - Conversation history (user + assistant messages).
 * @param agentType - Which agent to use ("d3" or "wow").
 * @param groqApiKey - API key for Groq.
 * @param geminiApiKey - API key for Gemini fallback.
 * @param tools - Optional tools (currently unused, reserved for future use).
 * @param logger - Optional logger for structured output.
 * @returns The agent's response text.
 */
export async function runAgent(
	messages: AgentMessage[],
	agentType: AgentType,
	groqApiKey: string,
	geminiApiKey: string,
	tools?: unknown[],
	logger?: Logger,
): Promise<string> {
	const systemPrompt = buildSystemPrompt(agentType);
	const fullMessages: AgentMessage[] = [
		{ role: "system", content: systemPrompt },
		...messages,
	];

	return callWithFallback(fullMessages, groqApiKey, geminiApiKey, logger);
}
