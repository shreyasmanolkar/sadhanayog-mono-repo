# Log

Decisions and notable changes, newest first. OKF 0.1 reserved file.

This is for *why*, not *what* — `git log` already has what. One entry per decision that a future
reader would otherwise have to reverse-engineer.

---

## 2026-08-19 — Stage 1 epic records the scaffold unsigned and does not close children

SY-0008 is the Stage 1 program, not a signed architecture approval and not
the child work packages. CI host, tool versions, licenses, shared
development, CODEOWNERS reviewers, and moving stack ADRs to `implemented/`
stay unsigned. Children SY-0009–SY-0017 still own their artifacts. The
epic started while SY-0002 was `in_review` because a human named it after
the SY-0002 named outcome had landed.

Clean-checkout GitHub Actions was red: contracts/db DTS required
`@types/node` (declared by `packages/config/typescript/node.json` but not
installed), and `flutter analyze` treated `prefer_const_constructors` in
`apps/mobile/test/result_test.dart` as failure. The secret scanner no-oped
when `rg` was missing. Those three defects are repaired on the SY-0008
branch so the Stage 1 smoke can be true; they are not a rewrite of child
ownership.

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
