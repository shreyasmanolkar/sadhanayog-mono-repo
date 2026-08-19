import { Hono, type Context } from "hono";
import { liveHealthResponseSchema, readyHealthResponseSchema } from "@sadhanayog/contracts";
import type { AppEnv } from "../../app/bindings.js";
import { problem } from "../../http/problem.js";

export const healthRoutes = new Hono<AppEnv>();

function live(c: Context<AppEnv>) {
  return c.json(liveHealthResponseSchema.parse({ status: "ok" }));
}

function ready(c: Context<AppEnv>) {
  if (!c.env.SADHANAYOG_ENV) {
    return problem(c, 503, "health.not_ready", "Configuration is incomplete");
  }
  const checks: { config: boolean; d1?: boolean } = { config: true };
  if (c.env.DB !== undefined) {
    checks.d1 = true;
  }
  return c.json(readyHealthResponseSchema.parse({ status: "ok", checks }));
}

healthRoutes.get("/health/live", live);
healthRoutes.get("/api/v1/health/live", live);
healthRoutes.get("/health/ready", ready);
healthRoutes.get("/api/v1/health/ready", ready);
