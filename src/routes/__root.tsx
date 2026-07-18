import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'D3 / WoW Agent',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  notFoundComponent: () => {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#0f1117]">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#f1f5f9] mb-4">404</h1>
          <p className="text-[#475569] mb-6">Página no encontrada</p>
          <a
            href="/"
            className="px-4 py-2 bg-[#00cc66] text-white rounded-xl text-sm font-medium hover:bg-[#00e673] transition-colors"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    )
  },
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
