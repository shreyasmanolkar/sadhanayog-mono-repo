# AGENTS.md — Database

SQLite/D1 only. Persistence rows are not API DTOs.

- Reviewed SQL in `migrations/` is the deployment artifact.
- Never `drizzle-kit push` to production.
- Every future tenant table needs `organization_id`.
