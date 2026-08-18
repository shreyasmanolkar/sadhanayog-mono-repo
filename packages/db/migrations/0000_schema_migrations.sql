-- Reviewed SQL. Do not apply with drizzle-kit push.
CREATE TABLE IF NOT EXISTS schema_migrations (
  id TEXT PRIMARY KEY NOT NULL,
  applied_at INTEGER NOT NULL
);
