import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { strict as assert } from "node:assert";

const ROOT = join(fileURLToPath(new URL("../..", import.meta.url)));
const SCRIPT = join(ROOT, "tools/ci/lint-decisions.mjs");

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

function proposedNote({ id, title }) {
  return `# Agent Note: ${title}

ID: ${id}
Status: proposed

## Problem
p

## Proposal
x

## Rationale
r

## Alternatives considered

- **Status quo:** keep it
- **Other:** skip it

## Impact

- **Security:** none
- **Operations:** none
- **Data:** none

## Affected components
a

## Approvers
human

## Related records
none
`;
}

function template(lifecycle) {
  const headings =
    lifecycle === "implemented" || lifecycle === "archived"
      ? [
          "Problem",
          "Decision",
          "Rationale",
          "Alternatives considered",
          "Impact",
          "Affected components",
          "Approvers",
          "Related records",
          "Consequences",
          "Implementation",
          "Verification",
        ]
      : [
          "Problem",
          "Proposal",
          "Rationale",
          "Alternatives considered",
          "Impact",
          "Affected components",
          "Approvers",
          "Related records",
        ];
  return `# Agent Note: template\n\n${headings.map((h) => `## ${h}\n`).join("\n")}`;
}

function seed(root, { note, index } = {}) {
  mkdirSync(join(root, ".agents/notes/templates"), { recursive: true });
  for (const lifecycle of ["proposed", "implemented", "rejected", "archived"]) {
    mkdirSync(join(root, ".agents/notes", lifecycle), { recursive: true });
    writeFileSync(join(root, ".agents/notes/templates", `${lifecycle}.md`), template(lifecycle));
  }
  if (note) {
    const dir = join(root, ".agents/notes/proposed/process");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "2026-08-19-example.md"), note);
  }
  mkdirSync(join(root, "docs/architecture"), { recursive: true });
  if (index !== undefined) {
    writeFileSync(join(root, "docs/architecture/decisions.md"), index);
  }
}

const repo = run([]);
assert.equal(repo.code, 0, repo.stderr);
assert.match(repo.stdout, /ok: decision notes/);

const goodRoot = mkdtempSync(join(tmpdir(), "sy-notes-good-"));
try {
  const body = proposedNote({ id: "ADR-0001", title: "Example" });
  seed(goodRoot, { note: body, index: "stale\n" });
  const stale = run(["--root", goodRoot]);
  assert.notEqual(stale.code, 0);
  assert.match(stale.stderr, /out of date/);

  const written = run(["--root", goodRoot, "--write"]);
  assert.equal(written.code, 0, written.stderr);
  const index = readFileSync(join(goodRoot, "docs/architecture/decisions.md"), "utf8");
  assert.match(index, /ADR-0001/);
  assert.match(index, /Example/);
  assert.match(index, /pnpm decisions:index/);

  const check = run(["--root", goodRoot]);
  assert.equal(check.code, 0, check.stderr);
} finally {
  rmSync(goodRoot, { recursive: true, force: true });
}

const badId = mkdtempSync(join(tmpdir(), "sy-notes-id-"));
try {
  seed(badId, {
    note: proposedNote({ id: "ADR-0001", title: "Example" }).replace("ID: ADR-0001\n", ""),
    index: "",
  });
  const result = run(["--root", badId]);
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /exactly one ID/);
} finally {
  rmSync(badId, { recursive: true, force: true });
}

const oneAlt = mkdtempSync(join(tmpdir(), "sy-notes-alt-"));
try {
  const body = proposedNote({ id: "ADR-0001", title: "Example" }).replace(
    "- **Other:** skip it\n",
    "",
  );
  seed(oneAlt, { note: body, index: "" });
  const result = run(["--root", oneAlt]);
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /at least two real options/);
} finally {
  rmSync(oneAlt, { recursive: true, force: true });
}

const dup = mkdtempSync(join(tmpdir(), "sy-notes-dup-"));
try {
  seed(dup, {
    note: proposedNote({ id: "ADR-0001", title: "Example" }),
    index: "",
  });
  mkdirSync(join(dup, ".agents/notes/proposed/architecture"), { recursive: true });
  writeFileSync(
    join(dup, ".agents/notes/proposed/architecture/2026-08-19-other.md"),
    proposedNote({ id: "ADR-0001", title: "Other" }),
  );
  const result = run(["--root", dup]);
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /duplicate ADR-0001/);
} finally {
  rmSync(dup, { recursive: true, force: true });
}

process.stdout.write("ok: decision lint tests\n");
