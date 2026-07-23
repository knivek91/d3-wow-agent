import { createAuthClient } from "better-auth/react"
import { tanstackStartCookies } from "better-auth/tanstack-start"

const baseURL = import.meta.env.VITE_BASE_URL

if (!baseURL) {
  throw new Error("VITE_BASE_URL is required. Set it in .env or .dev.vars for local dev, or configure it in deploy.yml for production.")
}

export const authClient = createAuthClient({
  baseURL,
  plugins: [tanstackStartCookies()],
})

export const { signIn, signOut, useSession } = authClient
