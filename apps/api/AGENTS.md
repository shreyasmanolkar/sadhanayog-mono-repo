# AGENTS.md — API

The Worker is authoritative. Do not add product routes until the issue names
them. Health and problem details are the only public surface in Stage 1.

- Depend on `packages/contracts` and `packages/db` only.
- Never return persistence rows, stacks, or SQL errors.
- Tenant scope belongs in repository methods, not in route handlers alone.
- Local D1 only. No remote migrate.

Validate: `pnpm --filter @sadhanayog/api test && pnpm --filter @sadhanayog/api typecheck`
