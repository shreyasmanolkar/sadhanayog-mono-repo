# CI foundation

Status: living  
Owner: engineering  
Last-reviewed: 2026-08-19  
Authority: [engineering foundation](../architecture/engineering-foundation.md) §5.3, §14–16, §22  
Named outcome of [SY-0016](../issue-tracking/issues/SY-0016.md)

This document is the reviewable CI foundation. It does not implement product
behavior and it does not create production Cloudflare, identity, or GitHub
environment resources.

## What CI is

GitHub Actions runs on every pull request and on pushes to `main` and
`staging`. Four jobs run in parallel. Path filters are not used: a full
required check must exist before any skip-by-path is allowed
(foundation §16.2).

| Job | What it runs |
|---|---|
| Docs, tracker, secrets | `tracker:lint`, `tracker:test`, `toolchain:check`, `mcp:check`, `docs:lint`, `docs:test`, `skills:lint`, `skills:test`, `secrets:scan`, `boundaries`, `ci:policy`, `ci:test` |
| Format, lint, typecheck, test, build | `lint`, `typecheck`, `test`, `build`, `generated:check` |
| Flutter analyze, test, build smoke | `flutter pub get`, `analyze`, `test`, `build bundle` |
| Dependency and license policy | `licenses:check` |

Local equivalent of the TypeScript and governance jobs:

```bash
pnpm verify
```

Flutter stays a separate SDK. CI installs it; a laptop without Flutter still
runs `pnpm verify`.

## Commands

| Command | Meaning |
|---|---|
| `pnpm verify` | Tracker, pins, MCP, docs, skills, secrets, CI policy, licenses, quality tests, lint, types, tests, build, generated drift |
| `pnpm ci:policy` | Workflow/CODEOWNERS/Dependabot/gitignore invariants |
| `pnpm ci:test` | Unit tests for secret scan and workflow policy |
| `pnpm secrets:scan` | In-process scan for PEM keys, AWS access-key patterns, GitHub tokens |
| `pnpm licenses:check` | Third-party npm license allowlist (SY-0011) |
| `pnpm generated:check` | Committed OpenAPI matches contracts source |
| `pnpm boundaries` | Import-direction scan (web ↛ db/Worker, contracts ↛ apps/db) |

## Pins

CI Node, pnpm, and Flutter versions are literals in
[`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) and must match
[`mise.toml`](../../mise.toml). `pnpm ci:policy` fails on drift.

GitHub Actions are pinned to 40-character commit SHAs. Dependabot may open
grouped non-major PRs for npm, Actions, and pub. Nothing automerges.
Runtime, auth, database, mobile, and major updates need a human
(foundation §5.3).

## Permissions, forks, artifacts

- Workflow `permissions: contents: read` only.
- `actions/checkout` sets `persist-credentials: false`.
- The workflow does not read `secrets.*`. Fork pull requests therefore
  cannot receive repository secrets from this file.
- `pull_request_target` is forbidden.
- The workflow uploads no artifacts. `.gitignore` already excludes
  `.dev.vars`, local D1/SQLite, Wrangler state, and signing files
  (`*.jks`, `*.keystore`, `*.p12`, `*.mobileprovision`).
- `pnpm secrets:scan` does not depend on `rg`. GitHub-hosted runners are
  not assumed to have ripgrep.

Branch protection (required checks, CODEOWNERS enforcement, up-to-date
branch) is a GitHub repository setting. This issue documents the required
check names; it does not change GitHub org permissions.

Required check names to enable when a human configures protection:

- Docs, tracker, secrets
- Format, lint, typecheck, test, build
- Flutter analyze, test, build smoke
- Dependency and license policy

## CODEOWNERS

[`.github/CODEOWNERS`](../../.github/CODEOWNERS) requires a human on auth,
middleware, contracts, migrations, Worker config, security docs, decision
notes, `.github/`, and mobile signing paths. The named reviewer is a
placeholder until that decision is signed.

## Generated files

| Artifact | Git | CI |
|---|---|---|
| `packages/contracts/openapi/openapi.json` | committed | `generated:check` |
| `pnpm-lock.yaml`, `apps/mobile/pubspec.lock` | committed | frozen install / `flutter pub get` |
| `apps/web/src/routeTree.gen.ts` | ignored | regenerated locally, not a CI input |
| `dist/`, `build/`, coverage, Playwright reports | ignored | not uploaded |
| `.dev.vars`, `*.sqlite`, `.wrangler/`, keystores | ignored | never artifacts |

## Dependencies and licenses

`pnpm licenses:check` is SY-0011: `tools/ci/license-allowlist.json` fails
closed on unknown licenses and strong copyleft. The optional sharp libvips
binary is a named LGPL exception, not a general copyleft allow. **Product
SPDX / `LICENSE` is unsigned** and is not decided here. Do not add GPL/AGPL
to go green.

Flutter `pubspec.yaml` must not introduce `git:` dependencies. A full Dart
license inventory is deferred; the pub lockfile is the current evidence.

## Environment matrix

| Host | Role |
|---|---|
| Linux x64 (developer) | `pnpm verify`; Flutter optional |
| GitHub Actions `ubuntu-latest` | four jobs above |
| macOS mobile build host | not in this workflow (iOS/Android *release* builds are Stage 17) |
| Windows | not supported |

A shared staging *application* environment is not created. The `staging`
git branch is the integration branch this remote already uses.

## Testing coverage of this issue

- `tools/ci/check-secrets.test.mjs` — finds PEM/AKIA/GitHub tokens; skips
  `.example` and `node_modules`
- `tools/ci/check-licenses.test.mjs` — allowlist, OR/AND, Flutter git ban
- `tools/ci/check-ci-policy.test.mjs` — pin, SHA, no secrets, no
  `pull_request_target`
- Tracker smoke remains `pnpm tracker:test` (fixtures for invalid states
  are SY-0013). Skill trigger tests are SY-0014.

Playwright critical flow, axe CI, fresh/upgrade D1 suites, and iOS/Android
APK/IPA smokes are **explicitly deferred**. There is no product flow, no
`apps/web/e2e/` suite, and no product schema to migrate. Those belong with
later features and [SY-0129](../issue-tracking/issues/SY-0129.md).

## Agent authority

Agents may edit workflows, checkers, and this document on `SY-0016`. They
must not:

- raise GitHub permissions
- add repository secrets
- create production GitHub environments
- enable automerge
- upload artifacts that could contain `.dev.vars`, D1/R2 payloads, or
  signing material
- treat proposed Agent Notes as authority

## Unsigned decisions

| Decision | Status |
|---|---|
| CI host is GitHub Actions | Proposed in [ADR-0011](../../.agents/notes/proposed/process/2026-08-19-github-actions-ci.md). This remote already runs Actions. |
| Protected-path reviewers | CODEOWNERS names `@shreyas` on `*` and on protected paths. Not a signed reviewer set. |
| Product SPDX / `LICENSE` | Unsigned. Third-party allowlist only. |
| Shared development environment | Not created. |
| Branch protection in GitHub | Documented required checks; not applied from this repository. |
| Java 25 vs Android JDK 17 for APK | Not used. Flutter job does not compile an APK. |

## Layers this issue does not touch

- Database: None. No product tables. Local D1 binding stays with SY-0010.
- API: None. Health placeholder stays with SY-0010.
- Flutter application code: None. CI only runs the existing shell.
- Web application code: None.
- Infrastructure: None. No production DNS, D1, R2, identity tenants, or
  GitHub environments.

## Rollback

Revert `.github/`, `tools/ci/check-{secrets,licenses,ci-policy}*`, and this
document. Scaffold/config changes are reversible. Do not keep a red required
check after revert; disable the GitHub required-check names first if they
were enabled.
