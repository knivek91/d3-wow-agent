import { createGeminiChat } from "@tanstack/ai-gemini";

export function createGeminiAdapter(apiKey: string) {
	return createGeminiChat("gemini-3.5-flash", apiKey);
}
