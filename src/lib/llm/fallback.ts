import { chat } from "@tanstack/ai";
import { geminiAdapter } from "./adapters";
import type { Logger } from "../observability/logger";

async function callGroqDirect(
  messages: Array<{ role: string; content: string }>,
): Promise<string> {
  const apiKey =
    typeof process !== "undefined" ? process.env.GROQ_API_KEY : undefined;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not available in environment");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  const content = data.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Groq returned empty response");
  }

  return content;
}

export async function callWithFallback(
  messages: Array<{ role: string; content: string }>,
  logger?: Logger,
): Promise<string> {
  const startTime = Date.now();

  try {
    logger?.info(
      { provider: "groq", model: "llama-3.3-70b-versatile" },
      "Attempting Groq call",
    );
    const result = await callGroqDirect(messages);
    logger?.info(
      {
        provider: "groq",
        durationMs: Date.now() - startTime,
        resultLength: result.length,
      },
      "Groq succeeded",
    );
    return result;
  } catch (error) {
    const isRateLimit =
      error instanceof Error &&
      (error.message.toLowerCase().includes("rate limit") ||
        error.message.toLowerCase().includes("429") ||
        error.message.toLowerCase().includes("too many requests"));

    if (isRateLimit) {
      logger?.warn(
        { provider: "groq" },
        "Groq rate limited, falling back to Gemini",
      );
    } else {
      logger?.error(
        { error, provider: "groq" },
        "Groq failed, falling back to Gemini",
      );
    }

    try {
      logger?.info(
        { provider: "gemini", model: "gemini-3.5-flash" },
        "Attempting Gemini fallback",
      );
      const result = await chat({
        adapter: geminiAdapter,
        messages,
        stream: false,
      });
      logger?.info(
        { provider: "gemini", durationMs: Date.now() - startTime },
        "Gemini succeeded",
      );
      return result;
    } catch (fallbackError) {
      logger?.error(
        { error: fallbackError, provider: "gemini" },
        "Gemini fallback also failed",
      );
      throw fallbackError;
    }
  }
}
