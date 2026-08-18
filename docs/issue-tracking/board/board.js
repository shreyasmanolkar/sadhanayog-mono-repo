/* ═══════════════════════════════════════════════════════════════════════════════
   Sadhana Yog Track — board
   Renders ../issues/*.md as a Linear-style kanban. Every drag, checkbox and select
   writes straight back to the markdown file through track.mjs. No framework.

   Two modes:
     live   — served by `track.mjs board`. Reads /api/state, writes via /api/*, and
              live-reloads over SSE when a file changes on disk (yours or an agent's).
     static — a baked board.html (`track.mjs export`). Data is inlined; read-only.
   ═══════════════════════════════════════════════════════════════════════════════ */

const STATIC = typeof window.__TRACK_DATA__ !== "undefined" || location.protocol === "file:";

const view = {
  groupBy: "cycle",
  layout: "board", // board | list
  query: "",
  showDone: false,
  selected: null,
  // Compound filters (empty string = any). Persisted to the URL so a view is shareable.
  filters: {
    status: "",
    priority: "",
    project: "",
    cycle: "",
    assignee: "",
    tag: "",
  },
};

let D = { config: {}, issues: [], projects: [] };
let byId = new Map();

/* ── DOM helpers ─────────────────────────────────────────────────────────────── */

const h = (tag, attrs, ...kids) => {
  const el = document.createElement(tag);
  // `null` is the idiomatic "no attributes" argument — a default parameter only
  // covers `undefined`, so normalize here or every h(tag, null, …) throws.
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k === "data") for (const [dk, dv] of Object.entries(v)) el.dataset[dk] = dv;
    else el.setAttribute(k, v);
  }
  for (const kid of kids.flat()) {
    if (kid === null || kid === undefined || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return el;
};

const svg = (body, size = 14, cls = "") => {
  const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  el.setAttribute("viewBox", "0 0 14 14");
  el.setAttribute("width", size);
  el.setAttribute("height", size);
  if (cls) el.setAttribute("class", cls);
  el.innerHTML = body;
  return el;
};

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* ── Config lookups ──────────────────────────────────────────────────────────── */

const state = (id) => (D.config.states ?? []).find((s) => s.id === id) ?? { id, name: id, color: "#8a8f98", category: "backlog" };
const prio = (id) => (D.config.priorities ?? []).find((p) => p.id === id);
const label = (id) => (D.config.labels ?? []).find((l) => l.id === id) ?? { id, name: id, color: "#8a8f98" };
const cycle = (id) => (D.config.cycles ?? []).find((c) => c.id === id);
const member = (id) => (D.config.members ?? []).find((m) => m.id === id);
const project = (id) => D.projects.find((p) => p.id === id);
const isOpen = (i) => !["done", "canceled", "duplicate"].includes(i.status);

/* ── Icons ───────────────────────────────────────────────────────────────────── */

const PIE_C = 2 * Math.PI * 3.5;

function pie(pct, color) {
  return `<circle cx="7" cy="7" r="6" fill="none" stroke="${color}" stroke-width="1.5"/>
    <circle cx="7" cy="7" r="3.5" fill="none" stroke="${color}" stroke-width="7"
      stroke-dasharray="${(pct * PIE_C).toFixed(2)} ${PIE_C.toFixed(2)}" transform="rotate(-90 7 7)"/>`;
}

function statusIcon(s, size = 14) {
  const c = s.color;
  switch (s.category) {
    case "completed":
      return svg(
        `<circle cx="7" cy="7" r="7" fill="${c}"/><path d="M4.1 7.2l2 2 3.9-4.2" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
        size,
      );
    case "canceled":
      return svg(
        `<circle cx="7" cy="7" r="7" fill="${c}"/><path d="M4.9 4.9l4.2 4.2M9.1 4.9l-4.2 4.2" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>`,
        size,
      );
    case "triage":
    case "backlog":
      return svg(`<circle cx="7" cy="7" r="6" fill="none" stroke="${c}" stroke-width="1.5" stroke-dasharray="2.1 2"/>`, size);
    case "started":
      if (s.id === "blocked") {
        return svg(
          `<circle cx="7" cy="7" r="6" fill="none" stroke="${c}" stroke-width="1.5"/><path d="M7 3.8v4.1" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/><circle cx="7" cy="10.2" r="0.9" fill="${c}"/>`,
          size,
        );
      }
      return svg(pie(s.id === "in_review" ? 0.75 : 0.5, c), size);
    default:
      return svg(`<circle cx="7" cy="7" r="6" fill="none" stroke="${c}" stroke-width="1.5"/>`, size);
  }
}

function priorityIcon(id) {
  const p = prio(id);
  if (!p || id === "none") return null;
  if (id === "urgent" || id === "P0" || p.icon === "urgent") {
    return svg(
      `<rect x="0.5" y="0.5" width="13" height="13" rx="3" fill="${p.color}"/><path d="M7 3.4v4.3" stroke="#151517" stroke-width="1.7" stroke-linecap="round"/><circle cx="7" cy="10.2" r="1" fill="#151517"/>`,
      14,
    );
  }
  const filled = { high: 3, medium: 2, low: 1, P1: 3, P2: 2, P3: 1 }[id] ?? { high: 3, medium: 2, low: 1 }[p.icon] ?? 0;
  const bars = [
    { x: 0.5, y: 8, h: 5 },
    { x: 5, y: 5.5, h: 7.5 },
    { x: 9.5, y: 3, h: 10 },
  ];
  return svg(
    bars
      .map((b, i) => `<rect x="${b.x}" y="${b.y}" width="3.2" height="${b.h}" rx="1" fill="${i < filled ? p.color : "#3a3d44"}"/>`)
      .join(""),
    14,
  );
}

function progressIcon(done, total) {
  const pct = total ? done / total : 0;
  const c = pct === 1 ? "#4cb782" : "#8a8f98";
  return svg(pie(pct, c), 12);
}

const I = {
  cycle: (c = "currentColor") =>
    svg(`<circle cx="7" cy="7" r="6" fill="none" stroke="${c}" stroke-width="1.3"/><path d="M5.7 4.7l3.6 2.3-3.6 2.3z" fill="${c}"/>`, 13),
  project: (c = "currentColor") => svg(`<path d="M12.8 1.2L1.6 5.4l4.2 1.9 1.9 4.2z" fill="none" stroke="${c}" stroke-width="1.2" stroke-linejoin="round"/>`, 13),
  branch: (c = "currentColor") =>
    svg(
      `<circle cx="3.6" cy="3.2" r="1.7" fill="none" stroke="${c}" stroke-width="1.2"/><circle cx="3.6" cy="10.8" r="1.7" fill="none" stroke="${c}" stroke-width="1.2"/><circle cx="10.4" cy="3.2" r="1.7" fill="none" stroke="${c}" stroke-width="1.2"/><path d="M3.6 4.9v4.2M10.4 4.9v0.8c0 1.8-1.4 2.6-3.2 2.9-1.4.2-2.4.6-2.9 1.3" fill="none" stroke="${c}" stroke-width="1.2" stroke-linecap="round"/>`,
      13,
    ),
  blocked: (c = "#eb5757") => svg(`<circle cx="7" cy="7" r="6" fill="none" stroke="${c}" stroke-width="1.3"/><path d="M4.2 7h5.6" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/>`, 13),
  dots: () => svg(`<circle cx="2.5" cy="7" r="1.1" fill="currentColor"/><circle cx="7" cy="7" r="1.1" fill="currentColor"/><circle cx="11.5" cy="7" r="1.1" fill="currentColor"/>`, 14),
  plus: () => svg(`<path d="M7 2.6v8.8M2.6 7h8.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>`, 14),
  star: () => svg(`<path d="M7 1.4l1.7 3.6 3.9.5-2.9 2.7.8 3.9L7 10.2 3.5 12.1l.8-3.9L1.4 5.5l3.9-.5z" fill="currentColor"/>`, 14),
  code: () => svg(`<path d="M4.6 4L1.6 7l3 3M9.4 4l3 3-3 3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>`, 14),
  chevron: () => svg(`<path d="M5.4 3.2L9.2 7l-3.8 3.8" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>`, 12),
  panel: () => svg(`<rect x="1.2" y="2.2" width="11.6" height="9.6" rx="2" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M5.2 2.4v9.2" stroke="currentColor" stroke-width="1.2"/>`, 14),
  filter: () => svg(`<path d="M1.6 3.2h10.8M3.4 7h7.2M5.4 10.8h3.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>`, 14),
  sliders: () => svg(`<path d="M2 4.4h10M2 9.6h10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="5" cy="4.4" r="1.7" fill="#0c0c0e" stroke="currentColor" stroke-width="1.3"/><circle cx="9.4" cy="9.6" r="1.7" fill="#0c0c0e" stroke="currentColor" stroke-width="1.3"/>`, 14),
  search: () => svg(`<circle cx="6" cy="6" r="4.2" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M9.2 9.2l3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>`, 13),
  close: () => svg(`<path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>`, 14),
  doc: () => svg(`<path d="M3 1.6h5l3 3v7.8H3z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M8 1.6v3h3" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>`, 13),
  board: () =>
    svg(
      `<rect x="1.4" y="1.8" width="4.2" height="10.4" rx="1" fill="none" stroke="currentColor" stroke-width="1.2"/><rect x="6.9" y="1.8" width="4.2" height="10.4" rx="1" fill="none" stroke="currentColor" stroke-width="1.2"/>`,
      14,
    ),
  list: () =>
    svg(
      `<path d="M2 3.2h10M2 7h10M2 10.8h10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>`,
      14,
    ),
  cmd: () =>
    svg(
      `<rect x="1.5" y="1.5" width="11" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M5 5.2l-1.4 1.8L5 8.8M9 5.2l1.4 1.8L9 8.8" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>`,
      14,
    ),
};

/* ── Formatting ──────────────────────────────────────────────────────────────── */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const now = new Date();
  return d.getFullYear() === now.getFullYear()
    ? `${MONTHS[d.getMonth()]} ${d.getDate()}`
    : `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const fmtRange = (a, b) => (a && b ? `${fmtDate(a)} → ${fmtDate(b)}` : "");
const initials = (n) => n.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

/* ── Markdown (small, escaped-first — the body is rendered, never trusted) ────── */

function markdown(src) {
  const fences = [];
  let s = src.replace(/```[\w-]*\n([\s\S]*?)```/g, (_, code) => {
    fences.push(`<pre><code>${esc(code.replace(/\n$/, ""))}</code></pre>`);
    return ` F${fences.length - 1} `;
  });

  const inline = (t) =>
    esc(t)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>")
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt, url) => `<a href="${esc(url)}" target="_blank" rel="noreferrer">${txt}</a>`);

  const out = [];
  let list = null; // 'ul' | 'ol' | 'tasks'
  let para = [];
  let taskIndex = 0;

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${inline(para.join(" "))}</p>`);
      para = [];
    }
  };
  const closeList = () => {
    if (list) {
      out.push(list === "tasks" ? "</ul>" : `</${list}>`);
      list = null;
    }
  };

  for (const raw of s.split("\n")) {
    const line = raw.replace(/\s+$/, "");
    const fence = line.match(/^ F(\d+) $/);
    if (fence) {
      flushPara();
      closeList();
      out.push(fences[+fence[1]]);
      continue;
    }
    if (!line.trim()) {
      flushPara();
      closeList();
      continue;
    }

    const task = line.match(/^\s*[-*] \[([ xX])\]\s?(.*)$/);
    if (task) {
      flushPara();
      if (list !== "tasks") {
        closeList();
        out.push('<ul class="tasks">');
        list = "tasks";
      }
      const done = task[1].toLowerCase() === "x";
      out.push(
        `<li class="task${done ? " is-done" : ""}" data-task="${taskIndex++}">` +
          `<input type="checkbox"${done ? " checked" : ""}${STATIC ? " disabled" : ""}><span>${inline(task[2])}</span></li>`,
      );
      continue;
    }

    const head = line.match(/^(#{1,4})\s+(.*)$/);
    if (head) {
      flushPara();
      closeList();
      const lvl = Math.min(head[1].length, 3);
      out.push(`<h${lvl}>${inline(head[2])}</h${lvl}>`);
      continue;
    }

    if (/^(---|___|\*\*\*)\s*$/.test(line)) {
      flushPara();
      closeList();
      out.push("<hr>");
      continue;
    }

    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      flushPara();
      closeList();
      out.push(`<blockquote>${inline(quote[1])}</blockquote>`);
      continue;
    }

    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    const ol = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ul || ol) {
      flushPara();
      const want = ul ? "ul" : "ol";
      if (list !== want) {
        closeList();
        out.push(`<${want}>`);
        list = want;
      }
      out.push(`<li>${inline((ul ?? ol)[1])}</li>`);
      continue;
    }

    para.push(line.trim());
  }
  flushPara();
  closeList();
  return out.join("\n");
}

/* ── API ─────────────────────────────────────────────────────────────────────── */

async function api(path, method = "GET", body) {
  const res = await fetch(path, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `${res.status}`);
  return data;
}

let toastTimer;
function toast(msg, isErr = false) {
  document.querySelector(".toast")?.remove();
  const el = h("div", { class: `toast${isErr ? " is-err" : ""}`, html: msg });
  document.body.append(el);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.remove(), 2600);
}

/** Optimistic: paint the change, write the file, reconcile from the SSE reload. */
async function patch(id, fields) {
  if (STATIC) return toast("Read-only export. Run <code>track.mjs board</code> to edit.", true);
  const issue = byId.get(id);
  const prev = { ...issue };
  Object.assign(issue, fields);
  render();
  try {
    await api(`/api/issues/${id}`, "PATCH", fields);
    const [k, v] = Object.entries(fields)[0];
    toast(`<strong>${id}</strong> ${k} → ${v ?? "none"} · <code>issues/${id}.md</code>`);
  } catch (e) {
    Object.assign(issue, prev);
    render();
    toast(`${id}: ${e.message}`, true);
  }
}

async function toggleTask(id, index, checked) {
  if (STATIC) return toast("Read-only export. Run <code>track.mjs board</code> to edit.", true);
  try {
    await api(`/api/issues/${id}/task`, "POST", { index, checked });
    await load();
  } catch (e) {
    toast(`${id}: ${e.message}`, true);
  }
}

/* ── Grouping ────────────────────────────────────────────────────────────────── */

/** Columns are derived from config, not from the data — so an empty cycle still shows. */
function columns() {
  switch (view.groupBy) {
    case "status":
      return (D.config.states ?? []).map((s) => ({ key: s.id, title: s.name, icon: statusIcon(s) }));
    case "project":
      return [
        { key: null, title: "No project" },
        ...D.projects.map((p) => ({ key: p.id, title: p.title ?? p.id, icon: I.project(p.color ?? "#8a8f98") })),
      ];
    case "priority":
      return (D.config.priorities ?? []).map((p) => ({ key: p.id, title: p.name, icon: priorityIcon(p.id) }));
    case "assignee":
      return [
        { key: null, title: "Unassigned" },
        ...(D.config.members ?? []).map((m) => ({ key: m.id, title: m.name })),
      ];
    case "cycle":
    default:
      return [
        { key: null, title: "No cycle" },
        ...(D.config.cycles ?? []).map((c) => ({
          key: c.id,
          title: c.name,
          sub: fmtRange(c.starts, c.ends),
          icon: I.cycle("#8a8f98"),
        })),
      ];
  }
}

function visible() {
  const q = view.query.trim().toLowerCase();
  const f = view.filters;
  return D.issues.filter((i) => {
    if (!view.showDone && !isOpen(i)) return false;
    if (f.status && i.status !== f.status) return false;
    if (f.priority && (i.priority ?? "none") !== f.priority) return false;
    if (f.project && (i.project ?? "") !== f.project) return false;
    if (f.cycle && (i.cycle ?? "") !== f.cycle) return false;
    if (f.assignee && (i.assignee ?? "") !== f.assignee) return false;
    if (f.tag && !(i.tags ?? []).includes(f.tag)) return false;
    if (!q) return true;
    const hay = [i.id, i.title, i.description, i.project, i.milestone, ...(i.tags ?? [])].join(" ").toLowerCase();
    return hay.includes(q);
  });
}

function activeFilterCount() {
  return Object.values(view.filters).filter(Boolean).length;
}

function clearFilters() {
  for (const k of Object.keys(view.filters)) view.filters[k] = "";
}

/* ── URL state (shareable views) ─────────────────────────────────────────────── */

const FILTER_KEYS = ["status", "priority", "project", "cycle", "assignee", "tag"];

function readUrl() {
  if (STATIC || typeof location === "undefined") return;
  const p = new URLSearchParams(location.search);
  if (p.get("layout") === "list" || p.get("layout") === "board") view.layout = p.get("layout");
  const g = p.get("group");
  if (g && ["cycle", "status", "project", "priority", "assignee"].includes(g)) view.groupBy = g;
  if (p.has("q")) view.query = p.get("q") ?? "";
  if (p.get("done") === "1") view.showDone = true;
  for (const k of FILTER_KEYS) {
    if (p.has(k)) view.filters[k] = p.get(k) ?? "";
  }
  const id = p.get("issue");
  if (id) view.selected = id;
}

function writeUrl() {
  if (STATIC || typeof history === "undefined") return;
  const p = new URLSearchParams();
  if (view.layout !== "board") p.set("layout", view.layout);
  if (view.groupBy !== "cycle") p.set("group", view.groupBy);
  if (view.query) p.set("q", view.query);
  if (view.showDone) p.set("done", "1");
  for (const k of FILTER_KEYS) {
    if (view.filters[k]) p.set(k, view.filters[k]);
  }
  if (view.selected) p.set("issue", view.selected);
  const s = p.toString();
  const next = s ? `${location.pathname}?${s}` : location.pathname;
  if (next !== `${location.pathname}${location.search}`) history.replaceState(null, "", next);
}

/** rank (explicit pick order) first, then urgent, then id. */
function sortCards(a, b) {
  const ra = a.rank == null ? 1e9 : Number(a.rank);
  const rb = b.rank == null ? 1e9 : Number(b.rank);
  if (ra !== rb) return ra - rb;
  const pa = prio(a.priority)?.sort ?? 9;
  const pb = prio(b.priority)?.sort ?? 9;
  if (pa !== pb) return pa - pb;
  const na = parseInt(String(a.id).replace(/\D/g, ""), 10);
  const nb = parseInt(String(b.id).replace(/\D/g, ""), 10);
  return na - nb;
}

/* ── Card ────────────────────────────────────────────────────────────────────── */

function cardEl(i) {
  const s = state(i.status);
  const parent = i.parent ? byId.get(i.parent) : null;
  const chips = [];

  const pIcon = priorityIcon(i.priority);
  if (pIcon) chips.push(h("span", { class: "chip chip--bare", title: `Priority: ${prio(i.priority).name}` }, pIcon));
  if (i.rank != null) chips.push(h("span", { class: "chip chip--bare", title: `Pick order ${i.rank}` }, h("span", { class: "t" }, `#${i.rank}`)));

  chips.push(
    h(
      "button",
      {
        class: "chip chip--ghost",
        title: "Open issue",
        onclick: (e) => {
          e.stopPropagation();
          openDrawer(i.id);
        },
      },
      I.dots(),
    ),
  );

  if (i.cycle) {
    const c = cycle(i.cycle);
    chips.push(h("span", { class: "chip", title: c?.goal ?? "" }, I.cycle(), h("span", { class: "t" }, (c?.name ?? i.cycle).replace(/^Stage /, ""))));
  }

  for (const t of i.tags ?? []) {
    const l = label(t);
    chips.push(h("span", { class: "chip", title: l.description ?? l.name }, h("span", { class: "dot", style: `background:${l.color}` }), h("span", { class: "t" }, l.name)));
  }

  if (i.project) {
    const p = project(i.project);
    chips.push(h("span", { class: "chip chip--project", title: p?.title ?? i.project }, I.project(), h("span", { class: "t" }, p?.short ?? p?.title ?? i.project)));
  }

  const blockers = (i.blocked_by ?? []).filter((b) => byId.get(b) && byId.get(b).status !== "done");
  if (blockers.length) {
    chips.push(
      h(
        "span",
        { class: "chip chip--blocked", title: `Blocked by ${blockers.join(", ")}` },
        I.blocked(),
        h("span", { class: "t" }, String(blockers.length)),
      ),
    );
  }

  if (i.tasks_total) {
    chips.push(
      h(
        "span",
        { class: "chip", title: `${i.tasks_done} of ${i.tasks_total} tasks done` },
        progressIcon(i.tasks_done, i.tasks_total),
        h("span", { class: "t" }, `${i.tasks_done}/${i.tasks_total}`),
      ),
    );
  }

  if (i.pr) chips.push(h("span", { class: "chip" }, I.branch(), h("span", { class: "t" }, `#${i.pr}`)));

  const m = i.assignee ? member(i.assignee) : null;

  return h(
    "div",
    {
      class: `card${view.selected === i.id ? " is-selected" : ""}`,
      draggable: STATIC ? null : "true",
      tabindex: "0",
      data: { id: i.id },
      onclick: () => openDrawer(i.id),
      onkeydown: (e) => {
        if (e.key === "Enter") openDrawer(i.id);
      },
      ondragstart: (e) => {
        e.dataTransfer.setData("text/plain", i.id);
        e.dataTransfer.effectAllowed = "move";
        e.currentTarget.classList.add("is-dragging");
      },
      ondragend: (e) => e.currentTarget.classList.remove("is-dragging"),
    },
    h(
      "div",
      { class: "card-top" },
      h("span", { class: "card-id" }, i.id),
      parent && h("span", { class: "card-parent" }, I.chevron(), h("span", { class: "t" }, parent.title)),
      h("span", { class: "spacer" }),
      m
        ? h("span", { class: "avatar", style: `background:${m.color}`, title: m.name }, initials(m.name))
        : h("span", { class: "avatar avatar--none", title: "Unassigned" }, "?"),
    ),
    h("div", { class: "card-title" }, statusIcon(s), h("span", { class: "t" }, i.title)),
    chips.length ? h("div", { class: "chips" }, chips) : null,
    h("div", { class: "card-foot" }, `Created ${fmtDate(i.created)}`),
  );
}

/* ── Board ───────────────────────────────────────────────────────────────────── */

function boardEl() {
  const items = visible();
  const cols = columns();
  const board = h("div", { class: "board" });

  for (const col of cols) {
    const mine = items.filter((i) => (i[view.groupBy] ?? null) === col.key).sort(sortCards);

    const body = h(
      "div",
      {
        class: "col-body",
        ondragover: (e) => {
          if (STATIC) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          e.currentTarget.classList.add("is-over");
        },
        ondragleave: (e) => e.currentTarget.classList.remove("is-over"),
        ondrop: (e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("is-over");
          const id = e.dataTransfer.getData("text/plain");
          const issue = byId.get(id);
          if (!issue || (issue[view.groupBy] ?? null) === col.key) return;
          patch(id, { [view.groupBy]: col.key });
        },
      },
      mine.length ? mine.map(cardEl) : h("div", { class: "col-empty" }, "—"),
    );

    board.append(
      h(
        "div",
        { class: "col" },
        h(
          "div",
          { class: "col-head" },
          col.icon ?? null,
          h("span", { class: "col-title" }, col.title),
          h("span", { class: "col-count" }, String(mine.length)),
          col.sub ? h("span", { class: "col-dates" }, col.sub) : null,
          h("span", { class: "spacer" }),
          h("button", { class: "icon-btn", title: "Column options" }, I.dots()),
          h(
            "button",
            {
              class: "icon-btn",
              title: `New issue in ${col.title}`,
              onclick: () => newIssue({ [view.groupBy]: col.key }),
            },
            I.plus(),
          ),
        ),
        body,
      ),
    );
  }
  return board;
}

/* ── List view ───────────────────────────────────────────────────────────────── */

function listEl() {
  const items = visible().sort(sortCards);
  const table = h("div", { class: "list" });
  table.append(
    h(
      "div",
      { class: "list-head" },
      h("span", { class: "lc lc-id" }, "ID"),
      h("span", { class: "lc lc-title" }, "Title"),
      h("span", { class: "lc lc-status" }, "Status"),
      h("span", { class: "lc lc-prio" }, "Priority"),
      h("span", { class: "lc lc-project" }, "Project"),
      h("span", { class: "lc lc-cycle" }, "Cycle"),
      h("span", { class: "lc lc-est" }, "Pts"),
      h("span", { class: "lc lc-who" }, ""),
    ),
  );

  if (!items.length) {
    table.append(h("div", { class: "list-empty" }, "No issues match this view."));
    return table;
  }

  for (const i of items) {
    const s = state(i.status);
    const m = i.assignee ? member(i.assignee) : null;
    const p = i.project ? project(i.project) : null;
    const c = i.cycle ? cycle(i.cycle) : null;
    const pIcon = priorityIcon(i.priority);
    table.append(
      h(
        "div",
        {
          class: `list-row${view.selected === i.id ? " is-selected" : ""}`,
          tabindex: "0",
          data: { id: i.id },
          onclick: () => openDrawer(i.id),
          onkeydown: (e) => {
            if (e.key === "Enter") openDrawer(i.id);
          },
        },
        h("span", { class: "lc lc-id" }, i.id),
        h(
          "span",
          { class: "lc lc-title" },
          statusIcon(s, 13),
          h("span", { class: "t" }, i.title),
          i.tasks_total
            ? h("span", { class: "list-tasks", title: `${i.tasks_done}/${i.tasks_total} tasks` }, `${i.tasks_done}/${i.tasks_total}`)
            : null,
        ),
        h("span", { class: "lc lc-status" }, h("span", { class: "pill", style: `color:${s.color}` }, s.name)),
        h("span", { class: "lc lc-prio" }, pIcon ?? h("span", { class: "muted" }, "—")),
        h("span", { class: "lc lc-project" }, p ? h("span", { class: "chip chip--project" }, I.project(p.color ?? "#8a8f98"), h("span", { class: "t" }, p.short ?? p.title)) : h("span", { class: "muted" }, "—")),
        h("span", { class: "lc lc-cycle" }, c ? h("span", { class: "chip" }, I.cycle(), h("span", { class: "t" }, c.name.replace(/^Stage /, "S"))) : h("span", { class: "muted" }, "—")),
        h("span", { class: "lc lc-est" }, i.estimate != null ? String(i.estimate) : h("span", { class: "muted" }, "—")),
        h(
          "span",
          { class: "lc lc-who" },
          m
            ? h("span", { class: "avatar", style: `background:${m.color}`, title: m.name }, initials(m.name))
            : h("span", { class: "avatar avatar--none", title: "Unassigned" }, "?"),
        ),
      ),
    );
  }
  return table;
}

/* ── Filter controls ─────────────────────────────────────────────────────────── */

function filterSelect(key, labelText, options) {
  const cur = view.filters[key] || "";
  return h(
    "label",
    { class: `ctl filter-ctl${cur ? " is-on" : ""}`, title: `Filter by ${labelText}` },
    h(
      "select",
      {
        onchange: (e) => {
          view.filters[key] = e.target.value;
          writeUrl();
          render();
        },
      },
      h("option", { value: "", selected: !cur ? "" : null }, labelText),
      options.map((o) =>
        h("option", { value: o.id, selected: cur === o.id ? "" : null }, o.name),
      ),
    ),
  );
}

function filterBar() {
  return h(
    "div",
    { class: "filter-bar" },
    filterSelect(
      "status",
      "Status",
      (D.config.states ?? []).map((s) => ({ id: s.id, name: s.name })),
    ),
    filterSelect(
      "priority",
      "Priority",
      (D.config.priorities ?? []).map((p) => ({ id: p.id, name: p.name })),
    ),
    filterSelect(
      "project",
      "Project",
      D.projects.map((p) => ({ id: p.id, name: p.short ?? p.title ?? p.id })),
    ),
    filterSelect(
      "cycle",
      "Cycle",
      (D.config.cycles ?? []).map((c) => ({ id: c.id, name: c.name })),
    ),
    filterSelect(
      "assignee",
      "Assignee",
      (D.config.members ?? []).map((m) => ({ id: m.id, name: m.name })),
    ),
    filterSelect(
      "tag",
      "Label",
      (D.config.labels ?? []).map((l) => ({ id: l.id, name: l.name })),
    ),
    activeFilterCount()
      ? h(
          "button",
          {
            class: "ctl",
            title: "Clear all filters",
            onclick: () => {
              clearFilters();
              writeUrl();
              render();
            },
          },
          "Clear",
        )
      : null,
  );
}

/* ── Command palette (⌘K) ────────────────────────────────────────────────────── */

let paletteOpen = false;
let paletteQuery = "";
let paletteIndex = 0;

function closePalette() {
  paletteOpen = false;
  paletteQuery = "";
  paletteIndex = 0;
  document.querySelector(".palette")?.remove();
}

function paletteItems() {
  const q = paletteQuery.trim().toLowerCase();
  const items = [];

  const actions = [
    { id: "a:new", kind: "action", title: "Create issue", hint: "c", run: () => newIssue() },
    {
      id: "a:layout",
      kind: "action",
      title: view.layout === "board" ? "Switch to list view" : "Switch to board view",
      hint: "v",
      run: () => {
        view.layout = view.layout === "board" ? "list" : "board";
        writeUrl();
        render();
      },
    },
    {
      id: "a:done",
      kind: "action",
      title: view.showDone ? "Hide completed issues" : "Show completed issues",
      hint: "d",
      run: () => {
        view.showDone = !view.showDone;
        writeUrl();
        render();
      },
    },
    {
      id: "a:group",
      kind: "action",
      title: `Group by… (now: ${view.groupBy})`,
      hint: "g",
      run: () => {
        view.groupBy = GROUPS[(GROUPS.indexOf(view.groupBy) + 1) % GROUPS.length];
        writeUrl();
        render();
      },
    },
    {
      id: "a:clear",
      kind: "action",
      title: "Clear filters",
      run: () => {
        clearFilters();
        view.query = "";
        writeUrl();
        render();
      },
    },
    ...GROUPS.map((g) => ({
      id: `a:g-${g}`,
      kind: "action",
      title: `Group by ${g}`,
      run: () => {
        view.groupBy = g;
        writeUrl();
        render();
      },
    })),
  ];

  for (const a of actions) {
    if (!q || a.title.toLowerCase().includes(q)) items.push(a);
  }

  const issues = D.issues
    .filter((i) => {
      if (!q) return isOpen(i) || view.showDone;
      const hay = [i.id, i.title, i.project, i.milestone, ...(i.tags ?? [])].join(" ").toLowerCase();
      return hay.includes(q);
    })
    .sort(sortCards)
    .slice(0, 40)
    .map((i) => ({
      id: `i:${i.id}`,
      kind: "issue",
      title: i.title,
      hint: i.id,
      issue: i,
      run: () => openDrawer(i.id),
    }));

  items.push(...issues);
  return items;
}

function runPaletteItem(item) {
  closePalette();
  item.run();
}

function renderPalette() {
  document.querySelector(".palette")?.remove();
  if (!paletteOpen) return;

  const items = paletteItems();
  if (paletteIndex >= items.length) paletteIndex = Math.max(0, items.length - 1);

  const list = h("div", { class: "palette-list", role: "listbox" });
  if (!items.length) {
    list.append(h("div", { class: "palette-empty" }, "No matches"));
  } else {
    items.forEach((item, n) => {
      const row = h(
        "button",
        {
          class: `palette-row${n === paletteIndex ? " is-active" : ""}`,
          role: "option",
          "aria-selected": n === paletteIndex ? "true" : "false",
          onmousedown: (e) => {
            e.preventDefault();
            runPaletteItem(item);
          },
          onmouseenter: () => {
            paletteIndex = n;
            document.querySelectorAll(".palette-row").forEach((el, i) => el.classList.toggle("is-active", i === n));
          },
        },
        item.kind === "issue"
          ? h(
              "span",
              { class: "palette-main" },
              statusIcon(state(item.issue.status), 13),
              h("span", { class: "palette-id" }, item.hint),
              h("span", { class: "palette-title" }, item.title),
            )
          : h("span", { class: "palette-main" }, I.cmd(), h("span", { class: "palette-title" }, item.title)),
        item.kind === "action" && item.hint ? h("kbd", null, item.hint) : null,
      );
      list.append(row);
    });
  }

  const el = h(
    "div",
    {
      class: "palette",
      onclick: (e) => {
        if (e.target.classList.contains("palette")) closePalette();
      },
    },
    h(
      "div",
      { class: "palette-card", role: "dialog", "aria-label": "Command palette" },
      h(
        "div",
        { class: "palette-input-row" },
        I.search(),
        h("input", {
          class: "palette-input",
          type: "text",
          placeholder: "Jump to issue or run a command…",
          value: paletteQuery,
          oninput: (e) => {
            paletteQuery = e.target.value;
            paletteIndex = 0;
            renderPalette();
            document.querySelector(".palette-input")?.focus();
          },
          onkeydown: (e) => {
            const cur = paletteItems();
            if (e.key === "ArrowDown") {
              e.preventDefault();
              paletteIndex = Math.min(paletteIndex + 1, Math.max(0, cur.length - 1));
              renderPalette();
              document.querySelector(".palette-input")?.focus();
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              paletteIndex = Math.max(paletteIndex - 1, 0);
              renderPalette();
              document.querySelector(".palette-input")?.focus();
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (cur[paletteIndex]) runPaletteItem(cur[paletteIndex]);
            } else if (e.key === "Escape") {
              e.preventDefault();
              closePalette();
            }
          },
        }),
        h("kbd", null, "esc"),
      ),
      list,
      h("div", { class: "palette-foot" }, h("span", null, "↑↓ navigate"), h("span", null, "↵ open"), h("span", null, `${items.length} results`)),
    ),
  );
  document.body.append(el);
  queueMicrotask(() => document.querySelector(".palette-input")?.focus());
}

function openPalette() {
  if (STATIC) {
    // Static export still supports jump-to; actions that write are guarded elsewhere.
  }
  paletteOpen = true;
  paletteQuery = "";
  paletteIndex = 0;
  renderPalette();
}

/* ── Drawer ──────────────────────────────────────────────────────────────────── */

function selectField(labelText, value, options, onChange) {
  return h(
    "div",
    { class: "field" },
    h("label", { class: "field-label" }, labelText),
    h(
      "select",
      {
        class: "field-value",
        disabled: STATIC ? "" : null,
        onchange: (e) => onChange(e.target.value === "__none" ? null : e.target.value),
      },
      options.map((o) =>
        h("option", { value: o.id ?? "__none", selected: (o.id ?? null) === (value ?? null) ? "" : null }, o.name),
      ),
    ),
  );
}

function openDrawer(id) {
  view.selected = id;
  writeUrl();
  closeDrawer(false);
  const i = byId.get(id);
  if (!i) return;

  const relRow = (rid, kind) => {
    const r = byId.get(rid);
    if (!r) return null;
    return h(
      "button",
      { class: "rel", title: `${kind} ${rid}`, onclick: () => openDrawer(rid) },
      statusIcon(state(r.status), 12),
      h("span", { class: "rid" }, rid),
      h("span", { class: "rt" }, r.title),
    );
  };

  const relations = [
    ...(i.blocked_by ?? []).map((r) => ({ r, kind: "Blocked by" })),
    ...(i.blocks ?? []).map((r) => ({ r, kind: "Blocks" })),
    ...(i.relates ?? []).map((r) => ({ r, kind: "Relates to" })),
  ];
  const grouped = new Map();
  for (const { r, kind } of relations) {
    if (!grouped.has(kind)) grouped.set(kind, []);
    grouped.get(kind).push(r);
  }

  const bodyHtml = markdown(i.body ?? "");

  const main = h("div", { class: "drawer-main" }, h("h1", { class: "drawer-title" }, i.title), i.description ? h("p", { class: "drawer-desc" }, i.description) : null);

  if (i.tasks_total) {
    const pct = Math.round((i.tasks_done / i.tasks_total) * 100);
    main.append(
      h(
        "div",
        { class: "progress-bar" },
        h("span", null, `${i.tasks_done}/${i.tasks_total}`),
        h("span", { class: "track" }, h("span", { class: "fill", style: `width:${pct}%` })),
        h("span", null, `${pct}%`),
      ),
    );
  }

  const mdEl = h("div", { class: "md", html: bodyHtml });
  mdEl.querySelectorAll(".task").forEach((li) => {
    li.addEventListener("click", (e) => {
      // preventDefault reverts the browser's pre-click toggle: the markdown file is the
      // source of truth, so we flip the *persisted* state (the class) and re-read from disk.
      // Reading `input.checked` here would see the already-toggled value and invert it back.
      e.preventDefault();
      toggleTask(i.id, Number(li.dataset.task), !li.classList.contains("is-done"));
    });
  });
  main.append(mdEl);

  const side = h(
    "div",
    { class: "drawer-side" },
    selectField("Status", i.status, (D.config.states ?? []).map((s) => ({ id: s.id, name: s.name })), (v) => patch(i.id, { status: v })),
    selectField("Priority", i.priority, (D.config.priorities ?? []).map((p) => ({ id: p.id, name: p.name })), (v) => patch(i.id, { priority: v })),
    selectField(
      "Assignee",
      i.assignee,
      [{ id: null, name: "Unassigned" }, ...(D.config.members ?? []).map((m) => ({ id: m.id, name: m.name }))],
      (v) => patch(i.id, { assignee: v }),
    ),
    selectField(
      "Project",
      i.project,
      [{ id: null, name: "No project" }, ...D.projects.map((p) => ({ id: p.id, name: p.title ?? p.id }))],
      (v) => patch(i.id, { project: v }),
    ),
    selectField(
      "Cycle",
      i.cycle,
      [{ id: null, name: "No cycle" }, ...(D.config.cycles ?? []).map((c) => ({ id: c.id, name: c.name }))],
      (v) => patch(i.id, { cycle: v }),
    ),
    selectField(
      "Estimate",
      i.estimate,
      [{ id: null, name: "—" }, ...(D.config.estimate_scale ?? []).map((n) => ({ id: n, name: `${n} pt` }))],
      (v) => patch(i.id, { estimate: v === null ? null : Number(v) }),
    ),
  );

  if (i.milestone) {
    side.append(h("div", { class: "field" }, h("label", { class: "field-label" }, "Milestone"), h("div", { class: "field-value" }, i.milestone)));
  }

  if ((i.tags ?? []).length) {
    side.append(
      h(
        "div",
        { class: "field" },
        h("label", { class: "field-label" }, "Labels"),
        h(
          "div",
          { class: "tag-row" },
          (i.tags ?? []).map((t) => {
            const l = label(t);
            return h("span", { class: "chip", title: l.description ?? "" }, h("span", { class: "dot", style: `background:${l.color}` }), h("span", { class: "t" }, l.name));
          }),
        ),
      ),
    );
  }

  for (const [kind, ids] of grouped) {
    side.append(h("div", { class: "field" }, h("label", { class: "field-label" }, kind), ids.map((r) => relRow(r, kind)).filter(Boolean)));
  }

  if (i.resource) {
    side.append(
      h(
        "div",
        { class: "field" },
        h("label", { class: "field-label" }, "Source"),
        h("div", { class: "field-value", style: "font-size:11.5px;word-break:break-all" }, I.doc(), i.resource),
      ),
    );
  }
  if (i.linear_id) {
    side.append(h("div", { class: "field" }, h("label", { class: "field-label" }, "Linear"), h("div", { class: "field-value" }, i.linear_id)));
  }

  const drawer = h(
    "div",
    { class: "drawer", role: "dialog", "aria-label": `${i.id} ${i.title}` },
    h(
      "div",
      { class: "drawer-head" },
      h("span", { class: "id" }, i.id),
      h("span", { class: "spacer" }),
      h("span", { class: "file" }, i.file),
      h("button", { class: "icon-btn", title: "Close (Esc)", onclick: () => closeDrawer() }, I.close()),
    ),
    h("div", { class: "drawer-body" }, main, side),
  );

  const scrim = h("div", { class: "scrim", onclick: () => closeDrawer() });
  document.body.append(scrim, drawer);
  render();
}

function closeDrawer(clearSel = true) {
  document.querySelector(".drawer")?.remove();
  document.querySelector(".scrim")?.remove();
  if (clearSel) {
    view.selected = null;
    writeUrl();
    render();
  }
}

async function newIssue(fields = {}) {
  if (STATIC) return toast("Read-only export. Run <code>track.mjs board</code> to add issues.", true);
  const title = prompt("New issue — title");
  if (!title?.trim()) return;
  try {
    const r = await api("/api/issues", "POST", { title: title.trim(), status: "todo", ...fields });
    await load();
    toast(`Created <strong>${r.id}</strong> · <code>${r.file}</code>`);
    openDrawer(r.id);
  } catch (e) {
    toast(e.message, true);
  }
}

/* ── Help ────────────────────────────────────────────────────────────────────── */

const KEYS = [
  ["⌘K / Ctrl+K", "Command palette"],
  ["/", "Search"],
  ["c", "New issue"],
  ["v", "Board / list layout"],
  ["g", "Cycle group-by"],
  ["d", "Show / hide done"],
  ["Esc", "Close"],
  ["?", "This dialog"],
];

function toggleHelp() {
  const open = document.querySelector(".help");
  if (open) return open.remove();
  const el = h(
    "div",
    { class: "help", onclick: (e) => e.target.classList.contains("help") && e.target.remove() },
    h(
      "div",
      { class: "help-card" },
      h("h3", null, "Keyboard"),
      KEYS.map(([k, d]) => h("div", { class: "help-row" }, h("span", null, d), h("kbd", null, k))),
    ),
  );
  document.body.append(el);
}

/* ── Render ──────────────────────────────────────────────────────────────────── */

const GROUPS = ["cycle", "status", "project", "priority", "assignee"];

function render() {
  writeUrl();
  const app = document.getElementById("app");
  const shown = visible();
  const scrolls = [...document.querySelectorAll(".col-body")].map((e) => e.scrollTop);
  const boardScroll = document.querySelector(".board")?.scrollLeft ?? 0;
  const listScroll = document.querySelector(".list")?.scrollTop ?? 0;

  app.replaceChildren(
    h(
      "div",
      { class: "header" },
      h("button", { class: "icon-btn", title: "Toggle sidebar" }, I.panel()),
      h(
        "div",
        { class: "crumbs" },
        h("button", { class: "crumb" }, h("span", { class: "glyph" }, I.code()), D.config.workspace?.name ?? "Workspace"),
        h("span", { class: "crumb-sep" }, "/"),
        h("button", { class: "crumb" }, h("span", { class: "glyph glyph--cycle" }, I.cycle()), "Engineering Cycle Planning Board"),
        h("button", { class: "icon-btn star", title: "Favorite" }, I.star()),
        h("button", { class: "icon-btn" }, I.dots()),
      ),
      h("span", { class: "spacer" }),
      h(
        "button",
        {
          class: "ctl cmd-btn",
          title: "Command palette (⌘K)",
          onclick: () => openPalette(),
        },
        I.cmd(),
        "Commands",
        h("kbd", null, "⌘K"),
      ),
      STATIC ? h("span", { class: "badge-ro" }, I.doc(), "Static export · read-only") : null,
    ),
    h(
      "div",
      { class: "subheader" },
      h("span", { class: "count" }, `${shown.length} issue${shown.length === 1 ? "" : "s"}`),
      filterBar(),
      h("span", { class: "spacer" }),
      h(
        "label",
        { class: "search" },
        I.search(),
        h("input", {
          type: "text",
          placeholder: "Search…",
          value: view.query,
          oninput: (e) => {
            view.query = e.target.value;
            writeUrl();
            render();
            document.querySelector(".search input")?.focus();
          },
        }),
        h("kbd", null, "/"),
      ),
      h(
        "button",
        {
          class: `ctl${view.showDone ? " is-on" : ""}`,
          title: "Show completed and canceled issues",
          onclick: () => {
            view.showDone = !view.showDone;
            writeUrl();
            render();
          },
        },
        I.filter(),
        view.showDone ? "All" : "Open",
      ),
      h(
        "div",
        { class: "layout-toggle", title: "Layout" },
        h(
          "button",
          {
            class: `icon-btn${view.layout === "board" ? " is-on" : ""}`,
            title: "Board view",
            onclick: () => {
              view.layout = "board";
              writeUrl();
              render();
            },
          },
          I.board(),
        ),
        h(
          "button",
          {
            class: `icon-btn${view.layout === "list" ? " is-on" : ""}`,
            title: "List view",
            onclick: () => {
              view.layout = "list";
              writeUrl();
              render();
            },
          },
          I.list(),
        ),
      ),
      view.layout === "board"
        ? h(
            "label",
            { class: "ctl", title: "Group by" },
            I.sliders(),
            h(
              "select",
              {
                onchange: (e) => {
                  view.groupBy = e.target.value;
                  writeUrl();
                  render();
                },
              },
              GROUPS.map((g) => h("option", { value: g, selected: view.groupBy === g ? "" : null }, g[0].toUpperCase() + g.slice(1))),
            ),
          )
        : null,
    ),
    view.layout === "list" ? listEl() : boardEl(),
  );

  document.querySelectorAll(".col-body").forEach((e, n) => (e.scrollTop = scrolls[n] ?? 0));
  const b = document.querySelector(".board");
  if (b) b.scrollLeft = boardScroll;
  const l = document.querySelector(".list");
  if (l) l.scrollTop = listScroll;
}

/* ── Load + live reload ──────────────────────────────────────────────────────── */

let urlBooted = false;

async function load() {
  D = STATIC ? window.__TRACK_DATA__ : await api("/api/state");
  byId = new Map(D.issues.map((i) => [i.id, i]));
  if (D.errors?.length) toast(`${D.errors.length} file(s) failed to parse — run <code>track.mjs lint</code>`, true);
  const drawerWasOpen = !!document.querySelector(".drawer");
  let openFromUrl = false;
  if (!urlBooted) {
    readUrl();
    openFromUrl = !!view.selected;
    urlBooted = true;
  }
  render();
  // Re-open the drawer after SSE reloads, or once from ?issue= on first paint.
  if (view.selected && byId.has(view.selected) && (drawerWasOpen || openFromUrl)) {
    openDrawer(view.selected);
  }
}

function keys(e) {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    if (paletteOpen) closePalette();
    else openPalette();
    return;
  }
  if (e.key === "Escape") {
    if (paletteOpen) {
      closePalette();
      return;
    }
    document.querySelector(".help")?.remove();
    closeDrawer();
    if (typing) e.target.blur();
    return;
  }
  if (paletteOpen) return;
  if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === "/") {
    e.preventDefault();
    document.querySelector(".search input")?.focus();
  } else if (e.key === "c") {
    newIssue();
  } else if (e.key === "d") {
    view.showDone = !view.showDone;
    writeUrl();
    render();
  } else if (e.key === "g") {
    view.groupBy = GROUPS[(GROUPS.indexOf(view.groupBy) + 1) % GROUPS.length];
    writeUrl();
    render();
  } else if (e.key === "v") {
    view.layout = view.layout === "board" ? "list" : "board";
    writeUrl();
    render();
  } else if (e.key === "?") {
    toggleHelp();
  }
}

document.addEventListener("keydown", keys);

if (!STATIC) {
  const es = new EventSource("/api/events");
  // Any write — a drag here, a `track set`, an agent editing the file, a git checkout —
  // lands on disk and comes back through here. The board is never the source of truth.
  es.addEventListener("changed", () => load());
}

load().catch((e) => {
  document.getElementById("app").innerHTML = `<div class="boot">Could not load: ${esc(e.message)}</div>`;
});
