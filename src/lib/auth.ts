import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { createDb } from "../db/index"
import * as schema from "../db/schema"

export function createAuth(env: Env) {
  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(createDb(env), {
      provider: "sqlite",
      schema,
      usePlural: false,
    }),
    socialProviders: {
      discord: {
        clientId: env.DISCORD_CLIENT_ID,
        clientSecret: env.DISCORD_CLIENT_SECRET,
        disabled: !env.DISCORD_CLIENT_ID || !env.DISCORD_CLIENT_SECRET,
      },
    },
    session: {
      cookieCache: { enabled: true, maxAge: 60 * 60 },
    },
  })
}
