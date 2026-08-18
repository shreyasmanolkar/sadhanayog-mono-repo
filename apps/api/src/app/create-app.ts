import { Hono } from "hono";
import type { AppEnv } from "./bindings.js";
import { requestId } from "../middleware/request-id.js";
import { securityHeaders } from "../middleware/security-headers.js";
import { healthRoutes } from "../modules/health/routes.js";
import { logEvent } from "../observability/logger.js";
import { problem } from "../http/problem.js";

export function createApp() {
  const app = new Hono<AppEnv>();

  app.use("*", requestId);
  app.use("*", securityHeaders);

  app.route("/", healthRoutes);

  app.notFound((c) => {
    if (c.req.path.startsWith("/api/") || c.req.path.startsWith("/health/")) {
      return problem(c, 404, "http.not_found", "Not found");
    }
    return c.body(null, 404);
  });

  app.onError((_error, c) => {
    logEvent({
      level: "error",
      msg: "unhandled",
      requestId: c.get("requestId"),
      route: c.req.routePath,
      env: c.env.SADHANAYOG_ENV,
      release: c.env.RELEASE,
    });
    return problem(c, 500, "http.internal", "An unexpected error occurred");
  });

  return app;
}
