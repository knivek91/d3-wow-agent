export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: T; error: string }

export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  fallback: T,
  label?: string,
): Promise<ApiResponse<T>> {
  try {
    const data = await fn()
    return { data, error: null }
  } catch (e) {
    const prefix = label ? `[${label}] ` : ''
    console.error(`${prefix}error`, e instanceof Error ? e.message : e)
    return { data: fallback, error: 'An unexpected error occurred' }
  }
}
