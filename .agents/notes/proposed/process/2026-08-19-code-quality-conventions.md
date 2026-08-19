# Agent Note: Code quality conventions

Status: proposed

## Problem

Stage 1 needs one reviewable convention for format, lint, TypeScript/Dart
strictness, import boundaries, commit history, generated artifacts, and
dependency licenses. The workspace already had Prettier, ESLint, and a
boundary script, but the target tree (`packages/config/{eslint,typescript,vitest}`),
commit policy, generated-file labels, and license allowlist were not named
outcomes.

## Proposal

Keep Prettier as the JS/JSON/CSS/YAML formatter and `dart format` for Flutter.
Keep ESLint 9 flat config with `typescript-eslint` recommended, and treat
`tsc --noEmit` under shared strict `tsconfig` files as the TypeScript
strictness gate. Put shared ESLint and Node Vitest config in
`packages/config`. Enforce foundation §5.2 import rules with a source scan
plus `no-restricted-imports`. Adopt Conventional Commits as a history
convention without git hooks. Label committed generated OpenAPI and check
drift. Allow only the permissive SPDX licenses in
`tools/ci/license-allowlist.json`.

## Rationale

The engineering foundation already named these controls. Adding a second
formatter (Biome) or type-aware ESLint would duplicate `tsc` and Prettier for
a three-person team. Husky/commitlint would add hook machinery the foundation
asks us to omit until a tool has a documented need. A zero-dependency
`tools/ci` script matches the existing secret/docs/boundary checkers.

## Alternatives considered

- **Biome instead of Prettier + ESLint:** rejected for this stage. The scaffold
  already used Prettier and ESLint; Biome would replace working configs without
  a measured CI-time problem.
- **Type-aware `strictTypeChecked` ESLint:** deferred. `tsc` already runs
  `strict` plus `exactOptionalPropertyTypes` and unused-binding flags.
  Type-aware lint can be added later if it catches defects `tsc` misses.
- **commitlint + Husky:** rejected. Conventional Commits stay a history
  convention (foundation §25). PR-title checks belong to SY-0016. Existing
  merge commits are not rewritten.
- **No license allowlist until Dependabot:** rejected. Stage 1 asks for a
  dependency policy; an allowlist plus `pnpm licenses:check` is the smallest
  closed-loop check. GPL/AGPL/SSPL/BUSL remain human exceptions. The optional
  sharp libvips binary (`LGPL-3.0-or-later`) is a named exception, not a
  general LGPL allow.

## Affected components

`packages/config`, root ESLint/Prettier, `apps/mobile/analysis_options.yaml`,
`tools/ci/check-*.mjs`, `docs/development/style.md`, `pnpm verify`.

## Related records

- **Supersedes:** None — first record
- **Superseded by:** None — still proposed
- **Index:** ADR-0008. Staging already assigned ADR-0006 to the Flutter
  shell and ADR-0007 to toolchain pins.
