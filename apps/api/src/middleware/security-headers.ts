import { createMiddleware } from "hono/factory";
import type { AppEnv } from "../app/bindings.js";

export const securityHeaders = createMiddleware<AppEnv>(async (c, next) => {
  await next();
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "no-referrer");
  c.header("X-Frame-Options", "DENY");
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
});
