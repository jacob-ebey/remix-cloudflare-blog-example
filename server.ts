import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
import * as build from "@remix-run/dev/server-build";

import type { DataFunctionContext, Env } from "./app/types";

const handleRequest = createPagesFunctionHandler({
  build,
  mode: process.env.NODE_ENV,
  getLoadContext: (
    ctx: EventContext<Env, string, unknown>
  ): DataFunctionContext => {
    return { ctx };
  },
});

export function onRequest(ctx: EventContext<Env, string, unknown>) {
  return handleRequest(ctx);
}
