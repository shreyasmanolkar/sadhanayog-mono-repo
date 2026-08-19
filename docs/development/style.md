# Code quality conventions

Status: living  
Owner: engineering  
Last-reviewed: 2026-08-19

Canonical policy for formatters, lint, TypeScript/Dart strictness, import
boundaries, Conventional Commits, generated files, and dependencies. Executable
configs and `pnpm verify` are authority; this document explains them.

Issue: [SY-0011](../issue-tracking/issues/SY-0011.md). Proposed rationale:
[ADR-0008](../../.agents/notes/proposed/process/2026-08-19-code-quality-conventions.md).

## Formatters

| Surface | Tool | Config |
|---|---|---|
| TypeScript, JavaScript, JSON, YAML, CSS | Prettier 3.6.2 | [`prettier.config.js`](../../prettier.config.js), [`.prettierignore`](../../.prettierignore) |
| Dart | `dart format` | default Dart style |
| Editor defaults | EditorConfig | [`.editorconfig`](../../.editorconfig) |

- Print width 100, double quotes, trailing commas.
- Markdown is not Prettier-formatted (`*.md` in `.prettierignore`) so tracker
  files and long prose keep hand wrapping.
- Generated OpenAPI, lockfile, Flutter tree, `dist`, and route trees are ignored.
- VS Code format-on-save lives in [`.vscode/settings.json`](../../.vscode/settings.json).

```bash
pnpm format
pnpm lint          # prettier --check plus ESLint
cd apps/mobile && dart format lib test
```

## ESLint and TypeScript

Shared ESLint lives in [`packages/config/eslint`](../../packages/config/eslint/index.js).
The repository root [`eslint.config.js`](../../eslint.config.js) re-exports it.

TypeScript strictness is the compiler, not type-aware ESLint:

- `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- `noUnusedLocals`, `noUnusedParameters`, `noImplicitOverride`
- `verbatimModuleSyntax`, `isolatedModules`

Configs: [`packages/config/typescript`](../../packages/config/typescript/base.json).
ESLint uses `typescript-eslint` recommended plus `eqeqeq` and `no-console`
(allow `warn`/`error`). Web adds `react-hooks` and `react-refresh`.

Do not add Biome alongside Prettier/ESLint. Do not disable a rule to make a
check green; fix the code or file an issue.

## Flutter

[`apps/mobile/analysis_options.yaml`](../../apps/mobile/analysis_options.yaml)
includes `package:flutter_lints/flutter.yaml`, enables analyzer
`strict-casts` / `strict-inference` / `strict-raw-types`, and extra lints for
unawaited futures and abandoned subscriptions.

```bash
cd apps/mobile && flutter analyze && flutter test
```

Flutter is not part of `pnpm verify` because the SDK may be absent locally. CI
runs analyze/test. See [setup.md](setup.md).

## Import boundaries

Foundation §5.2. Enforced by `pnpm boundaries`
([`tools/ci/check-boundaries.mjs`](../../tools/ci/check-boundaries.mjs)) and by
ESLint `no-restricted-imports` on web and contracts.

| From | May depend on | Must not |
|---|---|---|
| `apps/api` | `packages/contracts`, `packages/db` | `apps/web`, `apps/mobile` |
| `apps/web` | `packages/contracts`, `packages/config` | `packages/db`, Worker internals |
| `packages/contracts` | Zod and other wire-only libraries | apps, `packages/db` |
| `packages/db` | contracts only when that does not cycle | apps |
| `packages/config` | lint/test tooling | apps, contracts, db |
| `apps/mobile` | generated Dart client and Dart domain | Node packages |

Cross-feature imports go through a feature's public interface. That rule is
documented now and will gain a checker when feature folders exist.

The scan is a source/package.json regex, not a full module graph.

## Conventional Commits

History convention only — not a substitute for issues or release notes
(foundation §25). No git hook.

```text
type(scope)?: summary
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`,
`ci`, `chore`, `revert`. Scope is lowercase `api`, `web`, `mobile`, `db`,
`contracts`, `quality`, `docs`, `ci`. Summary is imperative, ≤100 characters,
no trailing period.

Merge and Git `Revert` subjects are allowed. Name the issue in the body
(`SY-0011`) rather than as a custom header type.

```bash
pnpm commits:check --message "chore(quality): add license allowlist"
pnpm commits:check --range origin/staging..HEAD
```

Do not rewrite existing history to match. PR-title enforcement belongs to
[SY-0016](../issue-tracking/issues/SY-0016.md).

## Generated files

Label generated artifacts in the file or its generator. Review the generator
and schema diff, not hand-edited output.

| Artifact | Committed? | Label / check |
|---|---|---|
| `packages/contracts/openapi/openapi.json` | yes | `x-generated-from` / `x-generated-by`; `pnpm generated:check` |
| generated Dart client (later) | yes | header; drift check when the client exists |
| `apps/web/src/routeTree.gen.ts` | no | gitignored; regenerate in CI when file-based routes land |
| `dist/`, `build/`, coverage, `.wrangler` | no | gitignored |
| `packages/db/migrations/*.sql` | yes | reviewed SQL, not an ignored generate-and-forget artifact |

After changing contracts:

```bash
pnpm --filter @sadhanayog/contracts build
```

Secrets, `.dev.vars`, signing material, local D1 state, and object payloads
are never generated-into-git.

## Dependencies and licenses

- Pin TypeScript workspace versions exactly. Use `workspace:` for internal
  packages. One pnpm lockfile.
- Flutter uses `pubspec.yaml` / committed `pubspec.lock` and `^` ranges per
  Dart convention; the SDK pin is in `mise.toml`.
- No automatic merge for runtime, auth, database, mobile build, or major
  updates (foundation §5.3). Weekly grouped non-major PRs are a later CI
  concern ([SY-0016](../issue-tracking/issues/SY-0016.md)).
- Third-party JavaScript licenses must match
  [`tools/ci/license-allowlist.json`](../../tools/ci/license-allowlist.json).
  Copyleft (`GPL`, `AGPL`, `SSPL`) and “source-available” (`BUSL`) licenses
  need a recorded exception and a human decision. The current exception is
  `@img/sharp-libvips-*` (`LGPL-3.0-or-later`), an optional native binary.

```bash
pnpm licenses:check
```

The allowlist is proposed until a human accepts the package-license decision
in the Agent Note.

## Commands

| Command | Meaning |
|---|---|
| `pnpm lint` | ESLint plus Prettier check |
| `pnpm format` | Prettier write |
| `pnpm boundaries` | Import and package.json boundary scan |
| `pnpm licenses:check` | Allowlisted dependency licenses |
| `pnpm quality:test` | Fixture tests for the checkers |
| `pnpm commits:check` | Conventional Commit header (message or range) |
| `pnpm generated:check` | OpenAPI drift and generated labels |
| `pnpm verify` | Full local quality gate, including the checks above |

## Troubleshooting

| Symptom | Check |
|---|---|
| `pnpm lint` fails on format | `pnpm format`, then re-run |
| ESLint `no-restricted-imports` | move the import behind the allowed package |
| `pnpm boundaries` fails | see the `from` package in the error; do not weaken the rule |
| `pnpm licenses:check` fails | add a justified exception or replace the dependency |
| `pnpm generated:check` fails | rebuild contracts; do not hand-edit OpenAPI |
| Flutter analyze missing | `mise install flutter` or rely on CI |
