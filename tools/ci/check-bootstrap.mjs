#!/usr/bin/env node
/**
 * Asserts the developer-bootstrap artifacts exist and stay secret-safe.
 * Does not install tools or mutate local D1.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../..", import.meta.url).pathname;

const required = [
  "tools/ci/bootstrap.sh",
  "tools/ci/local-db.mjs",
  ".env.example",
  "apps/api/.dev.vars.example",
  "docs/development/setup.md",
  "docs/development/commands.md",
  "docs/development/generated-files.md",
  "docs/development/dependencies.md",
  "docs/development/environment.md",
  "docs/development/agent-authority.md",
  "docs/operations/troubleshooting/README.md",
  ".gitignore",
  ".github/workflows/ci.yml",
];

const gitignoreNeedles = [
  ".dev.vars",
  "*.sqlite",
  "*.keystore",
  "*.jks",
  "*.mobileprovision",
  ".wrangler",
];

const secretNames = [
  "OIDC_CLIENT_SECRET",
  "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_ACCOUNT_ID",
  "D1_DATABASE_ID",
];

const errors = [];

for (const rel of required) {
  if (!existsSync(join(ROOT, rel))) errors.push(`missing ${rel}`);
}

const gitignore = existsSync(join(ROOT, ".gitignore"))
  ? readFileSync(join(ROOT, ".gitignore"), "utf8")
  : "";
for (const needle of gitignoreNeedles) {
  if (!gitignore.includes(needle)) {
    errors.push(`.gitignore does not exclude ${needle}`);
  }
}

function assignedSecrets(rel) {
  const path = join(ROOT, rel);
  if (!existsSync(path)) return;
  const src = readFileSync(path, "utf8");
  for (const line of src.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const name = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (secretNames.includes(name) && value !== "") {
      errors.push(`${rel} assigns a value to ${name}`);
    }
  }
}

assignedSecrets(".env.example");
assignedSecrets("apps/api/.dev.vars.example");

const workflowPath = join(ROOT, ".github/workflows/ci.yml");
if (existsSync(workflowPath)) {
  const workflow = readFileSync(workflowPath, "utf8");
  if (!/permissions:\s*\n\s*contents:\s*read/.test(workflow)) {
    errors.push(".github/workflows/ci.yml must default permissions to contents: read");
  }
  if (/^\s*secrets\s*:/m.test(workflow)) {
    errors.push(".github/workflows/ci.yml must not reference workflow secrets");
  }
  if (/upload-artifact/.test(workflow)) {
    errors.push(".github/workflows/ci.yml must not upload artifacts");
  }
}

if (errors.length) {
  for (const err of errors) console.error(err);
  process.exit(1);
}
process.stdout.write("ok: bootstrap artifacts\n");
