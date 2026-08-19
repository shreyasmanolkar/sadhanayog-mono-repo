# Stage 1 — Repository and engineering foundation

Status: draft program — not architecture-signed  
Owner: engineering  
Last-reviewed: 2026-08-19  
Issue: [SY-0008](../issue-tracking/issues/SY-0008.md)  
Sources: [engineering foundation](../architecture/engineering-foundation.md) §5–6, §14–20, §30;
[implementation roadmap](../roadmap/implementation-roadmap.md) Stage 1

This file is the named Stage 1 outcome. It makes the runnable monorepo
skeleton, governance, agent system, and CI foundation reviewable. It is
not a signed architecture approval and it does not close child work
packages [SY-0009](../issue-tracking/issues/SY-0009.md)–[SY-0017](../issue-tracking/issues/SY-0017.md).
Operational docs: [setup.md](setup.md), [commands.md](commands.md),
[toolchain.md](toolchain.md), [style.md](style.md),
[agent-instructions.md](agent-instructions.md), [ci.md](ci.md).

The engineering foundation document itself remains **Proposed foundation
for human approval**. Proposed Agent Notes are not authority.

## Purpose

Create a cloneable workspace where a contributor or agent can bootstrap,
run three empty apps, run `pnpm verify`, create/validate an issue and an
ADR, and read protected-operation rules — **without implementing product
behavior**. Attendance, invoices, identity, and the Teaching Archive
arrive as later vertical slices.

## Layer effects

| Area | This epic |
|---|---|
| Files/docs | Named program in this file; scoped rules in [AGENTS.md](AGENTS.md). Setup/commands/troubleshooting remain the operational docs. Child issues own their named artifacts. |
| Database | Empty Drizzle package and local D1 binding only. No product tables. |
| API | Health placeholder and typed binding/config boot only. No product routes. |
| Flutter | Default shell, test target, and iOS/Android folders only. No product features. |
| Web | Default shell, router, and test setup only. No product features. |
| Infrastructure | Local Wrangler bindings and non-production names. No production resources, DNS, identity apps, or secret values. |

Write **None.** for any later-stage layer. Do not create Cloudflare
production D1/R2, GitHub environments, or mobile signing material from
this issue.

## What this epic owns versus children

Roadmap Stage 1 names nine work packages. This epic owns the program,
the unsigned decision register, and the stage-exit account. Children
own the named artifacts.

The checkout already contains a bulk scaffold that those children were
meant to land. This epic does not rewrite that history and does not
treat `status: in_review` on a child as evidence. Child issues still
owe their own notes, evidence, and human gate to `done`.

## Artifact map

| Artifact | Owner | Status 2026-08-19 |
|---|---|---|
| [README.md](README.md) (this program) | SY-0008 | Draft, reviewable |
| [AGENTS.md](AGENTS.md) | SY-0008 | Draft |
| [setup.md](setup.md), [commands.md](commands.md) | [SY-0017](../issue-tracking/issues/SY-0017.md) | Present; bootstrap evidence still on SY-0017 |
| [toolchain.md](toolchain.md) | [SY-0009](../issue-tracking/issues/SY-0009.md) | Named SY-0009 outcome. Pins, lockfiles, generated-file policy, environment matrix. |
| [../operations/troubleshooting/README.md](../operations/troubleshooting/README.md) | SY-0017 | Thin placeholder |
| `tools/ci/tool-pins.json`, `mise.toml`, root `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` | [SY-0009](../issue-tracking/issues/SY-0009.md) | Canonical pins in `tool-pins.json`. Dart/Wrangler are not mise pins; Wrangler is the `apps/api` package pin `4.124.0`. Dart ships with Flutter 3.35.4 (Dart 3.9.2). `pnpm toolchain:check` fails on drift. |
| `apps/{api,web,mobile}`, `packages/{config,contracts,db}`, `content/teaching-archive` | [SY-0010](../issue-tracking/issues/SY-0010.md) | Compiling shells. Health only. No product tables or routes. |
| [style.md](style.md), `packages/config/{eslint,typescript,vitest}`, `tools/ci/check-{boundaries,commits,licenses,generated}.mjs` | [SY-0011](../issue-tracking/issues/SY-0011.md) | Named SY-0011 outcome. Conventional Commits checker has no git hook (by design). Dependabot/Renovate and a `LICENSE` file remain out of scope. |
| `docs/**` READMEs, `.agents/notes`, `docs/postmortems/template.md`, `tools/ci/lint-docs.mjs`, `tools/ci/lint-decisions.mjs` | [SY-0012](../issue-tracking/issues/SY-0012.md) | Present. Note lifecycle dirs other than `proposed/` are empty; no note template file. |
| `docs/issue-tracking/**`, `tools/tracker/**` | [SY-0013](../issue-tracking/issues/SY-0013.md) | Present. 152 seeded issues. Smoke test only; no invalid-state fixture suite. |
| Root/scoped `AGENTS.md`, `.agents/skills/*/SKILL.md`, [agent-instructions.md](agent-instructions.md) | [SY-0014](../issue-tracking/issues/SY-0014.md) | Named outcome plus `pnpm skills:lint` / `pnpm skills:test`. |
| `.codex/config.toml`, [mcp.md](mcp.md) | [SY-0015](../issue-tracking/issues/SY-0015.md) | Context7 + Cloudflare docs declared. Playwright pinned and disabled. GitHub/log/database MCP not added (intentional). |
| [ci.md](ci.md), `.github/workflows/ci.yml`, `.github/CODEOWNERS`, `.github/pull_request_template.md`, `.github/dependabot.yml`, `tools/ci/check-{secrets,ci-policy}.mjs` | [SY-0016](../issue-tracking/issues/SY-0016.md) | Named SY-0016 outcome. Four parallel jobs, SHA-pinned Actions, `permissions: contents: read`, no workflow secrets, Flutter `build bundle`. License allowlist remains SY-0011. |
| `tools/ci/bootstrap.sh`, `.env.example`, `apps/api/.dev.vars.example` | SY-0017 | Present. No synthetic seed/reset command. |

Do not close a child because its files exist on this branch.

## Target tree versus this checkout

Foundation §5 is the target tree. Empty product folders are not created
just to match the drawing.

| §5 path | This checkout |
|---|---|
| `apps/api/src/{app,http,middleware,modules,observability}` | Present. No `auth/` (Stage 5). Tests live at `apps/api/test/health.test.ts`, not `test/{contract,integration,security}/`. |
| `apps/web/src/{app,styles,test}` | Present. No `components/`, `features/`, `routes/`, or `e2e/` yet. |
| `apps/mobile/lib/{app,core}` plus `android/` `ios/` | Present. No `features/`, `l10n/`, or `integration_test/` yet. |
| `packages/config/{eslint,typescript,vitest}` | Present. Shared ESLint and Node Vitest config live here (SY-0011). Root `eslint.config.js` re-exports. |
| `packages/db/{src,migrations,test}` | Present. No `fixtures/` (Stage 3). Schema is `schema_migrations` only. |
| `packages/contracts/{src,openapi,test}` | Present. Committed OpenAPI 3.1. No generated Dart client yet (Stage 4). |
| `content/teaching-archive/manifest.json` | Present. `content/`, `schema/`, `test/` wait for Stage 11. |
| `tools/{tracker,ci,migration,content}` | Present. `migration/` and `content/` are placeholders (no extractors or content pipeline). |
| `docs/issue-tracking/{issues,templates,projects}` | Present. No `archive/` until an issue is archived. |
| `.agents/notes/proposed` | Present. `implemented/`, `rejected/`, `archived/` appear when a note transitions. |
| `.codex/config.toml`, `.github/{workflows,CODEOWNERS,pull_request_template.md}`, `.env.example`, `mise.toml` | Present. |

## Exit criteria

Stage 1 is done only when every row below is satisfied. This epic
records the criteria and defers unsatisfied rows.

| Stage 1 exit criterion | This epic | Remainder |
|---|---|---|
| New contributor/agent can clone and bootstrap | `pnpm bootstrap` (`tools/ci/bootstrap.sh`) documented in [setup.md](setup.md) | Clean-machine evidence on Linux and one mobile build host: SY-0017. Flutter SDK is pinned; a host without `flutter` on `PATH` skips mobile bootstrap. |
| Run the three empty apps locally | `pnpm dev` starts API `:8787` + web `:5173`. Flutter: `cd apps/mobile && flutter run` | SY-0010 owns the shells; SY-0017 owns bootstrap friction. No identity provider, so apps are empty shells. |
| Run `pnpm verify` | Root script runs tracker lint/test, toolchain pins, MCP inventory, docs/decision lint, skill lint/tests, secret scan, CI policy, import boundaries, licenses, quality-checker tests, eslint/prettier, typecheck, unit tests, web/api build, OpenAPI drift | Child packages still own their tests. |
| Create/validate an issue and an ADR | `pnpm tracker` + `node tools/ci/lint-decisions.mjs`. Skills: `work-issue`, `record-decision` | Invalid-state tracker fixtures: SY-0013. Skill trigger tests land in this checkout (`pnpm skills:test`). |
| Understand protected operations from documentation | Root [AGENTS.md](../../AGENTS.md), [CODEOWNERS](../../.github/CODEOWNERS), this program, [record-decision](../../.agents/skills/record-decision/SKILL.md) | Human reviewers for protected paths remain an unsigned decision. |
| CI green from a clean checkout | Workflow `.github/workflows/ci.yml` runs four parallel jobs (governance, TypeScript, Flutter analyze/test/`build bundle`, licenses) with `permissions: contents: read` | See [ci.md](ci.md). Human confirmation of GitHub required-check names. No iOS/Android APK/IPA in CI. |
| No product feature implemented | Health placeholder, empty Drizzle ledger, two shells that say the desk is empty | Keep for every child. |

This epic therefore **does not close Stage 1**. It closes the program,
the unsigned decision register, and the account of what the bulk
scaffold already contains.

## Required human decisions

Recorded here so later stages cannot proceed by inference. **None of
these are decided by this epic.** Stack ADRs stay in
[`.agents/notes/proposed/`](../../.agents/notes/proposed/) until a human
architectural reviewer moves them.

| Decision | Owner | Due before | Status |
|---|---|---|---|
| Approve the engineering foundation as authority | Architecture reviewer | Any work that treats §5–20 as approved | Unsigned. Document status is still Proposed. |
| CI host | Engineering + security | SY-0016 close | Unsigned. GitHub Actions is what the scaffold uses. |
| Exact tool versions (Node, pnpm, Flutter/Dart, Wrangler, Java) | Engineering | SY-0009 close | Draft pins in [`tools/ci/tool-pins.json`](../../tools/ci/tool-pins.json). Proposed note [2026-08-19-toolchain-pins.md](../../.agents/notes/proposed/process/2026-08-19-toolchain-pins.md) (ADR-0007). Not signed. |
| Package licenses | Product / legal | First public or third-party distribution; also Dependabot/license policy | Unsigned. SY-0011 proposes `tools/ci/license-allowlist.json` (ADR-0008). No `LICENSE` file. |
| Whether a shared development (non-local) environment is needed | Product + engineering | Staging/production promotion (foundation §14) | Unsigned. Local + CI only. |
| Protected-path reviewers beyond the current CODEOWNERS placeholder | Engineering lead | Merge of auth, schema, contracts, R2, production config, CI permissions, mobile signing, security docs, decision records | Unsigned. `.github/CODEOWNERS` currently names `@shreyas` on `*` and on the protected paths. |
| Record stack selections as **implemented** ADRs after scaffolds prove viable | Architecture reviewer | Before Stage 2 treats them as given | Eight notes remain `proposed/` (Worker monolith, Vite SPA, REST/OpenAPI, D1/Drizzle, Markdown tracker, Flutter shell, toolchain pins, code quality conventions). |

## Commands, generated files, dependencies, environment, authority

Operational detail lives with SY-0017 and SY-0011. The program only
fixes the nouns.

| Topic | Where it lives | Rule |
|---|---|---|
| Setup | [setup.md](setup.md) | `mise install` then `pnpm bootstrap`. Copy names from [`.env.example`](../../.env.example); values go in ignored `apps/api/.dev.vars`. |
| Commands | [commands.md](commands.md) | `pnpm verify`, `pnpm dev`, tracker CLIs, `db:*` stubs, Flutter from `apps/mobile`. |
| Troubleshooting | [../operations/troubleshooting/README.md](../operations/troubleshooting/README.md) | Tracker, Wrangler assets, missing Flutter, health ready 503. |
| Generated files | `packages/contracts/openapi/openapi.json` is committed and labelled (`x-generated-from` / `x-generated-by`). `apps/web/src/routeTree.gen.ts` is gitignored. Dart client is not generated yet. Policy: [style.md](style.md). | Drift: `pnpm generated:check`. Do not commit `.dev.vars`, D1/R2 state, or signing files ([`.gitignore`](../../.gitignore)). |
| Dependencies | One pnpm lockfile; Flutter `pubspec.lock`. `workspace:` links for internal packages. License allowlist: [style.md](style.md). | No Turborepo/Nx. No automatic merge of runtime/auth/db/mobile/major updates. SPDX allowlist is proposed, not signed. |
| Environment matrix | Local (mise + Wrangler local D1 placeholder) and GitHub Actions. | No shared development, staging, or production resources in this stage. |
| Agent authority | Root [AGENTS.md](../../AGENTS.md), scoped `AGENTS.md` files, this file, [CODEOWNERS](../../.github/CODEOWNERS) | Proposed notes are not authority. Production, secrets, migrations, and protected paths need a human. Backend remains authorization. |

## Open contradictions

Conflicts are defects. They are listed, not resolved.

1. **Stage 1 started while SY-0002 is not `done`.** Roadmap Stage 1
   depends on SY-0002 and an approved engineering foundation. SY-0002
   is `in_review` with draft evidence in
   [repository-baseline.md](../discovery/repository-baseline.md). A
   human named SY-0008 after that named outcome existed. Recorded, not
   a rewrite of `blocked_by`.
2. **Engineering foundation is still Proposed.**
   [architecture/README.md](../architecture/README.md) calls it
   “approved direction.” The foundation document status line does not.
   This program treats it as proposed.
3. **Children SY-0011–SY-0017 may still lack per-issue evidence.** The
   bulk scaffold landed first. SY-0008, SY-0009, and SY-0010 now have
   named outcomes. This epic does not move children to `done`.
4. **GitHub Actions was red on `main` and `staging` before this
   closeout.** Clean-checkout `pnpm verify` failed (`tsup` DTS: missing
   `@types/node` required by `packages/config/typescript/node.json`).
   `flutter analyze` failed on `prefer_const_constructors` in
   `apps/mobile/test/result_test.dart`. Local `node_modules` hid the
   types hole; CI did not. This branch repairs those two defects so the
   claimed smoke can be true. The secret scanner also no-oped on CI
   when `rg` was absent; it now walks the tree in process.
5. **CI `on.push` listed only `main`.** Contributors merge to `staging`.
   This branch also runs the workflow on `staging` pushes.
6. **CODEOWNERS names a single human on every path.** That is a
   placeholder, not an approved reviewer set.

## Security

- Workflow `permissions: contents: read`. The workflow references no
  GitHub secrets, so fork PRs cannot receive them.
- Artifacts: the workflow uploads none. `.gitignore` excludes
  `.dev.vars`, local D1/SQLite, Wrangler state, keystores, and
  provisioning profiles.
- Secret scan is part of `pnpm verify`. It looks for private-key PEM
  blocks and `AKIA…` access-key patterns. `.example` templates are
  skipped.
- No production data, raw user exports, or live OIDC secrets are in
  Git. Hostname `dash.omsadhanayog.com` is a legacy observation from
  Stage 0, not a Stage 1 resource.

## Rollback

Scaffold and config changes are reversible by Git. Keep foundation
changes separated by concern. Do not mutate the legacy Command Center
or Teaching Archive repositories. Do not “fix” Stage 0 generator drift
from this stage.

## Child execution order

```text
SY-0002 (human gate) ─ SY-0009 ─┬─ SY-0010 ─┬─ SY-0016 ─ (Stage 17 CI/CD later)
                                │            └─ SY-0017
                                ├─ SY-0011 ─┘
                                ├─ SY-0012 ─ SY-0013 ─ SY-0014 ─ SY-0015 ─┘
                                └─ SY-0015 (also blocked by SY-0014)
```

An agent may start a child only when that child’s `blocked_by` issues
are `done`. This epic started while SY-0002 was `in_review` because a
human named SY-0008 after the SY-0002 named outcome had landed. That
process contradiction is recorded; it is not a rewrite of the rule for
later children.
