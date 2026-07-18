import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function createDb(env: Env) {
  return drizzle(env.d3_wow_db, { schema });
}
