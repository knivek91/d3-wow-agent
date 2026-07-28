import { chat } from "@tanstack/ai";
import { openaiCompatibleText } from "@tanstack/ai-openai/compatible";
import { createGeminiAdapter } from "./adapters";
import type { Logger } from "../observability/logger";

export async function callWithFallback(
	messages: Array<{ role: string; content: string }>,
	groqApiKey: string,
	geminiApiKey: string,
	logger?: Logger,
): Promise<string> {
	const startTime = Date.now();

	try {
		logger?.info(
			{ provider: "groq", model: "llama-3.3-70b-versatile" },
			"Attempting Groq call",
		);

		const groq = openaiCompatibleText("llama-3.3-70b-versatile", {
			baseURL: "https://api.groq.com/openai/v1",
			apiKey: groqApiKey,
		});

		const result = await chat({
			adapter: groq,
			messages,
			stream: false,
		});

		logger?.info(
			{
				provider: "groq",
				durationMs: Date.now() - startTime,
				resultLength: (result as string).length,
			},
			"Groq succeeded",
		);
		return result as string;
	} catch (error) {
		const isRateLimit =
			error instanceof Error &&
			"status" in error &&
			(error as { status?: unknown }).status === 429;

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

		// Fallback to Gemini
		try {
			logger?.info(
				{ provider: "gemini", model: "gemini-3.5-flash" },
				"Attempting Gemini fallback",
			);

			const gemini = createGeminiAdapter(geminiApiKey);
			const result = await chat({
				adapter: gemini,
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
