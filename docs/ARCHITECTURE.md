# Architecture: Agentic Harness for Diablo 3 & World of Warcraft

## Overview

Agentic chat system built on **TanStack Start** + **Cloudflare Workers** that provides specialized answers about Diablo 3 and World of Warcraft using two specialist agents with web-scraping tools and LLM orchestration via **@tanstack/ai**.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Meta-framework** | [TanStack Start](https://tanstack.com/start) | Full-stack SSR on Cloudflare Workers |
| **UI** | React 19 + shadcn/ui + Tailwind CSS 4 | Chat interface |
| **AI SDK** | [@tanstack/ai](https://tanstack.com/ai) | LLM orchestration, streaming, tool calling |
| **AI Providers** | Groq (primary) + Gemini (fallback) | LLM inference |
| **Database** | Cloudflare D1 (SQLite) | Conversation persistence |
| **ORM** | Drizzle ORM | Type-safe DB access |
| **HTML Parser** | linkedom | Lightweight web scraping on Workers |
| **Auth** | [Cloudflare Access](https://www.cloudflare.com/zero-trust/access/) | Zero-code auth (OAuth delegado + MFA + sesión) |
| **Rate Limiting** | Cloudflare WAF + Worker | Protección contra abuso de API tokens |

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    Cloudflare Edge Network                     │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              Cloudflare Access (Zero Trust)              │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  ¿Cookie/Token válido?                            │   │   │
│  │  │    ├── No → OAuth con Google/GitHub/Email         │   │   │
│  │  │    └── Sí → Inyecta header Cf-Access-User        │   │   │
│  │  └──────────────────────┬───────────────────────────┘   │   │
│  │                         │                                │   │
│  │  ┌──────────────────────▼───────────────────────────┐   │   │
│  │  │              Cloudflare WAF (Rate Limiting)        │   │   │
│  │  │  Límite: N requests/hora por IP                   │   │   │
│  │  └──────────────────────┬───────────────────────────┘   │   │
│  │                         │                                │   │
│  │  ┌──────────────────────▼───────────────────────────┐   │   │
│  │  │                   Cloudflare Workers                │   │   │
│  │  │  ┌────────────────────────────────────────────┐   │   │   │
│  │  │  │              TanStack Start (SSR)            │   │   │   │
│  │  │  │                                               │   │   │   │
│  │  │  │  ┌─────────────────────────────────────────┐ │   │   │   │
│  │  │  │  │         Chat UI (shadcn/ui + Tailwind)    │ │   │   │   │
│  │  │  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ │ │   │   │   │
│  │  │  │  │  │ ChatInput│ │MsgList   │ │ConvList  │ │ │   │   │   │
│  │  │  │  │  └────┬─────┘ └────┬─────┘ └─────┬────┘ │ │   │   │   │
│  │  │  │  └───────┼────────────┼──────────────┼──────┘ │   │   │   │
│  │  │  │          │  @tanstack/ai-client + @tanstack/ai-react       │   │
│  │  │  │  ┌───────▼────────────▼──────────────▼──────┐ │   │   │   │
│  │  │  │  │         Server Functions Layer            │ │   │   │   │
│  │  │  │  │  createServerFn → chat handler            │ │   │   │   │
│  │  │  │  │  createServerFn → CRUD conversations      │ │   │   │   │
│  │  │  │  │  Middleware: verifica header Access       │ │   │   │   │
│  │  │  │  └────────────────────┬─────────────────────┘ │   │   │   │
│  │  │  │                       │                        │   │   │   │
│  │  │  │  ┌────────────────────▼─────────────────────┐ │   │   │   │
│  │  │  │  │           Agent Orchestrator               │ │   │   │   │
│  │  │  │  │  ┌──────────────┐  ┌──────────────┐     │ │   │   │   │
│  │  │  │  │  │ D3 Specialist│  │ WoW Specialist│     │ │   │   │   │
│  │  │  │  │  │ (prompt+tools)│  │ (prompt+tools)│     │ │   │   │   │
│  │  │  │  │  └──────┬───────┘  └──────┬───────┘     │ │   │   │   │
│  │  │  │  │         │                  │              │ │   │   │   │
│  │  │  │  │  ┌──────▼──────────────────▼──────┐     │ │   │   │   │
│  │  │  │  │  │       @tanstack/ai core         │     │ │   │   │   │
│  │  │  │  │  │  chat({ adapter, messages,      │     │ │   │   │   │
│  │  │  │  │  │    tools, maxSteps })           │     │ │   │   │   │
│  │  │  │  │  └────────┬────────────────────────┘     │ │   │   │   │
│  │  │  │  └───────────┼──────────────────────────────┘ │   │   │   │
│  │  │  │              │                                │   │   │   │
│  │  │  │  ┌───────────▼──────────────────────────────┐ │   │   │   │
│  │  │  │  │    Provider Router & Fallback             │ │   │   │   │
│  │  │  │  │  @tanstack/ai-openai (Groq)  ← primary   │ │   │   │   │
│  │  │  │  │  @tanstack/ai-gemini (Gemini) ← fallback │ │   │   │   │
│  │  │  │  └──────────────────────────────────────────┘ │   │   │   │
│  │  │  │                                               │   │   │   │
│  │  │  │  ┌──────────────────────────────────────────┐ │   │   │   │
│  │  │  │  │       Tool System                         │ │   │   │   │
│  │  │  │  │  ┌────────────────────────────┐          │ │   │   │   │
│  │  │  │  │  │ web_scrape(url)            │          │ │   │   │   │
│  │  │  │  │  │ → fetch + linkedom         │          │ │   │   │   │
│  │  │  │  │  └────────────────────────────┘          │ │   │   │   │
│  │  │  │  └──────────────────────────────────────────┘ │   │   │   │
│  │  │  │                                               │   │   │   │
│  │  │  │  ┌──────────────────────────────────────────┐ │   │   │   │
│  │  │  │  │  Cloudflare D1 + Drizzle ORM              │ │   │   │   │
│  │  │  │  │  conversations, messages                  │ │   │   │   │
│  │  │  │  └──────────────────────────────────────────┘ │   │   │   │
│  │  │  │                                               │   │   │   │
│  │  │  │  ┌──────────────────────────────────────────┐ │   │   │   │
│  │  │  │  │  Cloudflare Secrets                       │ │   │   │   │
│  │  │  │  │  GROQ_API_KEY, GEMINI_API_KEY             │ │   │   │   │
│  │  │  │  └──────────────────────────────────────────┘ │   │   │   │
│  │  │  └────────────────────────────────────────────┘   │   │   │
│  │  └────────────────────────────────────────────────────┘   │   │
│  └────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘

Legend:
  🔐 Cloudflare Access   → Auth layer (delegated OAuth, zero code)
  ⚡ Cloudflare WAF      → Rate limiting por IP
  🧠 TanStack Start       → SSR + Server Functions
  🎯 @tanstack/ai         → LLM orchestration
  💾 D1 + Drizzle         → Persistence


---

## Free Tier Constraints

This project runs entirely on free tiers. Every architectural decision must respect these limits:

### Constraint Matrix

| Resource | Free Limit | Our Budget | Mitigation |
|---|---|---|---|
| **Workers CPU time** | 10ms per request | Target: <8ms | Keep SSR lean; linkedom parsing offloaded to async; avoid heavy sync computation |
| **Workers requests** | 100k per day | ~500/day (POC scale) | ✅ Fine |
| **D1 rows read** | 5M per month | ~150k/month | ✅ Fine |
| **D1 rows written** | 100k per month | ~30k/month | ✅ Fine |
| **Groq requests** | 6000/day, 30/min | ~200/day | ✅ Fine; fallback to Gemini before hitting limit |
| **Gemini requests** | 1500/day | ~50/day (fallback only) | ✅ Fine |
| **Access users** | 50 users | 1-5 users | ✅ Fine |
| **Custom domain** | — | Using workers.dev | ✅ Free |

### CPU Budget (10ms per request)

This is the tightest constraint. We must design for it:

```typescript
// Estimated CPU cost per operation
// SSR render (React):     ~3-5ms
// D1 query:               ~0.5ms (async, minimal CPU)
// linkedom parse:         ~2-4ms
// JSON serialization:     ~0.5ms
// Auth header check:      ~0.01ms
// LLM API call:          ~0ms (async I/O, no CPU)
//                        ─────────
//  Total SSR:            ~6-10ms (tight but feasible)
//  Total API-only:       ~2-5ms (no SSR rendering)
```

**Design decisions to protect CPU budget:**

1. **No SSR for chat pages** — The chat UI loads as a static shell, then uses client-side hydration. The server only streams JSON (SSE tokens). SSR is only for the initial page load / login page.
2. **linkedom parsing** happens only when an agent calls the web_scrape tool, and it runs in the background while the LLM streams — not in the critical SSR path.
3. **D1 queries** are all `await`-ed (async), which doesn't consume CPU while waiting.
4. **Rate limit checks** use a simple integer read/write — negligible CPU cost.
5. **Auth** is handled by Cloudflare Access at the edge — 0 CPU cost.

> **If CPU consistently exceeds 10ms**, upgrade Workers to the paid plan ($5/mo) which removes the CPU limit entirely. But for PCP purposes, the free tier should work with the optimizations above.

---

## Security Architecture

### Layer 1: Cloudflare Access (Auth Gateway)

[Cloudflare Access](https://www.cloudflare.com/zero-trust/access/) acts as an **OAuth proxy** in front of the Worker. No auth code is written.

**How it works:**

```
User → *.workers.dev/chat → Cloudflare Access check
  ├── No session → Redirect to Google/GitHub/Email OTP login
  │               → User authenticates
  │               → Cloudflare creates encrypted session cookie
  │               → Redirect back to app
  └── Valid session → Injects header → Worker receives request
                       cf-access-authenticated-user-email: user@email.com
```

**Setup (done once in Cloudflare Zero Trust dashboard):**
1. Add your `*.workers.dev` domain to Zero Trust
2. Create an Access Policy → "Allow only specific emails" or "Allow anyone with Google account"
3. Select identity providers (Google, GitHub, Email OTP — all free)
4. Policy automatically protects the route — no code changes needed

**Benefits:**
- Zero auth code in the project
- MFA support out of the box (any provider that supports it)
- Session management handled by Cloudflare
- Requests never reach the Worker if unauthenticated — no token waste
- Free tier: up to 50 users

### Layer 2: Rate Limiting (Abuse Protection)

Even with auth, a malicious authenticated user could spam requests and exhaust API tokens.

**Two levels of rate limiting:**

| Level | Implementation | Limit | Purpose |
|---|---|---|---|
| **Cloudflare WAF** | Dashboard rate limiting rule | 60 requests/min per IP | First line of defense |
| **Worker-level** | In-memory counter in D1 | 100 requests/hour per user | Per-user fair usage |

**Worker-level implementation:**

```typescript
// src/lib/security/rate-limit.ts
import { eq } from "drizzle-orm";
import { createDb } from "#/db";
import { rateLimits } from "#/db/schema";

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 100;

export async function checkRateLimit(env: Env, userId: string): Promise<boolean> {
  const db = createDb(env);
  const now = Date.now();

  const [entry] = await db.select()
    .from(rateLimits)
    .where(eq(rateLimits.userId, userId))
    .limit(1);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    // New window: insert or replace
    await db.insert(rateLimits).values({
      userId,
      count: 1,
      windowStart: now,
    }).onConflictDoUpdate({
      target: rateLimits.userId,
      set: { count: 1, windowStart: now },
    });
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false; // Rate limited
  }

  await db.update(rateLimits)
    .set({ count: entry.count + 1 })
    .where(eq(rateLimits.userId, userId));
  return true;
}
```

### Layer 3: Server-side Validation (Defense in Depth)

As a final check, the Server Function reads the Cloudflare Access header:

```typescript
// Inside Server Function
createServerFn({ method: "POST" })
  .handler(async ({ ctx }) => {
    // Cloudflare Access injects this header automatically
    const userEmail = ctx.request.headers.get(
      "cf-access-authenticated-user-email"
    );

    if (!userEmail) {
      throw new Error("Unauthorized");
    }

    // Optional: restrict to specific emails
    // PLACEHOLDER: Allowlisted users come from env var ALLOWED_USERS (comma-separated)
    // Example: ALLOWED_USERS=user1@gmail.com,user2@gmail.com
    const ALLOWED_USERS = (env.ALLOWED_USERS || "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    if (ALLOWED_USERS.length > 0 && !ALLOWED_USERS.includes(userEmail)) {
      throw new Error("Access denied");
    }

    // Proceed with agent logic...
  });
```

### Dev vs Production: Auth Bypass for Local Development

Cloudflare Access only works after deployment (it needs a public domain). During local development with `npm run dev`, the header check would fail. We solve this with an environment flag:

```typescript
// src/lib/security/auth.ts
import { env } from "#/env";

export function getAuthenticatedUser(request: Request): string | null {
  // In development, skip Access check — allow all requests
  if (env.DEV) {
    return "dev-user@localhost";
  }

  // In production, validate Cloudflare Access header
  const userEmail = request.headers.get(
    "cf-access-authenticated-user-email"
  );
  return userEmail;
}
```

**`env.DEV`** comes from TanStack Start's built-in `import.meta.env.DEV` — it's `true` during `npm run dev` and `false` after deployment.

**Deployment flow:**

```
1. npm run deploy         → Worker live at d3-wow-agent.user.workers.dev
                           → Auth check is active (env.DEV = false)
                           → BUT no Access policy yet → all requests fail
                           → App is effectively "locked"

2. Cloudflare Dashboard   → Configure Access policy for workers.dev domain
                           → Now authenticated users can reach the Worker

3. User visits URL        → Access intercepts → Login → Header injected → App works
```

This means the app is **secure by default** after deployment: until you configure Access in the dashboard, nobody can use it. No window of exposure.

### Summary: Defense Layers

| Layer | What it blocks | Code needed |
|---|---|---|
| **Cloudflare Access** | Unauthenticated users | 0 lines |
| **Cloudflare WAF** | IP-based abuse (>60 req/min) | 0 lines (dashboard config) |
| **Worker rate limit** | Per-user abuse (>100 req/hr) | ~30 lines |
| **Server header check** | Direct Worker URL access | ~10 lines |

```
src/
├── db/
│   ├── schema.ts              # Drizzle schema (all tables)
│   ├── index.ts               # D1 client initialization
│   └── migrate.ts             # Migration runner
├── lib/
│   ├── llm/
│   │   ├── adapters.ts        # Groq + Gemini adapter instances
│   │   ├── fallback.ts        # Provider router with retry logic
│   │   └── retry.ts           # Exponential backoff retry
│   ├── agents/
│   │   ├── context.ts         # Context window management
│   │   ├── base.ts            # Base orchestrator (decides agent, routes)
│   │   ├── d3-specialist.ts   # D3 system prompt + tool definitions
│   │   └── wow-specialist.ts  # WoW system prompt + tool definitions
│   ├── tools/
│   │   ├── web-scrape.ts      # linkedom-based HTML scraper + cache
│   │   └── index.ts           # Shared tool registry
│   ├── security/
│   │   ├── auth.ts            # Access header validation (dev bypass)
│   │   └── rate-limit.ts      # Per-user rate limiting with D1
│   ├── observability/
│   │   └── logger.ts          # Structured JSON logging
│   └── utils.ts               # cn(), sleep(), token estimation
├── components/
│   ├── chat/
│   │   ├── ChatPage.tsx       # Main chat view (orchestrates all)
│   │   ├── ChatInput.tsx      # Message input with send button
│   │   ├── MessageBubble.tsx  # Single message display
│   │   ├── MessageList.tsx    # Scrollable message container
│   │   ├── StreamingIndicator.tsx # "Agent is thinking..." + provider
│   │   ├── ErrorMessage.tsx   # Error display + retry button
│   │   ├── AgentBadge.tsx     # D3 / WoW agent indicator
│   │   └── EmptyState.tsx     # Suggestions on new conversation
│   ├── sidebar/
│   │   ├── Sidebar.tsx        # Conversation list + new chat
│   │   └── ConversationItem.tsx
│   └── ui/                    # shadcn/ui components (installed via CLI)
├── routes/
│   ├── __root.tsx             # Root layout (shell)
│   ├── index.tsx              # Redirect to /chat
│   └── chat/
│       ├── index.tsx          # New conversation
│       └── $conversationId.tsx# Existing conversation
├── api/
│   ├── chat.ts                # Server Function: streaming chat handler
│   └── conversations.ts       # Server Function: CRUD + export
├── __tests__/
│   ├── llm/
│   │   ├── fallback.test.ts
│   │   └── retry.test.ts
│   ├── security/
│   │   └── rate-limit.test.ts
│   └── tools/
│       └── web-scrape.test.ts
├── env.ts                     # T3 Env (all server + client vars)
└── styles.css                 # Tailwind base styles
```

---

## Data Model

```sql
-- Cloudflare D1 via Drizzle ORM

CREATE TABLE conversations (
  id         TEXT PRIMARY KEY,           -- UUID v7
  title      TEXT NOT NULL DEFAULT 'New Conversation',
  agent_type TEXT NOT NULL CHECK(agent_type IN ('d3', 'wow', 'auto')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE messages (
  id              TEXT PRIMARY KEY,       -- UUID v7
  conversation_id TEXT NOT NULL,
  role            TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
  content         TEXT NOT NULL,
  agent_type      TEXT,                   -- 'd3', 'wow', or NULL for user
  model_used      TEXT,                   -- 'groq' or 'gemini'
  tokens_used     INTEGER,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE TABLE rate_limits (
  user_id      TEXT PRIMARY KEY,          -- email from Cf-Access-User header
  count        INTEGER NOT NULL DEFAULT 0,
  window_start INTEGER NOT NULL           -- Unix timestamp ms
);

CREATE TABLE scrape_cache (
  url        TEXT PRIMARY KEY,
  content    TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL                -- auto-expire after 1h
);

CREATE TABLE error_logs (
  id         TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  user_id    TEXT,
  message    TEXT NOT NULL,
  error      TEXT,
  timestamp  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_messages_conv ON messages(conversation_id, created_at);
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX idx_scrape_cache_expires ON scrape_cache(expires_at);
CREATE INDEX idx_error_logs_timestamp ON error_logs(timestamp DESC);
```

---

## Key Implementation Patterns

### Agent Orchestration with @tanstack/ai

```typescript
import { chat } from "@tanstack/ai";
import { openaiText } from "@tanstack/ai-openai";   // Groq (OpenAI-compatible)
import { geminiText } from "@tanstack/ai-gemini";   // Gemini fallback
import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";

// Tool definition (type-safe, isomorphic)
const webScrapeTool = toolDefinition({
  name: "web_scrape",
  description: "Scrape content from a gaming wiki URL (wowhead, icy-veins, diablo.fandom, etc.)",
  inputSchema: z.object({
    url: z.string().url(),
  }),
}).server(async ({ url }) => {
  const response = await fetch(url);
  const html = await response.text();
  return extractMainContent(html); // linkedom parsing
});

// Agent execution with provider fallback
async function agentChat({ messages, system, tools }) {
  try {
    return await chat({
      adapter: groqAdapter("llama-3.1-70b-versatile"),
      messages,
      system,
      tools: [webScrapeTool],
      maxSteps: 5,
    });
  } catch (error) {
    if (isRateLimitError(error)) {
      return await chat({
        adapter: geminiAdapter("gemini-2.5-flash"),
        messages,
        system,
        tools: [webScrapeTool],
        maxSteps: 5,
      });
    }
    throw error;
  }
}
```

### Streaming via Server Function

```typescript
// src/api/chat.ts
import { createServerFn } from "@tanstack/react-start";
import { toServerSentEventsResponse } from "@tanstack/ai";

export const chatHandler = createServerFn({ method: "POST" })
  .validator(z.object({
    conversationId: z.string().uuid(),
    message: z.string(),
    agentType: z.enum(["d3", "wow", "auto"]),
  }))
  .handler(async ({ data }) => {
    const stream = await runAgent(data);
    return toServerSentEventsResponse(stream);
  });
```

### Chat Client Hook

```typescript
// Inside ChatPage.tsx
import { useChat } from "@tanstack/ai-react";

function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
    body: { conversationId, agentType },
  });

  return (
    <div>
      <MessageList messages={messages} />
      <ChatInput value={input} onChange={handleInputChange} onSubmit={handleSubmit} />
    </div>
  );
}
```

---

## Dependencies

```json
{
  "dependencies": {
    "@tanstack/ai": "^0.40.0",
    "@tanstack/ai-openai": "^0.40.0",
    "@tanstack/ai-gemini": "^0.40.0",
    "@tanstack/ai-client": "^0.40.0",
    "@tanstack/ai-react": "^0.40.0",
    "drizzle-orm": "^0.41.0",
    "linkedom": "^0.18.0",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "drizzle-kit": "^0.30.0",
    "wrangler": "^4.111.0"
  }
}
```

---

## Implementation Order

| Phase | Tasks | Output |
|---|---|---|
| **0. Security Setup** | Configure Cloudflare Access in dashboard + WAF rate rule | Auth-protected Worker |
| **1. Scaffold** | Install deps, configure `env.ts` with T3 Env + Zod, set up D1 + Drizzle config | Working dev server |
| **2. Database** | Drizzle schema (all 5 tables), generate migration, CRUD server functions | Persistence layer |
| **3. Security Code** | `auth.ts` (Access header + dev bypass), `rate-limit.ts` (D1-based), integration in server functions | Abuse protection |
| **4. Observability** | `logger.ts` (structured JSON), error tracking, `wrangler tail` support | Debuggability |
| **5. LLM Layer** | `adapters.ts` (Groq + Gemini), `fallback.ts` (provider router), `retry.ts` (exponential backoff) | LLM connectivity |
| **6. Agents** | `context.ts` (window management), D3 specialist prompt, WoW specialist prompt, `base.ts` orchestrator | Agent responses |
| **7. Tools** | `web-scrape.ts` (linkedom + cache + domain allowlist), tool registry | Tool execution |
| **8. Chat UI** | `useChat` hook, `ChatInput`, `MessageList`, `StreamingIndicator`, `ErrorMessage`, `EmptyState`, `AgentBadge` with shadcn/ui | Working chat |
| **9. Sidebar** | `Sidebar`, `ConversationItem`, create/delete/export conversations | Full navigation |
| **10. Polish** | Error states, rate limit UX, provider switch notification, streaming cursor, responsive layout | Production-ready |
| **11. Tests** | Unit tests for fallback, retry, rate-limit, web-scrape; component tests with Testing Library | Test coverage |

---

## Error Handling & Retry Strategy

### Provider Fallback Chain

```
User Request
    │
    ▼
┌─────────────────────┐
│  Groq (primary)     │ ← Try 1
│  timeout: 30s       │
└─────────┬───────────┘
          │
    ╔══════╧══════════╗
    ║  ¿Error?        ║
    ║  - Rate limited ║
    ║  - Timeout      ║
    ║  - Server error ║
    ╚══════╤══════════╝
          │
    ┌─────▼─────┐
    │  Wait 1s  │ ← Exponential backoff (1s, 2s, 4s — max 3 retries)
    │  Retry    │
    └─────┬─────┘
          │
    ╔══════╧══════════╗
    ║  ¿Still error?  ║
    ╚══════╤══════════╝
          │
    ┌─────▼─────────┐
    │  Gemini (fallback) │ ← Try 1
    │  timeout: 30s      │
    └─────────┬───────────┘
              │
    ╔═════════╧═══════════╗
    ║  ¿Any error?        ║
    ╚═════════╤═══════════╝
              │
    ┌─────────▼──────────┐
    │ Return error to UI │ ← "I'm sorry, both AI providers
    │ with user message   │    are unavailable right now.
    └────────────────────┘    Please try again later."
```

### Retry Configuration

---

## Database Access: Drizzle ORM

All database operations go through **Drizzle ORM**, not raw SQL. Drizzle provides:

- **Type safety** — schema columns are TypeScript types
- **Migrations** — `drizzle-kit generate` + `drizzle-kit migrate`
- **Extensibility** — easy to add tables or switch to PostgreSQL later
- **Query building** — no raw SQL strings in application code

### Setup

```typescript
// src/db/index.ts
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function createDb(env: Env) {
  return drizzle(env.DB, { schema });
}
```

### Usage Pattern (instead of raw SQL)

```typescript
// ❌ Raw SQL (avoid)
await env.DB.prepare("SELECT * FROM conversations WHERE id = ?").bind(id).all();

// ✅ Drizzle ORM (use this)
import { createDb } from "#/db";
const db = createDb(env);

const conversations = await db.select().from(schema.conversations)
  .where(eq(schema.conversations.id, id))
  .all();
```

### All code examples in this document

Every code example that uses `env.DB.prepare()` is pseudocode for illustrating the data flow. The actual implementation will use Drizzle ORM syntax.

---

### src/lib/llm/retry.ts
interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;     // 1000
  maxDelayMs: number;      // 10000
}

const RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
};

async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = RETRY_CONFIG
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (!isRetryable(error)) throw error; // Don't retry validation errors

      const delay = Math.min(
        config.baseDelayMs * Math.pow(2, attempt), // exponential
        config.maxDelayMs
      );
      await sleep(delay);
    }
  }

  throw lastError;
}

// Which errors are retryable
function isRetryable(error: unknown): boolean {
  if (error instanceof RateLimitError) return true;
  if (error instanceof TimeoutError) return true;
  if (error instanceof ServerError) return true;
  return false;
}
```

### Error Response Contract (SSE)

The streaming endpoint communicates errors in-band via the SSE stream so the UI can react:

```
event: error
data: {"code": "RATE_LIMITED", "message": "Groq rate limit hit, switching to Gemini...", "recoverable": true}

event: error
data: {"code": "ALL_PROVIDERS_FAILED", "message": "All AI providers unavailable", "recoverable": false}

event: warning
data: {"code": "SCRAPE_FAILED", "message": "Could not access wowhead.com, answering from knowledge..."}

event: done
data: {"model": "gemini", "tokens": 450, "agent": "wow", "warnings": ["SCRAPE_FAILED"]}
```

### Client-Side Error States

The chat UI must handle these states:

| State | Trigger | UI Behavior |
|---|---|---|
| **Connecting** | Request sent, waiting for first token | Show spinner + "Connecting to agent..." |
| **Streaming** | Tokens arriving | Show text as it arrives, streaming cursor |
| **Provider switching** | Groq failed → Gemini | Inline message: "⚠️ Switching to backup model..." |
| **Tool executing** | Agent is scraping a website | Inline indicator: "🔍 Searching wowhead..." |
| **Recoverable error** | Rate limit warning | Toast notification, stream continues |
| **Fatal error** | All providers down | Error message in chat + retry button |
| **Rate limited (user)** | Too many requests | "⏳ You've reached the rate limit. Try again in X minutes." |
| **Empty** | New conversation | Example prompts to start ("Ask me about Diablo 3 builds...") |

---

## Observability & Logging

### Logging Strategy

Since Cloudflare Workers has limited logging (no `fs`), we use structured logging:

```typescript
// src/lib/observability/logger.ts
interface LogEntry {
  level: "debug" | "info" | "warn" | "error";
  message: string;
  requestId: string;
  userId?: string;
  agent?: string;
  model?: string;
  tokens?: number;
  durationMs?: number;
  error?: string;
  timestamp: string;
}

function log(entry: LogEntry) {
  // Always output to console (visible in `wrangler tail`)
  console.log(JSON.stringify(entry));

  // Store errors in D1 for later review
  if (entry.level === "error") {
    env.DB.prepare(
      "INSERT INTO error_logs (request_id, user_id, message, error, timestamp) VALUES (?, ?, ?, ?, ?)"
    ).bind(entry.requestId, entry.userId, entry.message, entry.error, entry.timestamp).run();
  }
}
```

### What We Log

| Event | Level | Data |
|---|---|---|
| Request start | `info` | requestId, userId, agentType |
| Provider call start | `debug` | model, tokens estimate |
| Provider success | `info` | model, tokens used, duration |
| Provider fallback | `warn` | from → to, reason |
| Tool execution | `debug` | tool name, url, duration |
| Tool failure | `warn` | tool name, error |
| Rate limit hit | `warn` | userId, current count |
| Auth failure | `info` | attempted userId |
| Fatal error | `error` | full error stack |
| Streaming complete | `info` | total tokens, duration, model |

### Monitoring with `wrangler tail`

During development and production, you can tail logs in real-time:

```bash
npx wrangler tail
# {"level":"info","message":"Provider call: groq","tokens":450,"durationMs":3200}
# {"level":"warn","message":"Provider fallback to gemini","reason":"rate_limited"}
```

---

## Data Privacy & Lifecycle

### Data Retention

| Data | Retention | Rationale |
|---|---|---|
| **Messages** | Indefinite (until user deletes conversation) | User expects history persistence |
| **Rate limit counters** | 1 hour (window resets) | Automatic cleanup |
| **Error logs** | 7 days | Debugging window |
| **Access logs** | Not stored (Cloudflare handles this) | N/A |

### User Data Controls

```typescript
// src/api/conversations.ts

// Delete conversation and all messages
export const deleteConversation = createServerFn({ method: "POST" })
  .handler(async ({ data }) => {
    await env.DB.prepare("DELETE FROM messages WHERE conversation_id = ?")
      .bind(data.conversationId).run();
    await env.DB.prepare("DELETE FROM conversations WHERE id = ?")
      .bind(data.conversationId).run();
  });

// Export conversation as JSON
export const exportConversation = createServerFn({ method: "GET" })
  .handler(async ({ data }) => {
    const messages = await env.DB.prepare(
      "SELECT role, content, agent_type, model_used, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at"
    ).bind(data.conversationId).all();
    return messages;
  });
```

---

## Web Scraping Design

### Scraping Flow

```
Agent needs info
    │
    ▼
┌───────────────────────┐
│ LLM decides URL to    │
│ scrape based on query │ ← Agent knows which wikis exist
└───────┬───────────────┘
        │
        ▼
┌───────────────────────┐
│ Check scrape cache    │ ← D1 cache (TTL: 1 hour)
│  └─ Hit? → Return cached
│  └─ Miss? → Continue
└───────┬───────────────┘
        │
        ▼
┌───────────────────────┐
│ robots.txt check      │ ← Respect webscraping rules
│  └─ Disallowed? → Skip
└───────┬───────────────┘
        │
        ▼
┌───────────────────────┐
│ fetch() + linkedom    │ ← 5s timeout
│  └─ Success? → Parse
│  └─ Fail? → Return error to agent
└───────┬───────────────┘
        │
        ▼
┌───────────────────────┐
│ Sanitize content      │ ← Strip scripts, styles, ads
│ Truncate to 5000 chars│ ← Context window budget
└───────┬───────────────┘
        │
        ▼
    Return to LLM
```

### Implementation

```typescript
// src/lib/tools/web-scrape.ts
import { parseHTML } from "linkedom";

const SCRAPE_TIMEOUT_MS = 5000;
const MAX_CONTENT_LENGTH = 5000;
const SCRAPE_CACHE_TTL = 60 * 60 * 1000; // 1 hour

const ALLOWED_DOMAINS = [
  "wowhead.com",
  "icy-veins.com",
  "diablo.fandom.com",
  "diablo.wiki.fextralife.com",
  "blizzard.com",
  "news.blizzard.com",
  "worldofwarcraft.blizzard.com",
  "diablo3.blizzard.com",
];

// Tool definition
export const webScrapeTool = toolDefinition({
  name: "web_scrape",
  description: "Fetch and extract content from a gaming wiki URL",
  inputSchema: z.object({
    url: z.string().url().describe("Full URL to scrape"),
  }),
}).server(async ({ url }, { env }) => {
  const parsed = new URL(url);

  // 1. Domain allowlist
  if (!ALLOWED_DOMAINS.some(d => parsed.hostname.endsWith(d))) {
    return { error: `Domain ${parsed.hostname} is not allowed` };
  }

  // 2. Check cache
  const cached = await env.DB.prepare(
    "SELECT content FROM scrape_cache WHERE url = ? AND expires_at > datetime('now')"
  ).bind(url).first();
  if (cached) return { content: cached.content };

  // 3. Fetch with timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SCRAPE_TIMEOUT_MS);
  const response = await fetch(url, { signal: controller.signal });
  clearTimeout(timeout);

  if (!response.ok) return { error: `HTTP ${response.status}` };

  // 4. Parse with linkedom
  const html = await response.text();
  const { document } = parseHTML(html);

  // 5. Extract main content (remove nav, scripts, ads)
  const main = document.querySelector("main, article, .content, #content");
  const text = (main || document.body).textContent
    .replace(/\\s+/g, " ")
    .trim()
    .slice(0, MAX_CONTENT_LENGTH);

  // 6. Cache result
  await env.DB.prepare(
    "INSERT OR REPLACE INTO scrape_cache (url, content, expires_at) VALUES (?, ?, datetime('now', '+1 hour'))"
  ).bind(url, text).run();

  return { content: text, source: url };
});
```

---

## LLM Context Management

### Context Window Budget

| Component | Token Budget | Notes |
|---|---|---|
| **System prompt** | ~500 tokens | Agent identity + rules |
| **Recent messages** | ~3000 tokens | Last ~10 exchanges |
| **Tool results** | ~2000 tokens | Scraped content |
| **Response** | ~1000 tokens | Max output per turn |
| **Total** | ~6500 tokens | Safe within Groq's 8K limit |

```typescript
// src/lib/agents/context.ts

// Truncate conversation history to stay within budget
function buildContextMessages(
  history: Message[],
  systemPrompt: string,
  maxTokens: number = 6000
): CoreMessage[] {
  let totalTokens = estimateTokens(systemPrompt);
  const messages: CoreMessage[] = [{ role: "system", content: systemPrompt }];

  // Add messages from newest to oldest until we hit the budget
  const reversed = [...history].reverse();
  for (const msg of reversed) {
    const tokens = estimateTokens(msg.content);
    if (totalTokens + tokens > maxTokens) break;
    messages.unshift({ role: msg.role, content: msg.content });
    totalTokens += tokens;
  }

  return messages;
}
```

### Prompt Injection Prevention

```typescript
// Sanitize user input: prevent system prompt override
function sanitizeUserMessage(content: string): string {
  return content
    .replace(/system\s*:/gi, "user-message:")
    .replace(/assistant\s*:/gi, "")
    .trim();
}
```

---

## UX States & Component Design

### Chat UI State Machine

```
                     ┌─────────────┐
                     │   Empty     │ ← New conversation, no messages yet
                     │ (suggestions)│
                     └──────┬──────┘
                            │ User types message
                            ▼
                     ┌─────────────┐
                     │ Connecting  │ ← Request sent, waiting for first token
                     │  (spinner)  │
                     └──────┬──────┘
                            │ First token arrives
                            ▼
                     ┌─────────────┐
               ┌────→│  Streaming  │ ← Tokens appearing in real-time
               │     │ (cursor)    │
               │     └──────┬──────┘
               │            │ Stream complete
               │            ▼
               │     ┌─────────────┐
               │     │  Complete   │ ← Full message rendered
               │     │ (idle)      │
               │     └──────┬──────┘
               │            │ User sends next message
               └────────────┘
                     │
               ┌─────┴──────┐
               ▼             ▼
     ┌──────────────┐  ┌──────────────┐
     │  Error       │  │ Rate Limited │
     │  + retry btn │  │  + countdown │
     └──────────────┘  └──────────────┘
```

### Component Responsibilities

```typescript
// components/chat/ChatPage.tsx — Orchestra de todos los subcomponentes
function ChatPage() {
  // useChat hook from @tanstack/ai-react
  const { messages, input, handleSubmit, status, error } = useChat();

  // status: "connecting" | "streaming" | "complete" | "error"
  // error: { code: string, message: string, recoverable: boolean }

  return (
    <div>
      <MessageList messages={messages} status={status} />
      {status === "connecting" && <StreamingIndicator agent="wow" />}
      {status === "error" && !error.recoverable && <ErrorMessage error={error} onRetry={handleSubmit} />}
      <ChatInput value={input} onChange={handleInputChange} onSubmit={handleSubmit} disabled={status === "connecting"} />
    </div>
  );
}
```

---

## Testing Strategy

| Test Type | What to Test | Tool | Location |
|---|---|---|---|
| **Unit** | LLM fallback logic, retry, token estimation | Vitest | `src/lib/__tests__/` |
| **Unit** | Web scraping extraction, sanitization | Vitest | `src/lib/tools/__tests__/` |
| **Unit** | Rate limit logic | Vitest | `src/lib/security/__tests__/` |
| **Integration** | Server function with D1 | Vitest + Miniflare | `src/api/__tests__/` |
| **Component** | Chat UI states (empty, loading, error) | Testing Library | `src/components/__tests__/` |
| **E2E** | Full conversation flow (manual) | wrangler dev | Local browser |

```typescript
// Example: testing fallback logic
import { describe, it, expect } from "vitest";
import { withFallback } from "./fallback";

describe("LLM fallback", () => {
  it("falls back to Gemini when Groq rate limits", async () => {
    const groq = () => Promise.reject(new RateLimitError("over quota"));
    const gemini = () => Promise.resolve("response from gemini");

    const result = await withFallback(groq, gemini);
    expect(result).toBe("response from gemini");
  });

  it("throws if both providers fail", async () => {
    const groq = () => Promise.reject(new Error("groq down"));
    const gemini = () => Promise.reject(new Error("gemini down"));

    await expect(withFallback(groq, gemini)).rejects.toThrow();
  });
});
```

---

## Environment Validation at Startup

All required environment variables should be validated when the Worker boots:

```typescript
// src/env.ts (using T3 Env)
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    GROQ_API_KEY: z.string().min(1, "GROQ_API_KEY is required"),
    GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
    ALLOWED_USERS: z.string().optional().default(""),
    // PLACEHOLDER: Comma-separated emails. If empty, any authenticated user is allowed.
    // Example: "kevin@gmail.com,friend@gmail.com"
  },
  client: {
    VITE_APP_TITLE: z.string().default("D3/WoW Agent"),
  },
  runtimeEnv: {
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    ALLOWED_USERS: process.env.ALLOWED_USERS,
    VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE,
  },
});
```

---

## Coding Standards

### File Naming
- **Server functions**: `src/api/chat.ts`, `src/api/conversations.ts`
- **Components**: PascalCase `ChatInput.tsx`, `MessageList.tsx`
- **Libraries**: kebab-case `web-scrape.ts`, `rate-limit.ts`
- **Tests**: `*.test.ts` alongside the module

### Error Handling Pattern
```typescript
// Every Server Function wraps in try/catch and returns typed errors
export const chatHandler = createServerFn({ method: "POST" })
  .handler(async ({ data }) => {
    try {
      // ... agent logic
    } catch (error) {
      if (error instanceof RateLimitError) {
        return { error: "rate_limited", retryAfter: 60 };
      }
      // Log and return generic error
      logger.error({ message: "Chat handler failed", error });
      return { error: "internal_error" };
    }
  });
```

### Import Order
1. External libraries (`@tanstack/ai`, `zod`)
2. Internal libraries (`#/lib/llm`, `#/lib/agents`)
3. Components (`#/components/ui`)
4. Types (`#/db/schema`)

---

---

## Token Optimization: Concise Responses

Verbose responses are the #1 bottleneck for free tiers — they waste Groq's 6000 req/day and Workers CPU budget. Every strategy below is designed to maximize **information per token**.

### Strategy 1: System Prompt Design

The most impactful lever. The agent system prompt explicitly enforces conciseness:

```typescript
// src/lib/agents/d3-specialist.ts
export const D3_SYSTEM_PROMPT = `You are a Diablo 3 specialist.

RULES:
- Answer in 2-4 sentences. No greetings, no pleasantries, no farewells.
- Use bullet points when listing (items, skills, stats).
- If the answer is a number or a name, just give it directly.
- If unsure, say "I don't know" — don't guess.
- Do not ask follow-up questions. Do not offer additional help.
- Do not repeat the user's question. Do not explain what you're doing.
- No markdown formatting except bullet lists when necessary.

EXAMPLE:
  User: "What's the best Barbarian build for season 34?"
  You: "• H90 Wrath of the Wastes set with Rend
   • Weapons: Istvan's Paired Blades (Little Rogue / Slanderer)
   • Cube: The Furnace, Mantle of Channeling, Convention of Elements
   • Gems: Bane of the Trapped, Bane of the Stricken, Gogok of Swiftness
   • Key stats: 56% CDR, 30% area damage on shoulders"

  That's it. No explanation of why it works. Just the build.`;
```

### Strategy 2: Hard Token Cap

Set a strict maximum on output tokens per turn:

```typescript
// src/lib/agents/base.ts
const agentChat = chat({
  adapter: groqAdapter("llama-3.1-70b-versatile", {
    maxTokens: 300,       // ← Hard cap: never more than 300 tokens
    temperature: 0.3,     // ← Lower temp = more deterministic, less rambling
  }),
  messages: contextMessages,
  system: agentSystemPrompt,
  tools: [webScrapeTool],
  maxSteps: 3,            // ← Reduced from 5: fewer tool calls = less tokens
});
```

**Token budget breakdown per response:**

| Component | Budget | Example |
|---|---|---|
| **Simple answer** | 50-100 tokens | `"GR build: LoD Corpse Explosion. Key items:...[truncated]"` |
| **Build/items list** | 150-200 tokens | Bullet list of items, gems, stats |
| **Explanation** | 200-300 tokens | Brief answer with context |
| **Hard max** | 300 tokens | Enforced by `maxTokens` |

### Strategy 3: Temperature Control

| Temperature | Behavior | Use Case |
|---|---|---|
| **0.2 - 0.4** | Focused, factual, concise | Default for Q&A |
| **0.5 - 0.7** | Moderate creativity | Build suggestions, theorycrafting |
| **> 0.7** | Verbose, creative | Avoid for free tiers |

For a POC, default to **temperature: 0.3** — gives direct, factual answers without fluff.

### Strategy 4: Token Counter in UI

Show the user how many tokens each response consumed. This creates awareness and lets them decide if they want shorter answers:

```typescript
// Inside MessageBubble.tsx
function MessageBubble({ message }: { message: Message }) {
  return (
    <div>
      <p>{message.content}</p>
      {message.role === "assistant" && message.tokens && (
        <span className="text-xs text-muted-foreground">
          {message.tokens} tokens · {message.model}
        </span>
      )}
    </div>
  );
}
```

### Strategy 5: Ban Verbosity Patterns

Strip these patterns at the system prompt level AND via input sanitization:

| Pattern | Why | Replace with |
|---|---|---|
| `"Great question!"` | Wastes 2 tokens | Nothing |
| `"Let me search for that..."` | Wastes 5 tokens | Nothing |
| `"Based on my knowledge..."` | Wastes 4 tokens | Nothing |
| `"In Diablo 3, there are several..."` | Wastes 6 tokens | Direct answer |
| Markdown headers, bold, italic | Wastes formatting tokens | Plain text |
| Disclaimers about accuracy | Wastes tokens | Omit |
| Suggesting other resources | Wastes tokens | Omit |

### Strategy 6: Response Length Awareness in Context

The agent should "see" how long its previous responses were and self-correct:

```typescript
// Add to system prompt dynamically
function buildSystemPrompt(basePrompt: string, recentTokens: number[]): string {
  const avgTokens = recentTokens.length > 0
    ? recentTokens.reduce((a, b) => a + b, 0) / recentTokens.length
    : 0;

  // If the agent has been verbose, remind it
  const reminder = avgTokens > 200
    ? "\nREMINDER: Your last responses averaged " + Math.round(avgTokens) + " tokens. Keep answers under 150 tokens."
    : "";

  return basePrompt + reminder;
}

### Strategy 7: Free Model Selection (as of July 2026)

After evaluating the Groq and Google Gemini free tiers, the primary and fallback models are:

| Provider | Model | Role | Free Tier Limits |
|---|---|---|---|
| **Groq** | `llama-3.1-70b-versatile` | **Primary** — best quality, tool calling | 30 RPM, 1K RPD, 12K TPM |
| **Groq** | `llama-1b` (or any) | Alternate — higher daily limit | 30 RPM, 14.4K RPD |
| **Gemini** | `gemini-2.5-flash` | **Fallback** — when Groq rate-limited | 10 RPM, 250 RPD |
| **Gemini** | `gemini-2.5-flash-lite` | Cheaper fallback, higher limits | 15 RPM, 1K RPD |

> ⚠️ `gemini-2.0-flash` was deprecated by Google in 2025. The current free Gemini models are `gemini-2.5-flash` and `gemini-2.5-flash-lite`. Always verify at [ai.google.dev/pricing](https://ai.google.dev/gemini-api/docs/pricing).

The fallback flow in code:
```typescript
// Rate limit from Groq → retry with Gemini
if (isRateLimitError(error)) {
  return await chat({
    adapter: geminiAdapter("gemini-2.5-flash"),
    // same messages, system, tools
  });
}
```

### Expected Impact

| Strategy | Token Reduction | Effort |
|---|---|---|
| System prompt design | **40-60%** | Low (just text) |
| Hard token cap (300) | **30-50%** | Low (1 parameter) |
| Temperature 0.3 | **15-25%** | Low (1 parameter) |
| Verbosity pattern ban | **10-20%** | Low (prompt text) |
| Self-awareness reminder | **5-15%** | Medium (logic) |
| **Total estimated** | **50-70% fewer tokens** | |

> **Real-world example:** A verbose answer of ~400 tokens (~300 words) gets compressed to ~120 tokens (~90 words) — same information, 3x more responses per rate limit window.

---

## Future Enhancements (TODO)

- Blizzard API integration (real character/item/leaderboard data)
- Conversation search
- Message feedback (thumbs up/down)
- Agent reasoning visibility
- Multi-turn tool calling improvements
- Model hot-switching in UI
- **Workers Paid Plan** ($5/mo) — removes 10ms CPU limit if needed for scaling
- **D1 Paid Plan** — if storage/rows exceed free tier

---

## ADRs

### ADR 1: AI SDK
**Decision**: Use @tanstack/ai over Vercel AI SDK.
**Rationale**: Ecosystem cohesion — project already uses TanStack Router, Query, and Start. Same design philosophy (type-safe, composable, tree-shakeable). Native Groq support via @tanstack/ai-openai. Risk of alpha status is acceptable for a greenfield project.
**Date**: 2026-07-17

### ADR 2: Authentication
**Decision**: Use Cloudflare Access (Zero Trust) instead of custom auth.
**Rationale**: Zero auth code, MFA support, session management handled by Cloudflare, free up to 50 users. The Worker's `*.workers.dev` domain is already inside Cloudflare — no custom domain needed. Requests never reach the Worker if unauthenticated, preventing token abuse.
**Date**: 2026-07-17

### ADR 3: Rate Limiting
**Decision**: Two-layer rate limiting (WAF + Worker/D1).
**Rationale**: Even authenticated users could exhaust daily API tokens. Cloudflare WAF blocks IP-level abuse; D1-based per-user limiting ensures fair usage within the free tier limits of Groq/Gemini.
**Date**: 2026-07-17

### ADR 4: Web Scraping
**Decision**: Domain allowlist + linkedom + D1 cache + 5s timeout.
**Rationale**: Domain allowlist prevents the LLM from scraping arbitrary URLs (security). linkedom is lighter than cheerio on Workers. D1 cache avoids re-scraping the same URL within an hour. 5s timeout prevents hanging on slow sites. Content is sanitized and truncated to 5000 chars to fit context window.
**Date**: 2026-07-17

### ADR 5: Error Handling
**Decision**: Exponential backoff retry (3 attempts) + provider fallback (Groq → Gemini 2.5 Flash) + SSE error events.
**Rationale**: Retry with backoff handles transient failures (rate limits, timeouts). Provider fallback (Groq `llama-3.3-70b` → Gemini `gemini-2.5-flash`) handles provider outages. SSE error events keep the UI informed of what's happening (provider switch, tool execution, warnings).
**Date**: 2026-07-17

### ADR 6: Data Storage
**Decision**: All data in Cloudflare D1 (messages, rate limits, scrape cache, error logs).
**Rationale**: Single data layer simplifies the architecture (no KV, no R2 for MVP). D1 is SQLite-compatible with Drizzle ORM. Auto-cleanup for ephemeral data (rate limits expire after window, scrape cache after 1h, error logs after 7 days).
**Date**: 2026-07-17

### ADR 7: Free Tier First
**Decision**: Everything designed to stay within Cloudflare Workers free tier (100k req/day, 10ms CPU/req, D1 5M rows/mo, Access 50 users).
**Rationale**: The project is a POC with zero budget. The tightest constraint is Workers CPU (10ms/req). We mitigate by keeping SSR minimal (chat page is client-rendered, server only streams JSON), using async I/O for all DB/LLM operations, and keeping linkedom parsing off the critical path. If CPU consistently exceeds 10ms, the Workers Paid plan ($5/mo) removes the limit.
**Date**: 2026-07-17
