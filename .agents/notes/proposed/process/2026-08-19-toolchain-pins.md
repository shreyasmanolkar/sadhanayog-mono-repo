# Agent Note: Pinned workspace toolchain

ID: ADR-0007
Status: proposed

## Problem

Stage 1 needs one lockable set of Node, pnpm, Flutter, Dart, Wrangler, and
Java versions so local machines and CI do not silently diverge.

## Proposal

Treat `tools/ci/tool-pins.json` as the canonical pin table. `mise.toml`
installs Node, pnpm, Flutter, and Java. Dart ships with the pinned Flutter
SDK and must not be a second mise tool. Wrangler is the `apps/api`
devDependency. `pnpm toolchain:check` fails when files or present binaries
drift.

## Rationale

Foundation §5.3 requires pins and a check. A single JSON table is reviewable
and can be compared to mise, `package.json`, Wrangler, and CI without adding
Turborepo, Nx, FVM, or extra lockfiles.

## Alternatives considered

- **Unpinned latest tools:** rejected; CI and laptops would drift.
- **Separate Dart and Wrangler mise tools:** rejected; Dart would shadow the
  Flutter SDK, and Wrangler is already a pnpm dependency.
- **Task orchestrator (Turborepo/Nx):** rejected; three apps do not need a
  task graph yet (foundation §5.3).

## Impact

- **Security:** pin drift is a supply-chain risk. The checker compares files
  and present binaries; it does not fetch unpinned latest tools.
- **Operations:** `pnpm toolchain:check` is part of `pnpm verify`.
- **Data:** none.

## Affected components

`tools/ci/tool-pins.json`, `tools/ci/check-tool-pins.mjs`, `mise.toml`,
root `package.json`, `apps/api/package.json`, `.github/workflows/ci.yml`.

## Approvers

Human architectural reviewer. Not self-approved.

## Related records

- **Supersedes:** None — first record
- **Superseded by:** None — still proposed
