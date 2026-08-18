# AGENTS.md — operating the tracker

How a coding agent reads and writes this tracker. Read [`SPEC.md`](./SPEC.md) for the format.
This file is about **conduct**.

---

## The core idea

You do not need an API token, an MCP server, or a rate limit to work this tracker. The issues
are markdown files. You already have `Read`, `Edit`, `Grep`, and `Bash`.

Prefer the CLI over hand-editing frontmatter — it keeps the file canonical, bumps `timestamp`,
and validates against `config.yml`:

```bash
pnpm tracker:next
pnpm tracker:board
pnpm tracker:show SY-0009
pnpm tracker:move SY-0009 in_progress
pnpm tracker set SY-0009 branch=shreyas/sy-0009-scaffold
pnpm tracker new "Fix the thing" project=stage-1 cycle=stage-1 template=task
pnpm tracker:lint
```

Hand-edit the **body** freely (that's markdown, and checkboxes are the progress ring). Use the
CLI for **frontmatter**.

```js
import { loadState, patchIssue } from "./docs/issue-tracking/track.mjs";
```

---

## Always

**Start from `track next`, not from the board.** It walks the dependency graph and returns only
issues whose every blocker is terminal. Picking up a blocked issue is the most expensive
mistake available here.

**Run `track lint` before you commit.** Zero errors.

**Update the issue in the same commit as the code.** Do not batch tracker updates into a
separate "update issues" commit.

**Check boxes only with evidence.** `- [ ]` → `- [x]`. The ring is derived from these lines.

**Cite files and doc sections**, not "the code".

**Respect `resource:`.** When the guide and the issue disagree, the guide wins and the issue
is wrong.

---

## Never

**Never delete an issue file.** Close it: `canceled` (with a reason) or `duplicate` (survivor
in `relates`). IDs are `max+1` zero-padded; deleting `SY-0042` makes the next issue reuse the
number.

**Never edit `config.yml`.** Propose a schema change; don't do it.

**Never set `priority`.** Suggest one; let a human set it.

**Never cancel or close an issue you did not execute.**

**Never hand-edit `index.md`.** It is generated: `pnpm tracker:index`.

**Never regenerate `blocks:`.** Declare the edge once, in `blocked_by`.

**Never start a blocked issue.** Only dependency-free, specified issues are `ready`. One agent
owns an `in_progress` issue at a time.

---

## Blast radius

| An agent may, unprompted | An agent must ask first |
|---|---|
| File an issue (`status: triage`) | Set or change `priority` |
| Add labels, `estimate`, `project`, `milestone`, `rank` | Edit `config.yml` |
| Add `blocked_by` / `relates` edges it can prove | Cancel or close an issue it did not execute |
| Move **its own** work: `ready → in_progress → in_review` | Move an issue to `done` without acceptance evidence |
| Check off tasks it actually did | Change `cycle` (scheduling — a human's call) |
| Write `branch:` / `pr:` | Delete anything |
| Run `lint`, `index`, `stats`, `next`, `export`, `board` | Access raw user data, secrets, or production |

`rank` sequences eligible work. It does not override `blocked_by`.

- **`agent-ok`** — low blast radius. Take it end-to-end.
- **`needs-human`** — auth, schema/migrations, secrets, deploys, or a decision. Draft it; a
  human lands it. Every `migration` issue is `needs-human`.

---

## Closing an issue honestly

`status: done` means the acceptance criteria passed and you recorded evidence. It does not
mean "the code compiles" or "I believe it works". If a verification step is blocked, leave
the issue at `in_review` and say what is outstanding.

---

## Filing a good issue

```bash
pnpm tracker new "Short title" project=stage-1 cycle=stage-1 template=task tags=task,docs
```

Then write the body. Seeded issues use the Stage-1 heading set (Objective through Completion
Checklist). New issues may use the template's Context / Tasks / Verify. Either way:

- **Context** cites `file` or a doc section.
- **Tasks** are steps someone else could execute.
- **Verify** is observable behavior, plus `pnpm verify` when code changed.
