import { createGeminiChat } from "@tanstack/ai-gemini";

/**
 * Create a Gemini text adapter with an explicitly provided API key.
 * Uses createGeminiChat internally (geminiText does not accept apiKey param).
 * @param apiKey - Google Gemini API key.
 * @returns A GeminiTextAdapter configured with the given model and key.
 */
export function createGeminiAdapter(apiKey: string) {
	return createGeminiChat("gemini-3.5-flash", apiKey);
}
