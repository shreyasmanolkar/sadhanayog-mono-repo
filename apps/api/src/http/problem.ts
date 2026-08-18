import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ProblemDetails } from "@sadhanayog/contracts";
import type { AppEnv } from "../app/bindings.js";

export function problem(
  c: Context<AppEnv>,
  status: ContentfulStatusCode,
  code: string,
  title: string,
  detail?: string,
): Response {
  const body: ProblemDetails = {
    type: "about:blank",
    title,
    status,
    code,
    requestId: c.get("requestId"),
    ...(detail === undefined ? {} : { detail }),
  };
  return c.json(body, status, {
    "Content-Type": "application/problem+json; charset=utf-8",
    "Cache-Control": "no-store",
  });
}
