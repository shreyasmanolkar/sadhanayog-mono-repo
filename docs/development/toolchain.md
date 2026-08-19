# Workspace toolchain

Status: living  
Owner: engineering  
Last-reviewed: 2026-08-19  
Authority: [engineering foundation](../architecture/engineering-foundation.md) §5.3, §14, §16.1  
Named outcome of [SY-0009](../issue-tracking/issues/SY-0009.md)

This document is the reviewable workspace/toolchain scaffold. It does not
implement product behavior. Empty app shells, linters, CI jobs, MCP, and
bootstrap runbooks belong to SY-0010–SY-0017.

## Pins

Canonical table: [`tools/ci/tool-pins.json`](../../tools/ci/tool-pins.json).
Check: `pnpm toolchain:check`.

| Tool | Pin | How it is installed | Notes |
|---|---|---|---|
| Node | 24.11.1 | `mise.toml` + `package.json` `engines` | Exact runtime. Engines allow `>=24.11.1 <25`. |
| pnpm | 10.33.0 | `mise.toml` + `packageManager` | One lockfile: `pnpm-lock.yaml`. |
| Flutter | 3.35.4 | `mise.toml` | Mobile SDK. CI uses `subosito/flutter-action`. |
| Dart | 3.9.2 | ships with Flutter 3.35.4 | Do not add a mise `dart` tool. |
| Java | 25.0.1 | `mise.toml` | Host JDK. Android `compileOptions` stay Java 11. |
| Wrangler | 4.124.0 | `apps/api` devDependency | Not a mise tool. |

`mise.toml` also prepends `./node_modules/.bin` to `PATH`.

## Layout owned by this issue

```text
apps/          # workspace members; compiling shells are SY-0010
packages/      # config, contracts, db members; compiling packages are SY-0010
content/       # teaching-archive placeholder; content pipeline is later
tools/ci       # bootstrap + pin check
tools/tracker  # tracker executable (owned with SY-0013)
tools/migration
tools/content
pnpm-workspace.yaml
package.json
pnpm-lock.yaml
mise.toml
.env.example
.gitignore
```

Root scripts this issue cares about: `bootstrap`, `toolchain:check`, `dev`,
`verify`, `db:generate`, `db:migrate:local`, `db:verify`. Quality gates inside
`verify` other than the pin check were introduced with the bulk Stage 1
scaffold and remain owned by SY-0011–SY-0016.

## Generated files

| Artifact | Git | Why |
|---|---|---|
| `pnpm-lock.yaml` | committed | TypeScript workspace lock |
| `apps/mobile/pubspec.lock` | committed | Flutter lock |
| `packages/contracts/openapi/openapi.json` | committed | contract drift is reviewable (SY-0010) |
| `apps/web/src/routeTree.gen.ts` | ignored | regenerated, deterministic |
| `dist/`, `build/`, coverage, Playwright reports | ignored | build output |
| `.wrangler/`, `*.sqlite`, `.mf/` | ignored | local D1 / Miniflare state |
| `.env`, `.dev.vars` | ignored | secrets |
| `*.jks`, `*.keystore`, `*.p12`, `*.mobileprovision` | ignored | signing material |

## Dependencies

- pnpm workspaces with `workspace:*` for internal packages. No second Node
  lockfile.
- Flutter uses `apps/mobile/pubspec.yaml` only. Node packages are not Dart
  packages.
- `.npmrc` sets `engine-strict=true`.
- No Turborepo/Nx. Root scripts orchestrate three apps.
- Renovate/Dependabot is not configured here (Stage 17 / SY-0016 follow-up).

## Environment matrix

| Host | Role | Required |
|---|---|---|
| Linux x64 | TypeScript workspace, Worker, web, tracker | Node, pnpm, Wrangler via pnpm |
| Linux x64 with Flutter | mobile unit/widget tests | + Flutter/Dart, Java |
| macOS | iOS/Android build host | + Xcode / Android SDK |
| GitHub Actions `ubuntu-latest` | CI | Node+pnpm job; Flutter job |
| Windows | not supported | — |

A shared staging environment is not created. Local plus a later protected
development environment and production is the foundation default until an RC
needs staging.

## Agent authority

Agents install and check the pins locally. They do not create production
Cloudflare resources, change CI permissions, or put secret values in Git.
Protected-path review for `.github/` and notes is human. See [AGENTS.md](../../AGENTS.md).

## Unsigned decisions

Recorded here so implementation is not pretending they are approved:

1. **Exact versions** — the table above is proposed in
   [`.agents/notes/proposed/process/2026-08-19-toolchain-pins.md`](../../.agents/notes/proposed/process/2026-08-19-toolchain-pins.md).
2. **CI host** — GitHub Actions is what this remote already runs. Not signed
   as the only allowed host.
3. **Package license** — no `LICENSE` file. Product is private. SPDX choice
   needs a human.
4. **Shared development environment** — not created.
5. **Protected-path reviewers** — existing CODEOWNERS; not changed here
   (SY-0016).
6. **Java 25 vs Android JDK 17 LTS** — host pin is 25.0.1 because that is
   what `mise.toml` already installed. Confirm on a real Android build host.
7. **Windows contributors** — out of the matrix until a human adds them.
8. **Engineering foundation** — still a proposed document. This issue follows
   it; it does not approve it.

## Layers this issue does not touch

- Database: None. No product tables. Empty Drizzle package is SY-0010.
- API: None. Health placeholder is SY-0010.
- Flutter application code: None. SDK pin only.
- Web application code: None. Workspace membership only.
- Infrastructure: None. No production DNS, D1, R2, or identity tenants.
