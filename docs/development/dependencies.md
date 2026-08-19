# Dependencies

Status: living  
Owner: engineering  
Last-reviewed: 2026-08-19  
Issue: [SY-0017](../issue-tracking/issues/SY-0017.md)

- One pnpm workspace ([`pnpm-workspace.yaml`](../../pnpm-workspace.yaml)) and one [`pnpm-lock.yaml`](../../pnpm-lock.yaml). Internal packages use `workspace:*`.
- Flutter has its own [`apps/mobile/pubspec.yaml`](../../apps/mobile/pubspec.yaml) and committed `pubspec.lock`. It does not consume Node packages.
- Do not add Turborepo, Nx, or FVM. Root scripts orchestrate three apps (foundation §5.3).
- Import boundaries are enforced by [`tools/ci/check-boundaries.mjs`](../../tools/ci/check-boundaries.mjs): web may not import `packages/db` or Worker internals; contracts may not import apps or db.
- `pnpm.onlyBuiltDependencies` allowlists native builds (`esbuild`, `workerd`, `sharp`).
- Dependabot / Renovate is **not** configured. Weekly grouped non-major updates and a license policy are unsigned human decisions. Do not auto-merge runtime, auth, database, mobile-build, or major updates.

Adding a runtime dependency requires the owning issue to name it. Preferred sources are the approved stack in [engineering-foundation.md](../architecture/engineering-foundation.md); that document is still **Proposed** until a human signs it.
