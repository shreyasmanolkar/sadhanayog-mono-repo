import { describe, expect, it } from "vitest";
import { createApp } from "../src/app/create-app.js";

function request(path: string) {
  const app = createApp();
  return app.request(path, undefined, {
    SADHANAYOG_ENV: "development",
    RELEASE: "test",
  });
}

describe("health", () => {
  it("returns live without bindings", async () => {
    const res = await request("/health/live");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
    expect(res.headers.get("x-request-id")).toBeTruthy();
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
  });

  it("returns ready when config is present", async () => {
    const res = await request("/health/ready");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ status: "ok", checks: { config: true } });
  });

  it("does not expose stack traces on missing API routes", async () => {
    const res = await request("/api/v1/does-not-exist");
    expect(res.status).toBe(404);
    const body = (await res.json()) as { detail?: string; code: string };
    expect(body.code).toBe("http.not_found");
    expect(JSON.stringify(body)).not.toMatch(/stack trace|SQLSTATE|D1_ERROR/i);
  });
});
