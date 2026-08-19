# Commands

Status: living  
Owner: engineering  
Last-reviewed: 2026-08-19

| Command | Meaning |
|---|---|
| `pnpm bootstrap` | Install JS deps; Flutter pub get if SDK present |
| `pnpm dev` | API (8787) + web (5173) |
| `pnpm verify` | Tracker, docs, secrets, boundaries, lint, types, tests, build, generated drift |
| `pnpm docs:lint` | Documentation links/headers and Agent Note schema/index drift |
| `pnpm docs:test` | Fixture tests for the docs and decision linters |
| `pnpm decisions:index` | Regenerate `docs/architecture/decisions.md` from Agent Notes |
| `pnpm tracker` | Tracker CLI (help if no args) |
| `pnpm tracker:lint` | Issue DAG and schema |
| `pnpm tracker:next` | Unblocked Ready/Todo issues |
| `pnpm tracker:board` | Linear-style board at http://localhost:4322 |
| `pnpm tracker:show SY-NNNN` | Print one issue |
| `pnpm tracker:move SY-NNNN <status>` | Change issue status |
| `pnpm tracker:index` | Regenerate `docs/issue-tracking/index.md` |
| `pnpm tracker:stats` | Counts by status, cycle, project |
| `pnpm tracker:export` | Self-contained `board.html` |
| `pnpm tracker:test` | Tracker CLI smoke test |
| `pnpm db:generate` | Drizzle SQL generation (review before commit) |
| `pnpm db:migrate:local` | Apply reviewed SQL to local D1 |
| `cd apps/mobile && flutter test` | Mobile unit/widget tests |

Generated OpenAPI is committed. After changing contracts:

```bash
pnpm --filter @sadhanayog/contracts build
```
