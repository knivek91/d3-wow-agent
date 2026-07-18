# d3-wow-agent

Full-stack project built with [TanStack Start](https://tanstack.com/start) on [Cloudflare Workers](https://workers.cloudflare.com/).

---

## Tech Stack

### Frontend

| Category | Technology | Version | Purpose |
|---|---|---|---|
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `^6.0.2` | Main language, static typing |
| **UI Framework** | [React](https://react.dev/) | `^19.2.0` | User interface construction |
| **Meta-framework** | [TanStack Start](https://tanstack.com/start) | latest | Full-stack framework with SSR, server functions and API routes |
| **Routing** | [TanStack Router](https://tanstack.com/router) | latest | File-based routing with SSR support |
| **Data Fetching** | [TanStack Query](https://tanstack.com/query) | latest | Data fetching, caching and server state synchronization |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | `^4.1.18` | Utility-first CSS framework |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) | New York | Reusable component system |
| **Icons** | [Lucide React](https://lucide.dev/) | `^0.577.0` | SVG icon library |
| **Animations** | [tw-animate-css](https://github.com/tailwindlabs/tailwindcss-animate) | `^1.3.6` | CSS animations for Tailwind |

### Backend / Infrastructure

| Category | Technology | Purpose |
|---|---|---|
| **Runtime** | [Cloudflare Workers](https://workers.cloudflare.com/) | Serverless edge execution environment |
| **Deployment** | [Wrangler](https://developers.cloudflare.com/workers/wrangler/) | CLI for building and deploying to Cloudflare |
| **Vite Integration** | [@cloudflare/vite-plugin](https://developers.cloudflare.com/vite/) | Cloudflare plugin for Vite |

### Build & Tooling

| Category | Technology | Version | Purpose |
|---|---|---|---|
| **Bundler** | [Vite](https://vite.dev/) | `^8.0.0` | Dev server and build tool |
| **React Plugin** | [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) | `^6.0.1` | React integration with Vite |
| **Linter / Formatter** | [Biome](https://biomejs.dev/) | `2.4.5` | Unified linting and formatting |
| **Package Manager** | npm | — | Dependency management |
| **CSS Processing** | LightningCSS | — | PostCSS / CSS bundling via Vite |

### Testing

| Category | Technology | Version | Purpose |
|---|---|---|---|
| **Test Runner** | [Vitest](https://vitest.dev/) | `^4.1.5` | Unit test execution |
| **React Testing** | [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/) | `^16.3.0` | React component testing |
| **DOM Testing** | [@testing-library/dom](https://testing-library.com/docs/dom-testing/intro/) | `^10.4.1` | DOM manipulation testing |
| **DOM Simulator** | [jsdom](https://github.com/jsdom/jsdom) | `^28.1.0` | Simulated DOM environment for tests |

### Type Safety

| Category | Technology | Purpose |
|---|---|---|
| **Validation** | [Zod](https://zod.dev/) | `^4.3.6` | Runtime schema validation |
| **Env variables** | [T3 Env](https://env.t3.gg/) | `^0.13.10` | Typed environment variables with Zod |

### Utilities

| Library | Purpose |
|---|---|
| [class-variance-authority](https://cva.style/) | CSS class variants for components |
| [clsx](https://github.com/lukeed/clsx) | Conditional CSS classes |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | Intelligent Tailwind class merging without conflicts |

---

## Project Structure

```
d3-wow-agent/
├── public/                    # Static assets
│   ├── favicon.ico
│   ├── logo192.png
│   ├── logo512.png
│   ├── manifest.json          # PWA manifest
│   └── robots.txt
├── src/                       # Source code
│   ├── env.ts                 # Typed environment variables (T3 Env + Zod)
│   ├── router.tsx             # TanStack Router configuration
│   ├── routeTree.gen.ts       # Auto-generated route tree
│   ├── styles.css             # Global styles (Tailwind + custom)
│   ├── integrations/          # Third-party library integrations
│   │   └── tanstack-query/
│   │       ├── devtools.tsx
│   │       └── root-provider.tsx
│   ├── lib/
│   │   └── utils.ts           # Shared utilities (cn function)
│   └── routes/                # File-based routes
│       ├── __root.tsx          # Root layout (HTML shell)
│       └── index.tsx           # Main route /
├── .opencode/                 # OpenCode AI agent configuration
│   └── agents/
│       ├── tech-planner.md     # Planning and design agent
│       └── code-specialist.md  # Code implementation agent
├── biome.json                 # Biome configuration
├── components.json            # shadcn/ui configuration
├── tsconfig.json              # TypeScript configuration
├── tsr.config.json            # TanStack Router configuration
├── vite.config.ts             # Vite configuration
├── wrangler.jsonc             # Cloudflare Workers configuration
├── worker-configuration.d.ts  # Wrangler-generated types
└── package.json               # Dependencies and scripts
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run test` | Run tests with Vitest |
| `npm run lint` | Run Biome linting |
| `npm run format` | Format code with Biome |
| `npm run check` | Run lint + format check |
| `npm run deploy` | Build + deploy to Cloudflare Workers |

---

## Architecture

This project follows a **full-stack SSR** (Server-Side Rendering) architecture deployed on Cloudflare's edge:

1. **TanStack Start** acts as the meta-framework, orchestrating SSR rendering on Cloudflare Workers and client-side hydration.
2. **TanStack Router** with file-based routing: routes are defined as files in `src/routes/` and the route tree is generated automatically.
3. **TanStack Query** for data fetching and caching, with SSR integration via `@tanstack/react-router-ssr-query`.
4. **Server Functions** (`createServerFn`) allow running server-side logic directly from client components.
5. **API Routes** are defined using the `server` property in route files.
6. **T3 Env** provides typed environment variables, separating server and client variables (prefixed with `VITE_`).
7. **shadcn/ui** with New York style for reusable UI components using CVA + tailwind-merge.

---

## Code Conventions

- **Formatting and linting**: Biome (configured in `biome.json`)
- **Import style**: Prefer absolute imports with `#/` alias (e.g. `import { env } from "#/env"`)
- **Components**: Functional with TypeScript, using shadcn/ui as the base
- **Routes**: Files in `src/routes/` following TanStack Router's file-based pattern
- **Tests**: Vitest + Testing Library, `.test.ts` or `.spec.tsx` files alongside the module under test
- **CSS**: Tailwind utility classes + custom classes in `src/styles.css` when necessary

---

## Implementation Patterns

- **Loader pattern**: Data is loaded before rendering the route using `loader` in the route definition.
- **Server Function pattern**: Server logic encapsulated in `createServerFn()` callable from the client.
- **Component pattern**: UI components with variants via `class-variance-authority` and class merging via `tailwind-merge` (`cn()` function).
- **Integration pattern**: Third-party library integrations separated into `src/integrations/`.
- **Env pattern**: Environment variables defined in `src/env.ts` with Zod validation via T3 Env.
