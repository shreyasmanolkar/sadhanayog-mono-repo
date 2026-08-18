#!/usr/bin/env node
/**
 * In-repo issue tracker. Markdown files are the database.
 * Zero dependencies. Node >= 24.
 *
 *   node tools/tracker/track.mjs lint
 *   node tools/tracker/track.mjs show SY-0002
 *   node tools/tracker/track.mjs next
 *   node tools/tracker/track.mjs move SY-0002 in_progress
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const ISSUES_DIR = join(ROOT, "docs/issue-tracking/issues");
const ARCHIVE_DIR = join(ROOT, "docs/issue-tracking/archive");
const CONFIG_PATH = join(ROOT, "docs/issue-tracking/config.yml");
const INDEX_PATH = join(ROOT, "docs/issue-tracking/index.md");

const TYPES = new Set(["Epic", "Feature", "Task", "Bug", "Technical Debt", "Spike"]);
const STATUSES = new Set([
  "triage",
  "backlog",
  "ready",
  "in_progress",
  "blocked",
  "in_review",
  "done",
  "canceled",
  "duplicate",
]);
const PRIORITIES = new Set(["P0", "P1", "P2", "P3"]);
const SECURITY = new Set(["none", "low", "medium", "high"]);
const REQUIRED_HEADINGS = [
  "Objective",
  "Context/Architectural References",
  "In Scope",
  "Out of Scope",
  "Implementation Requirements",
  "Acceptance Criteria",
  "Testing Requirements",
  "Security/Privacy Requirements",
  "Documentation Requirements",
  "Rollback/Recovery",
  "Implementation Notes",
  "Review Evidence",
  "Completion Checklist",
];
const TERMINAL = new Set(["done", "canceled", "duplicate"]);

function parseScalar(raw) {
  const s = raw.trim();
  if (s === "" || s === "null" || s === "~") return null;
  if (s === "true") return true;
  if (s === "false") return false;
  if (s.startsWith("[") && s.endsWith("]")) {
    const inner = s.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((p) => parseScalar(p));
  }
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  if (/^-?\d+$/.test(s)) return Number(s);
  return s;
}

function parseFrontMatter(src, file) {
  if (!src.startsWith("---\n")) throw new Error(`${file}: missing YAML front matter`);
  const end = src.indexOf("\n---\n", 4);
  if (end === -1) throw new Error(`${file}: unclosed front matter`);
  const yaml = src.slice(4, end);
  const body = src.slice(end + 5);
  const fm = {};
  for (const line of yaml.split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx === -1) throw new Error(`${file}: cannot parse "${line}"`);
    fm[line.slice(0, idx).trim()] = parseScalar(line.slice(idx + 1));
  }
  return { fm, body };
}

function emitScalar(v) {
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean" || typeof v === "number") return String(v);
  if (Array.isArray(v)) return `[${v.map(emitScalar).join(", ")}]`;
  if (/[:#[\]{}]/.test(String(v)) || String(v).includes(" ")) return JSON.stringify(v);
  return String(v);
}

function serializeIssue(fm, body) {
  const order = [
    "id",
    "title",
    "type",
    "status",
    "priority",
    "stage",
    "parent",
    "blocked_by",
    "blocks",
    "relates",
    "owner",
    "resource",
    "security_impact",
    "created",
    "updated",
  ];
  const lines = ["---"];
  for (const key of order) {
    if (key in fm) lines.push(`${key}: ${emitScalar(fm[key])}`);
  }
  for (const key of Object.keys(fm)) {
    if (!order.includes(key)) lines.push(`${key}: ${emitScalar(fm[key])}`);
  }
  lines.push("---", "", body.replace(/^\n+/, "").replace(/\n+$/, ""), "");
  return lines.join("\n");
}

function headings(body) {
  return [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
}

function loadIssues() {
  if (!existsSync(ISSUES_DIR)) return [];
  const files = readdirSync(ISSUES_DIR).filter((f) => f.endsWith(".md"));
  return files.map((file) => {
    const path = join(ISSUES_DIR, file);
    const src = readFileSync(path, "utf8");
    const { fm, body } = parseFrontMatter(src, file);
    return { file, path, fm, body };
  });
}

function byId(issues) {
  const map = new Map();
  for (const issue of issues) map.set(issue.fm.id, issue);
  return map;
}

function lint(issues) {
  const errors = [];
  const ids = new Set();
  const map = byId(issues);

  if (!existsSync(CONFIG_PATH)) errors.push("missing docs/issue-tracking/config.yml");

  for (const issue of issues) {
    const { file, fm, body } = issue;
    const expectName = `${fm.id}.md`;
    if (file !== expectName) errors.push(`${file}: filename must be ${expectName}`);
    if (!/^SY-\d{4}$/.test(fm.id || "")) errors.push(`${file}: invalid id`);
    if (ids.has(fm.id)) errors.push(`${file}: duplicate id ${fm.id}`);
    ids.add(fm.id);
    if (!fm.title) errors.push(`${file}: title required`);
    if (!TYPES.has(fm.type)) errors.push(`${file}: unknown type ${fm.type}`);
    if (!STATUSES.has(fm.status)) errors.push(`${file}: unknown status ${fm.status}`);
    if (!PRIORITIES.has(fm.priority)) errors.push(`${file}: unknown priority ${fm.priority}`);
    if (!SECURITY.has(fm.security_impact)) errors.push(`${file}: unknown security_impact`);
    if (typeof fm.stage !== "number") errors.push(`${file}: stage must be a number`);
    if (!Array.isArray(fm.blocked_by)) errors.push(`${file}: blocked_by must be a list`);
    if (!Array.isArray(fm.blocks)) errors.push(`${file}: blocks must be a list`);
    if (!Array.isArray(fm.relates)) errors.push(`${file}: relates must be a list`);
    const found = headings(body);
    for (const h of REQUIRED_HEADINGS) {
      if (!found.includes(h)) errors.push(`${file}: missing heading ## ${h}`);
    }
    if (fm.parent && !map.has(fm.parent))
      errors.push(`${file}: parent ${fm.parent} does not exist`);
    if (fm.parent === fm.id) errors.push(`${file}: parent cannot be self`);
    if (
      fm.status === "ready" &&
      (fm.blocked_by || []).some((id) => map.has(id) && !TERMINAL.has(map.get(id).fm.status))
    ) {
      errors.push(`${file}: ready issues cannot have open blockers`);
    }
    if (fm.status === "done") {
      const unchecked = [...body.matchAll(/^- \[ \] /gm)];
      const acceptance = body.split("## Acceptance Criteria")[1]?.split("## ")[0] ?? "";
      if (acceptance.includes("- [ ]")) {
        errors.push(`${file}: done issues must check Acceptance Criteria`);
      }
      void unchecked;
    }
    if (fm.status === "duplicate" && (!fm.relates || fm.relates.length === 0)) {
      errors.push(`${file}: duplicate must set relates`);
    }
  }

  for (const issue of issues) {
    for (const dep of issue.fm.blocked_by || []) {
      if (!map.has(dep)) errors.push(`${issue.file}: blocked_by ${dep} does not exist`);
    }
    for (const rel of issue.fm.relates || []) {
      if (!map.has(rel)) errors.push(`${issue.file}: relates ${rel} does not exist`);
    }
  }

  // Inverse symmetry: blocks must equal dependents' blocked_by
  const expectedBlocks = new Map();
  for (const issue of issues) expectedBlocks.set(issue.fm.id, []);
  for (const issue of issues) {
    for (const dep of issue.fm.blocked_by || []) {
      if (expectedBlocks.has(dep)) expectedBlocks.get(dep).push(issue.fm.id);
    }
  }
  for (const issue of issues) {
    const actual = [...(issue.fm.blocks || [])].sort();
    const expected = (expectedBlocks.get(issue.fm.id) || []).sort();
    if (actual.join() !== expected.join()) {
      errors.push(
        `${issue.file}: blocks must be [${expected.join(", ")}] (derived from blocked_by)`,
      );
    }
  }

  // Cycle detection
  const visiting = new Set();
  const seen = new Set();
  const visit = (id, stack) => {
    if (seen.has(id)) return;
    if (visiting.has(id)) {
      errors.push(`dependency cycle: ${[...stack, id].join(" → ")}`);
      return;
    }
    visiting.add(id);
    const node = map.get(id);
    for (const dep of node?.fm.blocked_by || []) visit(dep, [...stack, id]);
    if (node?.fm.parent) visit(node.fm.parent, [...stack, id]);
    visiting.delete(id);
    seen.add(id);
  };
  for (const issue of issues) visit(issue.fm.id, []);

  return errors;
}

function writeIndex(issues) {
  const sorted = [...issues].sort((a, b) => a.fm.id.localeCompare(b.fm.id));
  const lines = [
    "# Issue index",
    "",
    "Generated by `node tools/tracker/track.mjs lint`. Do not edit by hand.",
    "",
    "| ID | Title | Type | Status | Priority | Stage | Blocked by |",
    "|---|---|---|---|---|---:|---|",
  ];
  for (const issue of sorted) {
    const blocked = (issue.fm.blocked_by || []).join(", ") || "—";
    lines.push(
      `| [${issue.fm.id}](issues/${issue.file}) | ${issue.fm.title} | ${issue.fm.type} | ${issue.fm.status} | ${issue.fm.priority} | ${issue.fm.stage} | ${blocked} |`,
    );
  }
  lines.push("");
  mkdirSync(dirname(INDEX_PATH), { recursive: true });
  writeFileSync(INDEX_PATH, lines.join("\n"));
}

function show(issues, id) {
  const issue = issues.find((i) => i.fm.id === id);
  if (!issue) {
    console.error(`Unknown issue ${id}`);
    process.exit(1);
  }
  process.stdout.write(`# ${issue.fm.id} ${issue.fm.title}\n`);
  process.stdout.write(
    `${issue.fm.type} · ${issue.fm.status} · ${issue.fm.priority} · stage ${issue.fm.stage}\n\n`,
  );
  process.stdout.write(issue.body);
}

function nextReady(issues) {
  const map = byId(issues);
  const ready = issues.filter((issue) => {
    if (issue.fm.status !== "ready" && issue.fm.status !== "backlog") return false;
    const blockers = issue.fm.blocked_by || [];
    const open = blockers.filter((id) => map.has(id) && !TERMINAL.has(map.get(id).fm.status));
    return open.length === 0 && issue.fm.status !== "done";
  });
  const unblockedReady = ready.filter((i) => i.fm.status === "ready");
  const pool = unblockedReady.length ? unblockedReady : ready.filter((i) => i.fm.type !== "Epic");
  pool.sort((a, b) => a.fm.id.localeCompare(b.fm.id));
  if (!pool.length) {
    process.stdout.write("No unblocked issues.\n");
    return;
  }
  process.stdout.write("Unblocked frontier:\n");
  for (const issue of pool.slice(0, 20)) {
    process.stdout.write(
      `- ${issue.fm.id} ${issue.fm.title} (${issue.fm.status}, ${issue.fm.type})\n`,
    );
  }
}

function move(issues, id, status) {
  if (!STATUSES.has(status)) {
    console.error(`Unknown status ${status}`);
    process.exit(1);
  }
  const issue = issues.find((i) => i.fm.id === id);
  if (!issue) {
    console.error(`Unknown issue ${id}`);
    process.exit(1);
  }
  const today = new Date().toISOString().slice(0, 10);
  issue.fm.status = status;
  issue.fm.updated = today;
  if (status === "canceled" && existsSync(issue.path)) {
    mkdirSync(ARCHIVE_DIR, { recursive: true });
  }
  writeFileSync(issue.path, serializeIssue(issue.fm, issue.body));
  process.stdout.write(`${id} → ${status}\n`);
}

function usage() {
  process.stdout.write(`Usage:
  track.mjs lint
  track.mjs show SY-NNNN
  track.mjs next
  track.mjs move SY-NNNN <status>
`);
}

const [cmd, a, b] = process.argv.slice(2);
const issues = loadIssues();

if (cmd === "lint" || cmd === undefined) {
  const errors = lint(issues);
  if (errors.length) {
    for (const err of errors) console.error(err);
    process.exit(1);
  }
  writeIndex(issues);
  process.stdout.write(`ok: ${issues.length} issues\n`);
} else if (cmd === "show") {
  if (!a) {
    usage();
    process.exit(1);
  }
  show(issues, a);
} else if (cmd === "next") {
  nextReady(issues);
} else if (cmd === "move") {
  if (!a || !b) {
    usage();
    process.exit(1);
  }
  move(issues, a, b);
  const next = loadIssues();
  const errors = lint(next);
  if (errors.length) {
    for (const err of errors) console.error(err);
    process.exit(1);
  }
  writeIndex(next);
} else {
  usage();
  process.exit(1);
}
