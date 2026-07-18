import { groqText } from "@tanstack/ai-groq";
import { geminiText } from "@tanstack/ai-gemini";

export const groqAdapter = groqText("llama-3.3-70b-versatile");
export const geminiAdapter = geminiText("gemini-2.5-flash");
