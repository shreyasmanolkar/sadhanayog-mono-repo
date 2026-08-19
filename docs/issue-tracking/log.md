# Log

Decisions and notable changes, newest first. OKF 0.1 reserved file.

This is for *why*, not *what* — `git log` already has what. One entry per decision that a future
reader would otherwise have to reverse-engineer.

---

## 2026-08-19 — SY-0016 splits CI into four read-only jobs and stops no-oping secrets

The bulk scaffold ran `pnpm verify` plus Flutter analyze/test as two jobs
and skipped the secret scan when `rg` was missing. SY-0016 makes the scan
in-process, adds license policy and a workflow policy linter, pins Actions
by SHA, and runs Flutter `build bundle` as the Stage 1 smoke. Playwright,
APK/IPA, path filters, production environments, and GitHub branch
protection remain deferred. CI host and CODEOWNERS reviewers stay unsigned.

## 2026-08-19 — SY-0002 inventories deploy topology from executables, not stale Worker docs

The Command Center revision ships three descriptions of custom-domain deploy:
`worker.js` (static `ASSETS` + `POST /sync`), `CLOUDFLARE_WORKER.md` (HtmlService
reverse proxy), and `Code.gs` comments that still assume the Worker serves
Google's wrapper. SY-0002 treats the executable Worker as observed behaviour
and lists the markdown drift instead of repairing it. Generator `--check` STALE
is recorded, not fixed. Cloudflare Access stays “not observed”.

## 2026-08-19 — Tracker `next` smoke test must not freeze SY-0001 as Ready

`tools/tracker/track.test.mjs` matched `SY-0001` in `track next`. That is live
board state, not a fixture. Advancing the epic made verify fail. The smoke
test now checks that `next` still prints the unblocked banner and a count.

## 2026-08-19 — Stage 0 epic records decisions unsigned and defers inventories

SY-0001 is the Stage 0 program, not the signed baseline. Preserve/change/remove,
browser-vs-Sheets precedence, health-note scope, and integration reality stay
unsigned until SY-0007. Child issues still own the named inventory files.
Generator drift is recorded, not repaired.

## 2026-08-19 — Adopt the vivek-os tracker skeleton, including the board UI

Copied the `vivek-os` issue-tracking skeleton into this repo: `track.mjs` as parser / validator /
local board server / static exporter, plus `board/` (Linear-style kanban). Markdown files remain
the database. The board is a view.

Kept Sadhana Yog identifiers and workflow:

- workspace key `SY`, zero-padded `SY-NNNN`
- `ready` stays the unblocked, specified state (`todo` exists for scheduled-but-not-ready)
- priorities stay `P0`–`P3`
- kind (Epic / Feature / Task / …) moves from `type:` into exclusive `tags`
- `type:` is the OKF document type (`Issue` / `Project` / `Template`)
- cycles and projects are the 21 roadmap stages

Existing issue bodies are unchanged. Frontmatter was migrated to the OKF profile so the board
and `track lint` can load them.
