---
name: change-d1-schema
description: Drizzle/SQL migration workflow for Cloudflare D1. Use on any schema or migration change.
---

# change-d1-schema

SQLite/D1 only. Expand → backfill → switch → contract. Generate SQL, review it,
apply to fresh local D1 and an upgraded fixture. No `drizzle-kit push` to
production. Preserve tenant scope and foreign keys.

Validate: fresh migrate, upgrade migrate, `PRAGMA foreign_key_check`, invariant tests.
