import { createFileRoute, redirect } from '@tanstack/react-router'
import { requireAuthFn } from '../../api/server-fns'
import ChatPage from '../../components/chat/ChatPage'

export const Route = createFileRoute('/chat/')({
  beforeLoad: async () => {
    const { authenticated } = await requireAuthFn()
    if (!authenticated) {
      throw redirect({ to: '/auth/login' })
    }
  },
  component: ChatPage,
})
