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
process.stdout.write("ok: generated OpenAPI matches source\n");
