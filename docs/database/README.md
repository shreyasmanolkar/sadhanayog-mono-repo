# Database

Status: living  
Owner: engineering  
Last-reviewed: 2026-08-19

D1 / SQLite via Drizzle. Product tables are Stage 3. The only reviewed SQL
today is the `schema_migrations` ledger in
[`packages/db/migrations`](../../packages/db/migrations).

Never run `drizzle-kit push` against production. Never migrate at Worker startup.
