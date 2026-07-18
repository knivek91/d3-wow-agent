import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";
import type { Logger } from "../observability/logger";

const ALLOWED_DOMAINS = [
  "wowhead.com",
  "icy-veins.com",
  "diablo.fandom.com",
  "blizzard.com",
];

const TIMEOUT_MS = 5000;
const MAX_CHARS = 8000;
const CACHE_TTL_HOURS = 1;

function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isAllowed(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_DOMAINS.some((domain) => parsed.hostname.endsWith(domain));
  } catch {
    return false;
  }
}

export function createFetchPageTool(env: Env, logger?: Logger) {
  return toolDefinition({
    name: "fetch_page",
    description: "Fetch and scrape content from a URL on allowed domains",
    inputSchema: z.object({
      url: z.string().url().describe("The URL to fetch"),
    }),
  }).server(async ({ url }) => {
    if (!isAllowed(url)) {
      return `Domain not allowed. Allowed domains: ${ALLOWED_DOMAINS.join(", ")}`;
    }

    const db = env.d3_wow_db;

    const cached = await db
      ?.prepare("SELECT content FROM scrape_cache WHERE url = ? AND expiresAt > datetime('now')")
      .bind(url)
      .first<{ content: string }>();

    if (cached) {
      logger?.info({ url }, "Returning cached page content");
      return cached.content;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!response.ok) {
        return `Failed to fetch page: ${response.status} ${response.statusText}`;
      }

      const html = await response.text();
      const text = stripHtml(html).slice(0, MAX_CHARS);

      await db
        ?.prepare(
          "INSERT OR REPLACE INTO scrape_cache (url, content, createdAt, expiresAt) VALUES (?, ?, datetime('now'), datetime('now', '+1 hour'))",
        )
        .bind(url, text)
        .run();

      return text;
    } catch (error) {
      logger?.error({ error, url }, "Failed to fetch page");
      return `Error fetching page: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  });
}
