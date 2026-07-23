import { createAuthClient } from "better-auth/react"
import { tanstackStartCookies } from "better-auth/tanstack-start"

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BASE_URL || "http://localhost:3000",
  plugins: [tanstackStartCookies()],
})

export const { signIn, signOut, useSession } = authClient
