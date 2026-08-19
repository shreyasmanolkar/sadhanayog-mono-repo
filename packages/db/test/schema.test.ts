import { describe, expect, it } from "vitest";
import { createDb, schema } from "../src/index.js";

describe("schema foundation", () => {
  it("exports only the migration ledger until Stage 3", () => {
    expect(Object.keys(schema)).toEqual(["schemaMigrations"]);
  });

  it("exports a D1 client factory", () => {
    expect(typeof createDb).toBe("function");
  });
});
