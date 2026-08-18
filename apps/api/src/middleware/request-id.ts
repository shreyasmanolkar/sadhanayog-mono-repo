import { createMiddleware } from "hono/factory";
import type { AppEnv } from "../app/bindings.js";

const REQUEST_ID = /^[A-Za-z0-9._-]{8,128}$/;

export const requestId = createMiddleware<AppEnv>(async (c, next) => {
  const incoming = c.req.header("x-request-id");
  const id = incoming && REQUEST_ID.test(incoming) ? incoming : crypto.randomUUID();
  c.set("requestId", id);
  await next();
  c.header("X-Request-ID", id);
});
