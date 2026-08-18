# Commands

Status: living  
Owner: engineering  
Last-reviewed: 2026-08-19

| Command | Meaning |
|---|---|
| `pnpm bootstrap` | Install JS deps; Flutter pub get if SDK present |
| `pnpm dev` | API (8787) + web (5173) |
| `pnpm verify` | Tracker, docs, secrets, boundaries, lint, types, tests, build, generated drift |
| `pnpm tracker` | Tracker CLI (`lint` by default; extra args forwarded) |
| `pnpm tracker:lint` | Issue DAG and schema |
| `pnpm tracker:next` | Unblocked Ready issues |
| `pnpm tracker:show SY-NNNN` | Print one issue |
| `pnpm tracker:move SY-NNNN <status>` | Change issue status |
| `pnpm tracker:test` | Tracker CLI smoke test |
| `pnpm db:generate` | Drizzle SQL generation (review before commit) |
| `pnpm db:migrate:local` | Apply reviewed SQL to local D1 |
| `cd apps/mobile && flutter test` | Mobile unit/widget tests |

Generated OpenAPI is committed. After changing contracts:

```bash
pnpm --filter @sadhanayog/contracts build
```
