import { chat } from "@tanstack/ai";
import { groqAdapter, geminiAdapter } from "./adapters";
import type { Logger } from "../observability/logger";

export async function callWithFallback(
  messages: Array<{ role: string; content: string }>,
  logger?: Logger,
): Promise<string> {
  try {
    logger?.info({ provider: "groq" }, "Attempting Groq call");
    return await chat({
      adapter: groqAdapter,
      messages,
      stream: false,
    });
  } catch (error) {
    const isRateLimit =
      error instanceof Error &&
      (error.message.toLowerCase().includes("rate limit") ||
        error.message.toLowerCase().includes("429") ||
        error.message.toLowerCase().includes("too many requests"));

    if (isRateLimit) {
      logger?.warn({ provider: "groq" }, "Groq rate limited, falling back to Gemini");
    } else {
      logger?.error({ error, provider: "groq" }, "Groq failed, falling back to Gemini");
    }

    try {
      return await chat({
        adapter: geminiAdapter,
        messages,
        stream: false,
      });
    } catch (fallbackError) {
      logger?.error({ error: fallbackError, provider: "gemini" }, "Gemini fallback also failed");
      throw fallbackError;
    }
  }
}
