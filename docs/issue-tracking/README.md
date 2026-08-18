# Sadhana Yog Track

A Linear-style issue tracker that lives in the repo. **The markdown files are the database.**

```bash
pnpm tracker:board       # → http://localhost:4322
```

The board is a *view* over `issues/*.md`, never a source of truth. Drag a card and the file is
rewritten. Edit the file and the board updates instantly (SSE). Run the CLI and both agree,
because there is only one copy.

---

## The files you'll read

| | |
|---|---|
| [`SPEC.md`](./SPEC.md) | The format. An OKF 0.1 profile — frontmatter schema and invariants |
| [`AGENTS.md`](./AGENTS.md) | How an agent operates the tracker |
| [`config.yml`](./config.yml) | The schema: states, priorities, labels, cycles, people. **Hand-owned** |

`index.md` is the generated OKF catalog (`pnpm tracker:index`). `log.md` is the decision log.

---

## Commands

```bash
pnpm tracker <cmd>
# or
node docs/issue-tracking/track.mjs <cmd>
```

| | |
|---|---|
| `board [--port 4322]` | The board. Read/write, live-reloads on any file change |
| `next` | **What is unblocked right now** — walks the dependency graph |
| `new "<title>" [k=v…]` | File an issue. `project=`, `cycle=`, `tags=a,b`, `template=bug\|feature\|migration\|chore\|task` |
| `set <ID> <k=v>…` | Edit fields. `move`, `done` are shorthands |
| `list [k=v]…` | Filter. `list cycle=stage-1 status=ready` |
| `show <ID>` | Print the file |
| `lint` | Validate everything against `config.yml`. **Exit 1 on error** |
| `index` | Regenerate `index.md` |
| `stats` | Counts by status, cycle, project |
| `export` | Bake a self-contained `board.html` — opens from `file://` |

### Board keyboard

| | |
|---|---|
| `⌘K` / `Ctrl+K` | Command palette — jump to any issue or run an action |
| `/` | Focus search |
| `c` | New issue |
| `v` | Toggle board ↔ list layout |
| `g` | Cycle group-by (board layout) |
| `d` | Show / hide done |
| `?` | Help |

Filters (status, priority, project, cycle, assignee, label), layout, search, and the open issue
persist in the URL — copy the link to reopen the same view.

---

## The model

| Linear | Here | In this repo |
|---|---|---|
| Initiative | `config.yml` → `initiatives` | Discovery · Foundation · Platform · Product · Hardening · Release |
| Project | `projects/*.md` | one per roadmap stage (`stage-0` … `stage-20`) |
| Milestone | `milestone:` on an issue | free string inside the stage |
| Cycle | `config.yml` → `cycles` | one per stage |
| Issue | `issues/SY-NNNN.md` | one work unit |
| Sub-issue | `- [ ]` checkboxes | progress ring on the card |
| Blocked-by | `blocked_by:` | the build order the roadmap encodes |

The implementation roadmap and engineering foundation remain the source of truth for *design*.
This tracks *execution*. Every issue carries a `resource:` pointer back to the guide that owns
it — **when they disagree, the guide wins.**

---

## What is unblocked right now

```bash
pnpm tracker:next
```

`blocked_by` is a hard, symmetric, cycle-checked relation. `track next` walks it and returns
only what every blocker has cleared. Start there, not from a wish list.

---

## Extending it

Add a key to any issue's frontmatter and it survives — OKF's unknown-field-preservation rule is
implemented in the serializer. The board ignores what it doesn't know; `lint` won't complain.

Add a state, label, cycle, or person in `config.yml` and lint enforces it everywhere immediately.
That edit is a human decision — agents propose, they do not change the schema.
