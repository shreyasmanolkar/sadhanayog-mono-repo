import { Hono } from "hono";
import { liveHealthResponseSchema } from "@sadhanayog/contracts";
import type { AppEnv } from "../../app/bindings.js";
import { problem } from "../../http/problem.js";

export const healthRoutes = new Hono<AppEnv>();

healthRoutes.get("/health/live", (c) => {
  const body = liveHealthResponseSchema.parse({ status: "ok" });
  return c.json(body);
});

healthRoutes.get("/api/v1/health/live", (c) => {
  const body = liveHealthResponseSchema.parse({ status: "ok" });
  return c.json(body);
});

healthRoutes.get("/health/ready", (c) => {
  const envName = c.env.SADHANAYOG_ENV;
  const hasConfig = Boolean(envName);
  if (!hasConfig) {
    return problem(c, 503, "health.not_ready", "Configuration is incomplete");
  }
  return c.json({
    status: "ok" as const,
    checks: {
      config: true,
      ...(c.env.DB === undefined ? {} : { d1: true }),
    },
  });
});
