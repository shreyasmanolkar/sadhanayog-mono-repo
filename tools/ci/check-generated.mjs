#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const ROOT = new URL("../..", import.meta.url).pathname;
const OPENAPI = join(ROOT, "packages/contracts/openapi/openapi.json");

const before = readFileSync(OPENAPI, "utf8");
execSync("pnpm --filter @sadhanayog/contracts openapi", { cwd: ROOT, stdio: "inherit" });
const after = readFileSync(OPENAPI, "utf8");
if (before !== after) {
  console.error(
    "packages/contracts/openapi/openapi.json is out of date. Run pnpm --filter @sadhanayog/contracts build",
  );
  process.exit(1);
}

let doc;
try {
  doc = JSON.parse(after);
} catch (error) {
  console.error("packages/contracts/openapi/openapi.json is not valid JSON");
  throw error;
}

if (doc["x-generated-from"] !== "packages/contracts/src/openapi.ts") {
  console.error("generated OpenAPI is missing x-generated-from");
  process.exit(1);
}
if (doc["x-generated-by"] !== "packages/contracts/scripts/write-openapi.mjs") {
  console.error("generated OpenAPI is missing x-generated-by");
  process.exit(1);
}

process.stdout.write("ok: generated OpenAPI matches source\n");
