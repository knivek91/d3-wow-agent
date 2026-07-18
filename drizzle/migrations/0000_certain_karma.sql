CREATE TABLE `conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT 'New Conversation' NOT NULL,
	`agentType` text NOT NULL,
	`createdAt` text DEFAULT 'datetime(''now'')' NOT NULL,
	`updatedAt` text DEFAULT 'datetime(''now'')' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `error_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`requestId` text NOT NULL,
	`userId` text,
	`message` text NOT NULL,
	`error` text,
	`timestamp` text DEFAULT 'datetime(''now'')' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`conversationId` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`agentType` text NOT NULL,
	`modelUsed` text,
	`tokensUsed` integer,
	`createdAt` text DEFAULT 'datetime(''now'')' NOT NULL,
	FOREIGN KEY (`conversationId`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`userId` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`windowStart` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scrape_cache` (
	`url` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`createdAt` text DEFAULT 'datetime(''now'')' NOT NULL,
	`expiresAt` text NOT NULL
);
