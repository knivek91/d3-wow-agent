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
      usePlural: true,
    }),
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      discord: {
        clientId: "",
        clientSecret: "",
        disabled: true,
      },
      google: {
        clientId: "",
        clientSecret: "",
        disabled: true,
      },
    },
    session: {
      cookieCache: { enabled: true, maxAge: 5 * 60 },
    },
  })
}
