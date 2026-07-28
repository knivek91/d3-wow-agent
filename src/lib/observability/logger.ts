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

class ConsoleLogger {
	private base: Record<string, unknown>;

	constructor(base: Record<string, unknown> = {}) {
		this.base = base;
	}

	private log(level: LogLevel, obj: Record<string, unknown>, msg: string) {
		const entry: LogEntry = {
			level,
			time: new Date().toISOString(),
			msg,
			...this.base,
			...obj,
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

	debug(obj: Record<string, unknown> | string, msg?: string) {
		if (typeof obj === "string") {
			this.log("debug", {}, obj);
		} else {
			this.log("debug", obj, msg || "");
		}
	}

	info(obj: Record<string, unknown> | string, msg?: string) {
		if (typeof obj === "string") {
			this.log("info", {}, obj);
		} else {
			this.log("info", obj, msg || "");
		}
	}

	warn(obj: Record<string, unknown> | string, msg?: string) {
		if (typeof obj === "string") {
			this.log("warn", {}, obj);
		} else {
			this.log("warn", obj, msg || "");
		}
	}

	error(obj: Record<string, unknown> | string, msg?: string) {
		if (typeof obj === "string") {
			this.log("error", {}, obj);
		} else {
			this.log("error", obj, msg || "");
		}
	}

	child(extra: Record<string, unknown>): ConsoleLogger {
		return new ConsoleLogger({ ...this.base, ...extra });
	}
}

export function createLogger(requestId?: string): ConsoleLogger {
	return new ConsoleLogger(requestId ? { requestId } : {});
}

export type Logger = ConsoleLogger;
