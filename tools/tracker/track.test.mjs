import { mkdtempSync, mkdirSync, writeFileSync, cpSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { strict as assert } from "node:assert";
import {
  ROOT,
  lint,
  loadState,
  patchIssue,
  createIssue,
  selectNext,
  serializeDoc,
  completionProblems,
  exportStatic,
} from "../../docs/issue-tracking/track.mjs";

const temps = [];

function tmpBundle() {
  const dir = mkdtempSync(join(tmpdir(), "sy-track-"));
  temps.push(dir);
  mkdirSync(join(dir, "issues"));
  mkdirSync(join(dir, "projects"));
  mkdirSync(join(dir, "archive"));
  mkdirSync(join(dir, "templates"));
  mkdirSync(join(dir, "board"));
  cpSync(join(ROOT, "config.yml"), join(dir, "config.yml"));
  writeFileSync(
    join(dir, "projects", "stage-1.md"),
    `---
type: Project
id: stage-1
title: Stage 1
description: Fixture project.
initiative: foundation
color: "#5e6ad2"
status: planned
lead: unassigned
resource: docs/architecture/engineering-foundation.md
created: 2026-08-19
timestamp: 2026-08-19T00:00:00Z
---
`,
  );
  return dir;
}

function issueMeta(id, extra = {}) {
  return {
    type: "Issue",
    id,
    title: extra.title ?? id,
    description: extra.description ?? "Fixture issue.",
    status: extra.status ?? "backlog",
    priority: extra.priority ?? "P2",
    estimate: extra.estimate ?? null,
    assignee: extra.assignee ?? "unassigned",
    project: extra.project ?? null,
    milestone: extra.milestone ?? null,
    cycle: extra.cycle ?? null,
    rank: extra.rank ?? null,
    tags: extra.tags ?? ["task"],
    parent: extra.parent ?? null,
    blocked_by: extra.blocked_by ?? [],
    blocks: extra.blocks ?? [],
    relates: extra.relates ?? [],
    resource: extra.resource ?? "docs/roadmap/implementation-roadmap.md",
    created: "2026-08-19",
    timestamp: "2026-08-19T00:00:00Z",
  };
}

const OPEN_BODY = `## Acceptance Criteria

- [ ] Named outcome exists

## Review Evidence

_None yet._

## Completion Checklist

- [ ] Acceptance criteria checked
- [ ] Required verification commands recorded
- [ ] Independent review recorded
- [ ] Protected-path human approval recorded if applicable
`;

const DONE_BODY = `## Acceptance Criteria

- [x] Named outcome exists

## Review Evidence

Fixture lint passed with 0 errors.

## Completion Checklist

- [x] Acceptance criteria checked
- [x] Required verification commands recorded
- [ ] Independent review recorded
- [ ] Protected-path human approval recorded if applicable
`;

function writeIssue(root, id, extra = {}, body = OPEN_BODY, folder = "issues") {
  writeFileSync(join(root, folder, `${id}.md`), serializeDoc(issueMeta(id, extra), body));
}

function errors(root) {
  return lint(root)
    .problems.filter((p) => p.level === "error")
    .map((p) => p.msg);
}

function test(name, fn) {
  fn();
  process.stdout.write(`ok: ${name}\n`);
}

try {
  test("live lint is a DAG with no errors", () => {
    const { problems, counts } = lint();
    assert.equal(
      problems.filter((p) => p.level === "error").length,
      0,
      problems
        .filter((p) => p.level === "error")
        .map((p) => p.msg)
        .join("\n"),
    );
    assert.ok(counts.issues >= 1);
  });

  test("live next default is ready-only", () => {
    const { config, issues } = loadState();
    const ready = selectNext(issues, config);
    assert.ok(ready.every((i) => i.status === "ready"));
    const all = selectNext(issues, config, { all: true });
    assert.ok(all.length >= ready.length);
  });

  test("dependency cycle is an error", () => {
    const root = tmpBundle();
    writeIssue(root, "SY-0001", { blocked_by: ["SY-0002"], blocks: ["SY-0002"] });
    writeIssue(root, "SY-0002", { blocked_by: ["SY-0001"], blocks: ["SY-0001"] });
    const msgs = errors(root).join("\n");
    assert.match(msgs, /dependency cycle/);
  });

  test("parent cycle is an error", () => {
    const root = tmpBundle();
    writeIssue(root, "SY-0001", { parent: "SY-0002" });
    writeIssue(root, "SY-0002", { parent: "SY-0001" });
    const msgs = errors(root).join("\n");
    assert.match(msgs, /parent cycle/);
  });

  test("unknown status is an error", () => {
    const root = tmpBundle();
    writeIssue(root, "SY-0001", { status: "shipping" });
    const msgs = errors(root).join("\n");
    assert.match(msgs, /unknown status/);
  });

  test("exclusive kind labels cannot both be set", () => {
    const root = tmpBundle();
    writeIssue(root, "SY-0001", { tags: ["task", "bug"] });
    const msgs = errors(root).join("\n");
    assert.match(msgs, /exclusive/);
  });

  test("ready cannot keep an open blocker", () => {
    const root = tmpBundle();
    writeIssue(root, "SY-0001", { status: "in_progress", blocks: ["SY-0002"] });
    writeIssue(root, "SY-0002", { status: "ready", blocked_by: ["SY-0001"] });
    const msgs = errors(root).join("\n");
    assert.match(msgs, /ready issues cannot have open blockers/);
  });

  test("blocked requires blocked_by", () => {
    const root = tmpBundle();
    writeIssue(root, "SY-0001", { status: "blocked" });
    const msgs = errors(root).join("\n");
    assert.match(msgs, /status is `blocked`/);
  });

  test("duplicate requires relates", () => {
    const root = tmpBundle();
    writeIssue(root, "SY-0001", { status: "duplicate" });
    const msgs = errors(root).join("\n");
    assert.match(msgs, /status is `duplicate`/);
  });

  test("asymmetric blocked_by/blocks is an error", () => {
    const root = tmpBundle();
    writeIssue(root, "SY-0001", { status: "done", blocks: [] }, DONE_BODY);
    writeIssue(root, "SY-0002", { blocked_by: ["SY-0001"], blocks: [] });
    const msgs = errors(root).join("\n");
    assert.match(msgs, /asymmetric edge/);
  });

  test("done without completion evidence is an error", () => {
    const root = tmpBundle();
    writeIssue(root, "SY-0001", { status: "done" }, OPEN_BODY);
    const msgs = errors(root).join("\n");
    assert.match(msgs, /Acceptance Criteria still has open checkboxes/);
    assert.match(msgs, /Review Evidence is empty/);
    const issue = loadState(root).issues[0];
    assert.ok(completionProblems(issue).length >= 2);
  });

  test("done with evidence lints clean", () => {
    const root = tmpBundle();
    writeIssue(root, "SY-0001", { status: "done" }, DONE_BODY);
    assert.deepEqual(errors(root), []);
  });

  test("move to done is refused without evidence", () => {
    const root = tmpBundle();
    writeIssue(root, "SY-0001", { status: "in_review" }, OPEN_BODY);
    assert.throws(() => patchIssue("SY-0001", { status: "done" }, root), /Acceptance Criteria/);
    assert.equal(loadState(root).issues[0].status, "in_review");
  });

  test("set blocked_by mirrors blocks on the peer", () => {
    const root = tmpBundle();
    writeIssue(root, "SY-0001", { status: "in_progress" });
    writeIssue(root, "SY-0002", { status: "backlog" });
    patchIssue("SY-0002", { blocked_by: ["SY-0001"] }, root);
    const byId = new Map(loadState(root).issues.map((i) => [i.id, i]));
    assert.deepEqual(byId.get("SY-0001").blocks, ["SY-0002"]);
    assert.deepEqual(byId.get("SY-0002").blocked_by, ["SY-0001"]);
    assert.deepEqual(errors(root), []);
  });

  test("next returns only ready by default", () => {
    const root = tmpBundle();
    writeIssue(root, "SY-0001", { status: "done", blocks: ["SY-0002", "SY-0003"] }, DONE_BODY);
    writeIssue(root, "SY-0002", { status: "ready", blocked_by: ["SY-0001"] });
    writeIssue(root, "SY-0003", { status: "todo", blocked_by: ["SY-0001"] });
    writeIssue(root, "SY-0004", { status: "backlog" });
    writeIssue(root, "SY-0005", { status: "ready", blocked_by: ["SY-0003"] });
    const { config, issues } = loadState(root);
    const ready = selectNext(issues, config).map((i) => i.id);
    assert.deepEqual(ready, ["SY-0002"]);
    const all = selectNext(issues, config, { all: true }).map((i) => i.id);
    assert.deepEqual(all, ["SY-0002", "SY-0003", "SY-0004"]);
  });

  test("createIssue allocates the next stable id and mirrors blockers", () => {
    const root = tmpBundle();
    writeIssue(root, "SY-0007", { status: "in_progress" });
    const created = createIssue(
      { title: "Follow-on", status: "triage", blocked_by: ["SY-0007"], tags: ["task"] },
      root,
    );
    assert.equal(created.id, "SY-0008");
    const byId = new Map(loadState(root).issues.map((i) => [i.id, i]));
    assert.deepEqual(byId.get("SY-0007").blocks, ["SY-0008"]);
    assert.deepEqual(byId.get("SY-0008").blocked_by, ["SY-0007"]);
  });

  test("archived issue files still lint", () => {
    const root = tmpBundle();
    writeIssue(root, "SY-0001", { status: "done" }, DONE_BODY, "archive");
    const state = loadState(root);
    assert.equal(state.issues[0].file, "archive/SY-0001.md");
    assert.deepEqual(errors(root), []);
  });

  test("export writes a self-contained board without touching the repo", () => {
    const root = tmpBundle();
    writeIssue(root, "SY-0001", { status: "ready" });
    writeFileSync(
      join(root, "board", "index.html"),
      '<html><link rel="stylesheet" href="board.css" /><script type="module" src="board.js"></script></html>',
    );
    writeFileSync(join(root, "board", "board.css"), "body{}");
    writeFileSync(join(root, "board", "board.js"), "console.log(1)");
    const out = join(root, "board.html");
    const result = exportStatic(out, root);
    assert.equal(result.issues, 1);
    assert.ok(existsSync(out));
  });
} finally {
  for (const dir of temps) rmSync(dir, { recursive: true, force: true });
}
