import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client.js'
import { Button } from '#/components/ui/button.js'
import { Input } from '#/components/ui/input.js'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card.js'

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
})

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (isSignUp) {
      const { error: signUpError } = await authClient.signUp.email({ email, password, name })
      if (signUpError) {
        setError(signUpError.message || 'Registration failed')
        return
      }
    } else {
      const { error: signInError } = await authClient.signIn.email({ email, password })
      if (signInError) {
        setError(signInError.message || 'Invalid credentials')
        return
      }
    }

    navigate({ to: '/chat' })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="text-3xl mb-2">🐉🐻</div>
          <CardTitle>D3 / WoW Agent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full gap-2"
            disabled
            title="Próximamente"
          >
            <span>💬</span> Continue with Discord
          </Button>

          <Button
            variant="outline"
            className="w-full gap-2"
            disabled
            title="Próximamente"
          >
            <span>📧</span> Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">O continúa con</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <Input
                type="text"
                placeholder="Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full">
              {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError('') }}
              className="text-primary underline underline-offset-4 hover:text-primary/80 cursor-pointer"
            >
              {isSignUp ? 'Inicia sesión' : 'Crea una'}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
