import { createFetchPageTool } from "./fetch-page";

export function createSharedTools(env: Env) {
  return [createFetchPageTool(env)];
}
