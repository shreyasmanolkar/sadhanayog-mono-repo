import { describe, expect, it } from "vitest";
import { schema } from "../src/index.js";

describe("schema foundation", () => {
  it("exports only the migration ledger until Stage 3", () => {
    expect(Object.keys(schema)).toEqual(["schemaMigrations"]);
  });
});
