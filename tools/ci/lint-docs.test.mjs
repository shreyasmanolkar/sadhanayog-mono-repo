import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { strict as assert } from "node:assert";

const ROOT = join(fileURLToPath(new URL("../..", import.meta.url)));
const SCRIPT = join(ROOT, "tools/ci/lint-docs.mjs");

function run(args) {
  try {
    const stdout = execFileSync("node", [SCRIPT, ...args], {
      encoding: "utf8",
      cwd: ROOT,
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { code: 0, stdout, stderr: "" };
  } catch (error) {
    return {
      code: error.status ?? 1,
      stdout: error.stdout ?? "",
      stderr: error.stderr ?? "",
    };
  }
}

const ok = run([]);
assert.equal(ok.code, 0, ok.stderr);
assert.match(ok.stdout, /ok: docs/);

const empty = mkdtempSync(join(tmpdir(), "sy-docs-empty-"));
try {
  const result = run(["--root", empty]);
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /missing docs\/README\.md/);
  assert.match(result.stderr, /missing \.agents\/notes\/README\.md/);
} finally {
  rmSync(empty, { recursive: true, force: true });
}

const headers = mkdtempSync(join(tmpdir(), "sy-docs-headers-"));
try {
  mkdirSync(join(headers, "docs"), { recursive: true });
  writeFileSync(
    join(headers, "docs/README.md"),
    `# Docs

Status: living
Last-reviewed: 2026-08-19

See [gap](missing.md).
`,
  );
  const result = run(["--root", headers]);
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /docs\/README\.md: missing Owner line/);
  assert.match(result.stderr, /docs\/README\.md: broken link missing\.md/);
} finally {
  rmSync(headers, { recursive: true, force: true });
}

process.stdout.write("ok: docs lint tests\n");
