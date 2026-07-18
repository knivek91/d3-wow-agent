export interface RetryOptions {
  attempts?: number;
  baseDelay?: number;
  maxDelay?: number;
}

function isRetryable(error: unknown): boolean {
  if (error instanceof Response) {
    const status = error.status;
    return status === 429 || status >= 500;
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes("rate limit") ||
      msg.includes("timeout") ||
      msg.includes("internal server") ||
      msg.includes("service unavailable") ||
      msg.includes("too many requests")
    );
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions,
): Promise<T> {
  const attempts = options?.attempts ?? 3;
  const baseDelay = options?.baseDelay ?? 1000;
  const maxDelay = options?.maxDelay ?? 10000;

  let lastError: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isRetryable(error) || i === attempts - 1) {
        throw error;
      }
      const delay = Math.min(baseDelay * 2 ** i + Math.random() * 1000, maxDelay);
      await sleep(delay);
    }
  }

  throw lastError;
}
