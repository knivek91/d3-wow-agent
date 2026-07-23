import { Button } from '#/components/ui/button.tsx'
import { Card, CardContent } from '#/components/ui/card.tsx'

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
      <Card className="max-w-md w-full border-destructive/50 bg-destructive/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-destructive mb-1">
                Error{code ? ` (${code})` : ''}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
            </div>
          </div>

          <div className="mt-4 flex gap-2 justify-end">
            {recoverable && onRetry && (
              <Button variant="destructive" size="sm" onClick={onRetry}>
                Reintentar
              </Button>
            )}
            {!recoverable && (
              <Button variant="secondary" size="sm" asChild>
                <a href="/chat">New conversation</a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
