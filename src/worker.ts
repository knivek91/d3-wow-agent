import { createStartHandler, defaultStreamHandler } from '@tanstack/react-start/server'
import { createAuth } from './lib/auth'

const handler = createStartHandler(defaultStreamHandler)

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') || 'http://localhost:3000'
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
}

function handleOptions(request: Request): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request),
  })
}

function addCorsHeaders(response: Response, request: Request): Response {
  const headers = new Headers(response.headers)
  for (const [key, value] of Object.entries(corsHeaders(request))) {
    headers.set(key, value)
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return handleOptions(request)
    }

    const url = new URL(request.url)

    if (url.pathname.startsWith('/api/auth/')) {
      const auth = createAuth(env)
      const response = await auth.handler(request)
      return addCorsHeaders(response, request)
    }

    return addCorsHeaders(await handler(request, env, ctx), request)
  },
}
