type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
	level: LogLevel;
	time: string;
	msg: string;
	requestId?: string;
	[key: string]: unknown;
}

/**
 * Safely serialize a value to JSON, handling Errors, non-serializable objects,
 * and circular references without throwing.
 */
function safeStringify(value: unknown): string {
	try {
		return JSON.stringify(value, (_key, v) => {
			if (v instanceof Error) {
				// Extract only safe, serializable properties from Error
				const safe: Record<string, unknown> = {
					name: v.name,
					message: v.message,
					stack: v.stack,
				};
				// Copy any custom enumerable properties that are safely serializable
				for (const prop of Object.keys(v as unknown as Record<string, unknown>)) {
					try {
						// Test if the property value is JSON-serializable
						JSON.stringify((v as unknown as Record<string, unknown>)[prop]);
						safe[prop] = (v as unknown as Record<string, unknown>)[prop];
					} catch {
						safe[prop] = String((v as unknown as Record<string, unknown>)[prop]);
					}
				}
				return safe;
			}
			return v;
		});
	} catch {
		// Ultimate fallback: extract message and level at minimum
		const entry = value as Partial<LogEntry>;
		return JSON.stringify({
			level: entry.level ?? "error",
			msg: entry.msg ?? "Failed to serialize log entry",
			time: entry.time ?? new Date().toISOString(),
			error: "Log serialization error — check raw output above",
		});
	}
}

/**
 * Structured JSON logger that writes to console. Each entry includes level,
 * timestamp, message, and any extra context. Guaranteed to never throw during
 * serialization — uses safeStringify internally.
 */
class ConsoleLogger {
	private base: Record<string, unknown>;

	constructor(base: Record<string, unknown> = {}) {
		this.base = base;
	}

	/**
	 * Core log method. Assembles the entry from base context + caller fields,
	 * serializes safely, and writes to the appropriate console method.
	 */
	private log(level: LogLevel, obj: Record<string, unknown>, msg: string) {
		const entry: LogEntry = {
			...this.base,
			...obj,
			level,
			time: new Date().toISOString(),
			msg,
		};

		const output = safeStringify(entry);

		switch (level) {
			case "error":
				console.error(output);
				break;
			case "warn":
				console.warn(output);
				break;
			default:
				console.log(output);
		}
	}

	/**
	 * Log at debug level.
	 * @param obj - Structured context fields, or the message itself if a string.
	 * @param msg - Message string (required if obj is an object).
	 */
	debug(obj: Record<string, unknown> | string, msg?: string) {
		if (typeof obj === "string") {
			this.log("debug", {}, obj);
		} else {
			this.log("debug", obj, msg || "");
		}
	}

	/**
	 * Log at info level.
	 * @param obj - Structured context fields, or the message itself if a string.
	 * @param msg - Message string (required if obj is an object).
	 */
	info(obj: Record<string, unknown> | string, msg?: string) {
		if (typeof obj === "string") {
			this.log("info", {}, obj);
		} else {
			this.log("info", obj, msg || "");
		}
	}

	/**
	 * Log at warn level.
	 * @param obj - Structured context fields, or the message itself if a string.
	 * @param msg - Message string (required if obj is an object).
	 */
	warn(obj: Record<string, unknown> | string, msg?: string) {
		if (typeof obj === "string") {
			this.log("warn", {}, obj);
		} else {
			this.log("warn", obj, msg || "");
		}
	}

	/**
	 * Log at error level.
	 * @param obj - Structured context fields, or the message itself if a string.
	 * @param msg - Message string (required if obj is an object).
	 */
	error(obj: Record<string, unknown> | string, msg?: string) {
		if (typeof obj === "string") {
			this.log("error", {}, obj);
		} else {
			this.log("error", obj, msg || "");
		}
	}

	/**
	 * Create a child logger that inherits this logger's base context merged
	 * with the provided extra fields.
	 * @param extra - Additional context fields to merge into the base.
	 */
	child(extra: Record<string, unknown>): ConsoleLogger {
		return new ConsoleLogger({ ...this.base, ...extra });
	}
}

/**
 * Create a structured JSON logger. Each log entry is serialized to a JSON
 * string with level, timestamp, message, and context fields.
 * @param requestId - Optional request ID to include in every log entry.
 */
export function createLogger(requestId?: string): ConsoleLogger {
	return new ConsoleLogger(requestId ? { requestId } : {});
}

export type Logger = ConsoleLogger;
