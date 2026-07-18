import { createStartHandler, defaultStreamHandler } from '@tanstack/react-start/server'

function basicAuth(request: Request, env: Env): Response | null {
  if (request.method === 'OPTIONS') return null

  const authHeader = request.headers.get('Authorization')

  if (!authHeader?.startsWith('Basic ')) {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="D3 WoW Agent"' },
    })
  }

  const encoded = authHeader.slice(6)
  let decoded: string
  try {
    decoded = atob(encoded)
  } catch {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="D3 WoW Agent"' },
    })
  }

  const colonIndex = decoded.indexOf(':')
  if (colonIndex === -1) {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="D3 WoW Agent"' },
    })
  }

  const username = decoded.substring(0, colonIndex)
  const password = decoded.substring(colonIndex + 1)

  // Read credentials from secret (JSON array of { username, password })
  const credentialsRaw = env.AUTH_CREDENTIALS
  if (!credentialsRaw) {
    return new Response('Server misconfiguration: AUTH_CREDENTIALS not set', {
      status: 500,
    })
  }

  let credentials: { username: string; password: string }[]
  try {
    credentials = JSON.parse(credentialsRaw)
    if (!Array.isArray(credentials)) throw new Error()
  } catch {
    return new Response('Server misconfiguration: invalid AUTH_CREDENTIALS', {
      status: 500,
    })
  }

  const isValid = credentials.some(
    (u) => u.username === username && u.password === password,
  )

  if (!isValid) {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="D3 WoW Agent"' },
    })
  }

  return null
}

const handler = createStartHandler(defaultStreamHandler)

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const authResponse = basicAuth(request, env)
    if (authResponse) return Promise.resolve(authResponse)
    return handler(request, env, ctx)
  },
}
