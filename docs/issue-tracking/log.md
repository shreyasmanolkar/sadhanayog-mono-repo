# Log

Decisions and notable changes, newest first. OKF 0.1 reserved file.

This is for *why*, not *what* — `git log` already has what. One entry per decision that a future
reader would otherwise have to reverse-engineer.

---

## 2026-08-20 — Stage 1 board cards get unique descriptions

Seeded Stage 1 issues all carried the epic sentence as `description`, so
every card drawer looked the same. SY-0008–SY-0017 now have one-line
descriptions that match the roadmap work package. SY-0008 `pr` is `9` so
the board chip renders `#9`. The stage-1 project card points at
`docs/development/README.md`. Child implementation notes stay on the
child PRs.

## 2026-08-20 — SY-0012 ADR path note is ADR-0009 after staging merge

Staging already assigned ADR-0006 to the Flutter shell, ADR-0007 to
toolchain pins, and ADR-0008 to quality conventions. The SY-0012 path
and ID convention note is therefore ADR-0009. IDs are never reused.

## 2026-08-19 — SY-0012 records the docs/decision system without promoting ADRs

The documentation map (`docs/README.md`) is the named SY-0012 outcome:
hierarchy, owners, generated ADR index, postmortem template, and runbook
name placeholders. Agent Notes keep lifecycle/class/date-slug paths and
gain an `ID: ADR-NNNN` field. Foundation §18.2's `proposed/ADR-NNNN-slug.md`
layout is recorded as proposed ADR-0009, not implemented. Stack ADRs
0001–0005 stay proposed. SY-0009 was not `done` when this work started;
a human named the issue.

## 2026-08-20 — Quality conventions stay Prettier/ESLint/tsc, no git hooks

SY-0011 names format, lint, Dart/TS strictness, import boundaries, Conventional
Commits, generated-file labels, and a license allowlist. A second formatter
(Biome), type-aware ESLint, and Husky were rejected as duplicate machinery.
GPL/AGPL stay forbidden; the optional sharp libvips binary is a named LGPL
exception, not a general copyleft allow. Staging already used ADR-0006 for
the Flutter shell, so this note is ADR-0008.

## 2026-08-19 — SY-0009 records toolchain pins without claiming empty apps

Stage 1 was bulk-scaffolded before this issue had a named outcome. SY-0009
owns the workspace directories, lockfiles, and version pins — not compiling
Worker/web/Flutter shells (SY-0010) or CI jobs (SY-0016). Canonical versions
live in `tools/ci/tool-pins.json`. Dart stays a Flutter-bundled pin so a
second mise Dart cannot shadow the SDK. Wrangler stays an npm pin.
Proposed as ADR-0007 because staging already assigned ADR-0006 to the
Flutter shell (SY-0010). Unsigned: license SPDX, shared staging, Java 25
vs Android JDK 17, Windows hosts, and human approval of the foundation
document.

## 2026-08-19 — SY-0010 empty shells keep later composition out of Stage 1

The compiling Worker/web/Flutter/db/contracts packages already existed on
`staging`. SY-0010 fills the Stage 1 gaps without taking Stage 4/8/9 work:
readiness stays unprotected, native product flavors stay SY-0064, file-based
TanStack routes stay SY-0072. Dart-define `AppConfig` is the flavors/config
shell named by the Stage 1 expected changes. Proposed ADR-0006 records the
Flutter client; it is not authority.

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
