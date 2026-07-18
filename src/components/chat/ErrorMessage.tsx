interface ErrorMessageProps {
  message: string
  code?: string
  recoverable?: boolean
  onRetry?: () => void
}

export default function ErrorMessage({
  message,
  code,
  recoverable,
  onRetry,
}: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      <div className="max-w-md w-full bg-[#2d1b1b] border border-[#5c2a2a] rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-red-300 mb-1">
              Error{code ? ` (${code})` : ''}
            </h3>
            <p className="text-sm text-red-200/70 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2 justify-end">
          {recoverable && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-[#5c2a2a] text-red-200 hover:bg-[#7a3838] transition-colors"
            >
              Reintentar
            </button>
          )}
          {!recoverable && (
            <a
              href="/chat"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-[#1c1e2e] text-[#94a3b8] hover:bg-[#2a2d3e] transition-colors"
            >
              Nueva conversación
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
