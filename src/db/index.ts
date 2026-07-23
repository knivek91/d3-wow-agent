import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

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
