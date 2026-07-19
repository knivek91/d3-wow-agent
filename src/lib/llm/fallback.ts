import { chat } from "@tanstack/ai";
import { groqAdapter, geminiAdapter } from "./adapters";
import type { Logger } from "../observability/logger";

export async function callWithFallback(
  messages: Array<{ role: string; content: string }>,
  logger?: Logger,
): Promise<string> {
  const startTime = Date.now();

  try {
    logger?.info({ provider: "groq", model: "llama-3.3-70b-versatile" }, "Attempting Groq call");
    const result = await chat({
      adapter: groqAdapter,
      messages,
      stream: false,
    });
    logger?.info({ provider: "groq", durationMs: Date.now() - startTime }, "Groq succeeded");
    return result;
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
      logger?.info({ provider: "gemini", model: "gemini-3.5-flash" }, "Attempting Gemini fallback");
      const result = await chat({
        adapter: geminiAdapter,
        messages,
        stream: false,
      });
      logger?.info({ provider: "gemini", durationMs: Date.now() - startTime }, "Gemini succeeded");
      return result;
    } catch (fallbackError) {
      logger?.error({ error: fallbackError, provider: "gemini" }, "Gemini fallback also failed");
      throw fallbackError;
    }
  }
}
