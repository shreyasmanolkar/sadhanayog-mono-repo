import { describe, expect, it } from "vitest";
import { liveHealthResponseSchema, problemDetailsSchema } from "../src/index.js";

describe("health contracts", () => {
  it("accepts a live response", () => {
    expect(liveHealthResponseSchema.parse({ status: "ok" })).toEqual({ status: "ok" });
  });

  it("rejects a product-shaped leak", () => {
    expect(() => liveHealthResponseSchema.parse({ status: "ok", db: { rows: [] } })).toThrow();
  });
});

describe("problem details", () => {
  it("requires a stable code and request id", () => {
    const parsed = problemDetailsSchema.parse({
      type: "about:blank",
      title: "Not ready",
      status: 503,
      code: "health.not_ready",
      requestId: "req_test",
    });
    expect(parsed.code).toBe("health.not_ready");
  });
});
