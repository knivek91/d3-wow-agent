import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

/**
 * Wraps a D1 database instance to intercept `bind()` calls and convert
 * JavaScript `Date` objects to ISO 8601 strings.
 *
 * D1's `D1PreparedStatement.bind()` does not accept `Date` objects —
 * only `null`, `number`, `string`, `boolean`, and `ArrayBuffer`.
 * This wrapper uses a `Proxy` to automatically convert any `Date`
 * values to `string` via `toISOString()` before passing them to D1.
 *
 * Required because Better Auth's Drizzle adapter passes raw `Date`
 * objects for timestamp fields (createdAt, updatedAt, expiresAt).
 *
 * @param db - The raw D1 database binding from the environment
 * @returns A proxied D1Database with automatic Date-to-string conversion
 */
function wrapD1(db: D1Database): D1Database {
  return new Proxy(db, {
    get(target, prop, receiver) {
      if (prop === "prepare") {
        return (sql: string) => {
          const stmt = target.prepare(sql);
          return new Proxy(stmt, {
            get(stmtTarget, stmtProp) {
              if (stmtProp === "bind") {
                return (...args: any[]) => {
                  const converted = args.map((arg) =>
                    arg instanceof Date ? arg.toISOString() : arg,
                  );
                  return stmtTarget.bind(...converted);
                };
              }
              const value = Reflect.get(stmtTarget, stmtProp, stmtTarget);
              return typeof value === "function"
                ? value.bind(stmtTarget)
                : value;
            },
          });
        };
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}

export function createDb(env: Env) {
  return drizzle(wrapD1(env.d3_wow_db), { schema });
}
