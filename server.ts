import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
import * as build from "@remix-run/dev/server-build";

import type { DataFunctionContext } from "./app/types";

const handleRequest = createPagesFunctionHandler({
  build,
  mode: process.env.NODE_ENV,
  getLoadContext: (ctx): DataFunctionContext => {
    return { ctx };
  },
});

export function onRequest(ctx: EventContext<unknown, string, unknown>) {
  return handleRequest(ctx);
}
