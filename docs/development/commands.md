# Commands

Status: living  
Owner: engineering  
Last-reviewed: 2026-08-20  
Issue: [SY-0017](../issue-tracking/issues/SY-0017.md)  
Program: [Stage 1 — Repository and engineering foundation](README.md)

| Command | Meaning |
|---|---|
| `pnpm bootstrap` | [`tools/ci/bootstrap.sh`](../../tools/ci/bootstrap.sh): JS install, toolchain pin check, Flutter pub get if SDK present |
| `pnpm bootstrap:check` | Asserts templates, docs, gitignore, and CI secret posture |
| `pnpm bootstrap:test` | Local D1 seed/reset guard tests |
| `pnpm toolchain:check` | Fail if mise, engines, CI, or present binaries drift from `tools/ci/tool-pins.json` |
| `pnpm dev` | API (8787) + web (5173) |
| `pnpm verify` | Tracker, bootstrap checks, pins, MCP, docs, skills, secrets, CI policy, boundaries, licenses, quality tests, lint, types, tests, build, generated drift |
| `pnpm ci:policy` | Workflow / CODEOWNERS / Dependabot / gitignore invariants |
| `pnpm ci:test` | Tests for secret scan and CI policy |
| `pnpm mcp:check` | Project MCP inventory vs `.codex` / `.grok` TOML |
| `pnpm docs:lint` | Documentation links/headers and Agent Note schema/index drift |
| `pnpm docs:test` | Fixture tests for the docs and decision linters |
| `pnpm decisions:index` | Regenerate `docs/architecture/decisions.md` from Agent Notes |
| `pnpm skills:lint` | Agent Skills frontmatter and required AGENTS.md (`quick_validate`) |
| `pnpm skills:test` | Skill trigger/use classification fixtures |
| `pnpm lint` / `pnpm format` | ESLint plus Prettier check / write |
| `pnpm typecheck` | Build contracts/db, then `tsc --noEmit` on TS workspaces |
| `pnpm test` | Vitest in contracts, db, api, web |
| `pnpm build` | contracts → db → web → api dry-run |
| `pnpm boundaries` | Import and package.json boundary scan |
| `pnpm licenses:check` | Allowlisted dependency licenses (SY-0011) |
| `pnpm quality:test` | Fixture tests for quality checkers |
| `pnpm commits:check` | Conventional Commit header (message or range) |
| `pnpm tracker` | Tracker CLI (help if no args) |
| `pnpm tracker:lint` | Issue DAG and schema |
| `pnpm tracker:next` | Unblocked `ready` issues |
| `pnpm tracker:next -- --all` | Unblocked ready plus unblocked triage/backlog/todo |
| `pnpm tracker:test` | Isolated tracker fixtures (cycles, invalid states, completion evidence) |
| `pnpm tracker:board` | Linear-style board at http://localhost:4322 |
| `pnpm tracker:show SY-NNNN` | Print one issue |
| `pnpm tracker:move SY-NNNN <status>` | Change issue status |
| `pnpm tracker:index` | Regenerate `docs/issue-tracking/index.md` |
| `pnpm tracker:stats` | Counts by status, cycle, project |
| `pnpm tracker:export` | Self-contained `board.html` |
| `pnpm db:generate` | Drizzle SQL generation (review before commit) |
| `pnpm db:migrate:local` | Apply reviewed SQL to local `sadhanayog-dev` |
| `pnpm db:seed:local -- --database sadhanayog-dev` | Idempotent local migrate; no product rows yet |
| `pnpm db:reset:local -- --database sadhanayog-dev --confirm sadhanayog-dev` | Delete local Wrangler persist, remigrate |
| `pnpm db:verify` | `@sadhanayog/db` tests |
| `cd apps/mobile && flutter test` | Mobile unit/widget tests |
| `cd apps/mobile && flutter analyze` | Flutter lints |
| `cd apps/mobile && flutter build bundle` | Flutter build smoke (CI) |
| `cd apps/mobile && flutter run --dart-define=SADHANAYOG_ENV=dev --dart-define=SADHANAYOG_API_ORIGIN=http://127.0.0.1:8787` | Mobile shell against local API |

`pnpm test:e2e` is not wired. Playwright arrives with later web-composition work.

## Seed and reset

Both commands are implemented by [`tools/ci/local-db.mjs`](../../tools/ci/local-db.mjs).

- Database name is required and must be exactly `sadhanayog-dev`.
- Reset also requires `--confirm sadhanayog-dev`.
- `--remote` is always refused.
- `SADHANAYOG_ENV=production` is always refused.
- Seed applies [`packages/db/migrations/0000_schema_migrations.sql`](../../packages/db/migrations/0000_schema_migrations.sql) only. Product fixtures are Stage 3.

Generated OpenAPI is committed. After changing contracts:

```bash
pnpm --filter @sadhanayog/contracts build
```
