import { createStartHandler, defaultStreamHandler } from '@tanstack/react-start/server'
import { createAuth } from './lib/auth'

const handler = createStartHandler(defaultStreamHandler)

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/api/auth/')) {
      const auth = createAuth(env)
      return auth.handler(request)
    }

    return handler(request, env, ctx)
  },
}
