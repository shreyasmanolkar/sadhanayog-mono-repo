---
name: build-worker-api
description: Implement or change Cloudflare Worker routes and use cases. Use when API behavior, Hono routes, authorization/authz, or problem-detail mapping changes. Do not use for SQL migrations or client UI.
---

# build-worker-api

Input: issue ID and the contract change in `packages/contracts`.

## Steps

1. Validate, authenticate, authorize, tenant-scope, rate limit, audit, map safe errors.
2. The Worker remains authoritative. Client checks are not authorization.
3. Depend on `packages/contracts` and `packages/db` only.
4. Never return persistence rows, stacks, or SQL errors. Tenant scope belongs in repositories.

## Stop

Do not add product routes until the issue names them. Local D1 only; no remote migrate.

## Validate

Contract, integration, and negative authz tests. `pnpm --filter @sadhanayog/api test` and `pnpm --filter @sadhanayog/api typecheck`.

## Examples

- Match: "add a Worker Hono route for attendance"; "change API use case authorization on the Worker".
- Do not match: "TanStack students page"; "Drizzle migration".

## References

- [`apps/api/AGENTS.md`](../../../apps/api/AGENTS.md)
- [`docs/api/README.md`](../../../docs/api/README.md)
- engineering-foundation.md §9, §12
