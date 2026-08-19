import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app/create-app.js";
import { dbFromBindings } from "../../src/app/db.js";
import type { AppEnv } from "../../src/app/bindings.js";

const configured: AppEnv["Bindings"] = {
  SADHANAYOG_ENV: "development",
  RELEASE: "test",
};

function request(path: string, env: AppEnv["Bindings"] = configured) {
  return createApp().request(path, undefined, env);
}

describe("health", () => {
  it.each(["/health/live", "/api/v1/health/live"])(
    "returns live without bindings at %s",
    async (path) => {
      const res = await request(path);
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ status: "ok" });
      expect(res.headers.get("x-request-id")).toBeTruthy();
      expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    },
  );

  it.each(["/health/ready", "/api/v1/health/ready"])(
    "returns ready when config is present at %s",
    async (path) => {
      const res = await request(path);
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ status: "ok", checks: { config: true } });
    },
  );

  it("includes the d1 check when a D1 binding is present", async () => {
    const res = await request("/health/ready", {
      ...configured,
      DB: {} as D1Database,
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      status: "ok",
      checks: { config: true, d1: true },
    });
  });

  it("returns 503 when configuration is missing", async () => {
    const res = await request("/health/ready", {
      SADHANAYOG_ENV: "",
      RELEASE: "test",
    });
    expect(res.status).toBe(503);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("health.not_ready");
    expect(res.headers.get("content-type")).toMatch(/application\/problem\+json/);
  });

  it("does not expose stack traces on missing API routes", async () => {
    const res = await request("/api/v1/does-not-exist");
    expect(res.status).toBe(404);
    const body = (await res.json()) as { detail?: string; code: string };
    expect(body.code).toBe("http.not_found");
    expect(JSON.stringify(body)).not.toMatch(/stack trace|SQLSTATE|D1_ERROR/i);
  });
});

describe("typed D1 boot", () => {
  it("does not construct a client without a binding", () => {
    expect(dbFromBindings(configured)).toBeUndefined();
  });
});
