---
name: change-d1-schema
description: Drizzle SQL migration workflow for Cloudflare D1. Use when adding or changing a SQLite schema, Drizzle table, or reviewed SQL migration. Do not use for API handlers, product UI, or drizzle-kit push to production.
---

# change-d1-schema

Input: issue ID plus an approved domain model.

## Steps

1. SQLite/D1 only. Persistence rows are not API DTOs.
2. Expand → backfill → switch → contract. Generate SQL and review it.
3. Apply to a fresh local D1 and to an upgraded fixture. Preserve tenant scope and foreign keys.
4. Every future tenant table needs `organization_id`.

## Stop

No `drizzle-kit push` to production. No remote/shared migrate. Production migrations are human-gated.

## Validate

Fresh migrate, upgrade migrate, `PRAGMA foreign_key_check`, invariant tests, reviewed SQL in `packages/db/migrations/`. `pnpm db:verify`.

## Examples

- Match: "add a Drizzle SQL migration for D1"; "change the sqlite schema".
- Do not match: "new Worker route"; "model the glossary".

## References

- [`packages/db/AGENTS.md`](../../../packages/db/AGENTS.md)
- [`docs/database/README.md`](../../../docs/database/README.md)
- engineering-foundation.md §10
