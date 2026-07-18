import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  title: text("title").notNull().default("New Conversation"),
  agentType: text("agentType", { enum: ["d3", "wow"] }).notNull(),
  createdAt: text("createdAt").notNull().default("datetime('now')"),
  updatedAt: text("updatedAt").notNull().default("datetime('now')"),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversationId")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
  content: text("content").notNull(),
  agentType: text("agentType", { enum: ["d3", "wow"] }).notNull(),
  modelUsed: text("modelUsed"),
  tokensUsed: integer("tokensUsed"),
  createdAt: text("createdAt").notNull().default("datetime('now')"),
});

export const rateLimits = sqliteTable("rate_limits", {
  userId: text("userId").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: integer("windowStart").notNull(),
});

export const scrapeCache = sqliteTable("scrape_cache", {
  url: text("url").primaryKey(),
  content: text("content").notNull(),
  createdAt: text("createdAt").notNull().default("datetime('now')"),
  expiresAt: text("expiresAt").notNull(),
});

export const errorLogs = sqliteTable("error_logs", {
  id: text("id").primaryKey(),
  requestId: text("requestId").notNull(),
  userId: text("userId"),
  message: text("message").notNull(),
  error: text("error"),
  timestamp: text("timestamp").notNull().default("datetime('now')"),
});
