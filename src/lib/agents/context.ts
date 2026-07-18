export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const MAX_EXCHANGES = 10;
const MAX_TOKENS = 3000;

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function buildContext(messages: ChatMessage[]): ChatMessage[] {
  const recent = messages.slice(-MAX_EXCHANGES * 2);
  const result: ChatMessage[] = [];
  let totalTokens = 0;

  for (let i = recent.length - 1; i >= 0; i--) {
    const msg = recent[i];
    const tokens = estimateTokens(msg.content);
    if (totalTokens + tokens > MAX_TOKENS) break;
    result.unshift(msg);
    totalTokens += tokens;
  }

  return result;
}
