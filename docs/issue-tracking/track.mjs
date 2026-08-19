#!/usr/bin/env node
/**
 * Sadhana Yog Track — an in-repo, git-native issue tracker.
 *
 * The markdown files in `issues/` are the database. This file is the only executable:
 * a parser, a validator, a local server for the board, and a static exporter.
 *
 * Zero dependencies, Node >= 18 built-ins only. See SPEC.md for the format and
 * README.md for the commands.
 */

import { createServer } from "node:http";
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, watch } from "node:fs";
import { join, dirname, extname, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const TERMINAL = new Set(["done", "canceled", "duplicate"]);

function trackerPaths(root = ROOT) {
  return {
    root,
    issues: join(root, "issues"),
    archive: join(root, "archive"),
    projects: join(root, "projects"),
    board: join(root, "board"),
    templates: join(root, "templates"),
    config: join(root, "config.yml"),
  };
}

/* ══════════════════════════════════════════════════════════════════════════════
   1. YAML — a deliberately small subset (see SPEC.md §3)
   Supports: nested maps, block lists, flow lists/maps, scalars, comments, quotes.
   Does NOT support: anchors, multi-line scalars (| >), multi-doc, complex keys.
   `track lint` rejects anything outside the subset, so files never silently drift.
   ══════════════════════════════════════════════════════════════════════════════ */

function stripComment(line) {
  let out = "";
  let quote = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) {
      out += ch;
      if (ch === quote && line[i - 1] !== "\\") quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      out += ch;
      continue;
    }
    // A `#` only starts a comment at line start or after whitespace.
    if (ch === "#" && (i === 0 || /\s/.test(line[i - 1]))) break;
    out += ch;
  }
  return out.replace(/\s+$/, "");
}

function unquote(s) {
  const t = s.trim();
  if (
    (t.startsWith('"') && t.endsWith('"') && t.length > 1) ||
    (t.startsWith("'") && t.endsWith("'") && t.length > 1)
  ) {
    return t.slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\\\/g, "\\");
  }
  return t;
}

/** Split "a, b, [c, d]" on top-level commas only. */
function splitTopLevel(s, open = "[", close = "]") {
  const parts = [];
  let depth = 0;
  let quote = null;
  let cur = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (quote) {
      cur += ch;
      if (ch === quote && s[i - 1] !== "\\") quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
      continue;
    }
    if (ch === "[" || ch === "{") depth++;
    if (ch === "]" || ch === "}") depth--;
    if (ch === "," && depth === 0) {
      parts.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim() !== "") parts.push(cur);
  return parts.map((p) => p.trim());
}

function parseScalar(raw) {
  const s = raw.trim();
  if (s === "" || s === "null" || s === "~") return null;
  if (s.startsWith("[")) {
    const inner = s.slice(1, s.lastIndexOf("]"));
    return inner.trim() === "" ? [] : splitTopLevel(inner).map(parseScalar);
  }
  if (s.startsWith("{")) {
    const inner = s.slice(1, s.lastIndexOf("}"));
    const obj = {};
    if (inner.trim() === "") return obj;
    for (const pair of splitTopLevel(inner)) {
      const idx = pair.indexOf(":");
      if (idx === -1) continue;
      obj[unquote(pair.slice(0, idx))] = parseScalar(pair.slice(idx + 1));
    }
    return obj;
  }
  if (s.startsWith('"') || s.startsWith("'")) return unquote(s);
  if (s === "true") return true;
  if (s === "false") return false;
  // Dates stay strings on purpose — no timezone surprises, byte-stable round-trips.
  if (/^-?\d+$/.test(s)) return parseInt(s, 10);
  if (/^-?\d*\.\d+$/.test(s)) return parseFloat(s);
  return s;
}

function parseYaml(src, file = "<yaml>") {
  const lines = [];
  src.split(/\r?\n/).forEach((raw, i) => {
    const line = stripComment(raw);
    if (!line.trim()) return;
    lines.push({ indent: line.match(/^ */)[0].length, text: line.trim(), n: i + 1 });
  });

  let pos = 0;
  const fail = (msg, ln) => {
    throw new Error(`${file}:${ln ?? "?"} — ${msg}`);
  };

  const isListItem = (l) => l.text === "-" || l.text.startsWith("- ");

  function parseBlock(indent) {
    if (pos >= lines.length || lines[pos].indent < indent) return null;
    return isListItem(lines[pos]) ? parseList(indent) : parseMap(indent);
  }

  function parseList(indent) {
    const arr = [];
    while (pos < lines.length && lines[pos].indent === indent && isListItem(lines[pos])) {
      const line = lines[pos];
      const rest = line.text === "-" ? "" : line.text.slice(2).trim();
      const childIndent = line.indent + 2;
      if (rest === "") {
        pos++;
        arr.push(parseBlock(childIndent));
      } else if (/^(?:"[^"]*"|'[^']*'|[^:{}[\]]+?)\s*:(?:\s|$)/.test(rest)) {
        // `- key: value` — the item is a map whose first key sits after the dash.
        lines[pos] = { indent: childIndent, text: rest, n: line.n };
        arr.push(parseMap(childIndent));
      } else {
        pos++;
        arr.push(parseScalar(rest));
      }
    }
    return arr;
  }

  function parseMap(indent) {
    const obj = {};
    while (pos < lines.length && lines[pos].indent === indent) {
      const line = lines[pos];
      if (isListItem(line)) break;
      const m = line.text.match(/^("(?:[^"\\]|\\.)*"|'[^']*'|[^:]+?)\s*:\s*(.*)$/);
      if (!m) fail(`cannot parse "${line.text}" (expected \`key: value\`)`, line.n);
      const key = unquote(m[1]);
      const rest = m[2].trim();
      pos++;
      if (rest === "") {
        const next = lines[pos];
        if (next && next.indent > indent) obj[key] = parseBlock(next.indent);
        else if (next && next.indent === indent && isListItem(next)) obj[key] = parseList(indent);
        else obj[key] = null;
      } else {
        obj[key] = parseScalar(rest);
      }
    }
    return obj;
  }

  const result = parseBlock(lines.length ? lines[0].indent : 0);
  return result ?? {};
}

/* ── YAML emit (frontmatter only; config.yml is hand-owned and never rewritten) ── */

function emitScalar(v) {
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean" || typeof v === "number") return String(v);
  if (Array.isArray(v)) return `[${v.map(emitScalar).join(", ")}]`;
  if (typeof v === "object") {
    return `{${Object.entries(v)
      .map(([k, x]) => `${k}: ${emitScalar(x)}`)
      .join(", ")}}`;
  }
  const s = String(v);
  // Quote only when the plain form would be ambiguous or would break the parser.
  const needsQuote =
    s === "" ||
    /^(true|false|null|~|-?\d+(\.\d+)?)$/.test(s) ||
    /^[\s>|*&!%@`[\]{},#-]/.test(s) ||
    /:\s/.test(s) ||
    s.includes(" #") ||
    /["\n]/.test(s);
  return needsQuote
    ? `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`
    : s;
}

/* ══════════════════════════════════════════════════════════════════════════════
   2. The issue document
   ══════════════════════════════════════════════════════════════════════════════ */

/** Canonical key order. Unknown keys are preserved and appended (OKF §Extensions). */
const KEY_ORDER = [
  "type",
  "id",
  "title",
  "description",
  "status",
  "priority",
  "estimate",
  "assignee",
  "project",
  "milestone",
  "cycle",
  "rank",
  "tags",
  "parent",
  "blocked_by",
  "blocks",
  "relates",
  "resource",
  "linear_id",
  "branch",
  "pr",
  "created",
  "timestamp",
];

const FM_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

function parseDoc(path) {
  const raw = readFileSync(path, "utf8");
  const m = raw.match(FM_RE);
  if (!m) throw new Error(`${basename(path)} — missing YAML frontmatter (must start with \`---\`)`);
  const meta = parseYaml(m[1], basename(path));
  return { meta, body: m[2], path, raw };
}

function serializeDoc(meta, body) {
  const seen = new Set();
  const lines = [];
  for (const k of KEY_ORDER) {
    if (k in meta) {
      lines.push(`${k}: ${emitScalar(meta[k])}`);
      seen.add(k);
    }
  }
  // OKF: "consumers must preserve unknown fields."
  for (const k of Object.keys(meta)) {
    if (!seen.has(k)) lines.push(`${k}: ${emitScalar(meta[k])}`);
  }
  const trimmed = body.replace(/^\n+/, "").replace(/\s+$/, "");
  return `---\n${lines.join("\n")}\n---\n\n${trimmed}\n`;
}

const TASK_RE = /^(\s*)[-*] \[([ xX])\]\s?(.*)$/;

function tasksOf(body) {
  const out = [];
  body.split("\n").forEach((line, i) => {
    const m = line.match(TASK_RE);
    if (m) out.push({ line: i, checked: m[2].toLowerCase() === "x", text: m[3].trim() });
  });
  return out;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nowIso() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

/* ══════════════════════════════════════════════════════════════════════════════
   3. The store
   ══════════════════════════════════════════════════════════════════════════════ */

function loadConfig(root = ROOT) {
  return parseYaml(readFileSync(trackerPaths(root).config, "utf8"), "config.yml");
}

function listMd(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => extname(f) === ".md" && !f.startsWith("_"))
    .map((f) => join(dir, f));
}

function listIssueFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /^[A-Za-z]+-\d+\.md$/.test(f))
    .map((f) => join(dir, f));
}

function loadIssues(root = ROOT) {
  const dir = trackerPaths(root);
  const issues = [];
  const errors = [];
  const files = [
    ...listIssueFiles(dir.issues).map((path) => ({ path, file: `issues/${basename(path)}` })),
    ...listIssueFiles(dir.archive).map((path) => ({ path, file: `archive/${basename(path)}` })),
  ];
  for (const { path, file } of files) {
    try {
      const { meta, body } = parseDoc(path);
      const tasks = tasksOf(body);
      issues.push({
        ...meta,
        body,
        file,
        tasks_total: tasks.length,
        tasks_done: tasks.filter((t) => t.checked).length,
      });
    } catch (e) {
      errors.push(e.message);
    }
  }
  issues.sort((a, b) => idNum(a.id) - idNum(b.id));
  return { issues, errors };
}

function loadProjects(root = ROOT) {
  return listMd(trackerPaths(root).projects).map((path) => {
    const { meta, body } = parseDoc(path);
    return {
      ...meta,
      body,
      id: meta.id ?? basename(path, ".md"),
      file: `projects/${basename(path)}`,
    };
  });
}

function idNum(id) {
  const m = String(id ?? "").match(/(\d+)$/);
  return m ? parseInt(m[1], 10) : 0;
}

function issuePath(id, root = ROOT) {
  const dir = trackerPaths(root);
  const inIssues = join(dir.issues, `${id}.md`);
  const inArchive = join(dir.archive, `${id}.md`);
  if (existsSync(inArchive) && !existsSync(inIssues)) return inArchive;
  return inIssues;
}

function loadState(root = ROOT) {
  const config = loadConfig(root);
  const { issues, errors } = loadIssues(root);
  return { config, issues, projects: loadProjects(root), errors, generatedAt: nowIso() };
}

function sectionBody(body, heading) {
  const lines = String(body ?? "").split("\n");
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (start === -1) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s/.test(lines[i])) {
      end = i;
      break;
    }
  }
  return lines.slice(start + 1, end).join("\n");
}

function isPlaceholder(text) {
  const t = String(text ?? "")
    .replace(/[_*`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  return t === "" || t === "none yet." || t === "none yet" || t === "none.";
}

/** Problems that forbid `status: done`. */
function completionProblems(issue) {
  const problems = [];
  const ac = sectionBody(issue.body, "Acceptance Criteria");
  if (ac == null) {
    problems.push("status is `done` but ## Acceptance Criteria is missing");
  } else {
    const tasks = tasksOf(ac);
    if (!tasks.length) {
      problems.push("status is `done` but Acceptance Criteria has no checkboxes");
    } else if (tasks.some((t) => !t.checked)) {
      problems.push("status is `done` but Acceptance Criteria still has open checkboxes");
    }
  }
  const ev = sectionBody(issue.body, "Review Evidence");
  if (ev == null || isPlaceholder(ev)) {
    problems.push("status is `done` but Review Evidence is empty");
  }
  const cl = sectionBody(issue.body, "Completion Checklist");
  if (cl) {
    for (const name of ["Acceptance criteria checked", "Required verification commands recorded"]) {
      const task = tasksOf(cl).find((t) => t.text.toLowerCase() === name.toLowerCase());
      if (task && !task.checked) {
        problems.push(`status is \`done\` but Completion Checklist item "${name}" is open`);
      }
    }
  }
  return problems;
}

function mutateList(id, field, fn, root = ROOT) {
  const path = issuePath(id, root);
  if (!existsSync(path)) return;
  const { meta, body } = parseDoc(path);
  const before = meta[field] ?? [];
  const after = fn([...before]);
  if (JSON.stringify(before) === JSON.stringify(after)) return;
  meta[field] = after;
  meta.timestamp = nowIso();
  writeFileSync(path, serializeDoc(meta, body));
}

function syncBlocksMirror(dependantId, previous, next, root = ROOT) {
  const prev = new Set(previous ?? []);
  const curr = new Set(next ?? []);
  for (const blocker of prev) {
    if (!curr.has(blocker)) {
      mutateList(blocker, "blocks", (arr) => arr.filter((x) => x !== dependantId), root);
    }
  }
  for (const blocker of curr) {
    if (!prev.has(blocker)) {
      mutateList(
        blocker,
        "blocks",
        (arr) => (arr.includes(dependantId) ? arr : [...arr, dependantId]),
        root,
      );
    }
  }
}

/* ══════════════════════════════════════════════════════════════════════════════
   4. Mutations — every write goes through here, so the markdown stays canonical
   ══════════════════════════════════════════════════════════════════════════════ */

const WRITABLE = new Set([
  "title",
  "description",
  "status",
  "priority",
  "estimate",
  "assignee",
  "project",
  "milestone",
  "cycle",
  "rank",
  "tags",
  "parent",
  "blocked_by",
  "blocks",
  "relates",
  "linear_id",
  "branch",
  "pr",
]);

function patchIssue(id, patch, root = ROOT) {
  const path = issuePath(id, root);
  if (!existsSync(path)) throw new Error(`${id} not found`);
  const { meta, body } = parseDoc(path);
  const previousBlockedBy = meta.blocked_by ?? [];
  const changes = [];
  for (const [k, v] of Object.entries(patch)) {
    if (!WRITABLE.has(k)) throw new Error(`field \`${k}\` is not writable via the API`);
    const before = meta[k] ?? null;
    const after = v === "" || v === undefined ? null : v;
    if (JSON.stringify(before) === JSON.stringify(after)) continue;
    meta[k] = after;
    changes.push({ field: k, from: before, to: after });
  }
  if (!changes.length) return { id, changes: [] };
  if (changes.some((c) => c.field === "status") && meta.status === "done") {
    const missing = completionProblems({ ...meta, body });
    if (missing.length) throw new Error(`${id}: ${missing[0]}`);
  }
  meta.timestamp = nowIso();
  writeFileSync(path, serializeDoc(meta, body));
  if (changes.some((c) => c.field === "blocked_by")) {
    syncBlocksMirror(id, previousBlockedBy, meta.blocked_by ?? [], root);
  }
  return { id, changes };
}

function toggleTask(id, index, checked, root = ROOT) {
  const path = issuePath(id, root);
  const { meta, body } = parseDoc(path);
  const lines = body.split("\n");
  const tasks = tasksOf(body);
  const task = tasks[index];
  if (!task) throw new Error(`${id} has no task at index ${index}`);
  lines[task.line] = lines[task.line].replace(
    TASK_RE,
    (_, ind, __, text) => `${ind}- [${checked ? "x" : " "}] ${text}`,
  );
  meta.timestamp = nowIso();
  writeFileSync(path, serializeDoc(meta, lines.join("\n")));
  return { id, index, checked };
}

function appendActivity(id, text, author = "human", root = ROOT) {
  const path = issuePath(id, root);
  const { meta, body } = parseDoc(path);
  const entry = `- **${today()}** · \`${author}\` — ${text}`;
  let next;
  if (/^## Activity\s*$/m.test(body)) {
    next = body.replace(/^## Activity\s*$/m, (h) => `${h}\n\n${entry}`);
  } else {
    next = `${body.replace(/\s+$/, "")}\n\n## Activity\n\n${entry}\n`;
  }
  meta.timestamp = nowIso();
  writeFileSync(path, serializeDoc(meta, next));
  return { id, entry };
}

function nextId(config, issues) {
  const key = config.workspace?.key ?? "ISSUE";
  const max = issues.reduce((acc, i) => Math.max(acc, idNum(i.id)), 0);
  const width = Number(config.workspace?.id_width) || 4;
  return `${key}-${String(max + 1).padStart(width, "0")}`;
}

function createIssue(fields = {}, root = ROOT) {
  const { config, issues } = loadState(root);
  const dir = trackerPaths(root);
  const id = nextId(config, issues);
  const meta = {
    type: "Issue",
    id,
    title: fields.title ?? "Untitled",
    description: fields.description ?? null,
    status: fields.status ?? "triage",
    priority: fields.priority ?? "none",
    estimate: fields.estimate ?? null,
    assignee: fields.assignee ?? null,
    project: fields.project ?? null,
    milestone: fields.milestone ?? null,
    cycle: fields.cycle ?? null,
    rank: fields.rank ?? null,
    tags: fields.tags ?? [],
    parent: fields.parent ?? null,
    blocked_by: fields.blocked_by ?? [],
    blocks: fields.blocks ?? [],
    relates: fields.relates ?? [],
    resource: fields.resource ?? null,
    linear_id: fields.linear_id ?? null,
    branch: null,
    pr: null,
    created: today(),
    timestamp: nowIso(),
  };
  let body = fields.body;
  if (!body) {
    const tpl = join(dir.templates, `${fields.template ?? "feature"}.md`);
    body = existsSync(tpl)
      ? parseDoc(tpl).body
      : "## Context\n\n_Why this exists._\n\n## Tasks\n\n- [ ] \n\n## Verify\n\n- [ ] \n";
  }
  if (!existsSync(dir.issues)) mkdirSync(dir.issues, { recursive: true });
  writeFileSync(join(dir.issues, `${id}.md`), serializeDoc(meta, body));
  if ((meta.blocked_by ?? []).length) {
    syncBlocksMirror(id, [], meta.blocked_by, root);
  }
  return { id, file: `issues/${id}.md` };
}

/* ══════════════════════════════════════════════════════════════════════════════
   5. Lint — conformance + referential integrity
   ══════════════════════════════════════════════════════════════════════════════ */

function lint(root = ROOT) {
  const { config, issues, projects, errors } = loadState(root);
  const problems = errors.map((e) => ({ level: "error", msg: e }));
  const err = (id, msg) => problems.push({ level: "error", msg: `${id}: ${msg}` });
  const warn = (id, msg) => problems.push({ level: "warn", msg: `${id}: ${msg}` });

  const states = new Set((config.states ?? []).map((s) => s.id));
  const prios = new Set((config.priorities ?? []).map((p) => p.id));
  const cycles = new Set((config.cycles ?? []).map((c) => c.id));
  const labels = new Map((config.labels ?? []).map((l) => [l.id, l]));
  const members = new Set((config.members ?? []).map((m) => m.id));
  const projectIds = new Set(projects.map((p) => p.id));
  const estimates = new Set(config.estimate_scale ?? []);
  const ids = new Set(issues.map((i) => i.id));
  const groups = new Map(
    (config.label_groups ?? []).filter((g) => g.exclusive).map((g) => [g.id, g.name]),
  );

  const seen = new Set();
  for (const i of issues) {
    const id = i.id ?? `(${i.file})`;

    // OKF 0.1 conformance: every non-reserved doc needs a parseable, non-empty `type`.
    if (!i.type) err(id, "missing OKF `type` (must be `Issue`)");
    if (!i.id) err(id, "missing `id`");
    if (i.id && `issues/${i.id}.md` !== i.file && `archive/${i.id}.md` !== i.file)
      err(
        id,
        `filename must match id (expected issues/${i.id}.md or archive/${i.id}.md, got ${i.file})`,
      );
    if (i.id && seen.has(i.id)) err(id, "duplicate id");
    seen.add(i.id);
    if (!i.title) err(id, "missing `title`");
    if (!i.description) warn(id, "missing `description` (OKF recommends a one-sentence summary)");

    if (!states.has(i.status)) err(id, `unknown status \`${i.status}\``);
    if (i.priority && !prios.has(i.priority)) err(id, `unknown priority \`${i.priority}\``);
    if (i.cycle && !cycles.has(i.cycle)) err(id, `unknown cycle \`${i.cycle}\``);
    if (i.project && !projectIds.has(i.project)) err(id, `unknown project \`${i.project}\``);
    if (i.assignee && !members.has(i.assignee)) err(id, `unknown assignee \`${i.assignee}\``);
    if (i.estimate != null && !estimates.has(i.estimate))
      err(id, `estimate ${i.estimate} is not on the scale`);

    const seenGroups = new Map();
    for (const t of i.tags ?? []) {
      const label = labels.get(t);
      if (!label) {
        err(id, `unknown label \`${t}\``);
        continue;
      }
      if (label.group && groups.has(label.group)) {
        if (seenGroups.has(label.group)) {
          err(
            id,
            `two \`${groups.get(label.group)}\` labels (\`${seenGroups.get(label.group)}\`, \`${t}\`) — the group is exclusive`,
          );
        }
        seenGroups.set(label.group, t);
      }
    }

    for (const [field, val] of [
      ["blocked_by", i.blocked_by],
      ["blocks", i.blocks],
      ["relates", i.relates],
      ["parent", i.parent ? [i.parent] : []],
    ]) {
      for (const ref of val ?? []) {
        if (!ids.has(ref)) err(id, `${field} → \`${ref}\` does not exist`);
        if (ref === i.id) err(id, `${field} references itself`);
      }
    }

    // Semantic rules the format promises (SPEC §4).
    if (i.status === "blocked" && !(i.blocked_by ?? []).length) {
      err(id, "status is `blocked` but `blocked_by` is empty — name what blocks it");
    }
    if (i.status === "ready") {
      const open = (i.blocked_by ?? []).filter((b) => {
        const other = issues.find((x) => x.id === b);
        return other && !TERMINAL.has(other.status);
      });
      if (open.length) err(id, `ready issues cannot have open blockers (${open.join(", ")})`);
    }
    if (i.status === "duplicate" && !(i.relates ?? []).length) {
      err(id, "status is `duplicate` but `relates` is empty — name the survivor");
    }
    if (i.status === "done") {
      for (const msg of completionProblems(i)) err(id, msg);
    }
    if (i.cycle && i.status === "triage") {
      warn(
        id,
        `is in \`${i.cycle}\` but has not been triaged — accept it (\`todo\`) or pull it out of the cycle`,
      );
    }
  }

  // Relation symmetry: A.blocks:[B] ⟺ B.blocked_by:[A]. The board draws from either side,
  // so a one-sided edge is an invisible dependency.
  const byId = new Map(issues.map((i) => [i.id, i]));
  for (const i of issues) {
    for (const b of i.blocks ?? []) {
      const other = byId.get(b);
      if (other && !(other.blocked_by ?? []).includes(i.id)) {
        err(i.id, `blocks \`${b}\`, but ${b}.blocked_by does not list ${i.id} (asymmetric edge)`);
      }
    }
    for (const b of i.blocked_by ?? []) {
      const other = byId.get(b);
      if (other && !(other.blocks ?? []).includes(i.id)) {
        err(i.id, `blocked_by \`${b}\`, but ${b}.blocks does not list ${i.id} (asymmetric edge)`);
      }
    }
  }

  detectCycles(issues, byId, (i) => i?.blocked_by ?? [], "dependency cycle", problems);
  detectCycles(issues, byId, (i) => (i?.parent ? [i.parent] : []), "parent cycle", problems);

  return { problems, counts: { issues: issues.length, projects: projects.length } };
}

function detectCycles(issues, byId, edges, label, problems) {
  const WHITE = 0,
    GRAY = 1,
    BLACK = 2;
  const color = new Map(issues.map((i) => [i.id, WHITE]));
  const stack = [];
  const reported = new Set();
  const visit = (id) => {
    color.set(id, GRAY);
    stack.push(id);
    for (const dep of edges(byId.get(id))) {
      if (!byId.has(dep)) continue;
      if (color.get(dep) === GRAY) {
        const loop = stack.slice(stack.indexOf(dep)).concat(dep).join(" → ");
        if (!reported.has(loop)) {
          problems.push({ level: "error", msg: `${label}: ${loop}` });
          reported.add(loop);
        }
      } else if (color.get(dep) === WHITE) visit(dep);
    }
    stack.pop();
    color.set(id, BLACK);
  };
  for (const i of issues) if (color.get(i.id) === WHITE) visit(i.id);
}

function selectNext(issues, config, { all = false } = {}) {
  const byId = new Map(issues.map((i) => [i.id, i]));
  const statuses = all ? ["todo", "ready", "backlog", "triage"] : ["ready"];
  return issues
    .filter((i) => statuses.includes(i.status))
    .filter((i) => (i.blocked_by ?? []).every((b) => TERMINAL.has(byId.get(b)?.status)))
    .sort((a, b) => {
      const ra = a.rank == null ? 1e9 : Number(a.rank);
      const rb = b.rank == null ? 1e9 : Number(b.rank);
      if (ra !== rb) return ra - rb;
      const pa = (config.priorities ?? []).find((p) => p.id === a.priority)?.sort ?? 9;
      const pb = (config.priorities ?? []).find((p) => p.id === b.priority)?.sort ?? 9;
      return pa - pb || idNum(a.id) - idNum(b.id);
    });
}

/* ══════════════════════════════════════════════════════════════════════════════
   6. index.md — the OKF reserved catalog, regenerated from the issues
   ══════════════════════════════════════════════════════════════════════════════ */

function buildIndex() {
  const { config, issues, projects } = loadState();
  const stateName = new Map((config.states ?? []).map((s) => [s.id, s.name]));
  const cycleName = new Map((config.cycles ?? []).map((c) => [c.id, c.name]));
  const open = (i) => !["done", "canceled", "duplicate"].includes(i.status);

  const out = [
    "# Index",
    "",
    "> **Generated — do not hand-edit.** Run `node docs/issue-tracking/track.mjs index`.",
    "> OKF 0.1 reserved catalog file for this bundle.",
    "",
    `${issues.length} issues · ${issues.filter(open).length} open · ${projects.length} projects · updated ${today()}`,
    "",
  ];

  for (const p of projects) {
    const mine = issues.filter((i) => i.project === p.id);
    if (!mine.length) continue;
    const done = mine.filter((i) => i.status === "done").length;
    out.push(`## ${p.title ?? p.id} — ${done}/${mine.length}`, "");
    if (p.description) out.push(`${p.description}`, "");
    for (const i of mine) {
      const bits = [stateName.get(i.status) ?? i.status];
      if (i.cycle) bits.push(cycleName.get(i.cycle) ?? i.cycle);
      if (i.milestone) bits.push(i.milestone);
      out.push(`* [${i.id} — ${i.title}](./${i.file}) - ${bits.join(" · ")}`);
    }
    out.push("");
  }

  const orphans = issues.filter((i) => !i.project);
  if (orphans.length) {
    out.push("## Unassigned", "");
    for (const i of orphans)
      out.push(`* [${i.id} — ${i.title}](./${i.file}) - ${stateName.get(i.status) ?? i.status}`);
    out.push("");
  }

  writeFileSync(join(ROOT, "index.md"), out.join("\n"));
  return { issues: issues.length, projects: projects.length };
}

/* ══════════════════════════════════════════════════════════════════════════════
   7. The board — local server (read/write + live reload) and static export
   ══════════════════════════════════════════════════════════════════════════════ */

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
};

function serve(port = 4322) {
  const dir = trackerPaths(ROOT);
  const clients = new Set();

  const server = createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${port}`);
    const send = (code, data, type = "application/json") => {
      res.writeHead(code, { "content-type": type, "cache-control": "no-store" });
      res.end(type === "application/json" ? JSON.stringify(data) : data);
    };
    const body = async () => {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      return chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {};
    };

    try {
      // ── API ──
      if (url.pathname === "/api/state") return send(200, loadState());

      if (url.pathname === "/api/events") {
        res.writeHead(200, {
          "content-type": "text/event-stream",
          "cache-control": "no-cache",
          connection: "keep-alive",
        });
        res.write(": connected\n\n");
        clients.add(res);
        req.on("close", () => clients.delete(res));
        return;
      }

      const patch = url.pathname.match(/^\/api\/issues\/([\w-]+)$/);
      if (patch && req.method === "PATCH") {
        const result = patchIssue(patch[1], await body());
        return send(200, result);
      }

      const task = url.pathname.match(/^\/api\/issues\/([\w-]+)\/task$/);
      if (task && req.method === "POST") {
        const { index, checked } = await body();
        return send(200, toggleTask(task[1], index, checked));
      }

      const comment = url.pathname.match(/^\/api\/issues\/([\w-]+)\/comment$/);
      if (comment && req.method === "POST") {
        const { text, author } = await body();
        return send(200, appendActivity(comment[1], text, author));
      }

      if (url.pathname === "/api/issues" && req.method === "POST") {
        return send(201, createIssue(await body()));
      }

      // ── Static ──
      let file = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
      if (file.includes("..")) return send(400, { error: "bad path" });
      const path = join(dir.board, file);
      if (existsSync(path)) {
        return send(200, readFileSync(path), MIME[extname(path)] ?? "text/plain");
      }
      send(404, { error: "not found" });
    } catch (e) {
      send(400, { error: e.message });
    }
  });

  // Any change on disk — yours, an agent's, or a `git checkout` — pushes to the board.
  let timer = null;
  const onChange = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      for (const c of clients) c.write(`event: changed\ndata: ${Date.now()}\n\n`);
    }, 120);
  };
  for (const d of [dir.issues, dir.archive, dir.projects, dir.board])
    if (existsSync(d)) watch(d, onChange);
  watch(dir.config, onChange);

  server.listen(port, () => {
    const { issues } = loadState();
    console.log(`\n  ▸ Sadhana Yog Track — ${issues.length} issues`);
    console.log(`  ▸ http://localhost:${port}\n`);
    console.log(`    Live: edits on disk (yours or an agent's) push to the board instantly.`);
    console.log(`    Writes: drag a card → the markdown file is rewritten. Ctrl-C to stop.\n`);
  });
}

/** A single self-contained .html with the data inlined — opens from file://, no server. */
function exportStatic(out = join(ROOT, "board.html"), root = ROOT) {
  const dir = trackerPaths(root);
  const state = loadState(root);
  const html = readFileSync(join(dir.board, "index.html"), "utf8");
  const css = readFileSync(join(dir.board, "board.css"), "utf8");
  const js = readFileSync(join(dir.board, "board.js"), "utf8");
  const inlined = html
    .replace('<link rel="stylesheet" href="board.css" />', `<style>\n${css}\n</style>`)
    .replace(
      '<script type="module" src="board.js"></script>',
      `<script>window.__TRACK_DATA__ = ${JSON.stringify(state)};</script>\n<script type="module">\n${js}\n</script>`,
    );
  writeFileSync(out, inlined);
  return { out, bytes: inlined.length, issues: state.issues.length };
}

/* ══════════════════════════════════════════════════════════════════════════════
   8. CLI
   ══════════════════════════════════════════════════════════════════════════════ */

const HELP = `
  Sadhana Yog Track — git-native issue tracking

  node docs/issue-tracking/track.mjs <command>

    board [--port 4322]     Open the board. Read/write; live-reloads on file change.
    export [--out PATH]     Bake a single self-contained board.html (works from file://).
    new "<title>" [k=v...]  Create an issue. Keys: project, cycle, status, priority,
                            estimate, assignee, milestone, tags (comma-sep), template.
    set <ID> <k=v>...       Edit fields. tags/blocked_by/blocks/relates take comma-lists.
    move <ID> <status>      Shorthand for \`set <ID> status=<status>\`.
    done <ID>               Shorthand for \`move <ID> done\`.
    show <ID>               Print an issue.
    list [k=v]...           Filter issues. e.g. list cycle=stage-0 status=todo
    next [--all]            What is unblocked and ready right now. --all includes
                            unblocked triage/backlog/todo.
    lint                    Validate every file against config.yml. Exit 1 on error.
    index                   Regenerate index.md (the OKF catalog).
    stats                   Counts by status, cycle, project.
`;

function parseKV(args) {
  const out = {};
  const LISTS = new Set(["tags", "blocked_by", "blocks", "relates"]);
  for (const a of args) {
    const i = a.indexOf("=");
    if (i === -1) continue;
    const k = a.slice(0, i);
    const v = a.slice(i + 1);
    if (LISTS.has(k)) out[k] = v === "" ? [] : v.split(",").map((s) => s.trim());
    else if (k === "estimate" || k === "rank") out[k] = v === "" || v === "null" ? null : Number(v);
    else out[k] = v === "" || v === "null" ? null : v;
  }
  return out;
}

function fmtIssue(i, config) {
  const st = (config.states ?? []).find((s) => s.id === i.status);
  const prog = i.tasks_total ? ` ${i.tasks_done}/${i.tasks_total}` : "";
  const who = i.assignee ? ` · ${i.assignee}` : "";
  const rk = i.rank != null ? ` r${i.rank}` : "";
  return `  ${String(i.id).padEnd(9)} ${String(st?.name ?? i.status).padEnd(12)} ${String(i.cycle ?? "—").padEnd(9)}${rk.padEnd(6)} ${i.title}${prog}${who}`;
}

function main() {
  const [cmd, ...args] = process.argv.slice(2);
  const flag = (name, dflt) => {
    const i = args.indexOf(`--${name}`);
    return i === -1 ? dflt : args[i + 1];
  };

  switch (cmd) {
    case "board":
    case "serve":
      return serve(Number(flag("port", 4322)));

    case "export": {
      const r = exportStatic(flag("out", join(ROOT, "board.html")));
      return console.log(
        `  ✓ ${r.out} — ${r.issues} issues, ${(r.bytes / 1024).toFixed(0)} KB, self-contained`,
      );
    }

    case "new": {
      const title = args[0];
      if (!title)
        return console.error('  ✗ need a title: track new "Fix the thing" project=notes-v2');
      const r = createIssue({ title, ...parseKV(args.slice(1)) });
      return console.log(`  ✓ ${r.id} — ${r.file}`);
    }

    case "set": {
      const [id, ...rest] = args;
      try {
        const r = patchIssue(id, parseKV(rest));
        if (!r.changes.length) return console.log(`  · ${id} unchanged`);
        for (const c of r.changes)
          console.log(`  ✓ ${id} ${c.field}: ${JSON.stringify(c.from)} → ${JSON.stringify(c.to)}`);
      } catch (e) {
        console.error(`  ✗ ${e.message}`);
        process.exit(1);
      }
      return;
    }

    case "move":
      try {
        patchIssue(args[0], { status: args[1] });
        console.log(`  ✓ ${args[0]} → ${args[1]}`);
      } catch (e) {
        console.error(`  ✗ ${e.message}`);
        process.exit(1);
      }
      return;

    case "done":
      try {
        patchIssue(args[0], { status: "done" });
        console.log(`  ✓ ${args[0]} → done`);
      } catch (e) {
        console.error(`  ✗ ${e.message}`);
        process.exit(1);
      }
      return;

    case "show": {
      const path = issuePath(args[0]);
      if (!existsSync(path)) return console.error(`  ✗ ${args[0]} not found`);
      return console.log(readFileSync(path, "utf8"));
    }

    case "list": {
      const { config, issues } = loadState();
      const f = parseKV(args);
      const hits = issues
        .filter((i) => Object.entries(f).every(([k, v]) => String(i[k] ?? "") === String(v)))
        .sort((a, b) => {
          const ra = a.rank == null ? 1e9 : Number(a.rank);
          const rb = b.rank == null ? 1e9 : Number(b.rank);
          if (ra !== rb) return ra - rb;
          return idNum(a.id) - idNum(b.id);
        });
      console.log();
      hits.forEach((i) => console.log(fmtIssue(i, config)));
      return console.log(`\n  ${hits.length} issue(s)\n`);
    }

    case "next": {
      const all = args.includes("--all");
      const { config, issues } = loadState();
      const ready = selectNext(issues, config, { all });
      const title = all ? "Unblocked and schedulable" : "Unblocked and ready";
      console.log(`\n  ${title} — ${ready.length} issue(s)\n`);
      ready.slice(0, 25).forEach((i) => console.log(fmtIssue(i, config)));
      return console.log();
    }

    case "index": {
      const r = buildIndex();
      return console.log(`  ✓ index.md — ${r.issues} issues across ${r.projects} projects`);
    }

    case "stats": {
      const { config, issues } = loadState();
      const tally = (key) => {
        const m = new Map();
        for (const i of issues) m.set(i[key] ?? "—", (m.get(i[key] ?? "—") ?? 0) + 1);
        return [...m.entries()].sort((a, b) => b[1] - a[1]);
      };
      const pts = issues.reduce((a, i) => a + (i.estimate ?? 0), 0);
      console.log(`\n  ${issues.length} issues · ${pts} points\n`);
      for (const key of ["status", "cycle", "project"]) {
        console.log(`  ${key}`);
        for (const [k, n] of tally(key)) console.log(`    ${String(k).padEnd(24)} ${n}`);
        console.log();
      }
      return;
    }

    case "lint": {
      const { problems, counts } = lint();
      const errors = problems.filter((p) => p.level === "error");
      const warns = problems.filter((p) => p.level === "warn");
      console.log();
      for (const p of errors) console.log(`  ✗ ${p.msg}`);
      for (const p of warns) console.log(`  ⚠ ${p.msg}`);
      console.log(
        `\n  ${counts.issues} issues · ${counts.projects} projects · ${errors.length} error(s) · ${warns.length} warning(s)\n`,
      );
      if (errors.length) process.exit(1);
      return;
    }

    default:
      console.log(HELP);
      if (cmd) process.exit(1);
  }
}

// Importable as a module (agents and scripts reuse the canonical serializer rather
// than reimplementing it), executable as a CLI. Only the CLI path runs main().
export {
  parseYaml,
  parseDoc,
  serializeDoc,
  loadState,
  loadConfig,
  patchIssue,
  createIssue,
  lint,
  tasksOf,
  selectNext,
  completionProblems,
  exportStatic,
  ROOT,
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
